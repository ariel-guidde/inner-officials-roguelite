// =============================================================================
// Playground — dev harness
// Imports all 3 modules; renders a config sidebar + live preview pane.
// =============================================================================

import { useState, useEffect } from 'react'
import type { Agent, AgentCondition, AgentTier, DiceRollConfig, DiceRollResult, Equipment, EquipmentSlot, GameEvent, IntelligenceItem, IntelligenceType, LocationId, MapNodeData, StatName } from '@core/types'
import { ALL_STATS, STAT_LABELS, CONDITION_LABELS, AGENT_TIER_ORDER, BLOCKING_CONDITIONS, EQUIPMENT_SLOT_ICONS, EQUIPMENT_SLOT_LABELS } from '@core/types'
import { bus } from '@core/events'
import { passChance, rollFeeling } from '@modules/dice'
import { Dice }       from '@modules/dice'
import { Map as PalaceMap, type ResolutionEntry, URGENCY_COLOR, URGENCY_LABEL } from '@modules/map'
import { Characters } from '@modules/characters'
import { meetsRequirements, applyEquipmentBonuses } from '@lib/equipment'
import { Inventory }  from '@modules/inventory'
import { DICE_DEFAULTS }          from './configs/diceDefaults'
import { buildEmptyMapNodes }     from './configs/mapDefaults'
import { CHARACTERS_DEFAULTS }    from './configs/charactersDefaults'
import { ALL_EQUIPMENT }          from './configs/equipmentDefaults'
import { INTELLIGENCE_DEFAULTS }  from './configs/intelligenceDefaults'
import {
  StorylineEditor,
  type EventRuntimeState,
  type ResolutionType,
  ALL_EVENT_DEFINITIONS,
  ALL_STORYLINES,
  EVENT_DEFINITIONS_BY_ID as DEFS_BY_ID,
  type SpawnContext,
} from '@modules/events'
import {
  type ResolutionQueueItem,
  assignSlot, assignIntelligence, commitEvent, cancelCommit,
  spawnEventsOnMap, buildResolutionQueue, advanceDayOnMap,
  UNLOCKED_BY_DEFAULT,
} from '@modules/map'

type ActiveModule = 'dice' | 'map' | 'characters' | 'inventory' | 'events'

export interface PlaygroundProps {
  activeModule?: ActiveModule
  showEventLog?: boolean
}

