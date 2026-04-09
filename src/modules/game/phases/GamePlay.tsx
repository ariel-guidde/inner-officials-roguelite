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
import {
  type ResolutionType,
  EVENT_DEFINITIONS_BY_ID as DEFS_BY_ID,
  type SpawnContext,
  selectEventsForDay, ALL_EVENT_DEFINITIONS, definitionToEvent,
} from '@modules/events'
import { EventScreen, ResolutionScreen } from '@modules/event-screen'

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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null)

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
    setSelectedEventId(null) // close event screen if open
    setResolvingEventId(eventIds[0]) // open resolution for first event
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapNodes, allAgents, currentDay, dispatch])

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

  // Chain resolutions: when one finishes (resolvingEventId === null), open the next or advance day
  useEffect(() => {
    if (resolvingEventId !== null) return // still resolving
    if (resolutionQueue.length === 0) return // no queue
    if (resolutionIndex >= resolutionQueue.length) {
      // All done — advance day
      dispatch({ type: 'SET_RESOLUTION_QUEUE', eventIds: [] })
      advanceDay()
      return
    }
    // Open next event in queue
    setResolvingEventId(resolutionQueue[resolutionIndex])
  }, [resolvingEventId, resolutionQueue, resolutionIndex, advanceDay, dispatch])

  // ── Keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: close resolution screen, or close event screen (reset uncommitted)
      if (e.key === 'Escape') {
        if (resolvingEventId) {
          setResolvingEventId(null)
          return
        }
        if (selectedEventId) {
          // Same logic as clicking close — reset uncommitted assignments
          const ev = (() => { for (const n of mapNodes) { const found = n.events.find(x => x.id === selectedEventId); if (found) return found } return null })()
          if (ev && !ev.committed) {
            for (const slot of ev.slots) {
              if (slot.assignedAgentId && !slot.npcAgentId) {
                dispatch({ type: 'ASSIGN_AGENT', eventId: ev.id, slotId: slot.id, agentId: null })
              }
            }
            if (ev.assignedIntelligence) {
              dispatch({ type: 'ADD_INTELLIGENCE', intelType: ev.assignedIntelligence.type, tier: ev.assignedIntelligence.tier, amount: 1 })
              dispatch({ type: 'ASSIGN_INTELLIGENCE', eventId: ev.id, item: null })
            }
          }
          setSelectedEventId(null)
          return
        }
      }

      // Only allow e/Tab when no event or resolution screen is open
      if (!selectedEventId && !resolvingEventId) {
        if (e.key === 'e') {
          handleEndDay()
          return
        }
        if (e.key === 'Tab') {
          e.preventDefault()
          const nodesWithActiveEvents = mapNodes.filter(n =>
            n.events.some(ev => !ev.isCompleted && !ev.isExpired),
          )
          if (nodesWithActiveEvents.length === 0) return
          const currentIdx = selectedNodeId
            ? nodesWithActiveEvents.findIndex(n => n.id === selectedNodeId)
            : -1
          const nextIdx = (currentIdx + 1) % nodesWithActiveEvents.length
          setSelectedNodeId(nodesWithActiveEvents[nextIdx].id)
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resolvingEventId, selectedEventId, selectedNodeId, mapNodes, dispatch, handleEndDay])

  // ── Auto-select node after resolution ─────────────────────────────
  useEffect(() => {
    // When resolvingEventId just became null and there are more events in the queue
    if (resolvingEventId !== null) return
    if (resolutionQueue.length === 0) return
    if (resolutionIndex >= resolutionQueue.length) return
    const nextEventId = resolutionQueue[resolutionIndex]
    if (!nextEventId) return
    for (const node of mapNodes) {
      if (node.events.some(e => e.id === nextEventId)) {
        setSelectedNodeId(node.id)
        break
      }
    }
  }, [resolvingEventId, resolutionQueue, resolutionIndex, mapNodes])

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
          onNodeClick={(id) => {
            if (selectedNodeId === id) {
              setSelectedNodeId(null)
              return
            }
            const node = mapNodes.find(n => n.id === id)
            const activeEvents = node?.events.filter(e => !e.isCompleted && !e.isExpired) ?? []
            if (activeEvents.length === 1) {
              setSelectedNodeId(id)
              setSelectedEventId(activeEvents[0].id)
            } else {
              setSelectedNodeId(id)
            }
          }}
          onEventClick={(eventId) => setSelectedEventId(eventId)}
          onCommitEvent={handleCommitEvent}
          onCancelCommit={handleCancelCommit}
          onEndDay={handleEndDay}
          currentDay={currentDay}
          goldenDice={goldenDice}
          intelligence={intelligence}
        />
      </main>

      {/* Full-screen event view */}
      {selectedEventId && !resolvingEventId && (() => {
        let ev: import('@core/types').GameEvent | undefined
        for (const node of mapNodes) { ev = node.events.find(e => e.id === selectedEventId); if (ev) break }
        if (!ev) return null
        return (
          <EventScreen
            event={ev}
            agents={agents}
            allAgents={allAgents}
            allNodes={mapNodes}
            intelligence={intelligence}
            currentDay={currentDay}
            onSlotAssign={handleSlotAssign}
            onIntelAssign={handleIntelAssign}
            onCommit={handleCommitEvent}
            onCancel={handleCancelCommit}
            onClose={() => {
              // Reset uncommitted assignments when closing
              const ev = (() => { for (const n of mapNodes) { const e = n.events.find(x => x.id === selectedEventId); if (e) return e } return null })()
              if (ev && !ev.committed) {
                for (const slot of ev.slots) {
                  if (slot.assignedAgentId && !slot.npcAgentId) {
                    dispatch({ type: 'ASSIGN_AGENT', eventId: ev.id, slotId: slot.id, agentId: null })
                  }
                }
                if (ev.assignedIntelligence) {
                  dispatch({ type: 'ADD_INTELLIGENCE', intelType: ev.assignedIntelligence.type, tier: ev.assignedIntelligence.tier, amount: 1 })
                  dispatch({ type: 'ASSIGN_INTELLIGENCE', eventId: ev.id, item: null })
                }
              }
              setSelectedEventId(null)
            }}
          />
        )
      })()}

      {/* Resolution screen — progressive narrative + dice + dilemma */}
      {resolvingEventId && (() => {
        let ev: import('@core/types').GameEvent | undefined
        for (const node of mapNodes) { ev = node.events.find(e => e.id === resolvingEventId); if (ev) break }
        if (!ev) return null
        const assignedAgentsList = ev.slots
          .filter(s => s.assignedAgentId)
          .map(s => allAgents.find(a => a.id === s.assignedAgentId)!)
          .filter(Boolean)
        const item = buildQueueItem(ev, assignedAgentsList)
        return (
          <ResolutionScreen
            event={ev}
            assignedAgents={assignedAgentsList}
            pool={item.pool}
            tier={item.tier}
            goldenDiceAvailable={goldenDice}
            rerollsAvailable={0}
            onComplete={(result) => {
              if (result.goldenSpent > 0) dispatch({ type: 'CHANGE_GOLDEN_DICE', delta: -result.goldenSpent })

              const resolution: ResolutionType = result.success ? 'success' : 'failure'
              dispatch({ type: 'RESOLVE_EVENT', eventId: resolvingEventId, resolution, choiceId: result.choiceId })
              dispatch({ type: 'RECORD_NARRATIVE', entry: { day: currentDay, kind: 'event_resolved', eventId: resolvingEventId, resolution } })

              if (result.choiceId) {
                const def = DEFS_BY_ID[resolvingEventId]
                dispatch({ type: 'RECORD_NARRATIVE', entry: { day: currentDay, kind: 'choice_made', eventId: resolvingEventId, dilemmaId: def?.dilemma?.id ?? '', choiceId: result.choiceId } })

                // Process consequences from chosen option
                const choice = def?.dilemma?.choices.find(c => c.id === result.choiceId)
                if (choice?.moralWeight) {
                  const repResult = processReputationChange(choice.moralWeight as Partial<ReputationState>, stateRef.current, `dilemma:${resolvingEventId}`)
                  for (const action of repResult.actions) dispatch(action)
                  if (repResult.narrativeEntries.length > 0) dispatch({ type: 'RECORD_NARRATIVES', entries: repResult.narrativeEntries })
                }
                if (choice?.immediateConsequences) {
                  const cResult = processConsequences(choice.immediateConsequences, stateRef.current, `dilemma:${resolvingEventId}:${result.choiceId}`)
                  for (const action of cResult.actions) dispatch(action)
                  if (cResult.narrativeEntries.length > 0) dispatch({ type: 'RECORD_NARRATIVES', entries: cResult.narrativeEntries })
                }
              }

              // Remove resolved event from the map and clear resolution screen
              dispatch({ type: 'REMOVE_EVENTS', eventIds: [resolvingEventId] })
              dispatch({ type: 'ADVANCE_RESOLUTION' })
              setResolvingEventId(null)
            }}
            onClose={() => setResolvingEventId(null)}
          />
        )
      })()}
    </div>
  )
}
