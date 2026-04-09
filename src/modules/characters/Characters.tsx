// =============================================================================
// Characters — agent card grid, list, and detail modal.
// =============================================================================

import { useState, useMemo } from 'react'
import type { Agent, AgentTier, Equipment, EquipmentSlot, StatName } from '@core/types'
import {
  ALL_STATS, STAT_LABELS, STAT_ABBREVIATIONS,
  AGENT_TIER_NAMES, AGENT_TIER_ORDER,
  EQUIPMENT_SLOT_ICONS, EQUIPMENT_SLOT_LABELS,
  CONDITION_ICONS, CONDITION_COLORS, CONDITION_LABELS, BLOCKING_CONDITIONS,
  TAG_CATEGORY, TAG_LABELS,
  agentRankShort, agentRankFull,
} from '@core/types'
import { applyConditionPenalties } from './logic/conditionEffects'
import { applyEquipmentBonuses } from '@lib/equipment'
import { statSummary } from './logic/statTotals'
import { TIER_THEME, TAG_CAT_STYLE, cardBorderStyle, type TierTheme } from './theme'
import { getPortrait } from './portraitRegistry'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the slots available to an agent based on their tags. */
function agentSlots(agent: Agent): EquipmentSlot[] {
  return agent.tags.includes('guard')
    ? ['attire', 'accessory', 'tool', 'weapon']
    : ['attire', 'accessory', 'tool']
}

/** Computes effective stats: base + equipment bonuses − condition penalties. */
function effectiveStatsFor(agent: Agent): Record<string, number> {
  const withEquip = applyEquipmentBonuses(agent.stats as Record<string, number>, agent.equipment)
  return applyConditionPenalties(withEquip as Record<StatName, number>, agent.conditions)
}

