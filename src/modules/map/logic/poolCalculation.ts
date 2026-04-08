// =============================================================================
// map/logic/poolCalculation.ts
// Pure functions for computing dice pool from agents, opposition, and intelligence.
// =============================================================================

import type { Agent, GameEvent } from '@core/types'
import { intelligenceBonusDice } from '@core/types'
import { applyEquipmentBonuses } from '@modules/characters'

/**
 * Total dice pool for an event given the assigned agents.
 * Returns 2 for auto-resolve (no-slot) events; null when no agents and slots exist.
 */
export function computeEventPool(
  assignedAgents: Agent[],
  event: Pick<GameEvent, 'slots' | 'statsChecked' | 'oppositionValue' | 'assignedIntelligence' | 'type'>,
): number | null {
  const hasSlots = event.slots.length > 0
  if (hasSlots && assignedAgents.length === 0) return null

  const base = assignedAgents.length === 0
    ? 2  // no-slot auto-resolve
    : Math.round(
        assignedAgents.reduce((sum, a) => {
          const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
          return sum + event.statsChecked.reduce((s, st) => s + (eff[st] ?? 0), 0) / event.statsChecked.length
        }, 0)
      ) - event.oppositionValue

  return Math.max(0, base + intelligenceBonusDice(event.assignedIntelligence, event.type))
}
