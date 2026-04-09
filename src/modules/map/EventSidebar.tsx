import type { GameEvent, MapNodeData } from '@core/types'
import { LOCATION_LABELS, STAT_LABELS } from '@core/types'
import { URGENCY_COLOR, URGENCY_LABEL } from './logic/eventUtils'
import { LOCATION_ICONS } from './mapTypes'

export function EventSidebar({ node, onClose, onEventClick }: {
  node: MapNodeData
  onClose: () => void
  onEventClick?: (eventId: string) => void
}) {
  const activeEvents = node.events.filter(e => !e.isCompleted && !e.isExpired)
  const icon = LOCATION_ICONS[node.id]
  const label = LOCATION_LABELS[node.id]

  return (
    <div className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: 280, borderLeft: '1px solid rgba(232,213,176,0.15)', background: 'rgba(10,6,4,0.97)' }}>
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(232,213,176,0.10)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div className="text-xs font-serif text-parchment/90 truncate">{label.en}</div>
        </div>
        <button onClick={onClose} className="text-silk/30 hover:text-parchment/70 transition-colors flex-shrink-0 ml-2 text-sm">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {activeEvents.length === 0 ? (
          <p className="text-[10px] italic text-silk/25 px-1 py-4 text-center">No active events.</p>
        ) : (
          activeEvents.map(ev => (
            <EventListItem key={ev.id} event={ev} onClick={() => onEventClick?.(ev.id)} />
          ))
        )}
      </div>
    </div>
  )
}

function EventListItem({ event, onClick }: { event: GameEvent; onClick: () => void }) {
  const uc = URGENCY_COLOR[event.urgency]
  const assignedCount = event.slots.filter(s => s.assignedAgentId).length
  const totalSlots = event.slots.filter(s => !s.npcAgentId).length

  return (
    <button onClick={onClick} className="w-full text-left rounded-lg p-3 transition-all hover:brightness-110"
      style={{ background: uc.bg, border: `1px solid ${uc.ring}` }}>
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="font-serif text-[12px] text-parchment/95 leading-tight flex-1">{event.title}</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold uppercase flex-shrink-0"
          style={{ background: `${uc.badge}22`, color: uc.badge }}>
          {URGENCY_LABEL[event.urgency]}
        </span>
      </div>

      <p className="text-[9px] text-silk/40 leading-relaxed line-clamp-2 mb-2">{event.description}</p>

      <div className="flex items-center gap-2 text-[9px]">
        {event.statsChecked.map(s => (
          <span key={s} className="px-1.5 py-0.5 rounded font-semibold"
            style={{ background: `${uc.badge}20`, color: uc.badge }}>{STAT_LABELS[s].en}</span>
        ))}
        <span className="text-silk/30 ml-auto">{event.threshold}+</span>
      </div>

      <div className="flex items-center gap-2 mt-1.5 text-[9px]">
        {totalSlots > 0 && (
          <span className="text-silk/30">{assignedCount}/{totalSlots} agents</span>
        )}
        {event.daysRemaining !== null && (
          <span style={{ color: event.daysRemaining <= 1 ? '#ff6040' : '#ffa060' }}>
            {event.daysRemaining}d left
          </span>
        )}
        {event.committed && <span style={{ color: '#00a86b' }}>Committed</span>}
        {event.inProgress && <span style={{ color: '#00a86b' }}>In Progress</span>}
      </div>
    </button>
  )
}