/** Card badge text: rank (e.g. "9 · Cairen") or custom title. */
function badgeText(agent: Agent): string | null {
  if (agent.haremRank != null) return agentRankShort(agent.haremRank)
  return agent.title ?? null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CharactersProps {
  agents: Agent[]
  selectedAgentId?: string | null
  onAgentSelect: (agentId: string) => void
  onAgentDragStart?: (agentId: string) => void
  /** If set, only these agent ids are shown. */
  filterAgentIds?: string[]
  /** Stats to highlight in accent color. */
  highlightStats?: StatName[]
  layout?: 'grid' | 'list'
  /** Renders a combined stat pool beneath the grid. */
  showPoolSummary?: boolean
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function Characters({
  agents, selectedAgentId, onAgentSelect, onAgentDragStart,
  filterAgentIds, highlightStats, layout = 'grid', showPoolSummary = false,
}: CharactersProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const visible = filterAgentIds
    ? agents.filter(a => filterAgentIds.includes(a.id))
    : agents

  const expandedAgent = expandedId ? visible.find(a => a.id === expandedId) ?? null : null
  const summary = showPoolSummary ? statSummary(visible) : null

  const handleClick = (id: string) => {
    setExpandedId(id)
    onAgentSelect(id)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className={layout === 'grid'
        ? 'grid gap-5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'
        : 'flex flex-col gap-2'}
      >
        {visible.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={agent.id === selectedAgentId}
            highlightStats={highlightStats}
            layout={layout}
            onClick={() => handleClick(agent.id)}
            onDragStart={onAgentDragStart ? () => onAgentDragStart(agent.id) : undefined}
          />
        ))}
      </div>

      {summary && <PoolSummaryBar summary={summary} highlightStats={highlightStats} />}
      {expandedAgent && (
        <DetailModal agent={expandedAgent} onClose={() => setExpandedId(null)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AgentCard — dispatches to grid or list layout
// ---------------------------------------------------------------------------

function AgentCard({ agent, isSelected, highlightStats, layout, onClick, onDragStart }: {
  agent: Agent
  isSelected: boolean
  highlightStats?: StatName[]
  layout: 'grid' | 'list'
  onClick: () => void
  onDragStart?: () => void
}) {
  const theme    = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  const isBlocked = agent.conditions.some(c => BLOCKING_CONDITIONS.has(c))

  const withEquipment = useMemo(
    () => applyEquipmentBonuses(agent.stats as Record<string, number>, agent.equipment),
    [agent.stats, agent.equipment],
  )
  const effective = useMemo(
    () => applyConditionPenalties(withEquipment as Record<StatName, number>, agent.conditions),
    [withEquipment, agent.conditions],
  )

  if (layout === 'list') {
    return (
      <ListCard agent={agent} isSelected={isSelected} isBlocked={isBlocked}
        theme={theme} effectiveStats={effective} highlightStats={highlightStats}
        portrait={portrait} onClick={onClick} />
    )
  }

  const slots = agentSlots(agent)
  const badge = badgeText(agent)

  return (
    <div
      role="button" tabIndex={0}
      draggable={!!onDragStart}
      onClick={onClick}
      onDragStart={onDragStart}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className="relative select-none cursor-pointer rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none"
      style={{ ...cardBorderStyle(theme, isSelected), aspectRatio: '3 / 4.8' }}
    >
      <CornerOrnaments theme={theme} tier={agent.tier} />

      {/* Portrait */}
      <div className="absolute inset-0">
        {portrait
          ? <img src={portrait} alt={agent.name} draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-top" />
          : <SilhouettePlaceholder theme={theme} />
        }
      </div>

      {/* Rank / title badge */}
      {badge && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold font-serif tracking-wide"
          style={{ background: `${theme.cardBg2}ee`, color: theme.accent, border: `1px solid ${theme.accent}55` }}>
          {badge}
        </div>
      )}

      {/* Condition icons */}
      {agent.conditions.length > 0 && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5">
          {agent.conditions.slice(0, 3).map(c => (
            <span key={c} className="text-xs leading-none drop-shadow" title={CONDITION_LABELS[c].en}>
              {CONDITION_ICONS[c]}
            </span>
          ))}
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{
        height: '58%',
        background: `linear-gradient(to top, ${theme.cardBg2}f8 30%, ${theme.cardBg2}c0 55%, transparent 100%)`,
      }} />

      {/* Blocked stamp */}
      {isBlocked && (
        <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-10">
          <span className="border-2 rounded px-3 py-1 font-serif text-sm tracking-widest rotate-[-10deg]"
            style={{ borderColor: '#cc2b0088', color: '#cc2b00', background: '#cc2b0018' }}>
            {CONDITION_LABELS[agent.conditions.find(c => BLOCKING_CONDITIONS.has(c))!].en.toUpperCase()}
          </span>
        </div>
      )}

      {/* Info strip */}
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-1 flex flex-col gap-1.5 z-[5]">
        <div className="font-serif font-bold text-parchment text-sm leading-tight truncate drop-shadow-lg">
          {agent.name}
        </div>

        {/* Stats — non-zero only, max 6, 2 columns */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {ALL_STATS
            .filter(s => (effective[s] ?? 0) > 0)
            .slice(0, 6)
            .map(s => {
              const val = effective[s]
              const penalised = val < (withEquipment[s] ?? 0)
              const hi = highlightStats?.includes(s)
              return (
                <div key={s} className="flex items-center gap-1">
                  <span className="text-[9px] font-sans w-[22px] flex-shrink-0"
                    style={{ color: hi ? theme.accent : 'rgba(232,213,176,0.45)' }}>
                    {STAT_ABBREVIATIONS[s]}
                  </span>
                  <div className="flex gap-px flex-shrink-0">
                    {Array.from({ length: Math.min(val, 6) }, (_, i) => (
                      <div key={i} className="rounded-full" style={{
                        width: 4, height: 4,
                        background: penalised ? '#cc6040' : (hi ? theme.accent : `${theme.accent}cc`),
                      }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold tabular-nums"
                    style={{ color: penalised ? '#cc6040' : 'rgba(245,233,200,0.7)' }}>
                    {val}
                  </span>
                </div>
              )
            })}
        </div>

        {/* Martial */}
        {(agent.stats.martial ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-sans" style={{ color: 'rgba(232,213,176,0.4)' }}>Mrt</span>
            <div className="flex gap-px">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="text-[8px]"
                  style={{ color: i < (agent.stats.martial ?? 0) ? theme.accent : `${theme.accent}22` }}>◆</span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment slots */}
        <div className="flex gap-1">
          {slots.map(slot => {
            const item = agent.equipment?.[slot]
            return (
              <div key={slot} title={item ? item.name : EQUIPMENT_SLOT_LABELS[slot]}
                className="flex-1 h-5 rounded flex items-center justify-center text-[10px]"
                style={{
                  background: item ? `${theme.accent}28` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${item ? theme.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <span style={{ opacity: item ? 1 : 0.25 }}>{EQUIPMENT_SLOT_ICONS[slot]}</span>
              </div>
            )
          })}
        </div>

        {/* Tags — no gender, no follower/scapegoat-eligible on card face */}
        <div className="flex flex-wrap gap-1">
          {agent.tags
            .filter(t => {
              const cat = TAG_CATEGORY[t]
              return cat !== 'gender' && t !== 'follower' && t !== 'scapegoat-eligible'
            })
            .slice(0, 3)
            .map(tag => {
              const s = TAG_CAT_STYLE[TAG_CATEGORY[tag]]
              return (
                <span key={tag} className="text-[9px] px-1.5 py-px rounded-full font-sans"
                  style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}33` }}>
                  {TAG_LABELS[tag]}
                </span>
              )
            })}
        </div>

        {/* Resentment */}
        {(agent.resentment ?? 0) > 0 && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: agent.resentment! }, (_, i) => <span key={i} className="text-[10px]">🔥</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// List card
// ---------------------------------------------------------------------------

function ListCard({ agent, isSelected, isBlocked, theme, effectiveStats, highlightStats, portrait, onClick }: {
  agent: Agent; isSelected: boolean; isBlocked: boolean
  theme: TierTheme; effectiveStats: Record<string, number>
  highlightStats?: StatName[]; portrait: string | undefined; onClick: () => void
}) {
  const badge = badgeText(agent)
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick()}
      className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-150 focus:outline-none"
      style={{ ...cardBorderStyle(theme, isSelected, isSelected ? 2 : 1), opacity: isBlocked ? 0.5 : 1 }}>
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: theme.cardBg, border: `1px solid ${theme.accent}44` }}>
        {portrait
          ? <img src={portrait} alt="" className="w-full h-full object-cover object-top" />
          : <span className="font-serif text-sm" style={{ color: theme.accent, opacity: 0.4 }}>{agent.name[0]}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-sm text-parchment truncate">{agent.name}</div>
        {badge && <div className="text-[9px] font-sans" style={{ color: theme.accent }}>{badge}</div>}
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {agent.tags
            .filter(t => TAG_CATEGORY[t] !== 'gender' && t !== 'follower')
            .slice(0, 3)
            .map(tag => {
              const s = TAG_CAT_STYLE[TAG_CATEGORY[tag]]
              return <span key={tag} className="text-[9px] px-1 rounded" style={{ color: s.text, background: s.bg }}>{TAG_LABELS[tag]}</span>
            })}
        </div>
      </div>
      {highlightStats?.slice(0, 3).map(stat => (
        <div key={stat} className="text-center">
          <div className="text-[9px] text-silk/40">{STAT_ABBREVIATIONS[stat]}</div>
          <div className="text-sm font-bold text-parchment tabular-nums">{effectiveStats[stat] ?? 0}</div>
        </div>
      ))}
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function DetailModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const theme   = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  const isBlocked = agent.conditions.some(c => BLOCKING_CONDITIONS.has(c))
  const slots   = agentSlots(agent)
  const tierIdx = AGENT_TIER_ORDER.indexOf(agent.tier)

  const withEquipment = useMemo(
    () => applyEquipmentBonuses(agent.stats as Record<string, number>, agent.equipment),
    [agent.stats, agent.equipment],
  )
  const effective = useMemo(
    () => applyConditionPenalties(withEquipment as Record<StatName, number>, agent.conditions),
    [withEquipment, agent.conditions],
  )

  const subtitle = agent.haremRank != null
    ? agentRankFull(agent.haremRank)
    : agent.title ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,6,2,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="relative w-full max-w-[560px] rounded-2xl overflow-hidden"
        style={{ ...cardBorderStyle(theme, false, theme.borderWidth + 1), boxShadow: `0 0 60px ${theme.glow}, 0 24px 60px rgba(0,0,0,0.7)` }}>

        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-silk/50 hover:text-parchment transition-colors text-xs"
          style={{ background: 'rgba(255,255,255,0.07)' }}>✕</button>

        <div className="flex" style={{ height: 420 }}>
          {/* Portrait panel */}
          <div className="relative w-40 flex-shrink-0 overflow-hidden" style={{ background: theme.cardBg2 }}>
            {portrait
              ? <img src={portrait} alt={agent.name} className="absolute inset-0 w-full h-full object-cover object-top" />
              : <SilhouettePlaceholder theme={theme} />
            }
            {(['top-left', 'bottom-left'] as const).map(p => (
              <CornerOrnament key={p} position={p} theme={theme} tier={agent.tier} />
            ))}
            {/* Tier pip row */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
              {AGENT_TIER_ORDER.map((_, i) => (
                <div key={i} className="rounded-full" style={{
                  width: 6, height: 6,
                  background: i <= tierIdx ? theme.accent : `${theme.accent}22`,
                }} />
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 flex-shrink-0">
              <div>
                <h2 className="font-serif text-lg font-bold text-parchment leading-tight">{agent.name}</h2>
                {subtitle && <div className="text-xs font-sans mt-0.5" style={{ color: theme.accent }}>{subtitle}</div>}
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold flex-shrink-0"
                style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}55`, color: theme.accent }}>
                {AGENT_TIER_NAMES[agent.tier]}
              </span>
            </div>

            {/* Tags — all categories */}
            <div className="flex flex-wrap gap-1 flex-shrink-0">
              {agent.tags.map(tag => {
                const s = TAG_CAT_STYLE[TAG_CATEGORY[tag]]
                return (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-sans"
                    style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}33` }}>
                    {TAG_LABELS[tag]}
                  </span>
                )
              })}
            </div>

            {/* Stats — 3-col compact grid */}
            <div className="flex-shrink-0">
              <SectionLabel label="Attributes" accent={theme.accent} />
              <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                {ALL_STATS.filter(s => (withEquipment[s] ?? 0) > 0).map(s => {
                  const boosted = withEquipment[s] ?? 0
                  const eff     = effective[s] ?? 0
                  const penalised = eff < boosted
                  const boostedAboveBase = boosted > (agent.stats[s] ?? 0)
                  return (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className="text-[9px] text-silk/40 w-[22px] flex-shrink-0">{STAT_ABBREVIATIONS[s]}</span>
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(232,213,176,0.08)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${(eff / 10) * 100}%`, background: penalised ? '#cc6040' : theme.accent }} />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums w-4 text-right"
                        style={{ color: penalised ? '#cc6040' : (boostedAboveBase ? theme.accent : 'rgba(245,233,200,0.75)') }}>
                        {eff}
                      </span>
                    </div>
                  )
                })}
              </div>
              {(agent.stats.martial ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-silk/40">⚔ Martial</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="rounded-sm" style={{
                        width: 8, height: 8,
                        background: i < (agent.stats.martial ?? 0) ? theme.accent : `${theme.accent}18`,
                      }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-parchment/70 tabular-nums">{agent.stats.martial}</span>
                </div>
              )}
            </div>

            {/* Equipment */}
            <div className="flex-shrink-0">
              <SectionLabel label="Equipment" accent={theme.accent} />
              <div className="flex gap-1.5">
                {slots.map(slot => {
                  const item: Equipment | null | undefined = agent.equipment?.[slot]
                  return (
                    <div key={slot} title={item ? item.name : EQUIPMENT_SLOT_LABELS[slot]}
                      className="flex-1 rounded-lg px-1.5 py-1 text-center"
                      style={{
                        background: item ? `${theme.accent}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${item ? theme.accent + '40' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <div className="text-sm">{EQUIPMENT_SLOT_ICONS[slot]}</div>
                      <div className="text-[8px] leading-tight mt-0.5"
                        style={{ color: item ? 'rgba(232,213,176,0.8)' : 'rgba(232,213,176,0.2)' }}>
                        {item ? item.name : EQUIPMENT_SLOT_LABELS[slot]}
                      </div>
                      {item && Object.entries(item.statBonus)
                        .filter(([, v]) => (v ?? 0) !== 0)
                        .map(([s, v]) => (
                          <span key={s} className="text-[8px]" style={{ color: theme.accent }}>
                            +{v} {STAT_ABBREVIATIONS[s as StatName] ?? s}
                          </span>
                        ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            {(agent.conditions.length > 0 || (agent.resentment ?? 0) > 0) && (
              <div className="flex-shrink-0">
                <SectionLabel label="Status" accent={theme.accent} />
                <div className="flex flex-wrap items-center gap-1.5">
                  {agent.conditions.map(c => {
                    const { bg, text } = CONDITION_COLORS[c]
                    return (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-sans flex items-center gap-1"
                        style={{ background: bg, color: text, border: `1px solid ${text}44`,
                          fontWeight: BLOCKING_CONDITIONS.has(c) ? 600 : 400 }}>
                        {CONDITION_ICONS[c]} {CONDITION_LABELS[c].en}
                      </span>
                    )
                  })}
                  {(agent.resentment ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-silk/40">Resentment</span>
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full"
                          style={{ background: i < (agent.resentment ?? 0) ? '#cc4400' : 'rgba(204,68,0,0.15)' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isBlocked && (
              <div className="rounded-lg px-3 py-1.5 text-[10px] text-center font-sans flex-shrink-0"
                style={{ background: 'rgba(204,43,0,0.12)', border: '1px solid rgba(204,43,0,0.3)', color: '#e07060' }}>
                Cannot be assigned while {
                  agent.conditions.filter(c => BLOCKING_CONDITIONS.has(c))
                    .map(c => CONDITION_LABELS[c].en.toLowerCase()).join(' or ')
                }.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Renders L-bracket corner ornaments on all four card corners. */
function CornerOrnaments({ theme, tier }: { theme: TierTheme; tier: AgentTier }) {
  return (
    <>
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
        <CornerOrnament key={pos} position={pos} theme={theme} tier={tier} />
      ))}
    </>
  )
}

function CornerOrnament({ position, theme, tier }: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  theme: TierTheme; tier: AgentTier
}) {
  const isTop  = position.startsWith('top')
  const isLeft = position.endsWith('left')
  const size   = tier === 'gold' ? 10 : tier === 'jade' ? 9 : 8
  return (
    <div className="absolute z-20 pointer-events-none" style={{
      top: isTop ? 4 : undefined, bottom: !isTop ? 4 : undefined,
      left: isLeft ? 4 : undefined, right: !isLeft ? 4 : undefined,
      width: size, height: size, opacity: 0.75,
      borderTop:    isTop    ? `1.5px solid ${theme.accent}` : undefined,
      borderBottom: !isTop   ? `1.5px solid ${theme.accent}` : undefined,
      borderLeft:   isLeft   ? `1.5px solid ${theme.accent}` : undefined,
      borderRight:  !isLeft  ? `1.5px solid ${theme.accent}` : undefined,
    }} />
  )
}

function SilhouettePlaceholder({ theme }: { theme: TierTheme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '28%' }}>
      <svg viewBox="0 0 80 110" width="60%" style={{ opacity: 0.18 }}>
        <circle cx="40" cy="16" r="11" fill={theme.accent} />
        <path d="M29 28 Q20 44 18 62 L62 62 Q60 44 51 28 Z" fill={theme.accent} />
        <path d="M18 62 Q12 84 14 104 L66 104 Q68 84 62 62 Z" fill={theme.accent} />
        <path d="M29 34 Q18 50 14 60" stroke={theme.accent} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M51 34 Q62 50 66 60" stroke={theme.accent} strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  )
}

function SectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="text-[9px] uppercase tracking-widest mb-1.5 pb-1"
      style={{ color: 'rgba(232,213,176,0.3)', borderBottom: `1px solid ${accent}20` }}>
      {label}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pool summary bar
// ---------------------------------------------------------------------------

function PoolSummaryBar({ summary, highlightStats }: {
  summary: Record<StatName, number>; highlightStats?: StatName[]
}) {
  return (
    <div className="rounded-xl border border-silk/10 bg-silk/5 px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-3">Combined Pool</div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
        {ALL_STATS.map(stat => {
          const hi = highlightStats?.includes(stat)
          return (
            <div key={stat} className="flex items-center gap-2">
              <span className="text-[10px] font-sans flex-1"
                style={{ color: hi ? '#ffd700' : 'rgba(232,213,176,0.45)' }}>
                {STAT_LABELS[stat].en}
              </span>
              <span className="text-sm font-bold tabular-nums"
                style={{ color: hi ? '#ffd700' : 'rgba(232,213,176,0.7)' }}>
                {summary[stat]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Characters
