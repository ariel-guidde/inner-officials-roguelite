import type { MapNodeData } from '@core/types'
import { LOCATION_LABELS } from '@core/types'
import { URGENCY_COLOR, IN_PROGRESS_COLOR, nodeUrgency } from './logic/eventUtils'
import { LOCATION_ICONS } from './mapTypes'

// ---------------------------------------------------------------------------
// NodeBadge — absolute-positioned badge or pip on a map node
// ---------------------------------------------------------------------------

function NodeBadge({ inProgress, resolveCountdown, ready, expiryCountdown, urgencyBadge, hasActive }: {
  inProgress: boolean; resolveCountdown: number | null
  ready: boolean; expiryCountdown: number | null
  urgencyBadge: string | null; hasActive: boolean
}) {
  if (inProgress && resolveCountdown !== null) {
    return (
      <div className="absolute -top-1 -right-1 flex items-center justify-center text-[9px] font-bold"
        style={{ width: 16, height: 16, borderRadius: '50%', background: IN_PROGRESS_COLOR.badge, color: '#001a0d', boxShadow: `0 0 6px ${IN_PROGRESS_COLOR.glow}` }}>
        {resolveCountdown}
      </div>
    )
  }
  if (ready) {
    return (
      <div className="absolute -top-1 -right-1 flex items-center justify-center text-[9px] font-bold"
        style={{ width: 16, height: 16, borderRadius: '50%', background: IN_PROGRESS_COLOR.badge, color: '#001a0d' }}>
        ✓
      </div>
    )
  }
  if (expiryCountdown !== null) {
    return (
      <div className="absolute -top-1 -right-1 flex items-center justify-center text-[9px] font-bold"
        style={{
          width: 16, height: 16, borderRadius: '50%', color: '#fff',
          background: expiryCountdown <= 1 ? '#c02010' : expiryCountdown <= 2 ? '#c07000' : (urgencyBadge ?? 'rgba(232,213,176,0.4)'),
          boxShadow: expiryCountdown <= 1 ? '0 0 6px rgba(192,32,16,0.7)' : 'none',
        }}>
        {expiryCountdown}
      </div>
    )
  }
  if (hasActive && urgencyBadge) {
    return (
      <div className="absolute -top-1 -right-1"
        style={{ width: 8, height: 8, borderRadius: '50%', background: urgencyBadge }} />
    )
  }
  return null
}

// ---------------------------------------------------------------------------
// MapNode
// ---------------------------------------------------------------------------

