// =============================================================================
// Dilemma — Full-screen split view for event resolution with choices.
// Left: scene visual + dice area. Right: narrative + choice cards.
// Inspired by Sultan's Game ritual screen layout.
// =============================================================================

import { useState } from 'react'
import type { ReputationState } from '@core/types'

// ---------------------------------------------------------------------------
// Types — standalone, not coupled to event system types
// ---------------------------------------------------------------------------

export interface DilemmaChoiceData {
  id: string
  label: string
  description: string
  /** Visible consequences preview */
  consequences: string
  /** Reputation changes applied on pick */
  reputationDelta?: Partial<ReputationState>
  /** If true, this choice is locked (shown but greyed out) */
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
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'choosing' | 'confirming' | 'resolved'>('choosing')

  const selectedChoice = data.choices.find(c => c.id === selectedId)

  const handlePick = (choice: DilemmaChoiceData) => {
    if (choice.locked) return
    setSelectedId(choice.id)
    setPhase('confirming')
  }

  const handleConfirm = () => {
    if (!selectedChoice) return
    setPhase('resolved')
    // Small delay for the resolved state to render before callback
    setTimeout(() => {
      onResolve({
        choiceId: selectedChoice.id,
        reputationDelta: selectedChoice.reputationDelta ?? {},
      })
    }, 800)
  }

  const handleBack = () => {
    setSelectedId(null)
    setPhase('choosing')
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
          <h1 className="font-serif text-3xl text-parchment/80 leading-tight mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {data.title}
          </h1>

          {/* Consequence preview on hover */}
          {phase === 'choosing' && hoveredId && (
            <div className="mt-8 transition-all" style={{ opacity: 0.7 }}>
              <ReputationPreview delta={data.choices.find(c => c.id === hoveredId)?.reputationDelta} />
            </div>
          )}

          {/* Confirmed choice display */}
          {phase === 'confirming' && selectedChoice && (
            <div className="mt-8">
              <div className="font-serif text-lg italic text-gold/60">"{selectedChoice.label}"</div>
              <div className="mt-4">
                <ReputationPreview delta={selectedChoice.reputationDelta} large />
              </div>
            </div>
          )}

          {/* Resolved state */}
          {phase === 'resolved' && selectedChoice && (
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
          <p className="font-serif text-[15px] text-silk/55 leading-[1.9] mb-8">
            {data.narrative}
          </p>

          {/* The question */}
          <div className="mb-6">
            <div className="w-12 h-px mb-4" style={{ background: 'rgba(255,215,0,0.2)' }} />
            <p className="font-serif text-base text-parchment/70 leading-relaxed">
              {data.question}
            </p>
          </div>

          {/* Choices */}
          {phase === 'choosing' && (
            <div className="space-y-3">
              {data.choices.map(choice => (
                <button
                  key={choice.id}
                  disabled={choice.locked}
                  className="w-full text-left rounded-lg p-4 transition-all group"
                  style={{
                    background: 'rgba(232,213,176,0.02)',
                    border: `1px solid rgba(232,213,176,0.06)`,
                    opacity: choice.locked ? 0.3 : 1,
                    cursor: choice.locked ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={() => !choice.locked && setHoveredId(choice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handlePick(choice)}>

                  <div className="font-serif text-[14px] text-parchment/80 group-hover:text-gold/80 transition-colors">
                    {choice.label}
                  </div>
                  <p className="text-[11px] text-silk/35 leading-relaxed mt-1">
                    {choice.description}
                  </p>
                  <div className="text-[10px] mt-2 flex items-center gap-2">
                    <span className="text-silk/25">{choice.consequences}</span>
                    {choice.locked && choice.lockReason && (
                      <span className="text-red-400/40 text-[9px]">({choice.lockReason})</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Confirmation */}
          {phase === 'confirming' && selectedChoice && (
            <div className="space-y-4">
              <div className="rounded-lg p-4"
                style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)' }}>
                <div className="font-serif text-[14px] text-gold/80 mb-1">{selectedChoice.label}</div>
                <p className="text-[11px] text-silk/40">{selectedChoice.description}</p>
                <p className="text-[10px] text-silk/25 mt-2">{selectedChoice.consequences}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack}
                  className="px-5 py-2.5 rounded-lg text-sm transition-all"
                  style={{ background: 'rgba(232,213,176,0.05)', border: '1px solid rgba(232,213,176,0.1)', color: 'rgba(232,213,176,0.4)' }}>
                  Reconsider
                </button>
                <button onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-lg font-serif text-sm font-semibold transition-all hover:brightness-125"
                  style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.35)', color: 'rgba(255,215,0,0.85)' }}>
                  Decide
                </button>
              </div>
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

function ReputationPreview({ delta, large }: { delta?: Partial<ReputationState>; large?: boolean }) {
  if (!delta) return null
  const entries = Object.entries(delta).filter(([, v]) => v !== 0)
  if (entries.length === 0) return null
  return (
    <div className="flex gap-3 justify-center">
      {entries.map(([metric, d]) => (
        <div key={metric} className="text-center">
          <div className={`font-serif font-bold ${large ? 'text-3xl' : 'text-2xl'}`}
            style={{ color: (d as number) > 0 ? 'rgba(0,200,120,0.7)' : 'rgba(220,80,60,0.7)' }}>
            {(d as number) > 0 ? '+' : ''}{d as number}
          </div>
          <div className={`uppercase tracking-wider ${large ? 'text-[10px] text-silk/35' : 'text-[9px] text-silk/30'}`}>{metric}</div>
        </div>
      ))}
    </div>
  )
}
