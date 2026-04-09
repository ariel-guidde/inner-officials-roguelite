// =============================================================================
// ResolutionScreen — progressive narrative with inline dice rolls and dilemmas.
// Text reveals paragraph by paragraph on "Continue". Dice requires "Attempt".
// =============================================================================

import { useState, useCallback, useEffect } from 'react'
import type { Agent, DiceRollConfig, DiceRollResult, GameEvent, ReputationState } from '@core/types'
import { STAT_LABELS, RANK_TITLES } from '@core/types'
import { URGENCY_COLOR, URGENCY_LABEL } from '@modules/map'
import { Dice } from '@modules/dice'
import { applyEquipmentBonuses } from '@lib/equipment'
import type { DilemmaChoice } from '@modules/events'
import { EVENT_DEFINITIONS_BY_ID } from '@modules/events'

// A narrative beat — one step in the progressive story
type NarrativeBeat =
  | { kind: 'text'; content: string }
  | { kind: 'dice'; pool: number; threshold: number; tier: import('@core/types').AgentTier; statSummary: string }
  | { kind: 'dilemma'; prompt: string; choices: DilemmaChoice[] }
  | { kind: 'result'; success: boolean; margin: number }
  | { kind: 'choice_result'; choiceId: string; label: string }

interface Props {
  event: GameEvent
  assignedAgents: Agent[]
  pool: number
  tier: import('@core/types').AgentTier
  goldenDiceAvailable: number
  rerollsAvailable: number
  onComplete: (result: {
    success: boolean
    choiceId?: string
    goldenSpent: number
    rerollsUsed: number
    rollResult?: DiceRollResult
  }) => void
  onClose: () => void
}

