// =============================================================================
// Map.tsx — Inner Officials roguelite map view (root component)
// =============================================================================

import './map.css'
import { useState, useMemo, useEffect } from 'react'
import type {
  Agent,
  DayPhase,
  IntelligenceItem,
  LocationId,
  MapNodeData,
} from '@core/types'
import {
  LOCATION_LABELS,
  ALL_INTELLIGENCE_TYPES,
  intelligenceTypeTotal,
  INTELLIGENCE_LABELS,
  INTELLIGENCE_COLORS,
  INTELLIGENCE_ICONS,
  type IntelligenceStore,
} from '@core/types'
import { assignedAgentIds } from './logic/eventUtils'
import { MapCanvas } from './MapCanvas'
import { EventSidebar } from './EventSidebar'
import { AgentHand, CardInspectModal } from './AgentHand'
import type { PendingSlot, InspectedCard } from './mapTypes'

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
        goldenDice={goldenDice}
        intelligence={intelligence}
      />

      <div className="flex flex-1 min-h-0">
        {/* Map canvas */}
        <MapCanvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          highlightedNodeId={highlightedNodeId}
          currentDay={currentDay}
          showDebugOverlay={showDebugOverlay}
          assigned={assigned}
          readyCount={readyCount}
          onNodeClick={onNodeClick}
          onEndDay={onEndDay}
        />

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

function DayHeader({ currentDay, goldenDice, intelligence }: {
  currentDay: number
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