export function Playground({ activeModule: initialModule = 'dice', showEventLog = true }: PlaygroundProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>(initialModule)
  const [diceConfig, setDiceConfig] = useState<DiceRollConfig>(DICE_DEFAULTS)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)
  const [pendingRoll, setPendingRoll] = useState<DiceRollConfig | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<LocationId | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [mapNodes, setMapNodes] = useState<MapNodeData[]>(() => buildEmptyMapNodes())
  const [currentDay, setCurrentDay] = useState(1)

  // Available agents = Lady Wu + her followers only (not NPCs, rivals, imperial figures)
  const [availableAgentIds, setAvailableAgentIds] = useState<Set<string>>(
    () => new Set(CHARACTERS_DEFAULTS.filter(a =>
      (a.tags.includes('protagonist') || a.tags.includes('follower')) &&
      !a.conditions.some(c => BLOCKING_CONDITIONS.has(c as AgentCondition))
    ).map(a => a.id))
  )

  // Resolution queue — live dice roll per event
  const [resolutionQueue, setResolutionQueue] = useState<ResolutionQueueItem[]>([])
  const [resolutionIndex, setResolutionIndex] = useState(0)
  const [resolutionResults, setResolutionResults] = useState<ResolutionEntry[]>([])
  const isResolutionOpen = resolutionQueue.length > 0
  const currentResolutionItem = isResolutionOpen ? resolutionQueue[resolutionIndex] : null

  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem('playground-agents')
      return saved ? (JSON.parse(saved) as Agent[]) : CHARACTERS_DEFAULTS
    } catch { return CHARACTERS_DEFAULTS }
  })
  const availableAgents = agents.filter(a => availableAgentIds.has(a.id))
  // Items in the pool = ALL_EQUIPMENT minus whatever is equipped by any agent
  const equippedIds = new Set(
    agents.flatMap(a => Object.values(a.equipment ?? {}).filter(Boolean).map((e) => (e as Equipment).id))
  )
  const poolItems = ALL_EQUIPMENT.filter(e => !equippedIds.has(e.id))

  // Persist agents to localStorage on every change
  useEffect(() => {
    localStorage.setItem('playground-agents', JSON.stringify(agents))
  }, [agents])

  const handleAgentUpdate = (agentId: string, patch: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...patch } : a))
  }

  const handleEquip = (agentId: string, slot: EquipmentSlot, item: Equipment) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a
      return { ...a, equipment: { ...a.equipment, [slot]: item } }
    }))
  }

  const handleUnequip = (agentId: string, slot: EquipmentSlot) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a
      return { ...a, equipment: { ...a.equipment, [slot]: null } }
    }))
  }

  // Golden dice — add an auto-success to a settled roll
  const [goldenDiceAvailable, setGoldenDiceAvailable] = useState(3)
  const [goldenDiceSpent, setGoldenDiceSpent] = useState(0)
  // Intelligence — counted resource (no longer scroll cards)

  // Rerolls — simple generic reroll resource (dice module only)
  const [rerollsAvailable, setRerollsAvailable] = useState(1)
  // Event runtime states — the state machine for every event definition
  const [eventStates, setEventStates] = useState<Map<string, EventRuntimeState>>(() => new Map())
  // Active storylines — which storylines spawn events on the map
  const [activeStorylineIds, setActiveStorylineIds] = useState<Set<string>>(
    () => new Set(ALL_STORYLINES.map(s => s.id))
  )

  // ── Spawn context + pool draw using shared utilities ──
  const buildSpawnContext = (): SpawnContext => ({
    currentDay,
    eventStates,
    unlockedLocations: new Set<LocationId>(UNLOCKED_BY_DEFAULT),
  })

  const runPoolDraw = () => {
    const ctx = buildSpawnContext()
    const result = spawnEventsOnMap(mapNodes, eventStates, ctx, currentDay)
    setMapNodes(result.nodes)
    setEventStates(result.states)
  }

  // Spawn on mount
  useEffect(() => {
    runPoolDraw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleStoryline = (id: string) => {
    setActiveStorylineIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Re-draw when storylines toggle
  useEffect(() => {
    // Clear map and re-run pool
    setMapNodes(prev => prev.map(node => ({ ...node, events: [] })))
    // Reset non-resolved event states
    setEventStates(prev => {
      const next = new Map(prev)
      for (const [id, s] of next) {
        if (s.state === 'onMap') next.delete(id)
      }
      return next
    })
    runPoolDraw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStorylineIds])

  const logEvent = (msg: string) =>
    setEventLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)])

  const handleRollSettled = (result: DiceRollResult) => {
    // Re-apply any golden dice that carried over from a reroll
    let final = result
    if (goldenDiceSpent > 0) {
      const successes = result.successes + goldenDiceSpent
      final = {
        ...result,
        successes,
        isSuccess: successes >= diceConfig.threshold,
        isCriticalFailure: false,
        margin: successes - diceConfig.threshold,
      }
    }
    setLastResult(final)
    setPendingRoll(null)
    bus.emit('dice:rollSettled', final)
    logEvent(`dice:rollSettled — ${final.successes} successes (${goldenDiceSpent > 0 ? `+${goldenDiceSpent} golden` : 'no golden'}), ${final.isSuccess ? '✓ PASS' : '✗ FAIL'}`)
  }

  const handleTriggerRoll = () => {
    const config = { ...diceConfig, goldenDice: 0 }
    setGoldenDiceSpent(0)
    setLastResult(null)
    setPendingRoll(config)
    bus.emit('dice:rollRequested', config)
    logEvent(`dice:rollRequested — pool ${diceConfig.pool}, threshold ${diceConfig.threshold}`)
  }

  const handleSpendGoldenDie = () => {
    if (goldenDiceAvailable <= 0 || !lastResult) return
    setGoldenDiceAvailable((n) => n - 1)
    setGoldenDiceSpent((n) => n + 1)
    // Patch the result directly — golden dice are auto-successes
    setLastResult((prev) => {
      if (!prev) return prev
      const successes = prev.successes + 1
      return {
        ...prev,
        successes,
        isSuccess: successes >= diceConfig.threshold,
        isCriticalFailure: false,
        margin: successes - diceConfig.threshold,
      }
    })
    logEvent(`golden die spent — ${goldenDiceAvailable - 1} remaining`)
  }

  const handleReroll = () => {
    if (rerollsAvailable <= 0) return
    setRerollsAvailable((n) => n - 1)
    // golden dice stay in the scene and carry their successes into the new result
    setLastResult(null)
    setPendingRoll({ ...diceConfig, goldenDice: 0 })
    logEvent(`reroll spent — ${rerollsAvailable - 1} remaining, ${goldenDiceSpent} golden die${goldenDiceSpent !== 1 ? 's' : ''} carry over`)
  }

  const handleNodeClick = (locationId: LocationId) => {
    setSelectedNodeId(locationId)
    bus.emit('map:nodeSelected', { locationId })
    logEvent(`map:nodeSelected — ${locationId}`)
  }

  const handleEventClick = (event: GameEvent) => {
    bus.emit('map:eventOpened', { eventId: event.id })
    logEvent(`map:eventOpened — ${event.title}`)
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId)
    bus.emit('characters:agentSelected', { agentId })
    logEvent(`characters:agentSelected — ${agentId}`)
  }

  const handleSlotAssign = (eventId: string, slotId: string, agentId: string | null) => {
    setMapNodes(prev => assignSlot(prev, eventId, slotId, agentId))
    const agentName = agentId ? (agents.find(a => a.id === agentId)?.name ?? agentId) : 'unassigned'
    logEvent(`slot:assigned — ${slotId} → ${agentName}`)
  }

  const handleIntelAssign = (eventId: string, intelItem: IntelligenceItem | null) => {
    setMapNodes(prev => assignIntelligence(prev, eventId, intelItem))
    logEvent(`intel:assigned — ${eventId} → ${intelItem ? `${intelItem.type}/${intelItem.tier}` : 'none'}`)
  }

  const handleCommitEvent = (eventId: string) => {
    const { nodes } = commitEvent(mapNodes, eventId, currentDay)
    setMapNodes(nodes)
    logEvent(`event:committed — ${eventId}`)
  }

  const handleCancelCommit = (eventId: string) => {
    const result = cancelCommit(mapNodes, eventId, currentDay)
    if (!result) return
    setMapNodes(result.nodes)
    logEvent(`event:cancel — ${eventId}`)
  }

  // ── End-of-day resolution (uses shared buildResolutionQueue) ──────

  const handleEndDay = () => {
    const { queue, toCommit } = buildResolutionQueue(mapNodes, agents, currentDay)

    // Apply multi-day commitments
    if (toCommit.length > 0) {
      const commitMap = new Map(toCommit.map(c => [c.eventId, c]))
      setMapNodes(prev => prev.map(node => ({
        ...node,
        events: node.events.map(ev => {
          const commit = commitMap.get(ev.id)
          if (!commit) return ev
          return { ...ev, inProgress: true, resolveOnDay: commit.resolveOnDay }
        }),
      })))
      toCommit.forEach(c => logEvent(`event:committed — ${c.eventId}, resolves day ${c.resolveOnDay}`))
    }

    if (queue.length === 0) {
      applyDayEnd([])
      return
    }

    setResolutionQueue(queue)
    setResolutionIndex(0)
    setResolutionResults([])
    logEvent(`day:end — ${queue.length} event(s) to resolve`)
  }

  const handleResolutionSettled = (result: DiceRollResult) => {
    const item = resolutionQueue[resolutionIndex]
    logEvent(`event:resolved — ${item.event.title} → ${result.isSuccess ? 'success' : 'failure'}`)
  }

  const handleResolutionNext = (
    result?: DiceRollResult,
    spent?: { golden: number },
  ) => {
    // Deduct spent resources
    if (spent) {
      if (spent.golden > 0)
        setGoldenDiceAvailable(n => Math.max(0, n - spent.golden))
    }

    const item = resolutionQueue[resolutionIndex]
    const isLast = resolutionIndex + 1 >= resolutionQueue.length

    let currentEntry: ResolutionEntry
    if (item.isExpired && !result) {
      currentEntry = {
        event: item.event, agentNames: [], totalPool: 0,
        rollResult: null, success: false, margin: -item.event.threshold, outcome: 'expired',
      }
    } else if (result) {
      currentEntry = {
        event:      item.event,
        agentNames: item.assignedAgents.map(a => a.name),
        totalPool:  item.pool,
        rollResult: result,
        success:    result.isSuccess,
        margin:     result.margin,
        outcome:    result.isSuccess ? 'success' : 'failure',
      }
    } else {
      return
    }

    const updatedResults = [...resolutionResults, currentEntry]

    if (isLast) {
      applyDayEnd(updatedResults)
    } else {
      setResolutionResults(updatedResults)
      setResolutionIndex(resolutionIndex + 1)
    }
  }

  const applyDayEnd = (entries: ResolutionEntry[]) => {
    const allResolvedIds = new Set(entries.map(e => e.event.id))
    const nextDay = currentDay + 1

    // 1. Record resolutions in the event state machine
    setEventStates(prev => {
      const next = new Map(prev)
      for (const e of entries) {
        const resolution: ResolutionType = e.outcome === 'expired' ? 'expired'
          : e.rollResult?.isCriticalSuccess ? 'criticalSuccess'
          : e.rollResult?.isCriticalFailure ? 'criticalFailure'
          : e.success ? 'success' : 'failure'
        const existing = next.get(e.event.id)
        next.set(e.event.id, {
          defId: e.event.id,
          state: 'resolved',
          resolution,
          choiceId: existing?.choiceId,
          dayPlaced: existing?.dayPlaced,
          dayResolved: currentDay,
        })
      }
      return next
    })

    // 2. Clean map using shared utility (handles timer expiry too)
    const { nodes: cleanedNodes, expiredIds } = advanceDayOnMap(mapNodes, allResolvedIds, currentDay)
    setMapNodes(cleanedNodes)

    // 3. Record any timer-expired events in state
    if (expiredIds.length > 0) {
      setEventStates(prev => {
        const next = new Map(prev)
        for (const id of expiredIds) {
          next.set(id, { defId: id, state: 'resolved', resolution: 'expired', dayResolved: currentDay })
        }
        return next
      })
    }

    // 4. Advance day
    setCurrentDay(nextDay)
    setResolutionQueue([])
    setResolutionIndex(0)
    setResolutionResults([])
    logEvent(`day:complete — Day ${nextDay} begins`)
  }

  // Spawn new events when day changes
  useEffect(() => {
    if (currentDay <= 1) return
    runPoolDraw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay])

  // DEFS_BY_ID imported from @modules/events for definition lookups

  // Probability shown pre-roll: no golden dice (they're a post-roll choice)
  const passProbability = passChance(diceConfig.pool, diceConfig.threshold, diceConfig.difficulty, 0)

  return (
    <div className="flex h-screen bg-ink text-parchment font-sans overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 bg-ink border-r border-silk/20 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-silk/20">
          <h1 className="font-serif text-lg text-gold font-bold">Inner Officials</h1>
          <p className="text-xs text-silk/50 mt-0.5">Dev Playground</p>
        </div>

        {/* Module selector */}
        <div className="p-4 border-b border-silk/20">
          <label className="text-xs uppercase tracking-wider text-silk/50 block mb-2">Module</label>
          <div className="flex gap-1 flex-wrap">
            {(['dice', 'map', 'characters', 'inventory', 'events'] as ActiveModule[]).map((m) => (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={`flex-1 py-1.5 text-xs rounded capitalize transition-colors
                  ${activeModule === m
                    ? 'bg-vermilion text-parchment'
                    : 'bg-silk/10 text-silk/60 hover:bg-silk/20'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Module-specific controls */}
        <div className="p-4 flex-1">
          {activeModule === 'dice' && (
            <DiceControls
              config={diceConfig}
              onChange={setDiceConfig}
              passProb={passProbability}
              goldenDiceAvailable={goldenDiceAvailable}
              onGoldenDiceAvailableChange={setGoldenDiceAvailable}
              rerollsAvailable={rerollsAvailable}
              onRerollsAvailableChange={setRerollsAvailable}
            />
          )}
          {activeModule === 'map' && (
            <MapControls
              selectedNodeId={selectedNodeId}
              currentDay={currentDay}
              isResolutionOpen={isResolutionOpen}
              agents={agents}
              availableAgentIds={availableAgentIds}
              onToggleAgent={(id) => setAvailableAgentIds(prev => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })}
              activeStorylineIds={activeStorylineIds}
              onToggleStoryline={handleToggleStoryline}
            />
          )}
          {activeModule === 'characters' && (
            <CharactersControls
              agents={agents}
              poolItems={poolItems}
              selectedAgentId={selectedAgentId}
              onSelect={setSelectedAgentId}
              onAgentUpdate={handleAgentUpdate}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          )}
          {activeModule === 'inventory' && (
            <div className="text-xs text-silk/40 space-y-1">
              <p>Click an agent to manage their loadout.</p>
              <p>Hover items to preview. Click Equip to assign.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Preview pane ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Module preview */}
        <div className={`flex-1 overflow-auto ${activeModule === 'map' || activeModule === 'events' ? '' : 'p-6'}`}>
          {activeModule === 'dice' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-silk/70 text-sm">Dice Module Preview</h2>
                <button
                  onClick={handleTriggerRoll}
                  className="px-4 py-1.5 bg-vermilion hover:bg-vermilion/80 text-parchment text-sm rounded transition-colors"
                >
                  Roll {diceConfig.pool}d
                </button>
              </div>
              <Dice
                rollConfig={pendingRoll}
                onRollSettled={handleRollSettled}
                onRollStarted={() => logEvent('dice:rollStarted')}
                canvasHeight="400px"
                goldenDiceSpent={goldenDiceSpent}
                displayResult={lastResult}
                onDismiss={() => {
                  setLastResult(null)
                  setGoldenDiceSpent(0)
                  setPendingRoll(null)
                  logEvent('result dismissed')
                }}
                onReroll={rerollsAvailable > 0 && lastResult ? handleReroll : undefined}
              />
              {lastResult && goldenDiceAvailable > 0 && (
                <button
                  onClick={handleSpendGoldenDie}
                  className="self-center px-4 py-1.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-sm rounded transition-colors"
                >
                  Add Golden Die 🌕 ({goldenDiceAvailable} remaining)
                </button>
              )}
            </div>
          )}

          {activeModule === 'map' && (
            <PalaceMap
              nodes={mapNodes}
              agents={availableAgents}
              allAgents={agents}
              selectedNodeId={selectedNodeId}
              onNodeClick={(id) => setSelectedNodeId(prev => prev === id ? null : id)}
              onSlotAssign={handleSlotAssign}
              onIntelAssign={handleIntelAssign}
              onCommitEvent={handleCommitEvent}
              onCancelCommit={handleCancelCommit}
              onEndDay={handleEndDay}
              currentDay={currentDay}
              goldenDice={goldenDiceAvailable}
            />
          )}

          {activeModule === 'characters' && (
            <Characters
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              showPoolSummary
            />
          )}

          {activeModule === 'inventory' && (
            <Inventory
              poolItems={poolItems}
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          )}

          {activeModule === 'events' && (
            <StorylineEditor
              currentDay={currentDay}
              eventStates={eventStates}
              activeStorylineIds={activeStorylineIds}
              onToggleStoryline={handleToggleStoryline}
            />
          )}
        </div>

        {/* Event log */}
        {showEventLog && (
          <div className="h-36 border-t border-silk/20 bg-ink/80 overflow-y-auto p-3">
            <div className="text-xs uppercase tracking-wider text-silk/30 mb-2">Event Log</div>
            {eventLog.length === 0
              ? <div className="text-xs text-silk/20 italic">No events yet</div>
              : eventLog.map((entry, i) => (
                  <div key={i} className="text-xs text-silk/60 font-mono leading-5">{entry}</div>
                ))
            }
          </div>
        )}
      </main>

      {/* Resolution modal — overlays everything */}
      {isResolutionOpen && currentResolutionItem && (
        <ResolutionModal
          item={currentResolutionItem}
          index={resolutionIndex}
          total={resolutionQueue.length}
          difficulty={diceConfig.difficulty}
          nextDay={currentDay + 1}
          goldenDiceAvailable={goldenDiceAvailable}
          onSettled={handleResolutionSettled}
          onNext={handleResolutionNext}
          onDilemmaChoice={(eventDefId, choiceId) => {
            // Record the choice in the event's runtime state
            setEventStates(prev => {
              const next = new Map(prev)
              const existing = next.get(eventDefId)
              if (existing) {
                next.set(eventDefId, { ...existing, choiceId })
              }
              return next
            })
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-controls (Playground-internal — not exported)
// ---------------------------------------------------------------------------

function ResolutionModal({ item, index, total, difficulty, nextDay,
    goldenDiceAvailable, onSettled, onNext, onDilemmaChoice }: {
  item: ResolutionQueueItem
  index: number
  total: number
  difficulty: DiceRollConfig['difficulty']
  nextDay: number
  goldenDiceAvailable: number
  onSettled: (r: DiceRollResult) => void
  onNext: (r?: DiceRollResult, spent?: { golden: number }) => void
  onDilemmaChoice?: (eventDefId: string, choiceId: string) => void
}) {
  const [rollConfig, setRollConfig] = useState<DiceRollConfig | null>(null)
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null)
  const [goldenSpent, setGoldenSpent] = useState(0)
  const isLast = index === total - 1

  // Dilemma state
  const def = item.defId ? DEFS_BY_ID[item.defId] : undefined
  const dilemma = def?.dilemma
  const showDilemmaBefore = dilemma && dilemma.timing === 'before-roll'
  const showDilemmaStandalone = dilemma && dilemma.timing === 'standalone'
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const selectedChoice = dilemma?.choices.find(c => c.id === selectedChoiceId)

  // Effective threshold/pool accounting for choice overrides
  const effectiveThreshold = selectedChoice?.overrideThreshold ?? item.event.threshold

  const triggerRoll = (pool: number, threshold?: number) => {
    setRollResult(null)
    setRollConfig({
      pool,
      threshold: threshold ?? effectiveThreshold,
      tier: item.tier,
      difficulty,
      goldenDice: 0,
      eventLabel: item.event.title,
    })
  }

  useEffect(() => {
    setRollResult(null)
    setGoldenSpent(0)
    setSelectedChoiceId(null)
    // Auto-trigger roll only if no dilemma (or dilemma is after-roll)
    if (!item.isExpired && !showDilemmaBefore && !showDilemmaStandalone) {
      const t = setTimeout(() => triggerRoll(item.pool), 200)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.event.id, item.pool, item.isExpired])

  const uc = URGENCY_COLOR[item.event.urgency]

  // Effective result after golden dice adjustments
  const effectiveResult = rollResult ? (() => {
    if (goldenSpent === 0) return rollResult
    const successes = rollResult.successes + goldenSpent
    return {
      ...rollResult,
      successes,
      isSuccess: successes >= effectiveThreshold,
      isCriticalFailure: false,
      margin: successes - effectiveThreshold,
    }
  })() : null

  const handleSpendGolden = () => {
    if (goldenSpent >= goldenDiceAvailable || !rollResult) return
    setGoldenSpent(n => n + 1)
  }

  const handleNext = () => {
    onNext(effectiveResult ?? undefined, { golden: goldenSpent })
  }

  const handleChoicePick = (choiceId: string) => {
    setSelectedChoiceId(choiceId)
    const choice = dilemma?.choices.find(c => c.id === choiceId)
    if (dilemma) {
      onDilemmaChoice?.(item.defId ?? item.event.id, choiceId)
    }
    if (choice?.skipDiceRoll) {
      // Standalone resolution — create a synthetic success result
      // and proceed directly
    } else {
      // Trigger roll with overridden stats (pool stays same for now, threshold may change)
      setTimeout(() => triggerRoll(item.pool, choice?.overrideThreshold), 200)
    }
  }

  // Dilemma choice selection phase
  const needsChoiceFirst = (showDilemmaBefore || showDilemmaStandalone) && !selectedChoiceId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,3,1,0.88)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#0d0800', border: '1px solid rgba(232,213,176,0.13)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-silk/35">{index + 1} / {total}</span>
            <div className="flex items-center gap-2">
              {dilemma && (
                <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                  style={{ background: 'rgba(255,180,0,0.15)', color: 'rgba(255,180,0,0.8)' }}>
                  Dilemma
                </span>
              )}
              <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: `${uc.badge}22`, color: uc.badge }}>
                {URGENCY_LABEL[item.event.urgency]}
              </span>
            </div>
          </div>
          <h2 className="font-serif text-lg text-parchment leading-tight">{item.event.title}</h2>
          <p className="text-[10px] text-silk/40 mt-0.5 leading-relaxed line-clamp-2">{item.event.description}</p>
        </div>

        {item.isExpired ? (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div className="text-4xl">⌛</div>
            <div className="text-parchment/60 font-serif text-base">Event Expired</div>
            <div className="text-[10px] text-silk/35">No agents were assigned before the deadline.</div>
            <button onClick={handleNext} className="mt-2 px-5 py-2 rounded-lg text-sm font-serif"
              style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.18)', color: 'rgba(232,213,176,0.6)' }}>
              {isLast ? `Begin Day ${nextDay} →` : 'Next →'}
            </button>
          </div>
        ) : needsChoiceFirst ? (
          /* ── Dilemma choice phase ── */
          <div className="px-5 py-4 overflow-y-auto flex-1">
            <p className="text-[11px] text-silk/60 leading-relaxed mb-4 italic font-serif">{dilemma!.prompt}</p>
            <div className="space-y-2">
              {dilemma!.choices.map(choice => (
                <button key={choice.id}
                  className="w-full text-left rounded-lg p-3 transition-all hover:brightness-125"
                  style={{
                    background: 'rgba(255,180,0,0.05)',
                    border: '1px solid rgba(255,180,0,0.2)',
                  }}
                  onClick={() => handleChoicePick(choice.id)}>
                  <div className="font-serif text-[12px] font-semibold" style={{ color: 'rgba(255,200,60,0.9)' }}>
                    {choice.label}
                  </div>
                  <div className="text-[9px] text-silk/45 mt-1 leading-relaxed">{choice.description}</div>

                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {choice.overrideStats && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(120,180,255,0.12)', color: 'rgba(120,180,255,0.75)' }}>
                        {choice.overrideStats.map(s => STAT_LABELS[s].en).join(' + ')}
                        {choice.overrideThreshold != null && ` ≥ ${choice.overrideThreshold}✓`}
                      </span>
                    )}
                    {choice.skipDiceRoll && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(180,120,255,0.12)', color: 'rgba(180,120,255,0.75)' }}>
                        no dice roll
                      </span>
                    )}
                    {choice.moralWeight && Object.entries(choice.moralWeight).filter(([,v]) => v !== 0).map(([k, v]) => (
                      <span key={k} className="text-[7px] px-1.5 py-0.5 rounded"
                        style={{
                          background: (v as number) > 0 ? 'rgba(0,180,100,0.12)' : 'rgba(220,60,60,0.12)',
                          color: (v as number) > 0 ? 'rgba(0,200,120,0.75)' : 'rgba(220,80,80,0.75)',
                        }}>
                        {k} {(v as number) > 0 ? '+' : ''}{v as number}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : selectedChoice?.skipDiceRoll ? (
          /* ── Standalone dilemma — no dice, just show choice result ── */
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div className="text-[11px] text-silk/50 italic font-serif text-center max-w-xs">
              "{selectedChoice.label}"
            </div>
            {selectedChoice.immediateConsequences?.map((c, i) => (
              c.kind === 'narrative' && (
                <div key={i} className="text-[10px] text-silk/40 italic text-center">{c.text}</div>
              )
            ))}
            {selectedChoice.moralWeight && (
              <div className="flex gap-2 mt-2">
                {Object.entries(selectedChoice.moralWeight).filter(([,v]) => v !== 0).map(([k, v]) => (
                  <span key={k} className="text-[9px] px-2 py-1 rounded"
                    style={{
                      background: (v as number) > 0 ? 'rgba(0,180,100,0.1)' : 'rgba(220,60,60,0.1)',
                      border: `1px solid ${(v as number) > 0 ? 'rgba(0,180,100,0.3)' : 'rgba(220,60,60,0.3)'}`,
                      color: (v as number) > 0 ? 'rgba(0,200,120,0.8)' : 'rgba(220,80,80,0.8)',
                    }}>
                    {k} {(v as number) > 0 ? '+' : ''}{v as number}
                  </span>
                ))}
              </div>
            )}
            <button onClick={() => {
              // Create synthetic success result for standalone choices
              const syntheticResult: DiceRollResult = {
                dice: [], successes: 1, isSuccess: true,
                isCriticalSuccess: false, isCriticalFailure: false, margin: 1,
              }
              onNext(syntheticResult, { golden: 0 })
            }}
              className="mt-4 px-5 py-2 rounded-lg text-sm font-serif font-semibold transition-all hover:brightness-125"
              style={{
                background: isLast ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
                border: `1px solid ${isLast ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
                color: isLast ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
              }}>
              {isLast ? `Begin Day ${nextDay} →` : 'Next →'}
            </button>
          </div>
        ) : (
          <>
            {/* Chosen approach indicator */}
            {selectedChoice && (
              <div className="px-5 py-2 border-b border-silk/10 flex-shrink-0"
                style={{ background: 'rgba(255,180,0,0.04)' }}>
                <div className="text-[8px] uppercase tracking-widest text-silk/30 mb-0.5">Chosen approach</div>
                <div className="text-[11px] font-serif" style={{ color: 'rgba(255,200,60,0.8)' }}>
                  {selectedChoice.label}
                </div>
              </div>
            )}

            {/* Stat breakdown */}
            <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
              <div className="flex items-start gap-4 flex-wrap">
                {(selectedChoice?.overrideStats ?? item.event.statsChecked).map(stat => (
                  <div key={stat} className="min-w-[60px]">
                    <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">{STAT_LABELS[stat].en}</div>
                    <div className="text-xl font-bold" style={{ color: uc.badge }}>{item.statTotals[stat] ?? 0}</div>
                    {item.assignedAgents.map(a => {
                      const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
                      return (
                        <div key={a.id} className="text-[8px] text-silk/30">
                          {a.name.split(' ')[0]}: {eff[stat] ?? 0}
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div className="ml-auto text-right border-l border-silk/10 pl-4">
                  <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">Dice Pool</div>
                  <div className="text-xl font-bold text-parchment">{item.pool}d</div>
                  <div className="text-[9px] text-silk/35">need {effectiveThreshold}✓</div>
                  {item.event.oppositionValue > 0 && (
                    <div className="text-[8px] text-red-400/55 mt-0.5">−{item.event.oppositionValue} opp</div>
                  )}
                </div>
              </div>
              {item.assignedAgents.length > 0 && (
                <div className="text-[9px] text-silk/35 mt-2">
                  {item.assignedAgents.map(a => a.name).join(' · ')}
                </div>
              )}
            </div>

            {/* Dice */}
            <div className="flex-1 min-h-0" style={{ height: 200 }}>
              <Dice
                rollConfig={rollConfig}
                onRollSettled={(r) => { setRollResult(r); onSettled(r) }}
                canvasHeight="200px"
                goldenDiceSpent={goldenSpent}
                displayResult={effectiveResult}
                onDismiss={() => {}}
              />
            </div>

            {/* Result + resources + Next */}
            {effectiveResult && (
              <div className="px-5 py-3 border-t border-silk/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold font-serif"
                      style={{ color: effectiveResult.isSuccess ? '#00a86b' : '#e04030' }}>
                      {effectiveResult.isSuccess ? '✓ Success' : '✗ Failed'}
                    </div>
                    <div className="text-[10px] text-silk/40 mt-0.5">
                      {effectiveResult.successes} of {effectiveThreshold} needed
                      {effectiveResult.margin !== 0 && (
                        <span style={{ color: effectiveResult.margin > 0 ? '#00a86b88' : '#e0403088' }}>
                          {' '}({effectiveResult.margin > 0 ? '+' : ''}{effectiveResult.margin})
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={handleNext}
                    className="px-5 py-2 rounded-lg text-sm font-serif font-semibold transition-all hover:brightness-125"
                    style={{
                      background: isLast ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
                      border: `1px solid ${isLast ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
                      color: isLast ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
                    }}>
                    {isLast ? `Begin Day ${nextDay} →` : 'Next →'}
                  </button>
                </div>

                {/* Resource spending row */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {/* Golden die */}
                  <button
                    onClick={handleSpendGolden}
                    disabled={goldenSpent >= goldenDiceAvailable}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all disabled:opacity-30"
                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.85)' }}>
                    🌕 Golden Die <span className="text-[8px] opacity-60">({goldenDiceAvailable - goldenSpent})</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function DiceControls({
  config,
  onChange,
  passProb,
  goldenDiceAvailable,
  onGoldenDiceAvailableChange,
  rerollsAvailable,
  onRerollsAvailableChange,
}: {
  config: DiceRollConfig
  onChange: (c: DiceRollConfig) => void
  passProb: number
  goldenDiceAvailable: number
  onGoldenDiceAvailableChange: (n: number) => void
  rerollsAvailable: number
  onRerollsAvailableChange: (n: number) => void
}) {
  const set = (patch: Partial<DiceRollConfig>) => onChange({ ...config, ...patch })

  return (
    <div className="space-y-4 text-sm">
      <Slider label="Pool"      value={config.pool}      min={0}  max={16} onChange={(v) => set({ pool: v })} />
      <Slider label="Threshold" value={config.threshold} min={1}  max={12} onChange={(v) => set({ threshold: v })} />

      <div>
        <label className="text-xs text-silk/50 uppercase tracking-wider block mb-1">Tier</label>
        <select
          className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
          value={config.tier}
          onChange={(e) => set({ tier: e.target.value as DiceRollConfig['tier'] })}
        >
          {(['clay', 'bronze', 'silver', 'gold', 'jade'] as const).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-silk/50 uppercase tracking-wider block mb-1">Difficulty</label>
        <select
          className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
          value={config.difficulty}
          onChange={(e) => set({ difficulty: e.target.value as DiceRollConfig['difficulty'] })}
        >
          <option value="gentle">Gentle (60%)</option>
          <option value="standard">Standard (50%)</option>
          <option value="ruthless">Ruthless (40%)</option>
        </select>
      </div>

      <div className="pt-2 border-t border-silk/10 space-y-3">
        <div>
          <Slider
            label="Golden Dice 🌕"
            value={goldenDiceAvailable}
            min={0} max={5}
            onChange={onGoldenDiceAvailableChange}
          />
          <p className="text-xs text-silk/30 mt-1">Auto-success, spent after roll</p>
        </div>
        <div>
          <Slider
            label="Rerolls ↺"
            value={rerollsAvailable}
            min={0} max={5}
            onChange={onRerollsAvailableChange}
          />
          <p className="text-xs text-silk/30 mt-1">Generic reroll from events/equipment</p>
        </div>
      </div>

      <div className="pt-2 border-t border-silk/10 text-xs text-silk/60">
        Pass chance: <span className="text-gold font-bold">{(passProb * 100).toFixed(1)}%</span>
        <span className="ml-2 text-silk/40">({rollFeeling(passProb)})</span>
      </div>
    </div>
  )
}

function MapControls({ selectedNodeId, currentDay, isResolutionOpen, agents, availableAgentIds, onToggleAgent, activeStorylineIds, onToggleStoryline }: {
  selectedNodeId: LocationId | null
  currentDay: number
  isResolutionOpen: boolean
  agents: Agent[]
  availableAgentIds: Set<string>
  onToggleAgent: (id: string) => void
  activeStorylineIds: Set<string>
  onToggleStoryline: (id: string) => void
}) {
  return (
    <div className="text-xs space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-1">Day</div>
        <div className="font-serif text-parchment text-xl">Day {currentDay}</div>
        {isResolutionOpen && (
          <div className="text-[10px] text-gold/55 mt-1 animate-pulse uppercase tracking-wider">Resolving…</div>
        )}
      </div>

      {selectedNodeId && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-1">Selected</div>
          <div className="text-parchment/65 font-mono text-[10px]">{selectedNodeId}</div>
        </div>
      )}

      {/* Active storylines */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-2">Active Storylines</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {ALL_STORYLINES.map(sl => {
            const hasDilemma = ALL_EVENT_DEFINITIONS
              .filter(d => sl.eventIds.includes(d.id))
              .some(d => d.dilemma)
            return (
              <label key={sl.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeStorylineIds.has(sl.id)}
                  onChange={() => onToggleStoryline(sl.id)}
                  className="accent-gold"
                />
                <span className="text-silk/65 leading-tight truncate flex-1">{sl.title}</span>
                {hasDilemma && (
                  <span className="text-[7px] px-1 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,180,0,0.15)', color: 'rgba(255,180,0,0.7)', border: '1px solid rgba(255,180,0,0.25)' }}>
                    dilemma
                  </span>
                )}
                <span className="text-silk/25 text-[8px] flex-shrink-0">{sl.eventIds.length}ev</span>
              </label>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-2">Available Agents</div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {agents.map(agent => {
            const blocked = agent.conditions.some(c => ['injured', 'imprisoned'].includes(c))
            return (
              <label key={agent.id} className={`flex items-center gap-2 cursor-pointer ${blocked ? 'opacity-40' : ''}`}>
                <input
                  type="checkbox"
                  checked={availableAgentIds.has(agent.id) && !blocked}
                  disabled={blocked}
                  onChange={() => !blocked && onToggleAgent(agent.id)}
                  className="accent-vermilion"
                />
                <span className="text-silk/65 leading-tight truncate">{agent.name}</span>
                <span className="text-silk/30 text-[8px] flex-shrink-0 ml-auto">{agent.tier}</span>
                {blocked && <span className="text-red-400/60 text-[8px]">blocked</span>}
              </label>
            )
          })}
        </div>
      </div>

      <div className="text-[10px] text-silk/20 space-y-1 pt-2 border-t border-silk/10">
        <p>Click nodes · assign agents · Continue →</p>
      </div>
    </div>
  )
}

const ALL_CONDITIONS: AgentCondition[] = [
  'poisoned', 'ill', 'injured', 'disgraced', 'imprisoned', 'mourning', 'pregnant', 'cursed',
]


function CharactersControls({
  agents, poolItems, selectedAgentId, onSelect, onAgentUpdate, onEquip, onUnequip,
}: {
  agents: Agent[]
  poolItems: Equipment[]
  selectedAgentId: string | null
  onSelect: (id: string) => void
  onAgentUpdate: (id: string, patch: Partial<Agent>) => void
  onEquip: (agentId: string, slot: EquipmentSlot, item: Equipment) => void
  onUnequip: (agentId: string, slot: EquipmentSlot) => void
}) {
  const agent = agents.find(a => a.id === selectedAgentId) ?? null
  const isGuard = agent?.tags.includes('guard') ?? false
  const agentSlots: EquipmentSlot[] = isGuard
    ? ['attire', 'accessory', 'tool', 'weapon']
    : ['attire', 'accessory', 'tool']

  const setCondition = (c: AgentCondition, on: boolean) => {
    if (!agent) return
    const conditions = on
      ? [...agent.conditions, c]
      : agent.conditions.filter(x => x !== c)
    onAgentUpdate(agent.id, { conditions })
  }

  const setStat = (s: StatName, delta: number) => {
    if (!agent) return
    const next = Math.max(0, Math.min(10, (agent.stats[s] ?? 0) + delta))
    onAgentUpdate(agent.id, { stats: { ...agent.stats, [s]: next } })
  }

  const setMartial = (delta: number) => {
    if (!agent) return
    onAgentUpdate(agent.id, { stats: { ...agent.stats, martial: Math.max(0, Math.min(5, (agent.stats.martial ?? 0) + delta)) } })
  }

  return (
    <div className="text-xs space-y-4 overflow-y-auto">
      {/* Agent selector + reset */}
      <div className="flex gap-1.5 items-end">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">Agent</label>
          <select
            className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
            value={selectedAgentId ?? ''}
            onChange={e => onSelect(e.target.value)}
          >
            <option value="">— select —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => { localStorage.removeItem('playground-agents'); window.location.reload() }}
          className="px-2 py-1 text-[10px] rounded bg-silk/10 hover:bg-silk/20 text-silk/40 hover:text-parchment transition-colors flex-shrink-0"
          title="Reset all agents to defaults">
          Reset
        </button>
      </div>

      {agent && (
        <>
          {/* Tier */}
          <div>
            <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">Tier</label>
            <select
              className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
              value={agent.tier}
              onChange={e => onAgentUpdate(agent.id, { tier: e.target.value as AgentTier })}
            >
              {AGENT_TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Equipment slots */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Equipment</div>
            <div className="space-y-1.5">
              {agentSlots.map(slot => {
                const current = agent.equipment?.[slot] ?? null
                // Items for this slot that exist in pool OR are currently equipped in this slot
                const available = [
                  ...(current ? [current] : []),
                  ...poolItems.filter(i => i.slot === slot),
                ]
                return (
                  <div key={slot} className="flex items-center gap-1.5">
                    <span className="text-sm w-5 flex-shrink-0">{EQUIPMENT_SLOT_ICONS[slot]}</span>
                    <select
                      className="flex-1 bg-silk/10 border border-silk/20 rounded px-1.5 py-0.5 text-parchment text-[10px] min-w-0"
                      value={current?.id ?? ''}
                      onChange={e => {
                        if (!e.target.value) { onUnequip(agent.id, slot); return }
                        const item = available.find(i => i.id === e.target.value)
                        if (!item) return
                        if (!meetsRequirements(agent, item)) return
                        onEquip(agent.id, slot, item)
                      }}
                    >
                      <option value="">— {EQUIPMENT_SLOT_LABELS[slot]} —</option>
                      {available.map(item => {
                        const ok = meetsRequirements(agent, item)
                        return <option key={item.id} value={item.id} disabled={!ok}>{ok ? '' : '✕ '}{item.name}</option>
                      })}
                    </select>
                    {current && (
                      <button onClick={() => onUnequip(agent.id, slot)}
                        className="text-[10px] text-silk/30 hover:text-red-400 transition-colors flex-shrink-0">✕</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Conditions</div>
            <div className="grid grid-cols-2 gap-1">
              {ALL_CONDITIONS.map(c => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agent.conditions.includes(c)}
                    onChange={e => setCondition(c, e.target.checked)}
                    className="accent-vermilion"
                  />
                  <span className="text-silk/60 leading-tight">{CONDITION_LABELS[c].en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resentment (only if field exists on agent) */}
          {'resentment' in agent && (
            <div>
              <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">
                Resentment — {agent.resentment ?? 0}/5
              </label>
              <input
                type="range" min={0} max={5} value={agent.resentment ?? 0}
                onChange={e => onAgentUpdate(agent.id, { resentment: Number(e.target.value) })}
                className="w-full accent-vermilion"
              />
            </div>
          )}

          {/* Stats */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Base Stats</div>
            <div className="space-y-1">
              {ALL_STATS.map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className="text-silk/50 w-24 flex-shrink-0 truncate">{STAT_LABELS[s].en}</span>
                  <button onClick={() => setStat(s, -1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">−</button>
                  <span className="text-parchment font-bold w-4 text-center tabular-nums">{agent.stats[s] ?? 0}</span>
                  <button onClick={() => setStat(s, +1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">+</button>
                </div>
              ))}
              {isGuard && (
                <div className="flex items-center gap-1.5">
                  <span className="text-silk/50 w-24 flex-shrink-0">Martial</span>
                  <button onClick={() => setMartial(-1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">−</button>
                  <span className="text-parchment font-bold w-4 text-center tabular-nums">{agent.stats.martial ?? 0}</span>
                  <button onClick={() => setMartial(+1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">+</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!agent && (
        <p className="text-silk/30 italic">Select an agent above or click a card.</p>
      )}
    </div>
  )
}

function Slider({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-silk/50 mb-1">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-parchment font-bold">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-vermilion"
      />
    </div>
  )
}


export default Playground
