// =============================================================================
// events/logic/eligibility.ts
// Evaluates prerequisites and determines event state transitions.
//
// The spawn system calls evaluateState() each day for every event definition.
// An event is eligible for the pool when its state is 'ready'.
// =============================================================================

import type { LocationId, ReputationState, HaremRank } from '@core/types'
import type { EventDefinition, EventPrerequisite, EventRuntimeState } from '../types'

// ---------------------------------------------------------------------------
// SpawnContext — everything the eligibility system needs to evaluate
// ---------------------------------------------------------------------------

export interface SpawnContext {
  currentDay: number
  /** Runtime state for every event definition. */
  eventStates: Map<string, EventRuntimeState>
  unlockedLocations: Set<LocationId>
  /** Optional — for reputation gates. */
  reputation?: ReputationState
  /** Optional — for rank gates. */
  haremRank?: HaremRank
}

// ---------------------------------------------------------------------------
// Prerequisite evaluation
// ---------------------------------------------------------------------------

function prerequisiteMet(prereq: EventPrerequisite, ctx: SpawnContext): boolean {
  switch (prereq.kind) {
    case 'eventResolved': {
      const s = ctx.eventStates.get(prereq.defId)
      if (!s || s.state !== 'resolved') return false
      return prereq.resolution == null || s.resolution === prereq.resolution
    }
    case 'eventNotResolved': {
      const s = ctx.eventStates.get(prereq.defId)
      return !s || s.state !== 'resolved'
    }
    case 'eventOnMap': {
      const s = ctx.eventStates.get(prereq.defId)
      return s?.state === 'onMap'
    }
    case 'choiceMade': {
      const s = ctx.eventStates.get(prereq.eventDefId)
      return s?.state === 'resolved' && s.choiceId === prereq.choiceId
    }
    case 'choiceNotMade': {
      const s = ctx.eventStates.get(prereq.eventDefId)
      if (!s || s.state !== 'resolved') return true // not resolved yet — choice not made
      return s.choiceId !== prereq.choiceId
    }
    case 'dayMin':
      return ctx.currentDay >= prereq.day
    case 'dayMax':
      return ctx.currentDay <= prereq.day
    case 'locationUnlocked':
      return ctx.unlockedLocations.has(prereq.locationId)
    case 'reputationMin':
      return (ctx.reputation?.[prereq.metric] ?? 0) >= prereq.value
    case 'reputationMax':
      return (ctx.reputation?.[prereq.metric] ?? 0) <= prereq.value
    case 'resourceMin':
      // Not evaluable from SpawnContext — default true (checked at runtime)
      return true
    case 'agentHasCondition':
      return true
    case 'agentAlive':
      return true
    case 'haremRankMin':
      // Lower rank number = higher rank (1 = Empress)
      return ctx.haremRank != null ? ctx.haremRank <= prereq.rank : true
    case 'anyOf':
      return prereq.conditions.some(c => prerequisiteMet(c, ctx))
  }
}

export function allPrerequisitesMet(def: EventDefinition, ctx: SpawnContext): boolean {
  // Location must be unlocked
  if (!ctx.unlockedLocations.has(def.locationId)) return false
  // All prerequisites must be met
  return def.prerequisites.every(p => prerequisiteMet(p, ctx))
}

// ---------------------------------------------------------------------------
// State evaluation — determines if a definition should transition to 'ready'
// ---------------------------------------------------------------------------

/**
 * Evaluate the current state of an event definition.
 * Returns the state it should be in based on current context.
 * Does NOT mutate — caller decides whether to apply the transition.
 */
export function evaluateState(def: EventDefinition, ctx: SpawnContext): EventRuntimeState['state'] {
  const current = ctx.eventStates.get(def.id)

  // Terminal states — never re-evaluate
  if (current?.state === 'resolved') {
    if (def.isRepeatable) {
      // Repeatable events can cycle back to unmet/ready
      return allPrerequisitesMet(def, ctx) ? 'ready' : 'unmet'
    }
    return 'resolved'
  }
  if (current?.state === 'skipped') return 'skipped'
  if (current?.state === 'onMap') return 'onMap'

  // Not yet resolved — check prerequisites
  return allPrerequisitesMet(def, ctx) ? 'ready' : 'unmet'
}
