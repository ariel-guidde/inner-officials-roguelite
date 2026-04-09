// =============================================================================
// ResolutionModal — shows dice roll for one event during day-end resolution.
// Extracted from GamePlay to keep file sizes manageable.
// =============================================================================

import { useState, useEffect } from 'react'
import type { DiceRollConfig, DiceRollResult } from '@core/types'
import { STAT_LABELS } from '@core/types'
import { Dice } from '@modules/dice'
import {
  URGENCY_COLOR, URGENCY_LABEL,
  type ResolutionQueueItem,
} from '@modules/map'
import { applyEquipmentBonuses } from '@lib/equipment'

interface Props {
  item: ResolutionQueueItem
  index: number
  total: number
  nextDay: number
  goldenDiceAvailable: number
  onComplete: (success: boolean, goldenSpent: number) => void
}

export function ResolutionModal({ item, index, total, nextDay, goldenDiceAvailable, onComplete }: Props) {
  const [rollConfig, setRollConfig] = useState<DiceRollConfig | null>(null)
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null)
  const [goldenSpent, setGoldenSpent] = useState(0)
  const isLast = index === total - 1
  const uc = URGENCY_COLOR[item.event.urgency]

  // Auto-trigger roll
  useEffect(() => {
    setRollResult(null)
    setGoldenSpent(0)
    if (item.isExpired) return
    const t = setTimeout(() => {
      setRollConfig({
        pool: item.pool,
        threshold: item.event.threshold,
        tier: item.tier,
        difficulty: 'standard',
        goldenDice: 0,
        eventLabel: item.event.title,
      })
    }, 300)
    return () => clearTimeout(t)
  }, [item.event.id, item.pool, item.isExpired, item.tier, item.event.threshold, item.event.title])

  const effectiveResult = rollResult ? (() => {
    if (goldenSpent === 0) return rollResult
    const successes = rollResult.successes + goldenSpent
    return {
      ...rollResult,
      successes,
      isSuccess: successes >= item.event.threshold,
      isCriticalFailure: false,
      margin: successes - item.event.threshold,
    }
  })() : null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(5,3,1,0.9)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: '#0d0800', border: '1px solid rgba(232,213,176,0.13)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-silk/35">{index + 1} / {total}</span>
            <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase"
              style={{ background: `${uc.badge}22`, color: uc.badge }}>
              {URGENCY_LABEL[item.event.urgency]}
            </span>
          </div>
          <h2 className="font-serif text-lg text-parchment leading-tight">{item.event.title}</h2>
          <p className="text-[10px] text-silk/40 mt-0.5 leading-relaxed line-clamp-2">{item.event.description}</p>
        </div>

        {item.isExpired ? (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div className="text-4xl">&#8987;</div>
            <div className="text-parchment/60 font-serif text-base">Event Expired</div>
            <button onClick={() => onComplete(false, 0)} className="mt-2 px-5 py-2 rounded-lg text-sm font-serif"
              style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.18)', color: 'rgba(232,213,176,0.6)' }}>
              {isLast ? `Begin Day ${nextDay}` : 'Next'}
            </button>
          </div>
        ) : (
          <>
            {/* Stat breakdown */}
            <div className="px-5 py-3 border-b border-silk/10 flex-shrink-0">
              <div className="flex items-start gap-4 flex-wrap">
                {item.event.statsChecked.map(stat => (
                  <div key={stat} className="min-w-[60px]">
                    <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">{STAT_LABELS[stat].en}</div>
                    <div className="text-xl font-bold" style={{ color: uc.badge }}>{item.statTotals[stat] ?? 0}</div>
                    {item.assignedAgents.map(a => {
                      const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
                      return <div key={a.id} className="text-[8px] text-silk/30">{a.name.split(' ')[0]}: {eff[stat] ?? 0}</div>
                    })}
                  </div>
                ))}
                <div className="ml-auto text-right border-l border-silk/10 pl-4">
                  <div className="text-[8px] uppercase tracking-widest text-silk/35 mb-1">Dice Pool</div>
                  <div className="text-xl font-bold text-parchment">{item.pool}d</div>
                  <div className="text-[9px] text-silk/35">need {item.event.threshold}+</div>
                </div>
              </div>
            </div>

            {/* Dice */}
            <div className="flex-1 min-h-0" style={{ height: 200 }}>
              <Dice
                rollConfig={rollConfig}
                onRollSettled={setRollResult}
                canvasHeight="200px"
                goldenDiceSpent={goldenSpent}
                displayResult={effectiveResult}
                onDismiss={() => {}}
              />
            </div>

            {/* Result */}
            {effectiveResult && (
              <div className="px-5 py-3 border-t border-silk/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold font-serif"
                      style={{ color: effectiveResult.isSuccess ? '#00a86b' : '#e04030' }}>
                      {effectiveResult.isSuccess ? 'Success' : 'Failed'}
                    </div>
                    <div className="text-[10px] text-silk/40 mt-0.5">
                      {effectiveResult.successes} of {item.event.threshold} needed
                    </div>
                  </div>
                  <button
                    onClick={() => onComplete(effectiveResult.isSuccess, goldenSpent)}
                    className="px-5 py-2 rounded-lg text-sm font-serif font-semibold transition-all hover:brightness-125"
                    style={{
                      background: isLast ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
                      border: `1px solid ${isLast ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
                      color: isLast ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
                    }}>
                    {isLast ? `Begin Day ${nextDay}` : 'Next'}
                  </button>
                </div>

                {/* Golden die button */}
                {goldenDiceAvailable - goldenSpent > 0 && (
                  <button
                    onClick={() => setGoldenSpent(n => n + 1)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all"
                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.85)' }}>
                    Golden Die ({goldenDiceAvailable - goldenSpent})
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
