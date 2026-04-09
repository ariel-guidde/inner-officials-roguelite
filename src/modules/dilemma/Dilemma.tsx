// =============================================================================
// Dilemma — Full-screen split view for event resolution with choices.
// Left: scene visual + atmospheric decoration. Right: narrative + choice lines.
// Sultan's Game style: mystery first, no consequence previews, no confirmation.
// =============================================================================

import { useState, useEffect, useRef } from 'react'
import type { ReputationState } from '@core/types'

// ---------------------------------------------------------------------------
// Types — standalone, not coupled to event system types
// ---------------------------------------------------------------------------

export interface DilemmaChoiceData {
  id: string
  label: string
  reputationDelta?: Partial<ReputationState>
  locked?: boolean
  lockReason?: string
}

export interface DilemmaData {
  /** Event title */
  title: string
  /** Location name */
  location: string
  /** The narrative prompt — what's happening, what's at stake */
  narrative: string
  /** The question the player must answer */
  question: string
  choices: DilemmaChoiceData[]
}

export interface DilemmaResult {
  choiceId: string
  reputationDelta: Partial<ReputationState>
}

interface Props {
  data: DilemmaData
  onResolve: (result: DilemmaResult) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dilemma({ data, onResolve }: Props) {
  const [phase, setPhase] = useState<'choosing' | 'resolved'>('choosing')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, [])

  const handlePick = (choice: DilemmaChoiceData) => {
    if (choice.locked || phase !== 'choosing') return
    setPhase('resolved')
    timerRef.current = setTimeout(() => {
      onResolve({
        choiceId: choice.id,
        reputationDelta: choice.reputationDelta ?? {},
      })
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-40 flex" style={{ background: '#0a0604' }}>

      {/* ── Left: Scene ──────────────────────────────────────────────── */}
      <div className="w-1/2 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(26,18,9,0.95) 0%, rgba(5,3,1,1) 80%)' }}>

        {/* Decorative ink-wash circle */}
        <div className="absolute w-80 h-80 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(232,213,176,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />

        {/* Location + title */}
        <div className="relative text-center z-10">
          <div className="text-xs text-silk/20 uppercase tracking-[0.3em] mb-3">{data.location}</div>
          <h1 className="font-serif text-3xl text-parchment/80 leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {data.title}
          </h1>

          {/* Resolved state */}
          {phase === 'resolved' && (
            <div className="mt-8">
              <div className="font-serif text-lg text-parchment/50">So it was decided.</div>
            </div>
          )}
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(232,213,176,0.08) 50%, transparent 90%)' }} />
      </div>

      {/* ── Right: Narrative + Choices ────────────────────────────────── */}
      <div className="w-1/2 flex flex-col border-l"
        style={{ borderColor: 'rgba(232,213,176,0.06)', background: 'rgba(13,8,0,0.98)' }}>

        {/* Narrative text */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <p className="font-serif text-[16px] text-silk/55 leading-[2.0] mb-8">
            {data.narrative}
          </p>

          {/* Decorative divider before the question */}
          <div className="mb-6">
            <div className="w-12 h-px mb-4" style={{ background: 'rgba(255,215,0,0.2)' }} />
            <p className="font-serif text-base text-parchment/70 leading-relaxed italic">
              {data.question}
            </p>
          </div>

          {/* Choices — simple text lines */}
          {phase === 'choosing' && (
            <div className="space-y-1 mt-6">
              {data.choices.map(choice => (
                <button
                  key={choice.id}
                  disabled={choice.locked}
                  className="w-full text-left py-2 px-3 transition-colors group"
                  style={{
                    opacity: choice.locked ? 0.3 : 1,
                    cursor: choice.locked ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => handlePick(choice)}>

                  <span className="font-serif text-[14px] text-parchment/60 group-hover:text-gold/80 transition-colors">
                    {choice.label}
                  </span>
                  {choice.locked && choice.lockReason && (
                    <span className="text-red-400/40 text-[9px] ml-2">({choice.lockReason})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Resolved */}
          {phase === 'resolved' && (
            <div className="text-sm text-silk/30 italic font-serif">
              The moment passes. Its consequences remain.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
