import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Physics, type RapierRigidBody } from '@react-three/rapier'
import type { DiceRollConfig, DiceRollResult, DieResult, DieFace } from '@core/types'
import { getTopFaceIndex, isFaceDragon } from '../logic/faceDetection'
import { DiceSurface } from './DiceSurface'
import { DieMesh } from './DieMesh'
import { GoldenDie } from './GoldenDie'

interface DicePhysicsWorldProps {
  config: DiceRollConfig
  isRevealed: boolean
  onSettled: (result: DiceRollResult) => void
  /** Golden dice added post-result — each mounts fresh and drops in. */
  goldenDiceSpent: number
}

const VELOCITY_THRESHOLD    = 0.08
const REQUIRED_STILL_FRAMES = 25
const MIN_FRAMES_BEFORE_CHECK = 50
const MAX_FRAMES = 600

/**
 * Physics world (Rapier).
 * Dice faces are mixed dragon/cloud based on difficulty.
 * After physics settles, reads each die's rotation to determine which face landed
 * up, then builds and emits the DiceRollResult.
 * Must be rendered inside a <Canvas>.
 */
export function DicePhysicsWorld({ config, isRevealed, onSettled, goldenDiceSpent }: DicePhysicsWorldProps) {
  const bodiesRef = useRef<Array<RapierRigidBody | null>>(
    new Array(config.pool).fill(null),
  )
  const stillFrames   = useRef(0)
  const totalFrames   = useRef(0)
  const hasSettled    = useRef(false)
  const onSettledRef  = useRef(onSettled)
  onSettledRef.current = onSettled

  const registerBody = useCallback((body: RapierRigidBody, index: number) => {
    bodiesRef.current[index] = body
  }, [])

  const buildResult = useCallback((): DiceRollResult => {
    const dice: DieResult[] = bodiesRef.current.map((body, i) => {
      if (!body) return { id: `die-${i}`, face: 'cloud' as DieFace, isGolden: false }
      const rot = body.rotation()
      const topFace = getTopFaceIndex(rot)
      const face: DieFace = isFaceDragon(topFace, config.difficulty) ? 'dragon' : 'cloud'
      return { id: `die-${i}-${Date.now()}`, face, isGolden: false }
    })

    const regularSuccesses = dice.filter(d => d.face === 'dragon').length
    const successes = regularSuccesses + config.goldenDice

    return {
      dice,
      successes,
      isSuccess: successes >= config.threshold,
      isCriticalSuccess: dice.length > 0 && regularSuccesses === dice.length,
      isCriticalFailure: regularSuccesses === 0 && config.goldenDice === 0,
      margin: successes - config.threshold,
    }
  }, [config])

  useFrame(() => {
    if (hasSettled.current) return

    totalFrames.current++

    if (totalFrames.current > MAX_FRAMES) {
      hasSettled.current = true
      onSettledRef.current(buildResult())
      return
    }

    if (totalFrames.current < MIN_FRAMES_BEFORE_CHECK) return

    const bodies = bodiesRef.current.filter((b): b is RapierRigidBody => b !== null)
    if (bodies.length < config.pool) return

    const allStill = bodies.every((body) => {
      const lv = body.linvel()
      const av = body.angvel()
      return (
        Math.abs(lv.x) < VELOCITY_THRESHOLD &&
        Math.abs(lv.y) < VELOCITY_THRESHOLD &&
        Math.abs(lv.z) < VELOCITY_THRESHOLD &&
        Math.abs(av.x) < VELOCITY_THRESHOLD &&
        Math.abs(av.y) < VELOCITY_THRESHOLD &&
        Math.abs(av.z) < VELOCITY_THRESHOLD
      )
    })

    if (allStill) {
      stillFrames.current++
      if (stillFrames.current >= REQUIRED_STILL_FRAMES) {
        hasSettled.current = true
        onSettledRef.current(buildResult())
      }
    } else {
      stillFrames.current = 0
    }
  })

  return (
    <Physics gravity={[0, -18, 0]} interpolate>
      <DiceSurface />

      {Array.from({ length: config.pool }, (_, i) => (
        <DieMesh
          key={i}
          index={i}
          total={config.pool}
          difficulty={config.difficulty}
          tier={config.tier}
          isRevealed={isRevealed}
          onBodyReady={registerBody}
        />
      ))}

      {Array.from({ length: goldenDiceSpent }, (_, i) => (
        <GoldenDie key={`golden-${i}`} index={i} />
      ))}
    </Physics>
  )
}
