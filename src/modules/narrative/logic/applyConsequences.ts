// =============================================================================
// narrative/logic/applyConsequences.ts — stub
// Pure function: converts a Consequence[] into a state-patch object that
// Playground (or the future game store) can apply.
// =============================================================================

import type { Consequence } from '@core/types'

export interface ConsequencePatch {
  scrollsToAdd: import('@core/types').IntelligenceScroll[]
  goldenDiceDelta: number
  rerollsDelta: number
  conditionsToApply: Array<{ agentId: string; condition: import('@core/types').AgentCondition }>
  conditionsToRemove: Array<{ agentId: string; condition: import('@core/types').AgentCondition }>
  locationsToUnlock: import('@core/types').LocationId[]
  eventsToTrigger: string[]
  narrativeLines: string[]
}

/** TODO: implement fully — returns empty patch for now */
export function applyConsequences(_consequences: Consequence[]): ConsequencePatch {
  return {
    scrollsToAdd: [],
    goldenDiceDelta: 0,
    rerollsDelta: 0,
    conditionsToApply: [],
    conditionsToRemove: [],
    locationsToUnlock: [],
    eventsToTrigger: [],
    narrativeLines: [],
  }
}
