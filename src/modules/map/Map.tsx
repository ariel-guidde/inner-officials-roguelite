// =============================================================================
// Map.tsx — Inner Officials roguelite map view
// =============================================================================

import { useState, useMemo, useEffect } from 'react'
import type {
  Agent,
  AgentTier,
  DayPhase,
  EventSlot,
  GameEvent,
  IntelligenceItem,
  IntelligenceType,
  LocationId,
  MapNodeData,
} from '@core/types'
import {
  LOCATION_LABELS,
  STAT_ABBREVIATIONS,
  STAT_LABELS,
  AGENT_TIER_COLORS,
  AGENT_TIER_NAMES,
  AGENT_TIER_ORDER,
  BLOCKING_CONDITIONS,
  CONDITION_ICONS,
  CONDITION_LABELS,
  EQUIPMENT_SLOT_ICONS,
  EQUIPMENT_SLOT_LABELS,
  INTELLIGENCE_LABELS,
  INTELLIGENCE_EVENT_MATCH,
  INTEL_TIER_BONUS,
  INTELLIGENCE_COLORS,
  INTELLIGENCE_ICONS,
  ALL_INTELLIGENCE_TYPES,
  intelligenceTypeTotal,
  type IntelligenceStore,
} from '@core/types'
import { TIER_THEME, cardBorderStyle, applyEquipmentBonuses } from '@modules/characters'
import { getPortrait } from '@modules/characters'
import { LOCATION_LAYOUT } from './logic/layoutData'
import {
  URGENCY_COLOR,
  URGENCY_LABEL,
  IN_PROGRESS_COLOR,
  nodeUrgency,
  assignedAgentIds,
  agentMeetsSlot,
} from './logic/eventUtils'
import { computeEventPool } from './logic/poolCalculation'

// ---------------------------------------------------------------------------
// Static constants
// ---------------------------------------------------------------------------

const LOCATION_ICONS: Record<LocationId, string> = {
  chambers:        '🏮',
  innerCourt:      '⚖',
  householdOffice: '📋',
  imperialLibrary: '📚',
  imperialGardens: '🌸',
  emperorQuarters: '🐉',
  wuFamilyNetwork: '🔗',
  palacePhysician: '⚕',
  eunuchQuarter:   '🗝',
  buddhistTemple:  '🪷',
  tradeQuarter:    '💰',
  festivalGrounds: '🎋',
}

const EDGES: [LocationId, LocationId][] = [
  ['emperorQuarters', 'innerCourt'],
  ['innerCourt',      'chambers'],
  ['innerCourt',      'wuFamilyNetwork'],
  ['innerCourt',      'imperialLibrary'],
  ['imperialLibrary', 'imperialGardens'],
  ['imperialLibrary', 'buddhistTemple'],
  ['chambers',        'householdOffice'],
  ['chambers',        'imperialGardens'],
  ['chambers',        'palacePhysician'],
  ['householdOffice', 'eunuchQuarter'],
  ['eunuchQuarter',   'palacePhysician'],
  ['palacePhysician', 'tradeQuarter'],
  ['buddhistTemple',  'festivalGrounds'],
  ['tradeQuarter',    'festivalGrounds'],
]

// ---------------------------------------------------------------------------
// MapProps
// ---------------------------------------------------------------------------

export interface MapProps {
  nodes: MapNodeData[]
  /** Controllable agents shown in the player hand. */
  agents?: Agent[]
  /** Full cast including NPCs — used only for NPC slot display. */
  allAgents?: Agent[]
  selectedNodeId?: LocationId | null
  onNodeClick: (locationId: LocationId) => void
  onSlotAssign?: (eventId: string, slotId: string, agentId: string | null) => void
  onIntelAssign?: (eventId: string, intelItem: IntelligenceItem | null) => void
  onCommitEvent?: (eventId: string) => void
  onCancelCommit?: (eventId: string) => void
  onEndDay?: () => void
  currentDay?: number
  dayPhase?: DayPhase
  showDebugOverlay?: boolean
  highlightedNodeId?: LocationId | null
  /** Intelligence as counted resource. Shown in header and available for event assignment. */
  intelligence?: IntelligenceStore
  /** Golden dice count — add auto-successes to a settled roll. */
  goldenDice?: number
}

// ---------------------------------------------------------------------------
// Internal state types
// ---------------------------------------------------------------------------

interface PendingSlot {
  eventId: string
  slotId: string
  slot: EventSlot
}

type InspectedCard =
  | { kind: 'agent'; agent: Agent }

// ---------------------------------------------------------------------------
// Map (root component)
// ---------------------------------------------------------------------------

