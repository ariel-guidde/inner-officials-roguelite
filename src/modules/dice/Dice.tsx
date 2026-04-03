import { useEffect, useRef } from 'react'
import type { DiceRollConfig, DiceRollResult } from '@core/types'
import { useDiceRoll } from './hooks/useDiceRoll'
import { DiceScene } from './components/DiceScene'
import { ResultOverlay } from './components/ResultOverlay'

// ---------------------------------------------------------------------------
// Props contract
// ---------------------------------------------------------------------------

export interface DiceProps {
  /**
   * When this prop changes from null to a config object the module starts rolling.
   * Parent should set it to null after receiving onRollSettled.
   */
  rollConfig: DiceRollConfig | null
  /** Called ~700ms after physics settles (after the reveal animation). */
  onRollSettled: (result: DiceRollResult) => void
  /** Called the moment dice begin tumbling. */
  onRollStarted?: () => void
  /** Render a 2D fallback instead of the 3D scene (accessibility / perf). */
  disable3D?: boolean
  /** Canvas height. Default '400px'. */
  canvasHeight?: string
  /** Golden dice spent after the initial result — each one drops in physically. */
  goldenDiceSpent?: number
  /** Called when the player clicks OK on the result overlay. */
  onDismiss?: () => void
  /**
   * Override the result shown in the overlay (e.g. after golden dice patch it).
   * Falls back to the physics-determined result when not provided.
   */
  displayResult?: DiceRollResult | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dice({
  rollConfig,
  onRollSettled,
  onRollStarted,
  disable3D = false,
  canvasHeight = '400px',
  goldenDiceSpent = 0,
  onDismiss,
  displayResult,
}: DiceProps) {
  const { phase, result, rollId, launch, onPhysicsSettled, reset } = useDiceRoll(onRollSettled)

  // Frozen config — holds the config for the CURRENT roll even after parent clears rollConfig
  const prevConfigRef = useRef<DiceRollConfig | null>(null)

  // Launch when parent sets a new (non-null) config
  useEffect(() => {
    if (rollConfig !== null) {
      prevConfigRef.current = rollConfig
      launch(rollConfig)
      onRollStarted?.()
    }
  // We deliberately only react to rollConfig reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollConfig])

  const handleDismiss = () => {
    reset()
    onDismiss?.()
  }

  // 2D fallback — no Three.js
  if (disable3D) {
    return (
      <FallbackDice
        result={result}
        config={rollConfig ?? prevConfigRef.current}
        phase={phase}
      />
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-silk/10"
      style={{ height: canvasHeight }}
    >
      <DiceScene
        config={prevConfigRef.current}
        phase={phase}
        onPhysicsSettled={onPhysicsSettled}
        rollId={rollId}
        goldenDiceSpent={goldenDiceSpent}
      />

      {phase === 'revealed' && prevConfigRef.current && (displayResult ?? result) && (
        <ResultOverlay
          result={(displayResult ?? result)!}
          config={prevConfigRef.current}
          goldenDiceSpent={goldenDiceSpent}
          onDismiss={handleDismiss}
        />
      )}

      {phase === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center text-silk/20 text-sm pointer-events-none">
          Roll to begin
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2D fallback (no Canvas required)
// ---------------------------------------------------------------------------

function FallbackDice({
  result,
  config,
  phase,
}: {
  result: DiceRollResult | null
  config: DiceRollConfig | null
  phase: string
}) {
  if (!result || !config) {
    return (
      <div className="flex items-center justify-center h-32 text-silk/30 text-sm border border-silk/10 rounded-xl">
        {phase === 'rolling' ? 'Rolling…' : 'Waiting for roll…'}
      </div>
    )
  }

  return (
    <div className="border border-silk/10 rounded-xl p-4 text-center">
      <div className={`font-serif text-xl font-bold ${result.isSuccess ? 'text-jade' : 'text-vermilion'}`}>
        {result.isSuccess ? '✓ Pass' : '✗ Fail'}
      </div>
      <div className="text-silk/60 text-sm mt-1">
        {result.successes} / {config.threshold} successes
      </div>
      <div className="flex gap-1 mt-2 justify-center flex-wrap">
        {Array.from({ length: config.goldenDice }).map((_, i) => (
          <span key={i}>🌕</span>
        ))}
        {result.dice.map((d) => (
          <span key={d.id} className={d.face === 'dragon' ? '' : 'opacity-30'}>
            {d.face === 'dragon' ? '🐉' : '☁️'}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Dice
