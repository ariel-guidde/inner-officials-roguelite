// =============================================================================
// narrative/logic/applyConsequences.ts — stub
// Pure function: converts a Consequence[] into a state-patch object that
// Playground (or the future game store) can apply.
// =============================================================================

import type { Consequence, IntelligenceType } from '@core/types'

export interface ConsequencePatch {
  intelligenceToAdd: Array<{ type: IntelligenceType; amount: number }>
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
    intelligenceToAdd: [],
    goldenDiceDelta: 0,
    rerollsDelta: 0,
    conditionsToApply: [],
    conditionsToRemove: [],
    locationsToUnlock: [],
    eventsToTrigger: [],
    narrativeLines: [],
  }
}
