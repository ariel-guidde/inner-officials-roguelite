import type { Agent, EventSlot, GameEvent } from '@core/types'
import { AGENT_TIER_COLORS } from '@core/types'
import { TIER_THEME, cardBorderStyle } from '@modules/characters'
import { getPortrait } from '@modules/characters'
import { agentMeetsSlot } from './logic/eventUtils'
import type { PendingSlot } from './mapTypes'

// ---------------------------------------------------------------------------
// SlotRequirements — shows required tags / tier when no agent assigned
// ---------------------------------------------------------------------------

export function SlotRequirements({ slot }: { slot: EventSlot }) {
  const hasReqs = slot.requiredTags.length > 0 || (slot.anyRequiredTag?.length ?? 0) > 0 || slot.requiredTier
  if (!hasReqs) return null
  return (
    <div className="flex flex-wrap gap-0.5 mt-0.5">
      {slot.requiredTags.map(tag => (
        <span key={tag} className="text-[7px] px-1 py-0 rounded capitalize"
          style={{ background: 'rgba(192,150,60,0.15)', border: '1px solid rgba(192,150,60,0.3)', color: 'rgba(220,180,80,0.8)' }}>
          {tag}
        </span>
      ))}
      {slot.anyRequiredTag && slot.anyRequiredTag.length > 0 && (
        <span className="text-[7px] px-1 py-0 rounded"
          style={{ background: 'rgba(120,100,180,0.15)', border: '1px solid rgba(120,100,180,0.3)', color: 'rgba(160,140,220,0.8)' }}>
          {slot.anyRequiredTag.join(' / ')}
        </span>
      )}
      {slot.requiredTier && (
        <span className="text-[7px] px-1 py-0 rounded capitalize"
          style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.2)', color: 'rgba(232,213,176,0.5)' }}>
          {slot.requiredTier}+
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NpcMiniCard — tiny portrait card (NPC or assigned agent in slot)
// ---------------------------------------------------------------------------

export function NpcMiniCard({ agent }: { agent: Agent }) {
  const theme = TIER_THEME[agent.tier]
  const portrait = getPortrait(agent.portraitId)
  return (
    <div className="relative overflow-hidden flex-shrink-0"
      style={{ width: 28, height: 38, borderRadius: 3, ...cardBorderStyle(theme, false, 1) }}>
      {portrait
        ? <img src={portrait} alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-top" />
        : <div className="absolute inset-0 flex items-center justify-center font-serif text-[10px]"
            style={{ background: theme.cardBg2, color: theme.accent, opacity: 0.5 }}>
            {agent.name[0]}
          </div>
      }
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventSlotRow
// ---------------------------------------------------------------------------

export function EventSlotRow({ event, slot, agents, agentById, assigned, pendingSlot, onSetPendingSlot, onSlotAssign }: {
  event: GameEvent; slot: EventSlot; agents: Agent[]; agentById: Record<string, Agent>
  assigned: Set<string>; pendingSlot: PendingSlot | null
  onSetPendingSlot: (ps: PendingSlot | null) => void
  onSlotAssign?: (eventId: string, slotId: string, agentId: string | null) => void
}) {
  const isPending = pendingSlot?.slotId === slot.id && pendingSlot?.eventId === event.id

  // NPC slot — informational only
  if (slot.npcAgentId) {
    const npc = agentById[slot.npcAgentId]
    return (
      <div className="flex items-center gap-2 px-1.5 py-1 rounded"
        style={{ background: 'rgba(232,213,176,0.03)', border: '1px solid rgba(232,213,176,0.07)' }}>
        {npc ? (
          <>
            <NpcMiniCard agent={npc} />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-semibold truncate" style={{ color: AGENT_TIER_COLORS[npc.tier] }}>
                {npc.name}
              </div>
              <div className="text-[7px] text-silk/30">Present</div>
            </div>
          </>
        ) : (
          <span className="text-[9px] text-silk/25 italic">NPC (unknown)</span>
        )}
      </div>
    )
  }

  // Player slot
  const isLocked = event.inProgress
  const eligibleAgents = agents.filter(a => !assigned.has(a.id) && agentMeetsSlot(a, slot))
  const assignedAgent = slot.assignedAgentId ? (agentById[slot.assignedAgentId] ?? null) : null
  const hasEligible = eligibleAgents.length > 0 || assignedAgent != null

  const handleAssignButton = () => {
    isPending ? onSetPendingSlot(null) : onSetPendingSlot({ eventId: event.id, slotId: slot.id, slot })
  }

  const handleRemove = () => {
    if (!onSlotAssign || isLocked) return
    onSlotAssign(event.id, slot.id, null)
    if (isPending) onSetPendingSlot(null)
  }

  return (
    <div className="flex items-center gap-2 px-1.5 py-1.5 rounded"
      style={{
        background: isLocked ? 'rgba(0,168,107,0.05)' : isPending ? 'rgba(255,215,0,0.08)' : 'rgba(232,213,176,0.04)',
        border: `1px solid ${isLocked ? 'rgba(0,168,107,0.15)' : isPending ? 'rgba(255,215,0,0.35)' : 'rgba(232,213,176,0.08)'}`,
      }}>
      {/* Lock icon or mandatory dot */}
      {isLocked ? (
        <span className="flex-shrink-0 text-[8px]" style={{ color: 'rgba(0,168,107,0.5)', lineHeight: 1 }}>🔒</span>
      ) : (
        <span className="flex-shrink-0" style={{
          width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
          background: slot.isMandatory ? '#e04030' : 'rgba(232,213,176,0.2)',
        }} />
      )}

      {/* Assigned agent mini card */}
      {assignedAgent ? (
        <div className="flex-shrink-0">
          <NpcMiniCard agent={assignedAgent} />
        </div>
      ) : isPending ? (
        <div className="flex-shrink-0 w-[28px] h-[38px] rounded flex items-center justify-center"
          style={{ background: 'rgba(255,215,0,0.05)', border: '1px dashed rgba(255,215,0,0.3)' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,215,0,0.5)' }}>?</span>
        </div>
      ) : (
        <div className="flex-shrink-0 w-[28px] h-[38px] rounded flex items-center justify-center"
          style={{ background: 'rgba(232,213,176,0.03)', border: '1px dashed rgba(232,213,176,0.1)' }}>
          <span style={{ fontSize: 10, color: 'rgba(232,213,176,0.15)' }}>+</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {assignedAgent ? (
          <div>
            <div className="text-[9px] font-semibold truncate" style={{ color: AGENT_TIER_COLORS[assignedAgent.tier] }}>
              {assignedAgent.name.split(' ')[0]}
            </div>
            <div className="text-[7px] text-silk/30 mt-0.5">{assignedAgent.tier}</div>
          </div>
        ) : (
          <div className="min-w-0">
            {isPending ? (
              <span className="text-[9px]" style={{ color: 'rgba(255,215,0,0.7)' }}>Picking…</span>
            ) : !hasEligible ? (
              <span className="text-[9px]" style={{ color: '#e04030' }}>No eligible agents</span>
            ) : (
              <span className="text-[9px] text-silk/30">{slot.isMandatory ? 'Required' : 'Optional'}</span>
            )}
            {/* Requirements */}
            <SlotRequirements slot={slot} />
          </div>
        )}
      </div>

      {/* Action — hidden when locked */}
      {!isLocked && (
        assignedAgent ? (
          <button onClick={handleRemove}
            className="text-[9px] text-silk/30 hover:text-red-400 transition-colors flex-shrink-0 px-1">
            ×
          </button>
        ) : isPending ? (
          <button onClick={handleAssignButton}
            className="text-[8px] px-1.5 py-0.5 rounded flex-shrink-0 transition-all"
            style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', color: 'rgba(255,215,0,0.8)' }}>
            Cancel
          </button>
        ) : hasEligible ? (
          <button onClick={handleAssignButton}
            className="text-[8px] px-1.5 py-0.5 rounded flex-shrink-0 transition-all hover:brightness-125"
            style={{ background: 'rgba(232,213,176,0.08)', border: '1px solid rgba(232,213,176,0.2)', color: 'rgba(232,213,176,0.6)' }}>
            Assign →
          </button>
        ) : null
      )}
    </div>
  )
}
