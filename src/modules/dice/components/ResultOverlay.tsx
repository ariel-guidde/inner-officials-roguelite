import type { DiceRollConfig, DiceRollResult } from '@core/types'

interface ResultOverlayProps {
  result: DiceRollResult
  config: DiceRollConfig
  goldenDiceSpent: number
  onDismiss: () => void
}

/**
 * Absolute-positioned HTML overlay that appears after dice settle.
 * Shows the result and an explicit OK button to continue.
 */
export function ResultOverlay({ result, config, goldenDiceSpent, onDismiss }: ResultOverlayProps) {
  const passColor   = result.isSuccess ? 'text-jade'        : 'text-vermilion'
  const borderColor = result.isSuccess ? 'border-jade/40'   : 'border-vermilion/40'
  const bgColor     = result.isSuccess ? 'bg-jade/10'       : 'bg-vermilion/10'
  const okColor     = result.isSuccess ? 'border-jade/50 text-jade hover:bg-jade/15'
                                       : 'border-vermilion/50 text-vermilion hover:bg-vermilion/15'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 pointer-events-none">
      <div
        className={`
          ${borderColor} ${bgColor}
          border rounded-xl px-6 py-4 text-center max-w-sm w-full mx-4
          backdrop-blur-sm shadow-2xl
          animate-[fadeInUp_0.4s_ease-out]
          pointer-events-auto
        `}
      >
        {/* Pass / Fail */}
        <div className={`font-serif text-2xl font-bold ${passColor}`}>
          {result.isSuccess ? '✓ Pass' : '✗ Fail'}
          {result.isCriticalSuccess && (
            <span className="text-gold ml-2 text-xl"> — Critical Success!</span>
          )}
          {result.isCriticalFailure && (
            <span className="ml-2 text-xl opacity-70"> — Total Failure</span>
          )}
        </div>

        {/* Counts */}
        <div className="text-silk/60 text-sm mt-1">
          {result.successes} / {config.threshold} successes needed
          {result.margin !== 0 && (
            <span className={result.margin > 0 ? 'text-jade ml-1' : 'text-vermilion/70 ml-1'}>
              ({result.margin > 0 ? `+${result.margin}` : result.margin})
            </span>
          )}
        </div>

        {/* Die faces row */}
        <div className="flex gap-1.5 mt-3 justify-center flex-wrap">
          {Array.from({ length: goldenDiceSpent }).map((_, i) => (
            <span key={`g-${i}`} title="Golden die — auto-success" className="text-xl">🌕</span>
          ))}
          {result.dice.map((die) => (
            <span
              key={die.id}
              title={die.face === 'dragon' ? 'Dragon — success' : 'Cloud — failure'}
              className={`text-xl transition-opacity ${die.face === 'dragon' ? 'opacity-100' : 'opacity-30'}`}
            >
              {die.face === 'dragon' ? '🐉' : '☁️'}
            </span>
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className={`
            mt-4 px-8 py-1.5 rounded-lg border font-serif text-sm tracking-widest
            transition-colors duration-200
            ${okColor}
          `}
        >
          ok
        </button>
      </div>
    </div>
  )
}
