import { useState, useEffect } from 'react'
import type { GameEvent, IntelligenceItem, IntelligenceType } from '@core/types'
import {
  AGENT_TIER_COLORS,
  AGENT_TIER_NAMES,
  AGENT_TIER_ORDER,
  INTELLIGENCE_LABELS,
  INTELLIGENCE_EVENT_MATCH,
  INTEL_TIER_BONUS,
  INTELLIGENCE_COLORS,
  INTELLIGENCE_ICONS,
  ALL_INTELLIGENCE_TYPES,
  intelligenceTypeTotal,
  type IntelligenceStore,
} from '@core/types'

export function IntelligencePicker({ event, intelligence, isLocked, onAssign }: {
  event: GameEvent
  intelligence?: IntelligenceStore
  isLocked: boolean
  onAssign: (item: IntelligenceItem | null) => void
}) {
  const [expandedType, setExpandedType] = useState<IntelligenceType | null>(null)

  // Reset expanded when intelligence changes
  useEffect(() => { setExpandedType(null) }, [event.assignedIntelligence])

  const assigned = event.assignedIntelligence
  const isMatching = assigned ? INTELLIGENCE_EVENT_MATCH[assigned.type].includes(event.type) : false

  return (
    <div className="pt-1 space-y-1" style={{ borderTop: '1px solid rgba(232,213,176,0.07)' }}>
      <span className="text-[8px] uppercase tracking-widest text-silk/30">Intelligence</span>

      {/* Already assigned */}
      {assigned ? (
        <div className="flex items-center gap-1.5 rounded px-2 py-1"
          style={{
            background: `${INTELLIGENCE_COLORS[assigned.type]}12`,
            border: `1px solid ${INTELLIGENCE_COLORS[assigned.type]}30`,
          }}>
          <span style={{ fontSize: 11 }}>{INTELLIGENCE_ICONS[assigned.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-semibold" style={{ color: INTELLIGENCE_COLORS[assigned.type] }}>
              {INTELLIGENCE_LABELS[assigned.type]}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px]" style={{ color: AGENT_TIER_COLORS[assigned.tier] }}>
                {AGENT_TIER_NAMES[assigned.tier]}
              </span>
              {isMatching && (
                <span className="text-[7px] px-1 rounded"
                  style={{ background: 'rgba(0,168,107,0.15)', color: '#00a86b' }}>
                  +{INTEL_TIER_BONUS[assigned.tier]} dice
                </span>
              )}
              {!isMatching && (
                <span className="text-[7px] text-silk/25">no match</span>
              )}
            </div>
          </div>
          {!isLocked && (
            <button onClick={() => onAssign(null)}
              className="text-[9px] text-silk/30 hover:text-red-400 transition-colors flex-shrink-0">×</button>
          )}
        </div>
      ) : isLocked ? (
        <div className="text-[9px] text-silk/20 italic px-1">none</div>
      ) : (
        /* Type selection */
        <div className="space-y-1">
          {intelligence && ALL_INTELLIGENCE_TYPES.map(type => {
            const total = intelligenceTypeTotal(intelligence, type)
            if (total <= 0) return null
            const isExpanded = expandedType === type
            const matches = INTELLIGENCE_EVENT_MATCH[type].includes(event.type)

            return (
              <div key={type}>
                <button
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-all"
                  style={{
                    background: isExpanded ? `${INTELLIGENCE_COLORS[type]}15` : `${INTELLIGENCE_COLORS[type]}08`,
                    border: `1px solid ${isExpanded ? `${INTELLIGENCE_COLORS[type]}40` : `${INTELLIGENCE_COLORS[type]}18`}`,
                  }}
                  onClick={() => setExpandedType(isExpanded ? null : type)}>
                  <span style={{ fontSize: 10 }}>{INTELLIGENCE_ICONS[type]}</span>
                  <span className="text-[9px] font-semibold flex-1" style={{ color: INTELLIGENCE_COLORS[type] }}>
                    {INTELLIGENCE_LABELS[type]}
                  </span>
                  {matches && <span className="text-[7px] px-1 rounded" style={{ background: 'rgba(0,168,107,0.12)', color: '#00a86b88' }}>match</span>}
                  <span className="text-[8px] text-silk/30">{total}</span>
                </button>

                {/* Tier selection */}
                {isExpanded && (
                  <div className="flex gap-1 px-2 py-1">
                    {AGENT_TIER_ORDER.map(tier => {
                      const count = intelligence[type][tier]
                      if (count <= 0) return null
                      const bonus = matches ? INTEL_TIER_BONUS[tier] : 0
                      return (
                        <button key={tier}
                          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-all hover:brightness-125"
                          style={{
                            background: `${AGENT_TIER_COLORS[tier]}15`,
                            border: `1px solid ${AGENT_TIER_COLORS[tier]}40`,
                          }}
                          onClick={() => { onAssign({ type, tier }); setExpandedType(null) }}>
                          <span className="text-[9px] font-bold" style={{ color: AGENT_TIER_COLORS[tier] }}>
                            {AGENT_TIER_NAMES[tier]}
                          </span>
                          <span className="text-[7px] text-silk/30">×{count}</span>
                          {bonus > 0 && (
                            <span className="text-[7px]" style={{ color: '#00a86b' }}>+{bonus}d</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {(!intelligence || ALL_INTELLIGENCE_TYPES.every(t => intelligenceTypeTotal(intelligence, t) <= 0)) && (
            <span className="text-[9px] text-silk/20 italic px-1">none available</span>
          )}
        </div>
      )}
    </div>
  )
}
