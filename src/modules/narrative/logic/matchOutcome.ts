// =============================================================================
// narrative/logic/matchOutcome.ts — stub
// Pure function: given a script, a chosen approach, and a roll result,
// returns the first matching EventOutcome.
// =============================================================================

import type { DiceRollResult } from '@core/types'
import type { EventChoice, EventOutcome, EventScript } from '../types'

/**
 * Determines the OutcomeCondition band from a dice result.
 * criticalFailure < failure < success < marginalSuccess (margin 0) < criticalSuccess (margin ≥ 2)
 */
// TODO: implement
export function classifyRoll(_result: DiceRollResult): import('@core/types').OutcomeCondition {
  if (_result.isCriticalFailure) return 'criticalFailure'
  if (!_result.isSuccess) return 'failure'
  if (_result.margin === 0) return 'marginalSuccess'
  if (_result.margin >= 2) return 'criticalSuccess'
  return 'success'
}

/**
 * Finds the first matching outcome from a choice (if provided) or the script.
 * Returns null if no script or outcome is found — caller should show a generic result.
 */
// TODO: flesh out with fallback chains
export function matchOutcome(
  script: EventScript | null,
  choice: EventChoice | null,
  result: DiceRollResult,
): EventOutcome | null {
  if (!script) return null
  const condition = classifyRoll(result)
  const pool = choice?.outcomes ?? script.outcomes
  return pool.find(o => o.condition === condition) ?? null
}
