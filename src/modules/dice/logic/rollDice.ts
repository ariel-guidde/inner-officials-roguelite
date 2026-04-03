// =============================================================================
// Dice logic — pure functions, no React, no side effects.
// =============================================================================

import type { DiceRollConfig, DiceRollResult, DieResult, DieFace } from '@core/types'
import { DIFFICULTY_SUCCESS_RATE } from '@core/types'

/**
 * Resolve a dice check.
 * The result is computed before any physics animation plays.
 * The animation then reveals each die's pre-determined face.
 */
export function rollDice(config: DiceRollConfig): DiceRollResult {
  const { pool, threshold, difficulty, goldenDice } = config
  const successRate = DIFFICULTY_SUCCESS_RATE[difficulty]

  const dice: DieResult[] = Array.from({ length: pool }, (_, i) => {
    const face: DieFace = Math.random() < successRate ? 'dragon' : 'cloud'
    return { id: `die-${i}-${Date.now()}`, face, isGolden: false }
  })

  const regularSuccesses = dice.filter((d) => d.face === 'dragon').length
  const successes = regularSuccesses + goldenDice

  return {
    dice,
    successes,
    isSuccess:        successes >= threshold,
    isCriticalSuccess: pool > 0 && regularSuccesses === pool,
    isCriticalFailure: regularSuccesses === 0 && goldenDice === 0,
    margin:           successes - threshold,
  }
}

/**
 * Roll a subset of dice again (Intelligence Scroll reroll).
 * Returns a new full result merging kept dice with rerolled ones.
 */
export function rerollDice(
  previous: DiceRollResult,
  config: DiceRollConfig,
): DiceRollResult {
  // Full reroll — all regular dice tumble again
  const newDice: DieResult[] = previous.dice.map((d) => {
    if (d.isGolden) return d
    const face: DieFace = Math.random() < DIFFICULTY_SUCCESS_RATE[config.difficulty] ? 'dragon' : 'cloud'
    return { ...d, face }
  })

  const regularSuccesses = newDice.filter((d) => !d.isGolden && d.face === 'dragon').length
  const successes = regularSuccesses + config.goldenDice

  return {
    dice: newDice,
    successes,
    isSuccess:         successes >= config.threshold,
    isCriticalSuccess: config.pool > 0 && regularSuccesses === config.pool,
    isCriticalFailure: regularSuccesses === 0 && config.goldenDice === 0,
    margin:            successes - config.threshold,
  }
}
