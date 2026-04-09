import type { LocationId, MapNodeData } from '@core/types'
import { LOCATION_LAYOUT } from './logic/layoutData'
import { assignedAgentIds } from './logic/eventUtils'
import { MapNode } from './MapNode'
import { CORNERS, EDGES } from './mapTypes'

export function MapCanvas({ nodes, selectedNodeId, highlightedNodeId, currentDay, showDebugOverlay, assigned, readyCount, onNodeClick, onEndDay }: {
  nodes: MapNodeData[]
  selectedNodeId?: LocationId | null
  highlightedNodeId?: LocationId | null
  currentDay: number
  showDebugOverlay: boolean
  assigned: Set<string>
  readyCount: number
  onNodeClick: (locationId: LocationId) => void
  onEndDay?: () => void
}) {
  return (
    <div className="relative flex-1 min-w-0 overflow-hidden" style={{
      background: 'radial-gradient(ellipse at 50% 40%, #1a150e 0%, #0d0a06 50%, #050302 100%)',
    }}>
      {/* Parchment texture overlay — noise/grain effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          repeating-conic-gradient(rgba(196,149,106,0.03) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px,
          radial-gradient(ellipse at 20% 30%, rgba(196,149,106,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 60%, rgba(196,149,106,0.04) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 80%, rgba(196,149,106,0.03) 0%, transparent 60%),
          radial-gradient(ellipse at 60% 20%, rgba(196,149,106,0.025) 0%, transparent 45%)
        `,
      }} />

      {/* Decorative corner elements */}
      {CORNERS.map(c => (
        <div key={c.pos} className={`absolute ${c.pos} pointer-events-none`} style={{
          width: 60, height: 60, margin: 8,
          [c.borderV]: '2px solid rgba(196,149,106,0.12)',
          [c.borderH]: '2px solid rgba(196,149,106,0.12)',
          boxShadow: `inset ${c.shadowX}px ${c.shadowY}px 8px rgba(196,149,106,0.04)`,
        }} />
      ))}

      {/* Path lines between locations */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {EDGES.map(([a, b]) => {
          const la = LOCATION_LAYOUT[a]; const lb = LOCATION_LAYOUT[b]
          return (
            <line key={`${a}-${b}`}
              x1={`${la.x}%`} y1={`${la.y}%`}
              x2={`${lb.x}%`} y2={`${lb.y}%`}
              stroke="rgba(196,160,100,0.12)" strokeWidth="1.5" strokeDasharray="5 7" />
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

      {/* End Day button — fixed bottom-right of map */}
      <button onClick={onEndDay}
        className="absolute font-serif font-semibold transition-all"
        style={{
          bottom: 16, right: 16, zIndex: 10,
          padding: '10px 28px',
          fontSize: 15,
          borderRadius: 10,
          background: readyCount > 0
            ? 'linear-gradient(135deg, rgba(255,215,0,0.22) 0%, rgba(200,150,0,0.14) 100%)'
            : 'rgba(232,213,176,0.06)',
          border: readyCount > 0
            ? '2px solid rgba(255,215,0,0.55)'
            : '1px solid rgba(232,213,176,0.15)',
          color: readyCount > 0 ? 'rgba(255,215,0,0.95)' : 'rgba(232,213,176,0.35)',
          boxShadow: readyCount > 0
            ? '0 0 20px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)'
            : 'none',
          animation: readyCount > 0 ? 'endDayPulse 2s ease-in-out infinite' : 'none',
        }}>
        {readyCount > 0 ? `End Day (${readyCount} ready)` : 'End Day'}
      </button>

    </div>
  )
}
