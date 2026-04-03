// Pure probability calculations for the dice system.
// Used by the Playground to show expected outcomes before rolling.

import { DIFFICULTY_SUCCESS_RATE, type DiceDifficulty } from '@core/types'

/** Binomial coefficient C(n, k). */
function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return result
}

/**
 * Probability of getting exactly `k` successes from `n` dice.
 */
export function exactSuccessProbability(
  n: number,
  k: number,
  difficulty: DiceDifficulty,
): number {
  const p = DIFFICULTY_SUCCESS_RATE[difficulty]
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

/**
 * Probability of getting AT LEAST `threshold` successes from `pool` dice
 * (after adding `goldenDice` auto-successes).
 */
export function passChance(
  pool: number,
  threshold: number,
  difficulty: DiceDifficulty,
  goldenDice = 0,
): number {
  const effectiveThreshold = Math.max(0, threshold - goldenDice)
  if (effectiveThreshold <= 0) return 1
  if (pool <= 0) return 0

  let failChance = 0
  for (let k = 0; k < effectiveThreshold; k++) {
    failChance += exactSuccessProbability(pool, k, difficulty)
  }
  return Math.max(0, Math.min(1, 1 - failChance))
}

/**
 * Returns a rough descriptor of the roll's feel based on pass probability.
 */
export function rollFeeling(probability: number): string {
  if (probability >= 0.95) return 'Certain'
  if (probability >= 0.80) return 'Comfortable'
  if (probability >= 0.60) return 'Tense'
  if (probability >= 0.40) return 'Risky'
  if (probability >= 0.20) return 'Desperate'
  return 'Hail Mary'
}
