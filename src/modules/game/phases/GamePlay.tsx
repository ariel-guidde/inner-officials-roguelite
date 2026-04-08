// =============================================================================
// GamePlay — Act 1: Taizong's Court
// Full game loop: map → assign agents → end day → dice resolution → dilemma → repeat
// Uses the same modules as the playground, connected for real.
// =============================================================================

import { useState, useEffect, useMemo } from 'react'
import type {
  Agent, AgentTier, DiceRollConfig, DiceRollResult, GameEvent,
  IntelligenceItem, IntelligenceStore, IntelligenceType, LocationId, MapNodeData, StatName, StatBlock,
  ReputationState, HaremRank,
} from '@core/types'
import { EMPTY_INTELLIGENCE } from '@core/types'
import { STAT_LABELS, RANK_TITLES } from '@core/types'
import { Dice } from '@modules/dice'
import {
  Map as PalaceMap, URGENCY_COLOR, URGENCY_LABEL,
  buildEmptyMapNodes, UNLOCKED_BY_DEFAULT,
  type ResolutionQueueItem,
  assignSlot, assignIntelligence, commitEvent, cancelCommit,
  spawnEventsOnMap, buildResolutionQueue, advanceDayOnMap,
} from '@modules/map'
import { applyEquipmentBonuses } from '@modules/characters'
import { Dilemma, type DilemmaData, type DilemmaResult } from '@modules/dilemma'
import {
  type EventRuntimeState, type ResolutionType,
  EVENT_DEFINITIONS_BY_ID as DEFS_BY_ID,
  type SpawnContext,
} from '@modules/events'
import type { CreationChoices } from '../data/creationData'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  stats: Record<StatName, number>
  silver: number
  choices: CreationChoices
}

