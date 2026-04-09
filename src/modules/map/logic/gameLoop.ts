// =============================================================================
// map/logic/gameLoop.ts
// Shared game loop utilities used by both Game and Playground.
// Operates on MapNodeData[] and event state — no React dependency.
// =============================================================================

import type {
  Agent, AgentTier, GameEvent, IntelligenceItem,
  LocationId, MapNodeData, StatName,
} from '@core/types'
import { AGENT_TIER_ORDER } from '@core/types'
import { applyEquipmentBonuses } from '@lib/equipment'
import type { EventRuntimeState, SpawnContext } from '@modules/events'
import { ALL_EVENT_DEFINITIONS, selectEventsForDay, definitionToEvent } from '@modules/events'
import { computeEventPool } from './poolCalculation'

// ---------------------------------------------------------------------------
// Resolution queue item — shared between Game and Playground
// ---------------------------------------------------------------------------

export interface ResolutionQueueItem {
  event: GameEvent
  assignedAgents: Agent[]
  pool: number
  tier: AgentTier
  statTotals: Partial<Record<StatName, number>>
  isExpired?: boolean
  defId: string
}

// ---------------------------------------------------------------------------
// Build a resolution queue item from an event and its assigned agents
// ---------------------------------------------------------------------------

export function buildQueueItem(ev: GameEvent, assignedAgents: Agent[]): ResolutionQueueItem {
  const statTotals = Object.fromEntries(
    ev.statsChecked.map(stat => [
      stat,
      assignedAgents.reduce((sum, a) => {
        const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
        return sum + (eff[stat] ?? 0)
      }, 0),
    ])
  ) as Partial<Record<StatName, number>>

  const pool = computeEventPool(assignedAgents, ev) ?? 0
  const tier = assignedAgents.reduce<AgentTier>(
    (best, a) => AGENT_TIER_ORDER.indexOf(a.tier) > AGENT_TIER_ORDER.indexOf(best) ? a.tier : best,
    'clay',
  )
  return { event: ev, assignedAgents, pool, tier, statTotals, defId: ev.id }
}

// ---------------------------------------------------------------------------
// Update a single event within map nodes (for slot/intel assignment)
// ---------------------------------------------------------------------------

export function updateEventInNodes(
  nodes: MapNodeData[],
  eventId: string,
  updater: (ev: GameEvent) => GameEvent,
): MapNodeData[] {
  return nodes.map(node => {
    const idx = node.events.findIndex(ev => ev.id === eventId)
    if (idx === -1) return node
    const events = [...node.events]
    events[idx] = updater(events[idx])
    return { ...node, events }
  })
}

export function assignSlot(
  nodes: MapNodeData[],
  eventId: string,
  slotId: string,
  agentId: string | null,
): MapNodeData[] {
  return updateEventInNodes(nodes, eventId, ev => ({
    ...ev,
    slots: ev.slots.map(s => s.id !== slotId ? s : { ...s, assignedAgentId: agentId }),
  }))
}

export function assignIntelligence(
  nodes: MapNodeData[],
  eventId: string,
  intelItem: IntelligenceItem | null,
): MapNodeData[] {
  return updateEventInNodes(nodes, eventId, ev => ({
    ...ev,
    assignedIntelligence: intelItem,
  }))
}

/**
 * Commit an event for resolution. Returns updated nodes + the intel consumed (if any).
 * Only events with all mandatory slots filled can be committed.
 */
export function commitEvent(
  nodes: MapNodeData[],
  eventId: string,
  currentDay: number,
): { nodes: MapNodeData[]; consumedIntel: IntelligenceItem | null } {
  let consumedIntel: IntelligenceItem | null = null
  const updated = updateEventInNodes(nodes, eventId, ev => {
    consumedIntel = ev.assignedIntelligence
    return { ...ev, committed: true, committedOnDay: currentDay }
  })
  return { nodes: updated, consumedIntel }
}

/**
 * Cancel a committed event. Only allowed if committed on the current day and not yet inProgress.
 * Returns updated nodes + the intel to return (if any).
 */
export function cancelCommit(
  nodes: MapNodeData[],
  eventId: string,
  currentDay: number,
): { nodes: MapNodeData[]; returnedIntel: IntelligenceItem | null } | null {
  // Find the event first to check if cancellation is allowed
  let ev: GameEvent | undefined
  for (const node of nodes) {
    ev = node.events.find(e => e.id === eventId)
    if (ev) break
  }
  if (!ev || !ev.committed || ev.inProgress || ev.committedOnDay !== currentDay) return null

  let returnedIntel: IntelligenceItem | null = null
  const updated = updateEventInNodes(nodes, eventId, e => {
    returnedIntel = e.assignedIntelligence
    return { ...e, committed: false, committedOnDay: null }
  })
  return { nodes: updated, returnedIntel }
}

