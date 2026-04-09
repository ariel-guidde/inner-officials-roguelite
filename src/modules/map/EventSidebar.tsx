import type { Agent, IntelligenceItem, MapNodeData } from '@core/types'
import { LOCATION_LABELS, type IntelligenceStore } from '@core/types'
import { EventEntry } from './EventEntry'
import { LOCATION_ICONS, type PendingSlot } from './mapTypes'

export function EventSidebar({ node, agents, agentById, assigned, pendingSlot, onClose, onSetPendingSlot, onSlotAssign, onIntelAssign, onCommitEvent, onCancelCommit, intelligence, currentDay }: {
  node: MapNodeData; agents: Agent[]; agentById: Record<string, Agent>
  assigned: Set<string>; pendingSlot: PendingSlot | null
  onClose: () => void
  onSetPendingSlot: (ps: PendingSlot | null) => void
  onSlotAssign?: (eventId: string, slotId: string, agentId: string | null) => void
  onIntelAssign?: (eventId: string, intelItem: IntelligenceItem | null) => void
  onCommitEvent?: (eventId: string) => void
  onCancelCommit?: (eventId: string) => void
  intelligence?: IntelligenceStore
  currentDay?: number
}) {
  const activeEvents = node.events.filter(e => !e.isCompleted && !e.isExpired)
  const icon = LOCATION_ICONS[node.id]
  const label = LOCATION_LABELS[node.id]

  return (
    <div className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: 272, borderLeft: '1px solid rgba(232,213,176,0.15)', background: 'rgba(10,6,4,0.97)' }}>
      {/* Location header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(232,213,176,0.10)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div className="text-xs font-serif text-parchment/90 truncate">{label.en}</div>
        </div>
        <button onClick={onClose} className="text-silk/30 hover:text-parchment/70 transition-colors flex-shrink-0 ml-2 text-sm leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {activeEvents.length === 0 ? (
          <p className="text-[10px] italic text-silk/25 px-1 py-4 text-center">No active events.</p>
        ) : (
          activeEvents.map(ev => (
            <EventEntry key={ev.id} event={ev} agents={agents} agentById={agentById}
              assigned={assigned} pendingSlot={pendingSlot}
              onSetPendingSlot={onSetPendingSlot}
              onSlotAssign={onSlotAssign}
              onIntelAssign={onIntelAssign}
              onCommitEvent={onCommitEvent}
              onCancelCommit={onCancelCommit}
              intelligence={intelligence}
              currentDay={currentDay} />
          ))
        )}
      </div>
    </div>
  )
}
