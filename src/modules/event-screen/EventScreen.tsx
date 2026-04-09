// =============================================================================
// EventScreen — full-screen event view (replaces EventSidebar)
// Left: agent slots + intel picker. Right: event narrative. Bottom: hand.
// =============================================================================

import { useState, useMemo } from 'react'
import type {
  Agent, AgentTier, EventSlot, GameEvent, IntelligenceItem,
  LocationId,
} from '@core/types'
import {
  LOCATION_LABELS, STAT_LABELS, AGENT_TIER_COLORS, AGENT_TIER_NAMES,
  INTEL_TIER_BONUS, INTELLIGENCE_LABELS, INTELLIGENCE_COLORS, INTELLIGENCE_ICONS,
  INTELLIGENCE_EVENT_MATCH, ALL_INTELLIGENCE_TYPES,
  intelligenceTypeTotal,
  type IntelligenceStore,
} from '@core/types'
import { URGENCY_COLOR, URGENCY_LABEL } from '@modules/map'
import { agentMeetsSlot, assignedAgentIds } from '@modules/map/logic/eventUtils'
import { computeEventPool } from '@modules/map/logic/poolCalculation'
import { getPortrait } from '@modules/characters'
import { TIER_THEME, cardBorderStyle } from '@modules/characters'
import { applyEquipmentBonuses } from '@lib/equipment'

interface Props {
  event: GameEvent
  agents: Agent[]
  allAgents: Agent[]
  allNodes: import('@core/types').MapNodeData[]
  intelligence?: IntelligenceStore
  currentDay: number
  onSlotAssign: (eventId: string, slotId: string, agentId: string | null) => void
  onIntelAssign: (eventId: string, item: IntelligenceItem | null) => void
  onCommit: (eventId: string) => void
  onCancel: (eventId: string) => void
  onClose: () => void
}