export function Map({
  nodes,
  agents = [],
  allAgents = [],
  selectedNodeId,
  onNodeClick,
  onSlotAssign,
  onIntelAssign,
  onCommitEvent,
  onCancelCommit,
  onEndDay,
  currentDay = 1,
  showDebugOverlay = false,
  highlightedNodeId,
  intelligence,
  goldenDice = 0,
}: MapProps) {
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null)
  const [inspectedCard, setInspectedCard] = useState<InspectedCard | null>(null)

  useEffect(() => { setPendingSlot(null) }, [selectedNodeId])

  const assigned = useMemo(() => assignedAgentIds(nodes), [nodes])

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )

  // Events where all mandatory slots are filled (or no player slots)
  const readyCount = useMemo(() => {
    let count = 0
    for (const node of nodes) {
      for (const ev of node.events) {
        if (ev.isCompleted || ev.isExpired) continue
        const playerSlots = ev.slots.filter(s => !s.npcAgentId)
        const mandatory = playerSlots.filter(s => s.isMandatory)
        if (mandatory.length === 0 || mandatory.every(s => s.assignedAgentId != null)) count++
      }
    }
    return count
  }, [nodes])

  const handleAgentPick = (agentId: string) => {
    if (!pendingSlot || !onSlotAssign) return
    onSlotAssign(pendingSlot.eventId, pendingSlot.slotId, agentId)
    setPendingSlot(null)
  }

  // Merged agent roster: allAgents takes precedence over agents for lookup
  const agentById = useMemo(() => {
    const map: Record<string, Agent> = {}
    for (const a of allAgents) map[a.id] = a
    for (const a of agents) map[a.id] = a
    return map
  }, [agents, allAgents])

  return (
    <div className="flex flex-col h-full select-none">
      <DayHeader
        currentDay={currentDay}
        readyCount={readyCount}
        onEndDay={onEndDay}
        goldenDice={goldenDice}
        intelligence={intelligence}
      />

      <div className="flex flex-1 min-h-0">
        {/* Map canvas */}
        <div className="relative flex-1 min-w-0 overflow-hidden" style={{
          background: 'radial-gradient(ellipse at 50% 40%, #1a150e 0%, #0d0a06 50%, #050302 100%)',
        }}>
          {/* Parchment texture overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 30%, rgba(196,149,106,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 60%, rgba(196,149,106,0.03) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(196,149,106,0.02) 0%, transparent 60%)
            `,
          }} />

          {/* Path lines between locations */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {EDGES.map(([a, b]) => {
              const la = LOCATION_LAYOUT[a]; const lb = LOCATION_LAYOUT[b]
              return (
                <line key={`${a}-${b}`}
                  x1={`${la.x}%`} y1={`${la.y}%`}
                  x2={`${lb.x}%`} y2={`${lb.y}%`}
                  stroke="rgba(196,149,106,0.08)" strokeWidth="1" strokeDasharray="4 6" />
              )
            })}
          </svg>

          {nodes.map(node => {
            if (!node.isVisible) return null
            const layout = LOCATION_LAYOUT[node.id]
            return (
              <MapNode key={node.id} node={node}
                isSelected={selectedNodeId === node.id}
                isHighlighted={highlightedNodeId === node.id}
                currentDay={currentDay}
                onClick={() => onNodeClick(node.id)}
                style={{
                  position: 'absolute',
                  left: `${layout.x}%`, top: `${layout.y}%`,
                  transform: 'translate(-50%, -50%)', zIndex: 1,
                }} />
            )
          })}

          {showDebugOverlay && (
            <div className="absolute top-2 left-2 text-[9px] text-silk/30 font-mono pointer-events-none">
              {nodes.length} nodes · {assigned.size} assigned
            </div>
          )}
        </div>

        {/* Event sidebar */}
        {selectedNode && (
          <EventSidebar
            node={selectedNode}
            agents={agents}
            agentById={agentById}
            assigned={assigned}
            pendingSlot={pendingSlot}
            onClose={() => onNodeClick(selectedNode.id)}
            onSetPendingSlot={setPendingSlot}
            onSlotAssign={onSlotAssign}
            onIntelAssign={onIntelAssign}
            onCommitEvent={onCommitEvent}
            onCancelCommit={onCancelCommit}
            intelligence={intelligence}
            currentDay={currentDay}
          />
        )}
      </div>

      <AgentHand
        agents={agents}
        assigned={assigned}
        pendingSlot={pendingSlot}
        onAgentPick={handleAgentPick}
        onCancelPick={() => setPendingSlot(null)}
        onInspect={setInspectedCard}
      />

      {/* Card inspect overlay */}
      {inspectedCard && (
        <CardInspectModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DayHeader
// ---------------------------------------------------------------------------

function DayHeader({ currentDay, readyCount, onEndDay, goldenDice, intelligence }: {
  currentDay: number; readyCount: number; onEndDay?: () => void
  goldenDice: number; intelligence?: IntelligenceStore
}) {
  return (
    <div className="flex items-center gap-3 px-4 flex-shrink-0"
      style={{ height: 40, background: 'rgba(10,6,4,0.95)', borderBottom: '1px solid rgba(232,213,176,0.12)' }}>
      {/* Day counter */}
      <span className="font-serif text-sm text-parchment/80 flex-shrink-0">Day {currentDay}</span>

      {/* Resource counters */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ResourcePip icon="🌕" count={goldenDice} label="Golden Dice" color="#ffd700" />
        {intelligence && ALL_INTELLIGENCE_TYPES.map(type => {
          const count = intelligenceTypeTotal(intelligence, type)
          if (count <= 0) return null
          return (
            <ResourcePip key={type} icon={INTELLIGENCE_ICONS[type]} count={count}
              label={INTELLIGENCE_LABELS[type]} color={INTELLIGENCE_COLORS[type]} />
          )
        })}
      </div>

      <div className="flex-1" />

      {/* End Day button — prominent */}
      <button onClick={onEndDay}
        className="px-5 py-1.5 rounded-lg font-serif text-sm font-semibold transition-all flex-shrink-0"
        style={{
          background: readyCount > 0
            ? 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(200,160,0,0.15) 100%)'
            : 'rgba(232,213,176,0.05)',
          border: `1px solid ${readyCount > 0 ? 'rgba(255,215,0,0.5)' : 'rgba(232,213,176,0.12)'}`,
          color: readyCount > 0 ? 'rgba(255,215,0,0.95)' : 'rgba(232,213,176,0.35)',
          boxShadow: readyCount > 0 ? '0 0 12px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
        }}>
        {readyCount > 0 ? `End Day (${readyCount} ready)` : 'End Day'}
      </button>
    </div>
  )
}

function ResourcePip({ icon, count, label, color }: { icon: string; count: number; label: string; color?: string }) {
  const c = color ?? '#ffd700'
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded"
      title={label}
      style={{
        background: count > 0 ? `${c}14` : 'rgba(232,213,176,0.04)',
        border: `1px solid ${count > 0 ? `${c}40` : 'rgba(232,213,176,0.1)'}`,
      }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span className="text-[10px] font-semibold tabular-nums"
        style={{ color: count > 0 ? `${c}dd` : 'rgba(232,213,176,0.25)' }}>
        {count}
      </span>
    </div>
  )
}

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

function MapNode({ node, isSelected, isHighlighted, currentDay, onClick, style }: {
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
      {/* Node circle */}
      <div className="flex items-center justify-center transition-all" style={{
        width: 56, height: 56, borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, ${nodeBg}, rgba(10,6,4,0.9))`,
        border: `2px solid ${ringColor}`,
        boxShadow: nodeGlow + (hasEvents && !isSelected ? `, 0 0 20px ${uc?.ring ?? 'transparent'}22` : ''),
        fontSize: 24,
      }}>
        {icon}
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
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>
        {label}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventSidebar
// ---------------------------------------------------------------------------

function EventSidebar({ node, agents, agentById, assigned, pendingSlot, onClose, onSetPendingSlot, onSlotAssign, onIntelAssign, onCommitEvent, onCancelCommit, intelligence, currentDay }: {
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

// ---------------------------------------------------------------------------
// EventEntry
// ---------------------------------------------------------------------------

function EventEntry({ event, agents, agentById, assigned, pendingSlot, onSetPendingSlot, onSlotAssign, onIntelAssign, onCommitEvent, onCancelCommit, intelligence, currentDay }: {
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

// ---------------------------------------------------------------------------
// EventSlotRow
// ---------------------------------------------------------------------------

function EventSlotRow({ event, slot, agents, agentById, assigned, pendingSlot, onSetPendingSlot, onSlotAssign }: {
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

// ---------------------------------------------------------------------------
// SlotRequirements — shows required tags / tier when no agent assigned
// ---------------------------------------------------------------------------

function SlotRequirements({ slot }: { slot: EventSlot }) {
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
// IntelligencePicker — two-step: pick type → pick tier from available stock
// ---------------------------------------------------------------------------

function IntelligencePicker({ event, intelligence, isLocked, onAssign }: {
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

// ---------------------------------------------------------------------------
// NpcMiniCard — tiny portrait card (NPC or assigned agent in slot)
// ---------------------------------------------------------------------------

function NpcMiniCard({ agent }: { agent: Agent }) {
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
// AgentHand
// ---------------------------------------------------------------------------

function AgentHand({ agents, assigned, pendingSlot, onAgentPick, onCancelPick, onInspect }: {
  agents: Agent[]
  assigned: Set<string>; pendingSlot: PendingSlot | null
  onAgentPick: (agentId: string) => void; onCancelPick: () => void
  onInspect: (card: InspectedCard) => void
}) {
  const isAgentPickerMode = pendingSlot != null

  return (
    <div className="flex-shrink-0 flex flex-col"
      style={{ height: 140, borderTop: '1px solid rgba(232,213,176,0.15)', background: 'linear-gradient(0deg, rgba(10,6,4,0.99) 0%, rgba(15,10,6,0.97) 100%)' }}>
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
  const w = isAssigned ? 56 : 72
  const h = isAssigned ? 76 : 100

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
          style={{ fontSize: isAssigned ? 6 : 7, color: theme.accent }}>
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

function CardInspectModal({ card, onClose }: { card: InspectedCard; onClose: () => void }) {
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

export default Map
