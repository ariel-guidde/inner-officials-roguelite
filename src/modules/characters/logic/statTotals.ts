// Pure functions for computing dice pool sizes from agents.
// No React, no store imports.

import { BLOCKING_CONDITIONS, type Agent, type StatName } from '@core/types'

/**
 * Sum one or two stats across all non-blocked agents.
 * This is the pool size before opposition subtraction.
 */
export function computePool(
  agents: Agent[],
  stats: [StatName] | [StatName, StatName],
): number {
  return agents
    .filter((a) => !a.conditions.some((c) => BLOCKING_CONDITIONS.has(c)))
    .reduce((total, agent) => {
      return total + stats.reduce((sum, stat) => sum + (agent.stats[stat] ?? 0), 0)
    }, 0)
}

/**
 * Returns a per-stat breakdown across all available agents.
 * Used by the Playground's pool summary and by event slot validation.
 */
export function statSummary(agents: Agent[]): Record<StatName, number> {
  const available = agents.filter(
    (a) => !a.conditions.some((c) => BLOCKING_CONDITIONS.has(c)),
  )
  return {
    beauty:          sumStat(available, 'beauty'),
    cunning:         sumStat(available, 'cunning'),
    eloquence:       sumStat(available, 'eloquence'),
    discretion:      sumStat(available, 'discretion'),
    resolve:         sumStat(available, 'resolve'),
    vitality:        sumStat(available, 'vitality'),
    resourcefulness: sumStat(available, 'resourcefulness'),
    spiritualArts:   sumStat(available, 'spiritualArts'),
    scholarship:     sumStat(available, 'scholarship'),
  }
}

function sumStat(agents: Agent[], stat: StatName): number {
  return agents.reduce((sum, a) => sum + (a.stats[stat] ?? 0), 0)
}