export function EventScreen({ event, agents, allAgents, allNodes, intelligence, currentDay, onSlotAssign, onIntelAssign, onCommit, onCancel, onClose }: Props) {
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null)
  const uc = URGENCY_COLOR[event.urgency]
  const loc = LOCATION_LABELS[event.locationId]
  const assigned = useMemo(() => assignedAgentIds(allNodes), [allNodes])

  const agentById = useMemo(() => {
    const map: Record<string, Agent> = {}
    for (const a of allAgents) map[a.id] = a
    for (const a of agents) map[a.id] = a
    return map
  }, [agents, allAgents])

  const assignedAgents = useMemo(
    () => event.slots.filter(s => s.assignedAgentId).map(s => agentById[s.assignedAgentId!]).filter(Boolean),
    [event.slots, agentById],
  )

  const pool = computeEventPool(assignedAgents, event)
  const mandatory = event.slots.filter(s => !s.npcAgentId && s.isMandatory)
  const isReady = mandatory.length === 0 || mandatory.every(s => s.assignedAgentId != null)
  const isLocked = event.inProgress
  const canCommit = isReady && !event.committed && !isLocked
  const canCancelCommit = event.committed && !isLocked && event.committedOnDay === currentDay

  const handleAgentDrop = (slotId: string, agentId: string) => {
    const slot = event.slots.find(s => s.id === slotId)
    const agent = agentById[agentId]
    if (!slot || !agent) return
    if (assigned.has(agentId)) return
    if (!agentMeetsSlot(agent, slot)) return
    onSlotAssign(event.id, slotId, agentId)
    setPendingSlotId(null)
  }

  const handleAgentDoubleClick = (agentId: string) => {
    if (isLocked || assigned.has(agentId)) return
    const agent = agentById[agentId]
    if (!agent) return
    const emptySlot = event.slots.find(s =>
      !s.npcAgentId && !s.assignedAgentId && agentMeetsSlot(agent, s)
    )
    if (emptySlot) {
      onSlotAssign(event.id, emptySlot.id, agentId)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col" style={{ background: 'rgba(5,3,1,0.95)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(232,213,176,0.1)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-silk/30 hover:text-parchment transition-colors text-lg">&larr;</button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl text-parchment">{event.title}</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase"
                style={{ background: `${uc.badge}22`, color: uc.badge }}>
                {URGENCY_LABEL[event.urgency]}
              </span>
            </div>
            <div className="text-xs text-silk/35">{loc.en}</div>
          </div>
        </div>

        {/* Stats + pool preview */}
        <div className="flex items-center gap-4">
          {event.statsChecked.map(stat => (
            <div key={stat} className="text-center">
              <div className="text-[9px] text-silk/35 uppercase">{STAT_LABELS[stat].en}</div>
              <div className="text-base font-bold" style={{ color: uc.badge }}>
                {assignedAgents.reduce((sum, a) => {
                  const eff = applyEquipmentBonuses(a.stats, a.equipment) as Record<string, number>
                  return sum + (eff[stat] ?? 0)
                }, 0)}
              </div>
            </div>
          ))}
          <div className="text-center border-l border-silk/10 pl-4">
            <div className="text-[9px] text-silk/35 uppercase">Pool</div>
            <div className="text-base font-bold text-parchment">{pool ?? '—'}d</div>
            <div className="text-[8px] text-silk/25">need {event.threshold}+</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: slots + intel */}
        <div className="w-1/2 p-6 overflow-y-auto flex flex-col gap-4"
          style={{ borderRight: '1px solid rgba(232,213,176,0.08)' }}>

          {/* Agent slots */}
          <div>
            <div className="text-[9px] uppercase tracking-widest text-silk/30 mb-3">Agent Slots</div>
            <div className="space-y-2">
              {event.slots.map(slot => {
                const isNpc = !!slot.npcAgentId
                const agent = slot.assignedAgentId ? agentById[slot.assignedAgentId] : slot.npcAgentId ? agentById[slot.npcAgentId] : null
                const isPending = pendingSlotId === slot.id
                const eligible = agents.filter(a => !assigned.has(a.id) && agentMeetsSlot(a, slot))

                return (
                  <div key={slot.id}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all"
                    style={{
                      background: agent ? 'rgba(232,213,176,0.04)' : isPending ? 'rgba(255,215,0,0.12)' : 'rgba(232,213,176,0.02)',
                      border: `1px solid ${agent ? 'rgba(232,213,176,0.1)' : isPending ? 'rgba(255,215,0,0.5)' : 'rgba(232,213,176,0.06)'}`,
                      boxShadow: isPending ? '0 0 12px rgba(255,215,0,0.25), 0 0 24px rgba(255,215,0,0.1), inset 0 0 8px rgba(255,215,0,0.06)' : 'none',
                    }}
                    onDragOver={!isNpc && !isLocked ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setPendingSlotId(slot.id) } : undefined}
                    onDragLeave={() => setPendingSlotId(null)}
                    onDrop={!isNpc && !isLocked ? (e) => {
                      e.preventDefault()
                      const agentId = e.dataTransfer.getData('agentId')
                      if (agentId) handleAgentDrop(slot.id, agentId)
                      setPendingSlotId(null)
                    } : undefined}>

                    {/* Slot indicator */}
                    <div className="flex-shrink-0 w-3 h-3 rounded-full"
                      style={{ background: isNpc ? 'rgba(232,213,176,0.15)' : slot.isMandatory ? '#e04030' : 'rgba(232,213,176,0.15)' }} />

                    {/* Agent portrait or empty */}
                    {agent ? (
                      <div className="flex items-center gap-3 flex-1">
                        <AgentPortrait agent={agent} size={48} />
                        <div>
                          <div className="text-sm font-serif" style={{ color: AGENT_TIER_COLORS[agent.tier] }}>{agent.name}</div>
                          <div className="text-[9px] text-silk/30">{AGENT_TIER_NAMES[agent.tier]}{isNpc ? ' — Present' : ''}</div>
                        </div>
                        {!isNpc && !isLocked && (
                          <button onClick={() => onSlotAssign(event.id, slot.id, null)}
                            className="ml-auto text-silk/25 hover:text-red-400 transition-colors">×</button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-12 h-16 rounded border border-dashed flex items-center justify-center"
                          style={{ borderColor: isPending ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.15)' }}>
                          <span className="text-lg" style={{ color: isPending ? 'rgba(255,215,0,0.5)' : 'rgba(232,213,176,0.15)' }}>+</span>
                        </div>
                        <div>
                          <div className="text-xs text-silk/35">{slot.isMandatory ? 'Required' : 'Optional'}</div>
                          {slot.requiredTags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {slot.requiredTags.map(t => (
                                <span key={t} className="text-[7px] px-1 rounded capitalize"
                                  style={{ background: 'rgba(192,150,60,0.15)', color: 'rgba(220,180,80,0.8)' }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {!isLocked && eligible.length > 0 && (
                          <button onClick={() => {
                            setPendingSlotId(isPending ? null : slot.id)
                          }}
                            className="ml-auto text-[9px] px-2 py-1 rounded transition-all"
                            style={{ background: 'rgba(232,213,176,0.06)', border: '1px solid rgba(232,213,176,0.15)', color: 'rgba(232,213,176,0.5)' }}>
                            {isPending ? 'Cancel' : 'Assign'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {event.slots.length === 0 && (
                <div className="text-xs text-silk/25 italic p-3">Auto-resolve — no agents needed</div>
              )}
            </div>
          </div>

          {/* Intelligence */}
          <div>
            <div className="text-[9px] uppercase tracking-widest text-silk/30 mb-2">Intelligence</div>
            {event.assignedIntelligence ? (
              <div className="flex items-center gap-2 p-2 rounded"
                style={{ background: `${INTELLIGENCE_COLORS[event.assignedIntelligence.type]}12`, border: `1px solid ${INTELLIGENCE_COLORS[event.assignedIntelligence.type]}30` }}>
                <span>{INTELLIGENCE_ICONS[event.assignedIntelligence.type]}</span>
                <span className="text-xs" style={{ color: INTELLIGENCE_COLORS[event.assignedIntelligence.type] }}>
                  {INTELLIGENCE_LABELS[event.assignedIntelligence.type]} ({AGENT_TIER_NAMES[event.assignedIntelligence.tier]})
                </span>
                {!isLocked && (
                  <button onClick={() => onIntelAssign(event.id, null)}
                    className="ml-auto text-silk/25 hover:text-red-400">×</button>
                )}
              </div>
            ) : !isLocked && intelligence ? (
              <div className="flex gap-1 flex-wrap">
                {ALL_INTELLIGENCE_TYPES.map(type => {
                  const total = intelligenceTypeTotal(intelligence, type)
                  if (total <= 0) return null
                  const matches = INTELLIGENCE_EVENT_MATCH[type].includes(event.type)
                  return (
                    <button key={type} onClick={() => {
                      const tier = (['clay', 'bronze', 'silver', 'gold', 'jade'] as const).find(t => intelligence[type][t] > 0)
                      if (tier) onIntelAssign(event.id, { type, tier })
                    }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all hover:brightness-125"
                      style={{
                        background: `${INTELLIGENCE_COLORS[type]}12`,
                        border: `1px solid ${INTELLIGENCE_COLORS[type]}30`,
                        color: INTELLIGENCE_COLORS[type],
                      }}>
                      {INTELLIGENCE_ICONS[type]} {INTELLIGENCE_LABELS[type]} ({total})
                      {matches && <span className="text-[7px] opacity-60">match</span>}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-[9px] text-silk/20 italic">none available</div>
            )}
          </div>

          {/* Timer info */}
          {event.daysRemaining !== null && (
            <div className="text-xs" style={{ color: event.daysRemaining <= 1 ? '#ff6040' : '#ffa060' }}>
              {event.daysRemaining} day{event.daysRemaining !== 1 ? 's' : ''} until expiry
            </div>
          )}

          {/* Commit / Cancel */}
          <div className="flex gap-3 mt-auto pt-4">
            {canCommit && (
              <button onClick={() => { onCommit(event.id); onClose() }}
                className="px-6 py-2.5 rounded-lg font-serif text-sm font-semibold transition-all hover:brightness-125"
                style={{ background: 'rgba(0,168,107,0.15)', border: '1px solid rgba(0,168,107,0.4)', color: '#00a86b' }}>
                Commit
              </button>
            )}
            {canCancelCommit && (
              <button onClick={() => onCancel(event.id)}
                className="px-4 py-2 rounded-lg text-sm transition-all"
                style={{ background: 'rgba(232,213,176,0.05)', border: '1px solid rgba(232,213,176,0.15)', color: 'rgba(232,213,176,0.45)' }}>
                Cancel Commit
              </button>
            )}
            {event.committed && !canCancelCommit && (
              <div className="text-sm font-serif" style={{ color: '#00a86b' }}>Committed — resolves on End Day</div>
            )}
            {isLocked && (
              <div className="text-sm font-serif text-silk/40">In progress — agents locked</div>
            )}
          </div>
        </div>

        {/* Right: narrative */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <p className="font-serif text-[16px] text-silk/55 leading-[2.0]">{event.description}</p>

          {event.oppositionValue > 0 && (
            <div className="mt-4 text-xs text-red-400/50">Opposition: {event.oppositionValue}</div>
          )}
        </div>
      </div>

      {/* Bottom: agent hand for drag */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center gap-2 overflow-x-auto"
        style={{ height: 100, borderTop: '1px solid rgba(232,213,176,0.12)', background: 'rgba(10,6,4,0.98)' }}>
        <span className="text-[9px] uppercase tracking-widest text-silk/25 flex-shrink-0 mr-2">
          {pendingSlotId ? 'Click or drag an agent' : 'Hand'}
        </span>
        {agents.map(agent => {
          const isAssigned = assigned.has(agent.id)
          const pendingSlot = pendingSlotId ? event.slots.find(s => s.id === pendingSlotId) : null
          const isEligible = pendingSlot ? agentMeetsSlot(agent, pendingSlot) && !isAssigned : false

          return (
            <div key={agent.id}
              draggable={!isAssigned}
              onDragStart={(e) => { e.dataTransfer.setData('agentId', agent.id) }}
              onClick={() => {
                if (pendingSlotId && isEligible) {
                  handleAgentDrop(pendingSlotId, agent.id)
                }
              }}
              onDoubleClick={() => handleAgentDoubleClick(agent.id)}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing transition-all"
              style={{ opacity: isAssigned ? 0.3 : pendingSlotId ? (isEligible ? 1 : 0.2) : 1 }}>
              <AgentPortrait agent={agent} size={64} glow={isEligible} />
              <div className="text-center text-[8px] text-silk/50 mt-0.5 truncate" style={{ maxWidth: 64 }}>
                {agent.name.split(' ')[0]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Small portrait card used in slots and hand
function AgentPortrait({ agent, size, glow }: { agent: Agent; size: number; glow?: boolean }) {
  const theme = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  return (
    <div className="relative overflow-hidden flex-shrink-0 rounded"
      style={{
        width: size, height: size * 1.35,
        ...cardBorderStyle(theme, glow, size > 50 ? 2 : 1),
        boxShadow: glow ? `0 0 12px ${theme.glow}` : undefined,
      }}>
      {portrait ? (
        <img src={portrait} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-serif"
          style={{ background: theme.cardBg2, color: theme.accent, fontSize: size * 0.35, opacity: 0.5 }}>
          {agent.name[0]}
        </div>
      )}
    </div>
  )
}
