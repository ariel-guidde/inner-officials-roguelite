import { useState, useCallback, useRef } from 'react'
import type { DiceRollConfig, DiceRollResult } from '@core/types'

export type RollPhase = 'idle' | 'rolling' | 'revealed'

export interface DiceRollState {
  phase: RollPhase
  result: DiceRollResult | null
  /** Increments each roll — used as key to remount the physics world. */
  rollId: number
}

export function useDiceRoll(onRollSettled: (result: DiceRollResult) => void) {
  const [phase, setPhase] = useState<RollPhase>('idle')
  const [result, setResult] = useState<DiceRollResult | null>(null)
  const [rollId, setRollId] = useState(0)

  const onSettledRef = useRef(onRollSettled)
  onSettledRef.current = onRollSettled

  /** Start a roll — physics world will determine the result after settling. */
  const launch = useCallback((_config: DiceRollConfig) => {
    setResult(null)
    setRollId((id) => id + 1)
    setPhase('rolling')
  }, [])

  /** Called by DicePhysicsWorld once physics has settled, with the result read from die rotations. */
  const onPhysicsSettled = useCallback((r: DiceRollResult) => {
    setResult(r)
    setPhase('revealed')
    // Delay notifying parent so the reveal animation plays first
    setTimeout(() => onSettledRef.current(r), 700)
  }, [])

  const reset = useCallback(() => {
    setPhase('idle')
    setResult(null)
  }, [])

  return { phase, result, rollId, launch, onPhysicsSettled, reset }
}
