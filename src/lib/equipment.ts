// Pure equipment logic — no module dependencies, only @core/types.

import type {
  Agent, AgentTier, Equipment, EquipmentLoadout, StatName,
} from '@core/types'
import { AGENT_TIER_ORDER } from '@core/types'

/**
 * Returns a new stat map with every equipped item's statBonus added.
 */
export function applyEquipmentBonuses(
  stats: Record<string, number>,
  equipment?: EquipmentLoadout,
): Record<string, number> {
  const result = { ...stats }
  for (const item of Object.values(equipment ?? {})) {
    if (!item) continue
    for (const [stat, val] of Object.entries(item.statBonus)) {
      if (val == null || val === 0) continue
      result[stat] = (result[stat] ?? 0) + val
    }
  }
  return result
}

/**
 * Checks whether an agent meets an item's equip requirements.
 */
export function meetsRequirements(agent: Agent, item: Equipment): boolean {
  const req = item.requires
  if (req.tags?.length) {
    if (!req.tags.every(t => agent.tags.includes(t))) return false
  }
  if (req.anyTag?.length) {
    if (!req.anyTag.some(t => agent.tags.includes(t))) return false
  }
  if (req.minTier) {
    if (AGENT_TIER_ORDER.indexOf(agent.tier) < AGENT_TIER_ORDER.indexOf(req.minTier as AgentTier)) return false
  }
  if (req.minMartial != null) {
    if ((agent.stats.martial ?? 0) < req.minMartial) return false
  }
  if (req.minStats) {
    for (const [stat, minVal] of Object.entries(req.minStats) as [StatName, number][]) {
      if ((agent.stats[stat] ?? 0) < minVal) return false
    }
  }
  return true
}