export function MapNode({ node, isSelected, isHighlighted, currentDay, onClick, style }: {
  node: MapNodeData; isSelected: boolean; isHighlighted: boolean
  currentDay: number; onClick: () => void; style?: React.CSSProperties
}) {
  const urgency = nodeUrgency(node.events)
  const uc = urgency ? URGENCY_COLOR[urgency] : null
  const activeEvents = node.events.filter(e => !e.isCompleted && !e.isExpired)
  const icon = LOCATION_ICONS[node.id]
  const label = LOCATION_LABELS[node.id].en

  const hasEvents = activeEvents.length > 0
  const isInteractable = node.isUnlocked && (hasEvents || isSelected)

  // In-progress events: agents locked in, counting down to resolution
  const inProgressEvents = activeEvents.filter(e => e.inProgress)
  const hasInProgress = inProgressEvents.length > 0

  // Ready events: all mandatory player slots filled, not yet committed
  const readyEvents = !hasInProgress ? activeEvents.filter(ev => {
    const mandatory = ev.slots.filter(s => !s.npcAgentId && s.isMandatory)
    return mandatory.length > 0 && mandatory.every(s => s.assignedAgentId != null)
  }) : []
  const hasReady = readyEvents.length > 0

  // Badge content
  const resolveCountdown = hasInProgress
    ? inProgressEvents.reduce<number | null>((min, ev) => {
        if (ev.resolveOnDay === null) return min
        const days = ev.resolveOnDay - currentDay
        return min === null ? days : Math.min(min, days)
      }, null)
    : null

  const expiryCountdown = !hasInProgress && !hasReady
    ? activeEvents.reduce<number | null>((best, ev) => {
        if (ev.daysRemaining === null) return best
        return best === null ? ev.daysRemaining : Math.min(best, ev.daysRemaining)
      }, null)
    : null

  // Ring color — green for in-progress/ready, else urgency, else default
  const ringColor = isSelected
    ? 'rgba(255,215,0,0.9)'
    : isHighlighted ? 'rgba(255,215,0,0.55)'
    : hasInProgress ? IN_PROGRESS_COLOR.ring
    : hasReady ? IN_PROGRESS_COLOR.ring
    : uc ? uc.ring : 'rgba(232,213,176,0.2)'

  const nodeBg = hasInProgress || hasReady
    ? IN_PROGRESS_COLOR.bg
    : uc ? uc.bg : 'rgba(232,213,176,0.05)'

  const nodeGlow = hasInProgress
    ? `0 0 0 3px ${IN_PROGRESS_COLOR.glow}, 0 0 14px ${IN_PROGRESS_COLOR.glow}`
    : isSelected ? `0 0 0 3px rgba(255,215,0,0.25), 0 0 12px rgba(255,215,0,0.3)` : 'none'

  return (
    <div
      style={{
        ...style,
        opacity: !node.isUnlocked ? 0.35 : !hasEvents ? 0.4 : 1,
        cursor: isInteractable ? 'pointer' : 'default',
      }}
      onClick={isInteractable ? onClick : undefined}>
      {/* Node circle — double-ring border */}
      <div className="relative flex items-center justify-center transition-all" style={{
        width: 64, height: 64,
      }}>
        {/* Outer ring — thin, glows with urgency */}
        <div className="absolute inset-0 rounded-full" style={{
          border: `1px solid ${hasEvents && uc ? uc.ring + '80' : ringColor + '40'}`,
          boxShadow: hasEvents && uc && !isSelected
            ? `0 0 12px ${uc.ring}44, 0 0 24px ${uc.ring}18`
            : 'none',
        }} />
        {/* Inner circle */}
        <div className="flex items-center justify-center" style={{
          width: 54, height: 54, borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, ${nodeBg}, rgba(10,6,4,0.92))`,
          border: `2px solid ${ringColor}`,
          boxShadow: nodeGlow + (hasEvents && !isSelected ? `, 0 0 20px ${uc?.ring ?? 'transparent'}22` : ''),
          fontSize: 26,
        }}>
          {icon}
        </div>
      </div>

      <NodeBadge
        inProgress={hasInProgress} resolveCountdown={resolveCountdown}
        ready={hasReady} expiryCountdown={expiryCountdown}
        urgencyBadge={uc?.badge ?? null} hasActive={activeEvents.length > 0}
      />

      {/* Event circles — one per active event */}
      {activeEvents.length > 0 && (
        <div className="flex gap-1 justify-center mt-1" style={{ minHeight: 8 }}>
          {activeEvents.map(ev => {
            const evUc = URGENCY_COLOR[ev.urgency]
            const isReady = !ev.inProgress && ev.slots.filter(s => !s.npcAgentId && s.isMandatory).every(s => s.assignedAgentId != null) && ev.slots.some(s => s.isMandatory && !s.npcAgentId)
            const circleColor = ev.inProgress ? IN_PROGRESS_COLOR.badge
              : isReady ? IN_PROGRESS_COLOR.badge
              : evUc.badge
            return (
              <div key={ev.id} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: circleColor,
                boxShadow: ev.inProgress ? `0 0 4px ${IN_PROGRESS_COLOR.glow}` : `0 0 3px ${circleColor}55`,
                border: `1px solid ${circleColor}`,
              }} />
            )
          })}
        </div>
      )}

      <div className="text-center mt-1 leading-tight font-serif" style={{
        fontSize: 9, maxWidth: 80,
        color: isSelected ? 'rgba(255,215,0,0.9)' : hasEvents ? 'rgba(232,213,176,0.7)' : 'rgba(232,213,176,0.35)',
        textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0px 6px rgba(0,0,0,0.7), 0 0 12px rgba(5,3,2,0.5)',
      }}>
        {label}
      </div>
    </div>
  )
}
