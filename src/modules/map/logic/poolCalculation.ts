// =============================================================================
// map/logic/poolCalculation.ts
// Pure functions for computing dice pool from agents, opposition, and scrolls.
// Shared between Map.tsx (preview) and Playground.tsx (resolution).
// =============================================================================

import type { Agent, GameEvent, IntelligenceScroll, StatName } from '@core/types'
import { INTELLIGENCE_MATCHING_STATS } from '@core/types'
import { applyEquipmentBonuses } from '@modules/characters'

/**
 * Bonus dice from an intelligence scroll, given the stats the event checks.
 * +2 for jade tier on a stat match, +1 for any other tier, 0 if no match or no scroll.
 */
export function scrollBonusDice(
  scroll: IntelligenceScroll | null,
  statsChecked: readonly StatName[],
): number {
  if (!scroll) return 0
  const matches = INTELLIGENCE_MATCHING_STATS[scroll.type].some(s => statsChecked.includes(s))
  if (!matches) return 0
  return scroll.tier === 'jade' ? 2 : 1
}

/**
 * Total dice pool for an event given the assigned agents.
 * Returns 2 for auto-resolve (no-slot) events; null when no agents and slots exist.
 */
export function computeEventPool(
  assignedAgents: Agent[],
  event: Pick<GameEvent, 'slots' | 'statsChecked' | 'oppositionValue' | 'assignedScroll'>,
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

  return Math.max(0, base + scrollBonusDice(event.assignedScroll, event.statsChecked))
}
