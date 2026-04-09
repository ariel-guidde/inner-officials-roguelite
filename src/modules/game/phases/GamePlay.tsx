// GamePlay — Act 1: Taizong's Court
// All state reads from GameStateContext; all mutations through dispatch.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLatest } from '@lib/useLatest'
import type { Agent, AgentTier, IntelligenceItem, LocationId, ReputationState } from '@core/types'
import { RANK_TITLES } from '@core/types'
import { useGameState } from '@core/GameStateContext'
import { processConsequences, processReputationChange } from '@core/consequences'
import {
  Map as PalaceMap, UNLOCKED_BY_DEFAULT,
  type ResolutionQueueItem,
  buildResolutionQueue, advanceDayOnMap, buildQueueItem,
} from '@modules/map'
import { Dilemma, type DilemmaData, type DilemmaResult } from '@modules/dilemma'
import {
  type ResolutionType,
  EVENT_DEFINITIONS_BY_ID as DEFS_BY_ID,
  type SpawnContext,
  selectEventsForDay, ALL_EVENT_DEFINITIONS, definitionToEvent,
} from '@modules/events'
import { ResolutionModal } from './ResolutionModal'

/** Convert Record-based eventStates to the Map that spawn/eligibility logic expects. */
function toStatesMap(record: Record<string, import('@modules/events').EventRuntimeState>) {
  return new Map(Object.entries(record))
}

/** Derive the hand of controllable agents (protagonist + followers). */
function deriveHandAgents(agents: Record<string, Agent>): Agent[] {
  return Object.values(agents).filter(
    a => a.isProtagonist || a.tags?.includes('follower') || a.tags?.includes('maid'),
  )
}

