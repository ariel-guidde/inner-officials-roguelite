import type { Agent } from '@core/types'
import {
  BLOCKING_CONDITIONS,
  CONDITION_ICONS,
  CONDITION_LABELS,
  AGENT_TIER_COLORS,
  AGENT_TIER_NAMES,
  STAT_ABBREVIATIONS,
  EQUIPMENT_SLOT_ICONS,
} from '@core/types'
import { TIER_THEME, cardBorderStyle } from '@modules/characters'
import { getPortrait } from '@modules/characters'
import { applyEquipmentBonuses } from '@lib/equipment'
import { agentMeetsSlot } from './logic/eventUtils'
import type { PendingSlot, InspectedCard } from './mapTypes'

// ---------------------------------------------------------------------------
// AgentHand
// ---------------------------------------------------------------------------

export function AgentHand({ agents, assigned, pendingSlot, onAgentPick, onCancelPick, onInspect }: {
  agents: Agent[]
  assigned: Set<string>; pendingSlot: PendingSlot | null
  onAgentPick: (agentId: string) => void; onCancelPick: () => void
  onInspect: (card: InspectedCard) => void
}) {
  const isAgentPickerMode = pendingSlot != null

  return (
    <div className="flex-shrink-0 flex flex-col"
      style={{ height: 160, borderTop: '1px solid rgba(232,213,176,0.15)', background: 'linear-gradient(0deg, rgba(10,6,4,0.99) 0%, rgba(15,10,6,0.97) 100%)' }}>
      {/* Label strip */}
      <div className="flex items-center gap-2 px-3 pt-1.5 pb-0.5">
        <span className="text-[9px] uppercase tracking-widest text-silk/30">
          {isAgentPickerMode ? 'Select an agent for this slot' : 'Hand'}
        </span>
        {isAgentPickerMode && (
          <button onClick={onCancelPick}
            className="text-[8px] px-1.5 py-0.5 rounded transition-all ml-auto"
            style={{ background: 'rgba(232,213,176,0.06)', border: '1px solid rgba(232,213,176,0.15)', color: 'rgba(232,213,176,0.45)' }}>
            Cancel
          </button>
        )}
      </div>

      {/* Agent cards */}
      <div className="flex-1 flex items-center gap-2 px-3 overflow-x-auto pb-1.5">
        {agents.length === 0 && (
          <span className="text-[9px] text-silk/20 italic">Hand is empty</span>
        )}

        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent}
            isAssigned={assigned.has(agent.id)}
            isPickerMode={isAgentPickerMode}
            pendingSlot={pendingSlot}
            onPick={onAgentPick}
            onInspect={() => onInspect({ kind: 'agent', agent })} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AgentCard — portrait-based mini character card
// ---------------------------------------------------------------------------

function AgentCard({ agent, isAssigned, isPickerMode, pendingSlot, onPick, onInspect }: {
  agent: Agent; isAssigned: boolean; isPickerMode: boolean
  pendingSlot: PendingSlot | null; onPick: (agentId: string) => void
  onInspect: () => void
}) {
  const theme = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  const isBlocked = agent.conditions.some(c => BLOCKING_CONDITIONS.has(c))

  const isEligible = isPickerMode && pendingSlot != null
    && !isAssigned && !isBlocked
    && agentMeetsSlot(agent, pendingSlot.slot)

  // Assigned agents appear condensed
  const w = isAssigned ? 64 : 82
  const h = isAssigned ? 88 : 118

  const opacity = isPickerMode ? (isEligible ? 1 : 0.2) : (isBlocked ? 0.35 : 1)
  const cursor = isPickerMode ? (isEligible ? 'pointer' : 'default') : 'pointer'

  const borderStyle = cardBorderStyle(theme, isEligible)

  const handleClick = () => {
    if (isPickerMode) {
      if (isEligible) onPick(agent.id)
    } else {
      onInspect()
    }
  }

  return (
    <div
      className="flex-shrink-0 relative overflow-hidden transition-all"
      style={{
        width: w, height: h,
        borderRadius: 4,
        opacity,
        cursor,
        ...borderStyle,
        boxShadow: isEligible
          ? `0 0 14px ${theme.glow}, 0 0 0 2px ${theme.accent}66`
          : borderStyle.boxShadow,
        transform: isAssigned ? 'scale(0.95)' : 'scale(1)',
      }}
      onClick={handleClick}>

      {/* Portrait fills the card */}
      {portrait
        ? <img src={portrait} alt={agent.name} draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-top" />
        : <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: theme.cardBg2, paddingBottom: '20%' }}>
            <svg viewBox="0 0 80 110" width="55%" style={{ opacity: 0.18 }}>
              <circle cx="40" cy="16" r="11" fill={theme.accent} />
              <path d="M12 90 Q12 52 40 52 Q68 52 68 90 Z" fill={theme.accent} />
            </svg>
          </div>
      }

      {/* Bottom gradient + name */}
      <div className="absolute bottom-0 left-0 right-0 px-1 pb-0.5 pt-3"
        style={{ background: `linear-gradient(to top, ${theme.cardBg2}f8 40%, transparent)` }}>
        <div className="text-center font-serif truncate"
          style={{ fontSize: isAssigned ? 7 : 8, color: theme.accent }}>
          {agent.name.split(' ')[0]}
        </div>
      </div>

      {/* Assigned indicator */}
      {!isPickerMode && isAssigned && (
        <div className="absolute top-0.5 right-0.5 leading-none"
          style={{ fontSize: 9, color: '#ffd700', textShadow: '0 0 4px rgba(255,215,0,0.8)' }}>
          ↗
        </div>
      )}

      {/* Blocked overlay */}
      {isBlocked && !isPickerMode && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(10,0,0,0.55)' }}>
          <span style={{ fontSize: 14 }}>⛓</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CardInspectModal — full card view on left-click
// ---------------------------------------------------------------------------

export function CardInspectModal({ card, onClose }: { card: InspectedCard; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,3,1,0.82)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>
        {card.kind === 'agent' && <AgentInspectCard agent={card.agent} onClose={onClose} />}
      </div>
    </div>
  )
}

function AgentInspectCard({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const theme = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  const isBlocked = agent.conditions.some(c => BLOCKING_CONDITIONS.has(c))
  const effectiveStats = applyEquipmentBonuses(agent.stats as Record<string, number>, agent.equipment)
  const nonZeroStats = Object.entries(effectiveStats).filter(([, v]) => (v as number) > 0) as [string, number][]

  return (
    <div
      className="relative rounded-xl overflow-hidden flex shadow-2xl"
      style={{
        width: 480, height: 320,
        ...cardBorderStyle(theme, false, theme.borderWidth + 1),
      }}
    >
      {/* Portrait panel */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 200, background: theme.cardBg2 }}>
        {portrait
          ? <img src={portrait} alt={agent.name} className="absolute inset-0 w-full h-full object-cover object-top" draggable={false} />
          : <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '20%' }}>
              <svg viewBox="0 0 80 110" width="55%" style={{ opacity: 0.18 }}>
                <circle cx="40" cy="16" r="11" fill={theme.accent} />
                <path d="M12 90 Q12 52 40 52 Q68 52 68 90 Z" fill={theme.accent} />
              </svg>
            </div>
        }
        {/* Tier pips at bottom */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {['clay','bronze','silver','gold','jade'].map((t, i) => (
            <div key={t} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i <= ['clay','bronze','silver','gold','jade'].indexOf(agent.tier)
                ? theme.accent : `${theme.accent}22`,
            }} />
          ))}
        </div>
        {/* Blocked stamp */}
        {isBlocked && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,0,0,0.55)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest rotate-[-25deg] px-2 py-1 rounded"
              style={{ border: `2px solid #c02010`, color: '#c02010', background: 'rgba(0,0,0,0.6)' }}>
              {agent.conditions.find(c => BLOCKING_CONDITIONS.has(c))}
            </div>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto"
        style={{ background: `linear-gradient(160deg, ${theme.cardBg} 0%, ${theme.cardBg2} 100%)` }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-2 right-3 text-silk/30 hover:text-parchment/70 transition-colors text-lg leading-none">×</button>

        {/* Name + tier */}
        <div className="mb-3">
          <h2 className="font-serif text-xl text-parchment leading-tight">{agent.name}</h2>
          {agent.title && <div className="text-[10px] text-silk/45 mt-0.5 italic">{agent.title}</div>}
          <div className="text-[10px] mt-0.5 font-semibold" style={{ color: theme.accent }}>
            {AGENT_TIER_NAMES[agent.tier]}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
          {nonZeroStats.map(([stat, val]) => (
            <div key={stat} className="flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-wide" style={{ color: 'rgba(232,213,176,0.4)' }}>
                {STAT_ABBREVIATIONS[stat as keyof typeof STAT_ABBREVIATIONS] ?? stat}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: i < val ? theme.accent : `${theme.accent}22`,
                    }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold tabular-nums w-3 text-right"
                  style={{ color: theme.accent }}>{val}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Equipment */}
        {agent.equipment && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(Object.entries(agent.equipment) as [string, unknown][])
              .filter(([, item]) => item != null)
              .map(([slot, item]) => {
                const eq = item as { name: string }
                return (
                  <div key={slot} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px]"
                    style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}40`, color: theme.accent }}>
                    <span>{EQUIPMENT_SLOT_ICONS[slot as keyof typeof EQUIPMENT_SLOT_ICONS]}</span>
                    <span>{eq.name}</span>
                  </div>
                )
              })}
          </div>
        )}

        {/* Conditions */}
        {agent.conditions.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {agent.conditions.map(c => (
              <span key={c} className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(192,32,16,0.15)', border: '1px solid rgba(192,32,16,0.3)', color: '#e05040' }}>
                {CONDITION_ICONS[c]} {CONDITION_LABELS[c].en}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mt-auto">
          {agent.tags.filter(t => !['follower','protagonist','scapegoat-eligible'].includes(t)).map(tag => (
            <span key={tag} className="text-[7px] px-1 py-0.5 rounded capitalize"
              style={{ background: 'rgba(232,213,176,0.07)', border: '1px solid rgba(232,213,176,0.12)', color: 'rgba(232,213,176,0.4)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