// ---------------------------------------------------------------------------
// Spawn events onto map from the pool
// ---------------------------------------------------------------------------

export interface SpawnResult {
  nodes: MapNodeData[]
  states: Map<string, EventRuntimeState>
}

export function spawnEventsOnMap(
  currentNodes: MapNodeData[],
  currentStates: Map<string, EventRuntimeState>,
  ctx: SpawnContext,
  day: number,
): SpawnResult {
  const toSpawn = selectEventsForDay(ALL_EVENT_DEFINITIONS, ctx)
  const nodes = currentNodes.map(n => ({ ...n }))
  const states = new Map(currentStates)

  for (const def of toSpawn) {
    const idx = nodes.findIndex(n => n.id === def.locationId)
    if (idx >= 0 && !nodes[idx].events.some(e => e.id === def.id)) {
      nodes[idx] = { ...nodes[idx], events: [...nodes[idx].events, definitionToEvent(def)] }
    }
    if (!states.has(def.id)) {
      states.set(def.id, { defId: def.id, state: 'onMap', dayPlaced: day })
    }
  }

  return { nodes, states }
}

// ---------------------------------------------------------------------------
// Build resolution queue from current map state
// ---------------------------------------------------------------------------

export interface MultiDayCommit {
  eventId: string
  resolveOnDay: number
  intelType: IntelligenceItem | null
}

export interface ResolutionQueueResult {
  queue: ResolutionQueueItem[]
  /** Multi-day events that should be committed (set inProgress) but not resolved yet. */
  toCommit: MultiDayCommit[]
}

export function buildResolutionQueue(
  nodes: MapNodeData[],
  agents: Agent[],
  currentDay: number,
): ResolutionQueueResult {
  const queue: ResolutionQueueItem[] = []
  const toCommit: MultiDayCommit[] = []

  for (const node of nodes) {
    for (const ev of node.events) {
      if (ev.isCompleted || ev.isExpired) continue

      // In-progress multi-day events: check if they resolve today
      if (ev.inProgress) {
        if (ev.resolveOnDay === currentDay) {
          const assignedAgents = ev.slots
            .filter(s => s.assignedAgentId != null)
            .map(s => agents.find(a => a.id === s.assignedAgentId)!)
            .filter(Boolean)
          queue.push(buildQueueItem(ev, assignedAgents))
        }
        continue
      }

      // Only committed events resolve
      if (!ev.committed && ev.slots.length > 0) {
        // Not committed — check if it expires
        if (ev.daysRemaining === 1) {
          queue.push({
            event: ev, assignedAgents: [], pool: 0, tier: 'clay',
            statTotals: {}, isExpired: true, defId: ev.id,
          })
        }
        continue
      }

      // Auto-resolve events (no slots) or committed events
      const assignedAgents = ev.slots
        .filter(s => s.assignedAgentId != null)
        .map(s => agents.find(a => a.id === s.assignedAgentId)!)
        .filter(Boolean)

      if (ev.durationDays > 1 && assignedAgents.length > 0) {
        // Multi-day: transition to inProgress next day
        toCommit.push({
          eventId: ev.id,
          resolveOnDay: currentDay + ev.durationDays,
          intelType: ev.assignedIntelligence ?? null,
        })
      } else {
        queue.push(buildQueueItem(ev, assignedAgents))
      }
    }
  }

  return { queue, toCommit }
}

// ---------------------------------------------------------------------------
// Advance day: clean resolved/expired events, decrement timers
// ---------------------------------------------------------------------------

export interface DayAdvanceResult {
  nodes: MapNodeData[]
  expiredIds: string[]
}

export function advanceDayOnMap(
  nodes: MapNodeData[],
  resolvedIds: Set<string>,
  currentDay: number,
): DayAdvanceResult {
  const expiredIds: string[] = []

  // Find events that will expire
  for (const node of nodes) {
    for (const ev of node.events) {
      if (resolvedIds.has(ev.id)) continue
      if (ev.daysRemaining !== null && ev.daysRemaining <= 1) {
        expiredIds.push(ev.id)
      }
    }
  }

  const removeIds = new Set([...resolvedIds, ...expiredIds])

  const updatedNodes = nodes.map(node => ({
    ...node,
    events: node.events
      .filter(ev => !removeIds.has(ev.id))
      .map(ev => {
        if (ev.daysRemaining !== null) {
          return { ...ev, daysRemaining: ev.daysRemaining - 1 }
        }
        return ev
      }),
  }))

  return { nodes: updatedNodes, expiredIds }
}