export function GamePlay({ stats, silver: initialSilver, choices }: Props) {
  // ── Core state ──────────────────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState(1)
  const [mapNodes, setMapNodes] = useState<MapNodeData[]>(() => buildEmptyMapNodes())
  const [selectedNodeId, setSelectedNodeId] = useState<LocationId | null>(null)
  const [eventStates, setEventStates] = useState<Map<string, EventRuntimeState>>(() => new Map())
  const [haremRank, setHaremRank] = useState<HaremRank>(9)

  // ── Resources & reputation ──────────────────────────────────────────
  const [reputation, setReputation] = useState<ReputationState>({
    virtue: choices.disposition.reputationBonuses['virtue'] ?? 0,
    ruthlessness: choices.disposition.reputationBonuses['ruthlessness'] ?? 0,
    imperialFavor: choices.disposition.reputationBonuses['imperialFavor'] ?? 0,
    shadowReach: choices.disposition.reputationBonuses['shadowReach'] ?? 0,
    heavenlySight: choices.disposition.reputationBonuses['heavenlySight'] ?? 0,
    slander: 0,
  })
  const [silver, setSilver] = useState(initialSilver)
  const [goldenDice, setGoldenDice] = useState(0)
  const [intelligence, setIntelligence] = useState<IntelligenceStore>({ ...EMPTY_INTELLIGENCE, gossip: { ...EMPTY_INTELLIGENCE.gossip, clay: 1 } })

  // ── Resolution state ────────────────────────────────────────────────
  const [resolutionQueue, setResolutionQueue] = useState<ResolutionQueueItem[]>([])
  const [resolutionIndex, setResolutionIndex] = useState(0)
  const isResolutionOpen = resolutionQueue.length > 0
  const currentResItem = isResolutionOpen ? resolutionQueue[resolutionIndex] : null

  // ── Dilemma state ───────────────────────────────────────────────────
  const [activeDilemma, setActiveDilemma] = useState<DilemmaData | null>(null)
  const [pendingDilemmaEventId, setPendingDilemmaEventId] = useState<string | null>(null)

  // ── Agents ──────────────────────────────────────────────────────────
  const protagonist: Agent = useMemo(() => {
    const rankTitle = RANK_TITLES[haremRank].en.split(' — ')[0]
    return {
      id: 'protagonist-wu',
      name: `${rankTitle} Wu`,
      portraitId: 'Concubine1',
      tier: 'bronze' as AgentTier,
      stats: { ...stats } as StatBlock,
      conditions: [],
      tags: ['female', 'concubine', 'protagonist'] as Agent['tags'],
      isProtagonist: true,
      haremRank,
    }
  }, [stats, haremRank])

  const chunhua: Agent = useMemo(() => {
    const baseStats: StatBlock = {
      beauty: 2, cunning: 1, eloquence: 1, discretion: 1,
      resolve: 1, vitality: 1, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
    }
    for (const [k, v] of Object.entries(choices.maidArchetype.strongStats)) {
      (baseStats as Record<string, number>)[k] = v
    }
    return {
      id: 'chunhua',
      name: 'Chunhua',
      portraitId: 'Servant 1',
      tier: 'bronze' as AgentTier,
      stats: baseStats,
      conditions: [],
      tags: ['female', 'servant', 'maid', 'follower'] as Agent['tags'],
    }
  }, [choices])

  const agents = useMemo(() => [protagonist, chunhua], [protagonist, chunhua])

  // ── Spawning ────────────────────────────────────────────────────────

  const unlockedSet = useMemo(() => new Set<LocationId>(UNLOCKED_BY_DEFAULT), [])

  const buildCtx = (day: number, states: Map<string, EventRuntimeState>): SpawnContext => ({
    currentDay: day,
    eventStates: states,
    unlockedLocations: unlockedSet,
    reputation,
  })

  const runSpawn = (day: number, states: Map<string, EventRuntimeState>) => {
    const result = spawnEventsOnMap(mapNodes, states, buildCtx(day, states), day)
    setMapNodes(result.nodes)
    setEventStates(result.states)
  }

  useEffect(() => {
    const result = spawnEventsOnMap(buildEmptyMapNodes(), eventStates, buildCtx(1, eventStates), 1)
    setMapNodes(result.nodes)
    setEventStates(result.states)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Slot / intelligence assignment (passed to Map) ───────────────────

  const handleSlotAssign = (eventId: string, slotId: string, agentId: string | null) => {
    setMapNodes(prev => assignSlot(prev, eventId, slotId, agentId))
  }

  const handleIntelAssign = (eventId: string, intelItem: IntelligenceItem | null) => {
    setMapNodes(prev => assignIntelligence(prev, eventId, intelItem))
  }

  const handleCommitEvent = (eventId: string) => {
    const { nodes, consumedIntel } = commitEvent(mapNodes, eventId, currentDay)
    setMapNodes(nodes)
    if (consumedIntel) {
      setIntelligence(prev => {
        const next = { ...prev, [consumedIntel.type]: { ...prev[consumedIntel.type] } }
        next[consumedIntel.type][consumedIntel.tier] = Math.max(0, next[consumedIntel.type][consumedIntel.tier] - 1)
        return next
      })
    }
  }

  const handleCancelCommit = (eventId: string) => {
    const result = cancelCommit(mapNodes, eventId, currentDay)
    if (!result) return
    setMapNodes(result.nodes)
    if (result.returnedIntel) {
      const ri = result.returnedIntel
      setIntelligence(prev => {
        const next = { ...prev, [ri.type]: { ...prev[ri.type] } }
        next[ri.type][ri.tier] += 1
        return next
      })
    }
  }

  // ── End day: build queue and start resolution ───────────────────────

  const handleEndDay = () => {
    const { queue, toCommit } = buildResolutionQueue(mapNodes, agents, currentDay)

    // Apply multi-day commitments (set inProgress, lock agents)
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
    }

    if (queue.length === 0) {
      advanceDay()
      return
    }

    setResolutionQueue(queue)
    setResolutionIndex(0)
    checkForDilemma(queue[0])
  }

  // ── Check if a queue item needs a dilemma before dice ───────────────

  const checkForDilemma = (item: ResolutionQueueItem) => {
    if (item.isExpired) return // skip dilemma for expired events

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
          description: c.description,
          consequences: Object.entries(c.moralWeight ?? {})
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => `${k} ${(v as number) > 0 ? '+' : ''}${v}`)
            .join(', ') || '',
          reputationDelta: c.moralWeight as Partial<ReputationState> | undefined,
        })),
      }
      setActiveDilemma(dilemmaData)
      setPendingDilemmaEventId(item.defId)
    }
  }

  // ── Dilemma resolved → apply reputation, then continue resolution ───

  const handleDilemmaResolve = (result: DilemmaResult) => {
    // Apply reputation
    setReputation(prev => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(result.reputationDelta)) {
        next[k as keyof ReputationState] += v as number
      }
      return next
    })

    // Record choice
    if (pendingDilemmaEventId) {
      setEventStates(prev => {
        const next = new Map(prev)
        const existing = next.get(pendingDilemmaEventId)
        if (existing) next.set(pendingDilemmaEventId, { ...existing, choiceId: result.choiceId })
        return next
      })
    }

    setActiveDilemma(null)
    setPendingDilemmaEventId(null)

    // Check if the dilemma was standalone (skipDiceRoll) — if so, auto-resolve
    const item = resolutionQueue[resolutionIndex]
    const def = DEFS_BY_ID[item.defId]
    const choice = def?.dilemma?.choices.find(c => c.id === result.choiceId)

    if (choice?.skipDiceRoll || def?.dilemma?.timing === 'standalone') {
      // Skip dice, move to next or finish
      handleResolutionComplete(item, true)
    }
    // Otherwise: the resolution modal will appear with dice
  }

  // ── Resolution complete for one event ───────────────────────────────

  const handleResolutionComplete = (item: ResolutionQueueItem, success: boolean) => {
    const resolution: ResolutionType = item.isExpired ? 'expired' : success ? 'success' : 'failure'

    // Record in event states
    setEventStates(prev => {
      const next = new Map(prev)
      const existing = next.get(item.defId)
      next.set(item.defId, {
        defId: item.defId,
        state: 'resolved',
        resolution,
        choiceId: existing?.choiceId,
        dayPlaced: existing?.dayPlaced,
        dayResolved: currentDay,
      })
      return next
    })

    // Move to next in queue
    const nextIdx = resolutionIndex + 1
    if (nextIdx < resolutionQueue.length) {
      setResolutionIndex(nextIdx)
      checkForDilemma(resolutionQueue[nextIdx])
    } else {
      // All resolved, advance day
      setResolutionQueue([])
      setResolutionIndex(0)
      advanceDay()
    }
  }

  // ── Advance to next day ─────────────────────────────────────────────

  const advanceDay = () => {
    const resolvedIds = new Set(resolutionQueue.map(item => item.defId))
    const { nodes: cleanedNodes, expiredIds } = advanceDayOnMap(mapNodes, resolvedIds, currentDay)

    // Record expirations
    if (expiredIds.length > 0) {
      setEventStates(prev => {
        const next = new Map(prev)
        for (const id of expiredIds) {
          next.set(id, { defId: id, state: 'resolved', resolution: 'expired', dayResolved: currentDay })
        }
        return next
      })
    }

    setMapNodes(cleanedNodes)
    setCurrentDay(currentDay + 1)
  }

  // Spawn new events when day changes (avoids stale closure)
  useEffect(() => {
    if (currentDay <= 1) return
    runSpawn(currentDay, eventStates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay])

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(232,213,176,0.1)', background: 'rgba(10,6,4,0.97)' }}>
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-base text-gold">Inner Officials</h1>
          <span className="text-xs text-silk/30">Act 1 — Taizong's Court</span>
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
          allAgents={agents}
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

      {/* Resolution modal — dice roll for non-dilemma events */}
      {isResolutionOpen && currentResItem && !activeDilemma && (
        <ResolutionModal
          item={currentResItem}
          index={resolutionIndex}
          total={resolutionQueue.length}
          nextDay={currentDay + 1}
          goldenDiceAvailable={goldenDice}
          onComplete={(success, goldenSpent) => {
            if (goldenSpent > 0) setGoldenDice(n => Math.max(0, n - goldenSpent))
            handleResolutionComplete(currentResItem, success)
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

// ---------------------------------------------------------------------------
// ResolutionModal — shows dice roll for one event
// ---------------------------------------------------------------------------

function ResolutionModal({ item, index, total, nextDay, goldenDiceAvailable, onComplete }: {
  item: ResolutionQueueItem
  index: number
  total: number
  nextDay: number
  goldenDiceAvailable: number
  onComplete: (success: boolean, goldenSpent: number) => void
}) {
  const [rollConfig, setRollConfig] = useState<DiceRollConfig | null>(null)
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null)
  const [goldenSpent, setGoldenSpent] = useState(0)
  const isLast = index === total - 1
  const uc = URGENCY_COLOR[item.event.urgency]

  // Auto-trigger roll
  useEffect(() => {
    setRollResult(null)
    setGoldenSpent(0)
    if (item.isExpired) return
    const t = setTimeout(() => {
      setRollConfig({
        pool: item.pool,
        threshold: item.event.threshold,
        tier: item.tier,
        difficulty: 'standard',
        goldenDice: 0,
        eventLabel: item.event.title,
      })
    }, 300)
    return () => clearTimeout(t)
  }, [item.event.id, item.pool, item.isExpired, item.tier, item.event.threshold, item.event.title])

  const effectiveResult = rollResult ? (() => {
    if (goldenSpent === 0) return rollResult
    const successes = rollResult.successes + goldenSpent
    return {
      ...rollResult,
      successes,
      isSuccess: successes >= item.event.threshold,
      isCriticalFailure: false,
      margin: successes - item.event.threshold,
    }
  })() : null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(5,3,1,0.9)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#0d0800', border: '1px solid rgba(232,213,176,0.13)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-silk/35">{index + 1} / {total}</span>
            <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase"
              style={{ background: `${uc.badge}22`, color: uc.badge }}>
              {URGENCY_LABEL[item.event.urgency]}
            </span>
          </div>
          <h2 className="font-serif text-lg text-parchment leading-tight">{item.event.title}</h2>
          <p className="text-[10px] text-silk/40 mt-0.5 leading-relaxed line-clamp-2">{item.event.description}</p>
        </div>

        {item.isExpired ? (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div className="text-4xl">&#8987;</div>
            <div className="text-parchment/60 font-serif text-base">Event Expired</div>
            <button onClick={() => onComplete(false, 0)} className="mt-2 px-5 py-2 rounded-lg text-sm font-serif"
              style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.18)', color: 'rgba(232,213,176,0.6)' }}>
              {isLast ? `Begin Day ${nextDay}` : 'Next'}
            </button>
          </div>
        ) : (
          <>
            {/* Stat breakdown */}
            <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
              <div className="flex items-start gap-4 flex-wrap">
                {item.event.statsChecked.map(stat => (
                  <div key={stat} className="min-w-[60px]">
                    <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">{STAT_LABELS[stat].en}</div>
                    <div className="text-xl font-bold" style={{ color: uc.badge }}>{item.statTotals[stat] ?? 0}</div>
                    {item.assignedAgents.map(a => {
                      const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
                      return <div key={a.id} className="text-[8px] text-silk/30">{a.name.split(' ')[0]}: {eff[stat] ?? 0}</div>
                    })}
                  </div>
                ))}
                <div className="ml-auto text-right border-l border-silk/10 pl-4">
                  <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">Dice Pool</div>
                  <div className="text-xl font-bold text-parchment">{item.pool}d</div>
                  <div className="text-[9px] text-silk/35">need {item.event.threshold}+</div>
                </div>
              </div>
            </div>

            {/* Dice */}
            <div className="flex-1 min-h-0" style={{ height: 200 }}>
              <Dice
                rollConfig={rollConfig}
                onRollSettled={setRollResult}
                canvasHeight="200px"
                goldenDiceSpent={goldenSpent}
                displayResult={effectiveResult}
                onDismiss={() => {}}
              />
            </div>

            {/* Result */}
            {effectiveResult && (
              <div className="px-5 py-3 border-t border-silk/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold font-serif"
                      style={{ color: effectiveResult.isSuccess ? '#00a86b' : '#e04030' }}>
                      {effectiveResult.isSuccess ? 'Success' : 'Failed'}
                    </div>
                    <div className="text-[10px] text-silk/40 mt-0.5">
                      {effectiveResult.successes} of {item.event.threshold} needed
                    </div>
                  </div>
                  <button
                    onClick={() => onComplete(effectiveResult.isSuccess, goldenSpent)}
                    className="px-5 py-2 rounded-lg text-sm font-serif font-semibold transition-all hover:brightness-125"
                    style={{
                      background: isLast ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
                      border: `1px solid ${isLast ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
                      color: isLast ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
                    }}>
                    {isLast ? `Begin Day ${nextDay}` : 'Next'}
                  </button>
                </div>

                {/* Golden die button */}
                {goldenDiceAvailable - goldenSpent > 0 && (
                  <button
                    onClick={() => setGoldenSpent(n => n + 1)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all"
                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.85)' }}>
                    Golden Die ({goldenDiceAvailable - goldenSpent})
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
