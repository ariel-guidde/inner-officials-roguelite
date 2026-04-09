import { useMemo } from 'react'
import type { Agent, GameEvent, IntelligenceItem } from '@core/types'
import { STAT_LABELS, type IntelligenceStore } from '@core/types'
import { URGENCY_COLOR, URGENCY_LABEL, IN_PROGRESS_COLOR } from './logic/eventUtils'
import { computeEventPool } from './logic/poolCalculation'
import { EventSlotRow } from './EventSlotRow'
import { IntelligencePicker } from './IntelligencePicker'
import type { PendingSlot } from './mapTypes'

export function EventEntry({ event, agents, agentById, assigned, pendingSlot, onSetPendingSlot, onSlotAssign, onIntelAssign, onCommitEvent, onCancelCommit, intelligence, currentDay }: {
  event: GameEvent; agents: Agent[]; agentById: Record<string, Agent>
  assigned: Set<string>; pendingSlot: PendingSlot | null
  onSetPendingSlot: (ps: PendingSlot | null) => void
  onSlotAssign?: (eventId: string, slotId: string, agentId: string | null) => void
  onIntelAssign?: (eventId: string, intelItem: IntelligenceItem | null) => void
  onCommitEvent?: (eventId: string) => void
  onCancelCommit?: (eventId: string) => void
  intelligence?: IntelligenceStore
  currentDay?: number
}) {
  const isLocked = event.inProgress
  const uc = isLocked ? IN_PROGRESS_COLOR : URGENCY_COLOR[event.urgency]
  const playerSlots = event.slots.filter(s => !s.npcAgentId)
  const mandatory = playerSlots.filter(s => s.isMandatory)
  const isReady = mandatory.length === 0 || mandatory.every(s => s.assignedAgentId != null)

  const assignedAgents = useMemo(
    () => playerSlots.filter(s => s.assignedAgentId).map(s => agentById[s.assignedAgentId!]).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerSlots.map(s => s.assignedAgentId).join(','), agentById],
  )

  const previewPool = useMemo(
    () => computeEventPool(assignedAgents, event),
    [assignedAgents, event],
  )

  return (
    <div className="rounded-lg px-2.5 py-2.5 space-y-2"
      style={{ background: uc.bg, border: `1px solid ${uc.ring}` }}>

      {/* Title + urgency badge */}
      <div className="flex items-start justify-between gap-1">
        <span className="font-serif text-[12px] text-parchment/95 leading-tight flex-1">{event.title}</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide flex-shrink-0"
          style={{ background: `${uc.badge}22`, color: uc.badge }}>
          {URGENCY_LABEL[event.urgency]}
        </span>
      </div>

      {/* Description (brief) */}
      <p className="text-[9px] text-silk/40 leading-relaxed line-clamp-2">{event.description}</p>

      {/* Skills required — prominent */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[8px] uppercase tracking-widest text-silk/30">Skills:</span>
        {event.statsChecked.map(stat => (
          <span key={stat} className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
            style={{ background: `${uc.badge}20`, color: uc.badge, border: `1px solid ${uc.badge}40` }}>
            {STAT_LABELS[stat].en}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {/* Dice pool preview */}
          {previewPool !== null && (
            <span className="text-[9px] font-bold tabular-nums"
              style={{ color: previewPool >= event.threshold ? '#00d48a' : previewPool >= event.threshold - 1 ? '#ffa060' : '#e06050' }}>
              {previewPool}d
            </span>
          )}
          <span className="text-[9px] text-silk/40">
            {event.threshold}✓
            {event.oppositionValue > 0 && <span className="text-red-400/55"> −{event.oppositionValue}</span>}
          </span>
        </div>
      </div>

      {/* Timers row */}
      <div className="flex items-center gap-2 flex-wrap">
        {event.daysRemaining !== null && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
            style={{
              background: event.daysRemaining <= 1 ? 'rgba(192,32,16,0.2)' : 'rgba(192,112,0,0.15)',
              color: event.daysRemaining <= 1 ? '#ff6040' : '#ffa060',
              border: `1px solid ${event.daysRemaining <= 1 ? 'rgba(192,32,16,0.4)' : 'rgba(192,112,0,0.3)'}`,
            }}>
            ⏳ {event.daysRemaining}d until expiry
          </span>
        )}
        {event.durationDays > 1 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(100,100,200,0.12)', color: 'rgba(160,160,220,0.7)', border: '1px solid rgba(100,100,200,0.2)' }}>
            🔒 Agents busy {event.durationDays} days
          </span>
        )}
        {event.durationDays === 1 && (
          <span className="text-[9px] text-silk/25">Agents free next day</span>
        )}
      </div>

      {/* Slots */}
      {event.slots.length === 0 ? (
        <div className="text-[9px]">
          <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,168,107,0.12)', color: '#00a86b' }}>Auto</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {event.slots.map(slot => (
            <EventSlotRow key={slot.id} event={event} slot={slot}
              agents={agents} agentById={agentById} assigned={assigned}
              pendingSlot={pendingSlot}
              onSetPendingSlot={onSetPendingSlot} onSlotAssign={onSlotAssign} />
          ))}
        </div>
      )}

      {/* Intelligence slot */}
      <IntelligencePicker
        event={event}
        intelligence={intelligence}
        isLocked={isLocked}
        onAssign={(item) => onIntelAssign?.(event.id, item)}
      />

      {/* Status + commit/cancel */}
      <div className="text-[9px] flex items-center gap-2">
        {event.inProgress ? (
          <span style={{ color: IN_PROGRESS_COLOR.badge }}>⏳ In progress…</span>
        ) : event.committed ? (
          <>
            <span style={{ color: '#00a86b' }}>✓ Committed</span>
            {event.committedOnDay === currentDay && onCancelCommit && (
              <button onClick={() => onCancelCommit(event.id)}
                className="px-1.5 py-0.5 rounded transition-all hover:brightness-125"
                style={{ background: 'rgba(232,213,176,0.06)', border: '1px solid rgba(232,213,176,0.15)', color: 'rgba(232,213,176,0.45)' }}>
                Cancel
              </button>
            )}
          </>
        ) : isReady ? (
          <>
            <span style={{ color: 'rgba(255,215,0,0.6)' }}>Ready</span>
            {onCommitEvent && (
              <button onClick={() => onCommitEvent(event.id)}
                className="px-2 py-0.5 rounded font-semibold transition-all hover:brightness-125"
                style={{ background: 'rgba(0,168,107,0.15)', border: '1px solid rgba(0,168,107,0.4)', color: '#00a86b' }}>
                Commit
              </button>
            )}
          </>
        ) : (
          <span className="text-silk/25">Assign agents…</span>
        )}
      </div>
    </div>
  )
}
