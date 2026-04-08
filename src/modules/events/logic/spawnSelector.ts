// =============================================================================
// events/logic/spawnSelector.ts
// Selects which EventDefinitions to place onMap for a new day.
//
// All spawning is pool-based. No direct triggers.
// Forced events always appear when ready. Remaining slots filled by weighted draw.
// =============================================================================

import type { EventDefinition } from '../types'
import type { SpawnContext } from './eligibility'
import { evaluateState } from './eligibility'

/** Default max number of random (non-forced) pool events spawned per day. */
const DEFAULT_MAX_POOL_EVENTS = 3

export interface SpawnOptions {
  /** Max random (non-forced) events to draw. Default 3. */
  maxPoolEvents?: number
}

/**
 * Select events to place onMap this day.
 * Returns definitions that should transition from ready → onMap.
 */
export function selectEventsForDay(
  allDefs: EventDefinition[],
  ctx: SpawnContext,
  options?: SpawnOptions,
): EventDefinition[] {
  const maxPool = options?.maxPoolEvents ?? DEFAULT_MAX_POOL_EVENTS

  // Find all definitions currently in 'ready' state
  const ready = allDefs.filter(d => evaluateState(d, ctx) === 'ready')

  // Forced events always spawn
  const forced = ready.filter(d => d.isForced)
  const pool = ready.filter(d => !d.isForced)

  const selected: EventDefinition[] = [...forced]

  // Weighted sampling without replacement
  const remaining = [...pool]
  const draws = Math.min(maxPool, remaining.length)

  for (let i = 0; i < draws; i++) {
    const totalWeight = remaining.reduce((s, d) => s + d.poolWeight, 0)
    if (totalWeight === 0) break

    let roll = Math.random() * totalWeight
    const idx = remaining.findIndex(d => { roll -= d.poolWeight; return roll <= 0 })
    const chosen = remaining.splice(idx < 0 ? remaining.length - 1 : idx, 1)[0]
    selected.push(chosen)
  }

  return selected
}
