// =============================================================================
// CharacterCreation — 3-layer character builder
// Layer 1: Family Background → base stats, silver, connection
// Layer 2: Education (pick 2) → stat bonuses, benefits
// Layer 3: Disposition + Chunhua archetype
// =============================================================================

import { useState, useMemo } from 'react'
import type { StatName } from '@core/types'
import { STAT_LABELS } from '@core/types'
import {
  FAMILY_BACKGROUNDS, EDUCATIONS, DISPOSITIONS, MAID_ARCHETYPES,
  BASE_STATS,
  type FamilyBackground, type Education, type Disposition, type MaidArchetype,
  type CreationChoices,
} from '../data/creationData'

interface Props {
  onComplete: (choices: CreationChoices) => void
  onSkip: () => void
}

type Layer = 1 | 2 | 3 | 4 // 4 = summary

export function CharacterCreation({ onComplete, onSkip }: Props) {
  const [layer, setLayer] = useState<Layer>(1)
  const [background, setBackground] = useState<FamilyBackground | null>(null)
  const [educations, setEducations] = useState<Education[]>([])
  const [disposition, setDisposition] = useState<Disposition | null>(null)
  const [maidArchetype, setMaidArchetype] = useState<MaidArchetype | null>(null)

  const toggleEducation = (ed: Education) => {
    setEducations(prev => {
      if (prev.find(e => e.id === ed.id)) return prev.filter(e => e.id !== ed.id)
      if (prev.length >= 2) return prev
      return [...prev, ed]
    })
  }

  // Compute preview stats
  const previewStats = useMemo(() => {
    const stats = { ...BASE_STATS } as Record<StatName, number>
    if (background) {
      for (const [k, v] of Object.entries(background.statBonuses)) stats[k as StatName] += v
    }
    for (const ed of educations) stats[ed.stat] += 1
    return stats
  }, [background, educations])

  const canProceed = layer === 1 ? !!background
    : layer === 2 ? educations.length === 2
    : layer === 3 ? !!disposition && !!maidArchetype
    : true

  const handleNext = () => {
    if (layer < 4) setLayer((layer + 1) as Layer)
    else if (background && educations.length === 2 && disposition && maidArchetype) {
      onComplete({ background, educations: educations as [Education, Education], disposition, maidArchetype })
    }
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-3xl px-6 pt-8 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-2xl text-gold">Inner Officials</h1>
          <button onClick={onSkip} className="text-xs text-silk/30 hover:text-silk/60 transition-colors">
            Skip to game →
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i <= layer ? 'rgba(255,215,0,0.6)' : 'rgba(232,213,176,0.1)' }} />
          ))}
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-parchment">
            {layer === 1 && 'Family Background'}
            {layer === 2 && 'Education & Upbringing'}
            {layer === 3 && 'Personality'}
            {layer === 4 && 'Summary'}
          </h2>
          <span className="text-xs text-silk/30">
            {layer === 2 && `${educations.length}/2 selected`}
          </span>
        </div>
        <p className="text-xs text-silk/40 mt-1">
          {layer === 1 && 'Your father\'s station determines your starting resources and connections.'}
          {layer === 2 && 'Choose two areas of study. Each shapes your abilities and unlocks options.'}
          {layer === 3 && 'Who are you — and who is Chunhua?'}
          {layer === 4 && 'Review your choices before entering the palace.'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-3xl px-6 overflow-y-auto pb-24">
        {layer === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {FAMILY_BACKGROUNDS.map(bg => (
              <button key={bg.id}
                className="text-left rounded-lg p-3 transition-all"
                style={{
                  background: background?.id === bg.id ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                  border: `1px solid ${background?.id === bg.id ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                }}
                onClick={() => setBackground(bg)}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-sm text-parchment">{bg.name}</span>
                  <span className="text-xs text-gold/60 ml-auto">{bg.silver} silver</span>
                </div>
                <p className="text-[10px] text-silk/45 leading-relaxed mb-2">{bg.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(bg.statBonuses).map(([stat, val]) => (
                    <span key={stat} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,168,107,0.12)', color: 'rgba(0,200,120,0.8)' }}>
                      {STAT_LABELS[stat as StatName].en} +{val}
                    </span>
                  ))}
                </div>
                <div className="text-[9px] text-silk/30 mt-1.5">{bg.connection}</div>
              </button>
            ))}
          </div>
        )}

        {layer === 2 && (
          <div className="grid grid-cols-3 gap-2">
            {EDUCATIONS.map(ed => {
              const isSelected = educations.some(e => e.id === ed.id)
              const isFull = educations.length >= 2 && !isSelected
              return (
                <button key={ed.id}
                  className="text-left rounded-lg p-3 transition-all"
                  style={{
                    background: isSelected ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                    opacity: isFull ? 0.35 : 1,
                  }}
                  disabled={isFull}
                  onClick={() => toggleEducation(ed)}>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-serif text-[11px] text-parchment">{ed.name}</span>
                  </div>
                  <p className="text-[9px] text-silk/40 leading-relaxed mb-1.5">{ed.flavor}</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,168,107,0.12)', color: 'rgba(0,200,120,0.8)' }}>
                    {STAT_LABELS[ed.stat].en} +1
                  </span>
                  <div className="text-[8px] text-silk/30 mt-1">{ed.benefit}</div>
                </button>
              )
            })}
          </div>
        )}

        {layer === 3 && (
          <div className="space-y-6">
            {/* Disposition */}
            <div>
              <div className="text-xs uppercase tracking-widest text-silk/30 mb-2">Your Disposition</div>
              <div className="grid grid-cols-2 gap-2">
                {DISPOSITIONS.map(d => (
                  <button key={d.id}
                    className="text-left rounded-lg p-3 transition-all"
                    style={{
                      background: disposition?.id === d.id ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                      border: `1px solid ${disposition?.id === d.id ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                    }}
                    onClick={() => setDisposition(d)}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-serif text-sm text-parchment">{d.name}</span>
                    </div>
                    <p className="text-[10px] text-silk/45 leading-relaxed">{d.description}</p>
                    {Object.keys(d.reputationBonuses).length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {Object.entries(d.reputationBonuses).map(([k, v]) => (
                          <span key={k} className="text-[8px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(180,140,60,0.12)', color: 'rgba(200,170,80,0.8)' }}>
                            {k} +{v}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chunhua */}
            <div>
              <div className="text-xs uppercase tracking-widest text-silk/30 mb-1">Chunhua — Your Maid</div>
              <p className="text-[10px] text-silk/35 mb-2">She's been with you since childhood. What is she best at?</p>
              <div className="grid grid-cols-2 gap-2">
                {MAID_ARCHETYPES.map(m => (
                  <button key={m.id}
                    className="text-left rounded-lg p-3 transition-all"
                    style={{
                      background: maidArchetype?.id === m.id ? 'rgba(205,127,50,0.1)' : 'rgba(232,213,176,0.03)',
                      border: `1px solid ${maidArchetype?.id === m.id ? 'rgba(205,127,50,0.5)' : 'rgba(232,213,176,0.08)'}`,
                    }}
                    onClick={() => setMaidArchetype(m)}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-serif text-sm text-parchment">{m.name}</span>
                    </div>
                    <p className="text-[10px] text-silk/45 leading-relaxed mb-1.5">{m.flavor}</p>
                    <p className="text-[9px] text-silk/35">{m.description}</p>
                    <div className="flex gap-1 mt-1.5">
                      {Object.entries(m.strongStats).map(([stat, val]) => (
                        <span key={stat} className="text-[8px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(205,127,50,0.12)', color: 'rgba(205,150,80,0.8)' }}>
                          {STAT_LABELS[stat as StatName].en} {val}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {layer === 4 && background && disposition && maidArchetype && (
          <div className="space-y-4">
            {/* Background summary */}
            <SummarySection label="Family Background">
              <div className="font-serif text-sm text-gold">{background.name}</div>
              <div className="text-[10px] text-silk/40 mt-0.5">{background.description}</div>
              <div className="text-[10px] text-silk/50 mt-1">{background.silver} silver taels · {background.connection}</div>
            </SummarySection>

            <SummarySection label="Education">
              <div className="flex gap-3">
                {educations.map(ed => (
                  <div key={ed.id}>
                    <div className="font-serif text-[11px] text-parchment">{ed.name}</div>
                    <div className="text-[9px] text-silk/35">{ed.benefit}</div>
                  </div>
                ))}
              </div>
            </SummarySection>

            <SummarySection label="Disposition">
              <div className="font-serif text-[11px] text-parchment">{disposition.name}</div>
            </SummarySection>

            <SummarySection label="Chunhua">
              <div className="font-serif text-[11px]" style={{ color: '#cd7f32' }}>{maidArchetype.name}</div>
              <div className="text-[9px] text-silk/35">{maidArchetype.flavor}</div>
            </SummarySection>

            {/* Stat preview */}
            <SummarySection label="Starting Stats">
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {Object.entries(previewStats).map(([stat, val]) => {
                  const base = BASE_STATS[stat as StatName]
                  const bonus = val - base
                  return (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="text-[10px] text-silk/40 w-24">{STAT_LABELS[stat as StatName].en}</span>
                      <span className="text-[11px] text-parchment font-bold w-4 text-center">{val}</span>
                      {bonus > 0 && <span className="text-[9px]" style={{ color: '#00a86b' }}>+{bonus}</span>}
                    </div>
                  )
                })}
              </div>
            </SummarySection>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 w-full max-w-3xl px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(transparent, #1a1209 30%)' }}>
        {layer > 1 ? (
          <button onClick={() => setLayer((layer - 1) as Layer)}
            className="px-4 py-2 text-sm text-silk/50 hover:text-parchment transition-colors">
            ← Back
          </button>
        ) : <div />}

        <button onClick={handleNext} disabled={!canProceed}
          className="px-6 py-2.5 rounded-lg font-serif text-sm font-semibold transition-all disabled:opacity-30"
          style={{
            background: layer === 4 ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
            border: `1px solid ${layer === 4 ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
            color: layer === 4 ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
          }}>
          {layer === 4 ? 'Enter the Palace →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(232,213,176,0.03)', border: '1px solid rgba(232,213,176,0.08)' }}>
      <div className="text-[8px] uppercase tracking-widest text-silk/30 mb-1.5">{label}</div>
      {children}
    </div>
  )
}
