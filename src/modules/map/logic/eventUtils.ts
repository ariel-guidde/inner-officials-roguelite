// =============================================================================
// map/logic/eventUtils.ts
// Pure functions for event display and slot eligibility.
// No React. No side effects.
// =============================================================================

import type { Agent, DiceRollResult, EventSlot, EventUrgency, GameEvent, MapNodeData } from '@core/types'
import { AGENT_TIER_ORDER, BLOCKING_CONDITIONS } from '@core/types'

// ---------------------------------------------------------------------------
// Visual constants
// ---------------------------------------------------------------------------

export const URGENCY_COLOR: Record<EventUrgency, { ring: string; badge: string; bg: string }> = {
  routine:     { ring: 'rgba(140,130,110,0.5)', badge: '#908070', bg: 'rgba(140,130,110,0.07)' },
  timed:       { ring: '#c09000',               badge: '#ffd700', bg: 'rgba(180,140,0,0.08)'   },
  crisis:      { ring: '#c02010',               badge: '#e04030', bg: 'rgba(180,30,20,0.10)'   },
  // Opportunity is teal-blue — green is reserved for "in progress" events
  opportunity: { ring: '#0878a8',               badge: '#18b0d8', bg: 'rgba(8,120,168,0.08)'   },
}

/** Visual style for events that are committed and counting down. */
export const IN_PROGRESS_COLOR = {
  ring:  '#00a86b',
  badge: '#00d48a',
  bg:    'rgba(0,168,107,0.10)',
  glow:  'rgba(0,200,120,0.35)',
}

export const URGENCY_LABEL: Record<EventUrgency, string> = {
  routine:     'Routine',
  timed:       'Timed',
  crisis:      'Crisis',
  opportunity: 'Opportunity',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const URGENCY_RANK: Record<EventUrgency, number> = {
  routine: 0, timed: 1, opportunity: 2, crisis: 3,
}

/**
 * Highest-severity urgency among active (not completed, not expired) events.
 * Returns null if there are no active events.
 */
export function nodeUrgency(events: GameEvent[]): EventUrgency | null {
  const active = events.filter(e => !e.isCompleted && !e.isExpired)
  if (active.length === 0) return null
  return active.reduce<EventUrgency>(
    (best, e) => URGENCY_RANK[e.urgency] > URGENCY_RANK[best] ? e.urgency : best,
    'routine',
  )
}

/** All agent IDs currently assigned to any event slot across all nodes. */
export function assignedAgentIds(nodes: MapNodeData[]): Set<string> {
  const ids = new Set<string>()
  for (const node of nodes) {
    for (const event of node.events) {
      for (const slot of event.slots) {
        if (slot.assignedAgentId) ids.add(slot.assignedAgentId)
      }
    }
  }
  return ids
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

export type ResolutionOutcome = 'success' | 'failure' | 'expired' | 'skipped'

/**
 * One entry in the end-of-day resolution feed.
 * Computed up-front; revealed sequentially in the UI.
 */
export interface ResolutionEntry {
  event: GameEvent
  /** Names of agents who were assigned to this event's slots. */
  agentNames: string[]
  /** Final dice pool (after opposition subtraction). */
  totalPool: number
  /** null for events that expired or were skipped without rolling. */
  rollResult: DiceRollResult | null
  success: boolean
  margin: number
  outcome: ResolutionOutcome
}

/**
 * Whether an agent is eligible to fill a given event slot.
 * Gates: blocking conditions → requiredTags (ALL) → anyRequiredTag (ANY) → minTier.
 */
export function agentMeetsSlot(agent: Agent, slot: EventSlot): boolean {
  if (agent.conditions.some(c => BLOCKING_CONDITIONS.has(c))) return false
  if (slot.requiredTags.length > 0 && !slot.requiredTags.every(t => agent.tags.includes(t))) return false
  if (slot.anyRequiredTag?.length && !slot.anyRequiredTag.some(t => agent.tags.includes(t))) return false
  if (slot.requiredTier) {
    if (AGENT_TIER_ORDER.indexOf(agent.tier) < AGENT_TIER_ORDER.indexOf(slot.requiredTier)) return false
  }
  return true
}
