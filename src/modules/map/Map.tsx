// =============================================================================
// Map module — public component
// Renders the palace map: silk scroll background + node overlays + events.
// Props contract is the authoritative interface for this module.
// =============================================================================

import type { GameEvent, LocationId, MapNodeData } from '@core/types'

// ---------------------------------------------------------------------------
// Props contract
// ---------------------------------------------------------------------------

export interface MapProps {
  /** All palace nodes. Map treats this as read-only. */
  nodes: MapNodeData[]
  /** Currently selected node. */
  selectedNodeId?: LocationId | null
  onNodeClick: (locationId: LocationId) => void
  onEventClick: (event: GameEvent) => void
  /** Scale factor for the silk scroll background (0.5–2.0). Default 1.0. */
  scale?: number
  /** Debug mode: shows node IDs and unlock conditions. */
  showDebugOverlay?: boolean
  /** Node to highlight with an extra ring (Playground use). */
  highlightedNodeId?: LocationId | null
}

// ---------------------------------------------------------------------------
// Component (implementation — TODO)
// ---------------------------------------------------------------------------

export function Map(_props: MapProps) {
  // TODO: implement
  // Render flow:
  //   1. Render <PalaceBackground> (SVG or PNG silk scroll at props.scale)
  //   2. For each node in props.nodes:
  //      - Position absolutely using LOCATION_LAYOUT percentage coords
  //      - Render <MapNode> with isUnlocked, isVisible, events
  //      - If highlighted, add ring effect
  //   3. MapNode renders floating <EventCard> stack above it
  //   4. EventCard has <EventSlot> indicators and <TimerBadge>
  //   5. Click on MapNode → onNodeClick; click on EventCard → onEventClick
  return (
    <div className="relative w-full h-full flex items-center justify-center
                    bg-silk/10 border border-silk/20 rounded-lg text-silk/40 text-sm">
      🗺️ Map module — implementation pending
    </div>
  )
}

export default Map
