import { useState, useMemo } from 'react'
import type { StatName } from '@core/types'
import { STAT_LABELS } from '@core/types'
import {
  FAMILY_BACKGROUNDS, EDUCATIONS, PASSIONS, BASE_STATS,
  type FamilyBackground, type Education, type Passion, type CreationChoices,
} from '../data/creationData'

interface Props {
  onComplete: (choices: CreationChoices) => void
  onSkip: () => void
}

type Layer = 1 | 2 | 3 | 4

export function CharacterCreation({ onComplete, onSkip }: Props) {
  const [layer, setLayer] = useState<Layer>(1)
  const [background, setBackground] = useState<FamilyBackground | null>(null)
  const [education, setEducation] = useState<Education | null>(null)
  const [passion, setPassion] = useState<Passion | null>(null)

  const previewStats = useMemo(() => {
    const stats = { ...BASE_STATS } as Record<StatName, number>
    if (background) for (const [k, v] of Object.entries(background.statBonus)) stats[k as StatName] += v
    if (education) stats[education.stat] += 1
    if (passion) stats[passion.stat] += 1
    return stats
  }, [background, education, passion])

  const canProceed = layer === 1 ? !!background : layer === 2 ? !!education : layer === 3 ? !!passion : true

  const handleNext = () => {
    if (layer < 4) setLayer((layer + 1) as Layer)
    else if (background && education && passion) {
      onComplete({ background, education, passion })
    }
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-2xl px-6 pt-8 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-2xl text-gold">Inner Officials</h1>
          <button onClick={onSkip} className="text-xs text-silk/30 hover:text-silk/60 transition-colors">Skip →</button>
        </div>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i <= layer ? 'rgba(255,215,0,0.6)' : 'rgba(232,213,176,0.1)' }} />
          ))}
        </div>

        <h2 className="font-serif text-lg text-parchment">
          {layer === 1 && 'Family'}
          {layer === 2 && 'Education'}
          {layer === 3 && 'Passion'}
          {layer === 4 && 'Summary'}
        </h2>
        <p className="text-xs text-silk/40 mt-1">
          {layer === 1 && 'Where do you come from?'}
          {layer === 2 && 'What did you study?'}
          {layer === 3 && 'What draws your heart?'}
          {layer === 4 && 'This is who you are.'}
        </p>
      </div>

      <div className="flex-1 w-full max-w-2xl px-6 overflow-y-auto pb-24">

        {/* Layer 1: Background */}
        {layer === 1 && (
          <div className="space-y-2">
            {FAMILY_BACKGROUNDS.map(bg => (
              <button key={bg.id} onClick={() => setBackground(bg)}
                className="w-full text-left rounded-lg p-4 transition-all"
                style={{
                  background: background?.id === bg.id ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                  border: `1px solid ${background?.id === bg.id ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-base text-parchment">{bg.name}</span>
                  <span className="text-xs text-gold/50 ml-auto">{bg.silver} silver</span>
                </div>
                <p className="text-[11px] text-silk/45 leading-relaxed mb-2">{bg.description}</p>
                <div className="flex gap-2 text-[9px]">
                  {Object.entries(bg.statBonus).map(([stat, val]) => (
                    <span key={stat} className="px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,168,107,0.12)', color: 'rgba(0,200,120,0.8)' }}>
                      {STAT_LABELS[stat as StatName].en} +{val}
                    </span>
                  ))}
                  <span className="text-silk/30">{bg.connection}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Layer 2: Education */}
        {layer === 2 && (
          <div className="space-y-2">
            {EDUCATIONS.map(ed => (
              <button key={ed.id} onClick={() => setEducation(ed)}
                className="w-full text-left rounded-lg p-4 transition-all"
                style={{
                  background: education?.id === ed.id ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                  border: `1px solid ${education?.id === ed.id ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-base text-parchment">{ed.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto"
                    style={{ background: 'rgba(0,168,107,0.12)', color: 'rgba(0,200,120,0.8)' }}>
                    {STAT_LABELS[ed.stat].en} +1
                  </span>
                </div>
                <p className="text-[11px] text-silk/45 leading-relaxed">{ed.flavor}</p>
                <div className="text-[9px] text-silk/30 mt-1">{ed.perk}</div>
              </button>
            ))}
          </div>
        )}

        {/* Layer 3: Passion */}
        {layer === 3 && (
          <div className="space-y-2">
            {PASSIONS.map(p => (
              <button key={p.id} onClick={() => setPassion(p)}
                className="w-full text-left rounded-lg p-4 transition-all"
                style={{
                  background: passion?.id === p.id ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.03)',
                  border: `1px solid ${passion?.id === p.id ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.08)'}`,
                }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-base text-parchment">{p.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto"
                    style={{ background: 'rgba(0,168,107,0.12)', color: 'rgba(0,200,120,0.8)' }}>
                    {STAT_LABELS[p.stat].en} +1
                  </span>
                </div>
                <p className="text-[11px] text-silk/45 leading-relaxed">{p.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Layer 4: Summary */}
        {layer === 4 && background && education && passion && (
          <div className="space-y-4">
            <SummaryCard label="Family" title={background.name} detail={`${background.silver} silver · ${background.connection}`} />
            <SummaryCard label="Education" title={education.name} detail={education.perk} />
            <SummaryCard label="Passion" title={passion.name} detail={passion.description} />

            <div className="rounded-lg p-4" style={{ background: 'rgba(232,213,176,0.03)', border: '1px solid rgba(232,213,176,0.08)' }}>
              <div className="text-[8px] uppercase tracking-widest text-silk/30 mb-2">Starting Stats</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {Object.entries(previewStats).map(([stat, val]) => {
                  const bonus = val - BASE_STATS[stat as StatName]
                  return (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="text-[10px] text-silk/40 w-24">{STAT_LABELS[stat as StatName].en}</span>
                      <span className="text-[11px] text-parchment font-bold w-4 text-center">{val}</span>
                      {bonus > 0 && <span className="text-[9px]" style={{ color: '#00a86b' }}>+{bonus}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 w-full max-w-2xl px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(transparent, #1a1209 30%)' }}>
        {layer > 1 ? (
          <button onClick={() => setLayer((layer - 1) as Layer)}
            className="px-4 py-2 text-sm text-silk/50 hover:text-parchment transition-colors">← Back</button>
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

function SummaryCard({ label, title, detail }: { label: string; title: string; detail: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(232,213,176,0.03)', border: '1px solid rgba(232,213,176,0.08)' }}>
      <div className="text-[8px] uppercase tracking-widest text-silk/30 mb-1">{label}</div>
      <div className="font-serif text-sm text-gold">{title}</div>
      <div className="text-[10px] text-silk/40 mt-0.5">{detail}</div>
    </div>
  )
}