export function GamePlay() {
  const { state, dispatch } = useGameState()
  const {
    currentDay, mapNodes, eventStates, silver, goldenDice,
    intelligence, reputation, agents: agentsRecord, haremRank,
  } = state

  // Derived
  const agents = useMemo(() => deriveHandAgents(agentsRecord), [agentsRecord])
  const allAgents = useMemo(() => Object.values(agentsRecord), [agentsRecord])

  // Local UI state (not persisted)
  const [selectedNodeId, setSelectedNodeId] = useState<LocationId | null>(null)
  const [activeDilemma, setActiveDilemma] = useState<DilemmaData | null>(null)
  const [pendingDilemmaEventId, setPendingDilemmaEventId] = useState<string | null>(null)

  // Resolution is driven by state.resolutionQueue / state.resolutionIndex
  const resolutionQueue = state.resolutionQueue
  const resolutionIndex = state.resolutionIndex
  const isResolutionOpen = resolutionQueue.length > 0

  // Build the actual ResolutionQueueItem for the current index
  const currentResItem = useMemo<ResolutionQueueItem | null>(() => {
    if (!isResolutionOpen) return null
    const eventId = resolutionQueue[resolutionIndex]
    if (!eventId) return null
    // Find event in map nodes
    for (const node of mapNodes) {
      const ev = node.events.find(e => e.id === eventId)
      if (!ev) continue
      // Check if expired
      if (ev.isExpired || (ev.daysRemaining === 1 && !ev.committed)) {
        return { event: ev, assignedAgents: [], pool: 0, tier: 'clay' as AgentTier, statTotals: {}, isExpired: true, defId: ev.id }
      }
      const assignedAgents = ev.slots
        .filter(s => s.assignedAgentId != null)
        .map(s => allAgents.find(a => a.id === s.assignedAgentId)!)
        .filter(Boolean)
      return buildQueueItem(ev, assignedAgents)
    }
    return null
  }, [isResolutionOpen, resolutionQueue, resolutionIndex, mapNodes, allAgents])

  const stateRef = useLatest(state)
  const resolutionQueueRef = useLatest(resolutionQueue)
  const resolutionIndexRef = useLatest(resolutionIndex)

  // ── Spawning ────────────────────────────────────────────────────────

  const unlockedSet = useMemo(() => new Set<LocationId>(UNLOCKED_BY_DEFAULT), [])

  const runSpawn = useCallback((day: number) => {
    const statesMap = toStatesMap(eventStates)
    const ctx: SpawnContext = {
      currentDay: day,
      eventStates: statesMap,
      unlockedLocations: unlockedSet,
      reputation,
    }
    const toSpawn = selectEventsForDay(ALL_EVENT_DEFINITIONS, ctx)
    for (const def of toSpawn) {
      if (!eventStates[def.id]) {
        dispatch({
          type: 'SPAWN_EVENT',
          node: def.locationId,
          event: definitionToEvent(def),
          runtimeState: { defId: def.id, state: 'onMap', dayPlaced: day },
        })
      }
    }
  }, [eventStates, unlockedSet, reputation, dispatch])

  // Initial spawn on mount
  useEffect(() => {
    runSpawn(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSlotAssign = useCallback((eventId: string, slotId: string, agentId: string | null) =>
    dispatch({ type: 'ASSIGN_AGENT', eventId, slotId, agentId }), [dispatch])

  const handleIntelAssign = useCallback((eventId: string, intelItem: IntelligenceItem | null) =>
    dispatch({ type: 'ASSIGN_INTELLIGENCE', eventId, item: intelItem }), [dispatch])

  const handleCommitEvent = useCallback((eventId: string) => {
    let consumedIntel: IntelligenceItem | null = null
    for (const node of mapNodes) {
      const ev = node.events.find(e => e.id === eventId)
      if (ev) { consumedIntel = ev.assignedIntelligence ?? null; break }
    }
    dispatch({ type: 'COMMIT_EVENT', eventId })
    if (consumedIntel) dispatch({ type: 'SPEND_INTELLIGENCE', intelType: consumedIntel.type, tier: consumedIntel.tier })
  }, [dispatch, mapNodes])

  const handleCancelCommit = useCallback((eventId: string) => {
    let ev: import('@core/types').GameEvent | undefined
    for (const node of mapNodes) { ev = node.events.find(e => e.id === eventId); if (ev) break }
    if (!ev || !ev.committed || ev.inProgress || ev.committedOnDay !== currentDay) return
    dispatch({ type: 'CANCEL_COMMIT', eventId })
    if (ev.assignedIntelligence) dispatch({ type: 'ADD_INTELLIGENCE', intelType: ev.assignedIntelligence.type, tier: ev.assignedIntelligence.tier, amount: 1 })
  }, [dispatch, mapNodes, currentDay])

  const handleEndDay = useCallback(() => {
    const { queue, toCommit } = buildResolutionQueue(mapNodes, allAgents, currentDay)

    // Apply multi-day commitments
    if (toCommit.length > 0) {
      const commitMap = new Map(toCommit.map(c => [c.eventId, c]))
      const updatedNodes = mapNodes.map(node => ({
        ...node,
        events: node.events.map(ev => {
          const commit = commitMap.get(ev.id)
          if (!commit) return ev
          return { ...ev, inProgress: true, resolveOnDay: commit.resolveOnDay }
        }),
      }))
      dispatch({ type: 'SET_MAP_NODES', nodes: updatedNodes })
    }

    if (queue.length === 0) {
      advanceDay()
      return
    }

    const eventIds = queue.map(q => q.defId)
    dispatch({ type: 'SET_RESOLUTION_QUEUE', eventIds })
    checkForDilemma(queue[0])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapNodes, allAgents, currentDay, dispatch])

  const checkForDilemma = useCallback((item: ResolutionQueueItem) => {
    if (item.isExpired) return

    const def = DEFS_BY_ID[item.defId]
    if (def?.dilemma && (def.dilemma.timing === 'before-roll' || def.dilemma.timing === 'standalone')) {
      const dilemmaData: DilemmaData = {
        title: item.event.title,
        location: item.event.locationId,
        narrative: item.event.description,
        question: def.dilemma.prompt,
        choices: def.dilemma.choices.map(c => ({
          id: c.id,
          label: c.label,
          reputationDelta: c.moralWeight as Partial<ReputationState> | undefined,
        })),
      }
      setActiveDilemma(dilemmaData)
      setPendingDilemmaEventId(item.defId)
    }
  }, [])

  const handleDilemmaResolve = useCallback((result: DilemmaResult) => {
    const currentState = stateRef.current
    const repResult = processReputationChange(result.reputationDelta, currentState, `dilemma:${pendingDilemmaEventId}`)
    for (const action of repResult.actions) dispatch(action)
    if (repResult.narrativeEntries.length > 0) dispatch({ type: 'RECORD_NARRATIVES', entries: repResult.narrativeEntries })

    const eventId = resolutionQueueRef.current[resolutionIndexRef.current]
    const def = eventId ? DEFS_BY_ID[eventId] : undefined
    const chosenOption = def?.dilemma?.choices.find(c => c.id === result.choiceId)
    if (chosenOption?.immediateConsequences) {
      const cResult = processConsequences(chosenOption.immediateConsequences, currentState, `dilemma:${pendingDilemmaEventId}:${result.choiceId}`)
      for (const action of cResult.actions) dispatch(action)
      if (cResult.narrativeEntries.length > 0) dispatch({ type: 'RECORD_NARRATIVES', entries: cResult.narrativeEntries })
    }

    if (pendingDilemmaEventId) {
      dispatch({
        type: 'RECORD_NARRATIVE',
        entry: { day: currentDay, kind: 'choice_made', eventId: pendingDilemmaEventId, dilemmaId: def?.dilemma?.id ?? pendingDilemmaEventId, choiceId: result.choiceId },
      })
      // Update event state with choiceId
      const existing = eventStates[pendingDilemmaEventId]
      if (existing) {
        dispatch({ type: 'SET_EVENT_STATE', eventId: pendingDilemmaEventId, state: { ...existing, choiceId: result.choiceId } })
      }
    }

    setActiveDilemma(null)
    setPendingDilemmaEventId(null)

    const curEventId = resolutionQueueRef.current[resolutionIndexRef.current]
    if (chosenOption?.skipDiceRoll || def?.dilemma?.timing === 'standalone') {
      if (curEventId) handleResolutionComplete(curEventId, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRef, pendingDilemmaEventId, currentDay, dispatch, resolutionQueueRef, resolutionIndexRef])

  const handleResolutionComplete = useCallback((eventId: string, success: boolean) => {
    let isExpired = false
    for (const node of mapNodes) {
      const ev = node.events.find(e => e.id === eventId)
      if (ev && (ev.isExpired || (ev.daysRemaining === 1 && !ev.committed))) {
        isExpired = true
        break
      }
    }
    const resolution: ResolutionType = isExpired ? 'expired' : success ? 'success' : 'failure'
    dispatch({ type: 'RESOLVE_EVENT', eventId, resolution, choiceId: eventStates[eventId]?.choiceId })
    dispatch({ type: 'RECORD_NARRATIVE', entry: { day: currentDay, kind: 'event_resolved', eventId, resolution } })

    const nextIdx = resolutionIndex + 1
    if (nextIdx < resolutionQueue.length) {
      dispatch({ type: 'ADVANCE_RESOLUTION' })
      const nextEventId = resolutionQueue[nextIdx]
      for (const node of mapNodes) {
        const ev = node.events.find(e => e.id === nextEventId)
        if (!ev) continue
        const assignedAgents = ev.slots
          .filter(s => s.assignedAgentId != null)
          .map(s => allAgents.find(a => a.id === s.assignedAgentId)!)
          .filter(Boolean)
        const nextItem = ev.isExpired || (ev.daysRemaining === 1 && !ev.committed)
          ? { event: ev, assignedAgents: [], pool: 0, tier: 'clay' as AgentTier, statTotals: {}, isExpired: true, defId: ev.id }
          : buildQueueItem(ev, assignedAgents)
        checkForDilemma(nextItem)
        break
      }
    } else {
      dispatch({ type: 'SET_RESOLUTION_QUEUE', eventIds: [] })
      advanceDay()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapNodes, eventStates, currentDay, state, resolutionIndex, resolutionQueue, allAgents, dispatch])

  const advanceDay = useCallback(() => {
    const resolvedIds = new Set(resolutionQueueRef.current)
    const { nodes: cleanedNodes, expiredIds } = advanceDayOnMap(mapNodes, resolvedIds, currentDay)
    for (const id of expiredIds) {
      dispatch({ type: 'RESOLVE_EVENT', eventId: id, resolution: 'expired' })
      dispatch({ type: 'RECORD_NARRATIVE', entry: { day: currentDay, kind: 'event_resolved', eventId: id, resolution: 'expired' } })
    }

    dispatch({ type: 'SET_MAP_NODES', nodes: cleanedNodes })
    dispatch({ type: 'ADVANCE_DAY' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapNodes, currentDay, dispatch])

  // Spawn new events when day changes
  useEffect(() => {
    if (currentDay <= 1) return
    runSpawn(currentDay)
  }, [currentDay, runSpawn])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(232,213,176,0.1)', background: 'rgba(10,6,4,0.97)' }}>
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-base text-gold">Inner Officials</h1>
          <span className="text-xs text-silk/30">Act 1 -- Taizong's Court</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span className="text-parchment font-serif font-bold">Day {currentDay}</span>
          <span className="text-gold/60">{silver}<span className="text-silk/25"> silver</span></span>
          <span className="text-silk/40">Rank {haremRank} — {RANK_TITLES[haremRank].en.split(' — ')[0]}</span>
        </div>
      </header>

      {/* Reputation bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(232,213,176,0.06)', background: 'rgba(10,6,4,0.95)' }}>
        {([
          ['virtue', 'Virtue', '#00a86b'],
          ['ruthlessness', 'Ruthlessness', '#c02020'],
          ['imperialFavor', 'Favor', '#d4a017'],
          ['shadowReach', 'Shadow', '#7050a0'],
          ['heavenlySight', 'Sight', '#4080c0'],
        ] as const).map(([key, label, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[9px]" style={{ color: `${color}88` }}>{label}</span>
            <span className="text-[11px] font-bold" style={{ color }}>{reputation[key]}</span>
          </div>
        ))}
        {reputation.slander > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[9px] text-red-400/60">Slander</span>
            <span className="text-[11px] font-bold text-red-400">{reputation.slander}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <main className="flex-1 overflow-hidden">
        <PalaceMap
          nodes={mapNodes}
          agents={agents}
          allAgents={allAgents}
          selectedNodeId={selectedNodeId}
          onNodeClick={(id) => setSelectedNodeId(prev => prev === id ? null : id)}
          onSlotAssign={handleSlotAssign}
          onIntelAssign={handleIntelAssign}
          onCommitEvent={handleCommitEvent}
          onCancelCommit={handleCancelCommit}
          onEndDay={handleEndDay}
          currentDay={currentDay}
          goldenDice={goldenDice}
          intelligence={intelligence}
        />
      </main>

      {/* Resolution modal -- dice roll for non-dilemma events */}
      {isResolutionOpen && currentResItem && !activeDilemma && (
        <ResolutionModal
          item={currentResItem}
          index={resolutionIndex}
          total={resolutionQueue.length}
          nextDay={currentDay + 1}
          goldenDiceAvailable={goldenDice}
          onComplete={(success, goldenSpent) => {
            if (goldenSpent > 0) dispatch({ type: 'CHANGE_GOLDEN_DICE', delta: -goldenSpent })
            handleResolutionComplete(currentResItem.defId, success)
          }}
        />
      )}

      {/* Dilemma overlay */}
      {activeDilemma && (
        <Dilemma data={activeDilemma} onResolve={handleDilemmaResolve} />
      )}
    </div>
  )
}
