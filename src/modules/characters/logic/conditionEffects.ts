// Derives stat penalties from an agent's active conditions.
// No React, no store imports.

import type { AgentCondition, StatName } from '@core/types'

type StatPenalty = Partial<Record<StatName, number>>

/** Stat penalties per condition (additive, applied as negatives). */
const CONDITION_PENALTIES: Record<AgentCondition, StatPenalty> = {
  poisoned:   { vitality: 2, resolve: 1 },
  ill:        { vitality: 2, beauty: 1 },
  injured:    {}, // blocks assignment entirely — see BLOCKING_CONDITIONS
  disgraced:  { beauty: 2, eloquence: 1 },
  imprisoned: {}, // blocks assignment entirely
  mourning:   { beauty: 1, eloquence: 1 },
  pregnant:   { resourcefulness: 2, discretion: 1 },
  cursed:     { spiritualArts: 2 },
}

/**
 * Returns the effective stat block after applying all active condition penalties.
 * Values are clamped to a minimum of 0.
 */
export function applyConditionPenalties(
  stats: Record<StatName, number>,
  conditions: AgentCondition[],
): Record<StatName, number> {
  const result = { ...stats }
  for (const condition of conditions) {
    const penalties = CONDITION_PENALTIES[condition]
    for (const [stat, penalty] of Object.entries(penalties) as [StatName, number][]) {
      result[stat] = Math.max(0, (result[stat] ?? 0) - penalty)
    }
  }
  return result
}

/**
 * Returns true if the agent is completely blocked from assignment.
 */
export function isAgentBlocked(conditions: AgentCondition[]): boolean {
  return conditions.includes('injured') || conditions.includes('imprisoned')
}