export function ResolutionScreen({ event, assignedAgents, pool, tier, goldenDiceAvailable, rerollsAvailable, onComplete, onClose }: Props) {
  const uc = URGENCY_COLOR[event.urgency]
  const def = EVENT_DEFINITIONS_BY_ID[event.id]
  const dilemma = def?.dilemma

  // Build narrative beats
  const [beats] = useState<NarrativeBeat[]>(() => {
    const b: NarrativeBeat[] = [{ kind: 'text', content: event.description }]

    if (dilemma && (dilemma.timing === 'before-roll' || dilemma.timing === 'standalone')) {
      b.push({ kind: 'dilemma', prompt: dilemma.prompt, choices: dilemma.choices })
    }

    if (!dilemma || dilemma.timing !== 'standalone') {
      const statSummary = event.statsChecked.map(s => STAT_LABELS[s].en).join(' + ')
      b.push({ kind: 'dice', pool, threshold: event.threshold, tier, statSummary })
    }

    return b
  })

  // How many beats are revealed
  const [revealedCount, setRevealedCount] = useState(1)
  const [choiceId, setChoiceId] = useState<string | null>(null)
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null)
  const [rollConfig, setRollConfig] = useState<DiceRollConfig | null>(null)
  const [goldenSpent, setGoldenSpent] = useState(0)
  const [rerollsUsed, setRerollsUsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentBeat = beats[revealedCount - 1]
  const hasMoreBeats = revealedCount < beats.length

  const effectiveResult = rollResult ? (() => {
    if (goldenSpent === 0) return rollResult
    const successes = rollResult.successes + goldenSpent
    return {
      ...rollResult,
      successes,
      isSuccess: successes >= event.threshold,
      isCriticalFailure: false,
      margin: successes - event.threshold,
    }
  })() : null

  const handleContinue = useCallback(() => {
    if (hasMoreBeats) {
      setRevealedCount(prev => prev + 1)
    }
  }, [hasMoreBeats])

  const handleChoicePick = useCallback((choice: DilemmaChoice) => {
    setChoiceId(choice.id)
    // If standalone dilemma, skip dice — go straight to completion
    if (dilemma?.timing === 'standalone' || choice.skipDiceRoll) {
      setIsComplete(true)
    } else {
      // Reveal next beat (dice)
      setRevealedCount(prev => prev + 1)
    }
  }, [dilemma])

  const handleAttempt = useCallback(() => {
    // Find the choice's overrides if any
    const choice = choiceId && dilemma ? dilemma.choices.find(c => c.id === choiceId) : null
    setRollConfig({
      pool,
      threshold: choice?.overrideThreshold ?? event.threshold,
      tier,
      difficulty: 'standard',
      goldenDice: 0,
      eventLabel: event.title,
    })
  }, [pool, tier, event, choiceId, dilemma])

  const handleRollSettled = useCallback((result: DiceRollResult) => {
    setRollResult(result)
  }, [])

  const handleSpendGolden = useCallback(() => {
    if (goldenSpent >= goldenDiceAvailable) return
    setGoldenSpent(prev => prev + 1)
  }, [goldenSpent, goldenDiceAvailable])

  const handleReroll = useCallback(() => {
    if (rerollsUsed >= rerollsAvailable) return
    setRerollsUsed(prev => prev + 1)
    setRollResult(null)
    setRollConfig(prev => prev ? { ...prev } : null)
  }, [rerollsUsed, rerollsAvailable])

  const handleFinish = useCallback(() => {
    const success = dilemma?.timing === 'standalone' || (choiceId && dilemma?.choices.find(c => c.id === choiceId)?.skipDiceRoll)
      ? true
      : effectiveResult?.isSuccess ?? false
    onComplete({
      success,
      choiceId: choiceId ?? undefined,
      goldenSpent,
      rerollsUsed,
      rollResult: effectiveResult ?? undefined,
    })
  }, [choiceId, dilemma, effectiveResult, goldenSpent, rerollsUsed, onComplete])

  // ── Keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        // Continue button showing?
        if (hasMoreBeats && !choiceId && currentBeat?.kind === 'text') {
          handleContinue()
          return
        }
        // Attempt button showing?
        if (!rollConfig && !isComplete && beats.some((b, i) => i < revealedCount && b.kind === 'dice')) {
          handleAttempt()
          return
        }
        // Finish button showing?
        if (isComplete || (effectiveResult && !hasMoreBeats)) {
          handleFinish()
          return
        }
      }

      // Number keys 1-4 for dilemma choices
      if (['1', '2', '3', '4'].includes(e.key) && !choiceId) {
        const dilemmaBeats = beats.slice(0, revealedCount).filter(b => b.kind === 'dilemma')
        if (dilemmaBeats.length > 0) {
          const dilemmaBeat = dilemmaBeats[dilemmaBeats.length - 1]
          if (dilemmaBeat.kind === 'dilemma') {
            const idx = parseInt(e.key) - 1
            if (idx < dilemmaBeat.choices.length) {
              handleChoicePick(dilemmaBeat.choices[idx])
            }
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, hasMoreBeats, choiceId, currentBeat, handleContinue, rollConfig, isComplete, beats, revealedCount, handleAttempt, effectiveResult, handleFinish, handleChoicePick])

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'rgba(5,3,1,0.97)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(232,213,176,0.1)' }}>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl text-parchment">{event.title}</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase"
                style={{ background: `${uc.badge}22`, color: uc.badge }}>
                {URGENCY_LABEL[event.urgency]}
              </span>
            </div>
            <div className="text-xs text-silk/35">Resolution</div>
          </div>
        </div>
        <div className="text-xs text-silk/30">
          {assignedAgents.map(a => a.name).join(' · ')}
        </div>
      </div>

      {/* Main: left dice area, right narrative */}
      <div className="flex flex-1 min-h-0">
        {/* Left: dice + resources */}
        <div className="w-2/5 flex flex-col items-center justify-center p-6"
          style={{ borderRight: '1px solid rgba(232,213,176,0.08)' }}>
          {rollConfig ? (
            <>
              <div style={{ width: '100%', height: 250 }}>
                <Dice
                  rollConfig={rollConfig}
                  onRollSettled={handleRollSettled}
                  canvasHeight="250px"
                  goldenDiceSpent={goldenSpent}
                  displayResult={effectiveResult}
                  onDismiss={() => {}}
                />
              </div>

              {/* Result + resources */}
              {effectiveResult && (
                <div className="mt-4 text-center space-y-3">
                  <div className="text-2xl font-serif font-bold"
                    style={{ color: effectiveResult.isSuccess ? '#00a86b' : '#e04030' }}>
                    {effectiveResult.isSuccess ? 'Success' : 'Failed'}
                  </div>
                  <div className="text-xs text-silk/40">
                    {effectiveResult.successes} of {event.threshold} needed
                    {effectiveResult.margin !== 0 && (
                      <span style={{ color: effectiveResult.margin > 0 ? '#00a86b88' : '#e0403088' }}>
                        {' '}({effectiveResult.margin > 0 ? '+' : ''}{effectiveResult.margin})
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 justify-center">
                    {goldenDiceAvailable - goldenSpent > 0 && (
                      <button onClick={handleSpendGolden}
                        className="px-3 py-1.5 rounded text-xs transition-all hover:brightness-125"
                        style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.85)' }}>
                        Golden Die ({goldenDiceAvailable - goldenSpent})
                      </button>
                    )}
                    {rerollsAvailable - rerollsUsed > 0 && (
                      <button onClick={handleReroll}
                        className="px-3 py-1.5 rounded text-xs transition-all hover:brightness-125"
                        style={{ background: 'rgba(100,160,255,0.1)', border: '1px solid rgba(100,160,255,0.3)', color: 'rgba(130,180,255,0.85)' }}>
                        Reroll ({rerollsAvailable - rerollsUsed})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Pre-roll: stat breakdown */
            <div className="text-center space-y-4">
              <div className="text-silk/30 uppercase tracking-widest text-xs">Dice Check</div>
              <div className="flex gap-6 justify-center">
                {event.statsChecked.map(stat => (
                  <div key={stat}>
                    <div className="text-[9px] text-silk/35 uppercase">{STAT_LABELS[stat].en}</div>
                    <div className="text-2xl font-bold" style={{ color: uc.badge }}>
                      {assignedAgents.reduce((sum, a) => {
                        const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
                        return sum + (eff[stat] ?? 0)
                      }, 0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xl font-bold text-parchment">{pool}d → need {event.threshold}+</div>
              {event.oppositionValue > 0 && (
                <div className="text-xs text-red-400/50">Opposition: -{event.oppositionValue}</div>
              )}
            </div>
          )}
        </div>

        {/* Right: progressive narrative */}
        <div className="w-3/5 p-8 overflow-y-auto flex flex-col">
          <div className="flex-1 space-y-6">
            {beats.slice(0, revealedCount).map((beat, i) => {
              switch (beat.kind) {
                case 'text':
                  return <p key={i} className="font-serif text-[16px] text-silk/55 leading-[2.0]">{beat.content}</p>

                case 'dilemma':
                  return (
                    <div key={i}>
                      <div className="w-12 h-px mb-4" style={{ background: 'rgba(255,215,0,0.2)' }} />
                      <p className="font-serif text-base text-parchment/70 leading-relaxed italic mb-4">{beat.prompt}</p>
                      {!choiceId ? (
                        <div className="space-y-1">
                          {beat.choices.map(choice => (
                            <button key={choice.id}
                              disabled={choice.prerequisites && choice.prerequisites.length > 0} // simplified lock check
                              className="w-full text-left py-2 px-3 transition-colors group"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleChoicePick(choice)}>
                              <span className="font-serif text-[14px] text-parchment/60 group-hover:text-gold/80 transition-colors">
                                {choice.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm font-serif italic text-gold/50">
                          {dilemma?.choices.find(c => c.id === choiceId)?.label}
                        </div>
                      )}
                    </div>
                  )

                case 'dice':
                  return (
                    <div key={i} className="text-center py-4">
                      {!rollConfig && !isComplete && (
                        <button onClick={handleAttempt}
                          className="px-8 py-3 rounded-lg font-serif text-base font-semibold transition-all hover:brightness-125"
                          style={{
                            background: 'rgba(204,43,0,0.15)',
                            border: '1px solid rgba(204,43,0,0.4)',
                            color: 'rgba(230,100,70,0.9)',
                          }}>
                          Attempt ({beat.statSummary})
                        </button>
                      )}
                    </div>
                  )

                default:
                  return null
              }
            })}

            {/* Continue / Finish */}
            {hasMoreBeats && !choiceId && currentBeat?.kind === 'text' && (
              <button onClick={handleContinue}
                className="px-5 py-2 rounded-lg font-serif text-sm transition-all hover:brightness-125 self-start"
                style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.2)', color: 'rgba(232,213,176,0.6)' }}>
                Continue
              </button>
            )}

            {(isComplete || (effectiveResult && !hasMoreBeats)) && (
              <button onClick={handleFinish}
                className="px-6 py-2.5 rounded-lg font-serif text-sm font-semibold transition-all hover:brightness-125 self-start mt-4"
                style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.35)', color: 'rgba(255,215,0,0.85)' }}>
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
