// =============================================================================
// StorylineEditor.tsx
// Developer GUI for visualising storyline event chains.
//
// Layout:
//   [Storyline List] | [Graph Canvas] | [Event Detail Panel]
//
// The graph shows EventDefinitions as cards in a DAG, with coloured edges
// derived from graphEdges metadata. Click a card to inspect it.
// The left panel has active/inactive toggles per storyline and spawn sim.
// =============================================================================

import { useState, useMemo, useCallback } from 'react'
import type { LocationId } from '@core/types'
import { LOCATION_LABELS, STAT_LABELS } from '@core/types'
import { URGENCY_COLOR as UC } from '@modules/map'
import type { EventDefinition, EventRuntimeState, Storyline } from './types'
import { evaluateState, type SpawnContext } from './logic/eligibility'
import { ALL_EVENT_DEFINITIONS, EVENT_DEFINITIONS_BY_ID } from './data/eventDefinitions'
import { ALL_STORYLINES } from './data/storylines'

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const CARD_W   = 196
const CARD_H   = 148
const COL_GAP  = 72
const ROW_GAP  = 20
const COL_STEP = CARD_W + COL_GAP
const ROW_STEP = CARD_H + ROW_GAP

const EDGE_COLORS = {
  success:       '#00d48a',
  failure:       '#e04030',
  expiry:        '#a06030',
  choiceSuccess: '#d4a017',
  choiceFailure: '#c06020',
} as const

// ---------------------------------------------------------------------------
// Graph types
// ---------------------------------------------------------------------------

interface GraphNode {
  def: EventDefinition
  col: number
  row: number
}

interface GraphEdge {
  fromId: string
  toId: string
  kind: 'success' | 'failure' | 'expiry' | 'choiceSuccess' | 'choiceFailure'
  label?: string
}

// ---------------------------------------------------------------------------
// Build graph from graphEdges metadata
// ---------------------------------------------------------------------------

function buildGraph(storyline: Storyline | null, allDefs: EventDefinition[]): { nodes: GraphNode[]; edges: GraphEdge[]; width: number; height: number } {
  const defSet = storyline
    ? new Set(storyline.eventIds)
    : new Set(allDefs.filter(d => !d.storylineId).map(d => d.id))

  const defs = allDefs.filter(d => defSet.has(d.id))
  if (defs.length === 0) return { nodes: [], edges: [], width: 0, height: 0 }

  // Build edges from graphEdges metadata
  const edges: GraphEdge[] = []
  for (const def of defs) {
    const ge = def.graphEdges
    if (!ge) continue
    for (const id of ge.success ?? []) if (defSet.has(id)) edges.push({ fromId: def.id, toId: id, kind: 'success' })
    for (const id of ge.failure ?? []) if (defSet.has(id)) edges.push({ fromId: def.id, toId: id, kind: 'failure' })
    for (const id of ge.expiry  ?? []) if (defSet.has(id)) edges.push({ fromId: def.id, toId: id, kind: 'expiry' })
    for (const ce of ge.choiceEdges ?? []) {
      for (const id of ce.success ?? []) if (defSet.has(id)) edges.push({ fromId: def.id, toId: id, kind: 'choiceSuccess', label: ce.choiceId })
      for (const id of ce.failure ?? []) if (defSet.has(id)) edges.push({ fromId: def.id, toId: id, kind: 'choiceFailure', label: ce.choiceId })
    }
  }

  // Assign column depths via BFS
  const colOf: Record<string, number> = {}
  const inDegree: Record<string, number> = {}
  for (const d of defs) inDegree[d.id] = 0
  for (const e of edges) inDegree[e.toId] = (inDegree[e.toId] ?? 0) + 1

  const roots = defs.filter(d => inDegree[d.id] === 0)
  const queue = roots.map(d => d.id)
  for (const id of queue) colOf[id] = colOf[id] ?? 0
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const e of edges.filter(e => e.fromId === id)) {
      colOf[e.toId] = Math.max(colOf[e.toId] ?? 0, colOf[id] + 1)
      queue.push(e.toId)
    }
  }
  for (const d of defs) if (colOf[d.id] === undefined) colOf[d.id] = 0

  // Assign rows within each column
  const colRows: Record<number, number> = {}
  const nodes: GraphNode[] = defs
    .sort((a, b) => {
      const colDiff = (colOf[a.id] ?? 0) - (colOf[b.id] ?? 0)
      if (colDiff !== 0) return colDiff
      const aIdx = storyline?.eventIds.indexOf(a.id) ?? 0
      const bIdx = storyline?.eventIds.indexOf(b.id) ?? 0
      return aIdx - bIdx
    })
    .map(def => {
      const col = colOf[def.id] ?? 0
      const row = colRows[col] ?? 0
      colRows[col] = row + 1
      return { def, col, row }
    })

  const maxCol = Math.max(...nodes.map(n => n.col), 0)
  const maxRow = Math.max(...nodes.map(n => n.row), 0)
  return {
    nodes,
    edges,
    width:  (maxCol + 1) * COL_STEP + COL_GAP,
    height: (maxRow + 1) * ROW_STEP + ROW_GAP,
  }
}

function cardRect(node: GraphNode) {
  return {
    x: node.col * COL_STEP,
    y: node.row * ROW_STEP,
  }
}

// ---------------------------------------------------------------------------
// StorylineEditor
// ---------------------------------------------------------------------------

export interface StorylineEditorProps {
  currentDay?: number
  eventStates?: Map<string, EventRuntimeState>
  activeStorylineIds?: Set<string>
  onToggleStoryline?: (id: string) => void
}

export function StorylineEditor({ currentDay: externalDay, eventStates, activeStorylineIds, onToggleStoryline }: StorylineEditorProps) {
  const [selectedStorylineId, setSelectedStorylineId] = useState<string | null>(ALL_STORYLINES[0]?.id ?? null)
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null)

  const selectedStoryline = ALL_STORYLINES.find(s => s.id === selectedStorylineId) ?? null

  const { nodes, edges, width, height } = useMemo(
    () => buildGraph(selectedStoryline, ALL_EVENT_DEFINITIONS),
    [selectedStoryline],
  )

  // Build spawn context for status display
  const simCtx: SpawnContext = useMemo(() => ({
    currentDay:        externalDay ?? 1,
    eventStates:       eventStates ?? new Map(),
    unlockedLocations: new Set<LocationId>([
      'chambers', 'innerCourt', 'householdOffice', 'imperialLibrary',
      'imperialGardens', 'palacePhysician', 'buddhistTemple', 'eunuchQuarter',
    ]),
  }), [externalDay, eventStates])

  const stateOf = useCallback((defId: string) => {
    const def = EVENT_DEFINITIONS_BY_ID[defId]
    if (!def) return 'unmet'
    return evaluateState(def, simCtx)
  }, [simCtx])

  const selectedDef = selectedDefId ? (EVENT_DEFINITIONS_BY_ID[selectedDefId] ?? null) : null

  return (
    <div className="flex h-full bg-ink text-parchment font-sans overflow-hidden select-none">

      {/* ── Left panel: storyline list ──────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: 'rgba(232,213,176,0.12)', background: 'rgba(10,6,4,0.97)' }}>

        <div className="p-3 border-b" style={{ borderColor: 'rgba(232,213,176,0.10)' }}>
          <div className="text-[9px] uppercase tracking-widest text-silk/40 mb-2">Storylines</div>
          {ALL_STORYLINES.map(sl => {
            const isActive = activeStorylineIds?.has(sl.id) ?? true
            const hasDilemma = ALL_EVENT_DEFINITIONS
              .filter(d => sl.eventIds.includes(d.id))
              .some(d => d.dilemma)
            return (
              <div key={sl.id} className="flex items-center gap-1 mb-0.5">
                {onToggleStoryline && (
                  <button
                    className="flex-shrink-0 w-4 h-4 rounded text-[8px] flex items-center justify-center transition-all"
                    style={{
                      background: isActive ? 'rgba(0,212,138,0.15)' : 'rgba(232,213,176,0.06)',
                      border: `1px solid ${isActive ? 'rgba(0,212,138,0.4)' : 'rgba(232,213,176,0.15)'}`,
                      color: isActive ? '#00d48a' : 'rgba(232,213,176,0.25)',
                    }}
                    onClick={(e) => { e.stopPropagation(); onToggleStoryline(sl.id) }}
                    title={isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                    {isActive ? '●' : '○'}
                  </button>
                )}
                <button
                  className="flex-1 text-left px-2 py-1.5 rounded text-[11px] transition-all min-w-0"
                  style={{
                    background: selectedStorylineId === sl.id ? 'rgba(255,215,0,0.1)' : 'transparent',
                    color: selectedStorylineId === sl.id ? 'rgba(255,215,0,0.9)' : isActive ? 'rgba(232,213,176,0.6)' : 'rgba(232,213,176,0.3)',
                    border: `1px solid ${selectedStorylineId === sl.id ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
                  }}
                  onClick={() => { setSelectedStorylineId(sl.id); setSelectedDefId(null) }}>
                  <div className="font-semibold leading-tight truncate flex items-center gap-1">
                    {sl.title}
                    {hasDilemma && (
                      <span className="text-[6px] px-0.5 rounded flex-shrink-0"
                        style={{ background: 'rgba(255,180,0,0.15)', color: 'rgba(255,180,0,0.7)' }}>D</span>
                    )}
                  </div>
                  <div className="text-[8px] opacity-50 mt-0.5">{sl.eventIds.length} events</div>
                </button>
              </div>
            )
          })}
          <button
            className="w-full text-left px-2 py-1.5 rounded text-[11px] mt-1 transition-all"
            style={{
              background: selectedStorylineId === null ? 'rgba(255,215,0,0.1)' : 'transparent',
              color: selectedStorylineId === null ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.4)',
              border: `1px solid ${selectedStorylineId === null ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
            }}
            onClick={() => { setSelectedStorylineId(null); setSelectedDefId(null) }}>
            Pool Events (no storyline)
          </button>
        </div>

        {/* Day + state summary */}
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-widest text-silk/40 mb-2">
            Day {externalDay ?? 1} — Event States
          </div>
          <div className="space-y-0.5">
            {(selectedStoryline ? ALL_EVENT_DEFINITIONS.filter(d => selectedStoryline.eventIds.includes(d.id)) : ALL_EVENT_DEFINITIONS.filter(d => !d.storylineId))
              .map(def => {
                const s = stateOf(def.id)
                const stateColor = s === 'resolved' ? '#00d48a' : s === 'onMap' ? '#d4a017' : s === 'ready' ? '#6090ff' : 'rgba(232,213,176,0.2)'
                return (
                  <div key={def.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateColor }} />
                    <span className="text-[8px] leading-tight truncate flex-1"
                      style={{ color: s === 'unmet' ? 'rgba(232,213,176,0.25)' : 'rgba(232,213,176,0.65)' }}>
                      {def.title}
                    </span>
                    <span className="text-[7px] flex-shrink-0" style={{ color: stateColor }}>{s}</span>
                  </div>
                )
              })}
          </div>
        </div>
      </aside>

      {/* ── Center: graph canvas ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative" style={{ background: '#050302' }}>
        <GraphCanvas
          nodes={nodes} edges={edges}
          width={width} height={height}
          selectedDefId={selectedDefId}
          stateOf={stateOf}
          onSelect={setSelectedDefId}
        />
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-silk/20 italic">No events in this storyline yet.</p>
          </div>
        )}
      </div>

      {/* ── Right panel: event detail ───────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto border-l"
        style={{ borderColor: 'rgba(232,213,176,0.12)', background: 'rgba(10,6,4,0.97)' }}>
        {selectedDef
          ? <EventDefPanel def={selectedDef} stateOf={stateOf} onNavigate={setSelectedDefId} />
          : <div className="p-4 text-[10px] text-silk/25 italic text-center pt-12">Click an event to inspect it.</div>
        }
      </aside>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GraphCanvas
// ---------------------------------------------------------------------------

function GraphCanvas({ nodes, edges, width, height, selectedDefId, stateOf, onSelect }: {
  nodes: GraphNode[]; edges: GraphEdge[]
  width: number; height: number
  selectedDefId: string | null
  stateOf: (id: string) => string
  onSelect: (id: string) => void
}) {
  const PAD = 24
  return (
    <div className="relative" style={{ minWidth: width + PAD * 2, minHeight: height + PAD * 2, padding: PAD }}>
      <svg className="absolute pointer-events-none"
        style={{ left: PAD, top: PAD, width, height, overflow: 'visible' }}>
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.def.id === edge.fromId)
          const to   = nodes.find(n => n.def.id === edge.toId)
          if (!from || !to) return null

          const fr = cardRect(from)
          const tr = cardRect(to)
          const x1 = fr.x + CARD_W; const y1 = fr.y + CARD_H / 2
          const x2 = tr.x;           const y2 = tr.y + CARD_H / 2
          const cp = Math.min(COL_GAP * 0.7, 50)
          const d  = `M${x1},${y1} C${x1 + cp},${y1} ${x2 - cp},${y2} ${x2},${y2}`
          const color = EDGE_COLORS[edge.kind]
          const isDashed = edge.kind === 'expiry' || edge.kind === 'choiceSuccess' || edge.kind === 'choiceFailure'

          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.6}
                strokeDasharray={isDashed ? '5 3' : undefined} />
              <polygon
                points={`${x2},${y2} ${x2 - 7},${y2 - 4} ${x2 - 7},${y2 + 4}`}
                fill={color} fillOpacity={0.6} />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4}
                textAnchor="middle" fontSize={7} fill={color} fillOpacity={0.7}>
                {edge.label ? `${edge.kind.replace('choice', '')}(${edge.label})` : edge.kind}
              </text>
            </g>
          )
        })}
      </svg>

      {nodes.map(node => {
        const r = cardRect(node)
        return (
          <div key={node.def.id}
            className="absolute cursor-pointer transition-all"
            style={{ left: r.x, top: r.y, width: CARD_W, height: CARD_H }}
            onClick={() => onSelect(node.def.id)}>
            <EventCard
              def={node.def}
              isSelected={selectedDefId === node.def.id}
              state={stateOf(node.def.id)}
            />
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventCard
// ---------------------------------------------------------------------------

function EventCard({ def, isSelected, state }: {
  def: EventDefinition; isSelected: boolean; state: string
}) {
  const uc = UC[def.urgency]
  const loc = LOCATION_LABELS[def.locationId]
  const stateColor = state === 'resolved' ? '#00d48a' : state === 'onMap' ? '#d4a017' : state === 'ready' ? '#6090ff' : undefined

  const borderColor = isSelected ? 'rgba(255,215,0,0.85)'
    : stateColor     ? `${stateColor}88`
    :                  `${uc.ring}44`

  const glow = isSelected ? '0 0 0 2px rgba(255,215,0,0.25), 0 0 16px rgba(255,215,0,0.2)'
    : stateColor ? `0 0 8px ${stateColor}40` : 'none'

  return (
    <div className="h-full rounded-lg p-2 flex flex-col gap-1 overflow-hidden transition-all"
      style={{
        background: `linear-gradient(160deg, ${uc.bg} 0%, rgba(10,6,4,0.95) 100%)`,
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
      }}>

      <div className="flex items-start justify-between gap-1">
        <span className="font-serif text-[11px] leading-tight text-parchment/90 flex-1 line-clamp-2">{def.title}</span>
        <span className="text-[7px] px-1 py-0.5 rounded-full font-bold uppercase flex-shrink-0"
          style={{ background: `${uc.badge}22`, color: uc.badge }}>
          {def.urgency}
        </span>
      </div>

      <div className="text-[8px] text-silk/40 truncate">{loc.en}</div>

      <div className="flex gap-1 flex-wrap">
        {def.statsChecked.map(s => (
          <span key={s} className="text-[7px] px-1 rounded"
            style={{ background: `${uc.badge}18`, color: uc.badge, border: `1px solid ${uc.badge}30` }}>
            {STAT_LABELS[s].en}
          </span>
        ))}
        <span className="text-[7px] ml-auto" style={{ color: 'rgba(232,213,176,0.35)' }}>{def.threshold}✓</span>
      </div>

      {/* Prerequisites summary */}
      {def.prerequisites.length > 0 && (
        <div className="text-[7px] text-silk/30 truncate">
          {def.prerequisites.length} prerequisite{def.prerequisites.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Bottom row: dilemma + state */}
      <div className="flex gap-1 mt-auto flex-wrap items-center">
        {def.dilemma && (
          <span className="text-[7px] px-1 rounded"
            style={{ background: 'rgba(255,180,0,0.12)', color: 'rgba(255,180,0,0.75)', border: '1px solid rgba(255,180,0,0.2)' }}>
            {def.dilemma.choices.length} choices
          </span>
        )}
        {def.isForced && <span className="text-[7px]" style={{ color: '#e04030' }}>FORCED</span>}
        {def.isRepeatable && <span className="text-[7px]" style={{ color: 'rgba(232,213,176,0.4)' }}>↺</span>}
        {stateColor && (
          <span className="text-[7px] ml-auto px-1 rounded"
            style={{ background: `${stateColor}20`, color: stateColor }}>
            {state}
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EventDefPanel — right-panel detail view
// ---------------------------------------------------------------------------

function EventDefPanel({ def, stateOf, onNavigate }: {
  def: EventDefinition
  stateOf: (id: string) => string
  onNavigate: (id: string) => void
}) {
  const uc  = UC[def.urgency]
  const loc = LOCATION_LABELS[def.locationId]
  const state = stateOf(def.id)

  return (
    <div className="p-3 space-y-3 text-[10px]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase"
            style={{ background: `${uc.badge}22`, color: uc.badge }}>{def.urgency}</span>
          {def.isForced && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(224,64,48,0.15)', color: '#e04030' }}>FORCED</span>}
          <span className="text-[8px] px-1.5 py-0.5 rounded-full"
            style={{ background: state === 'resolved' ? 'rgba(0,212,138,0.15)' : state === 'ready' ? 'rgba(96,144,255,0.15)' : 'rgba(232,213,176,0.06)', color: state === 'resolved' ? '#00d48a' : state === 'ready' ? '#6090ff' : 'rgba(232,213,176,0.4)' }}>
            {state}
          </span>
        </div>
        <h2 className="font-serif text-[14px] text-parchment leading-tight">{def.title}</h2>
        <div className="text-[9px] text-silk/40 mt-0.5">{loc.en} · {loc.zh}</div>
        <div className="text-[9px] text-silk/35 mt-0.5 font-mono">{def.id}</div>
      </div>

      <p className="text-[9px] text-silk/55 leading-relaxed">{def.description}</p>

      {/* Mechanics */}
      <Section label="Mechanics">
        <Row label="Stats">{def.statsChecked.map(s => STAT_LABELS[s].en).join(' + ')}</Row>
        <Row label="Threshold">{def.threshold}✓{def.oppositionValue > 0 ? ` (−${def.oppositionValue} opp)` : ''}</Row>
        <Row label="Duration">{def.durationDays === 1 ? '1 day' : `${def.durationDays} days`}</Row>
        <Row label="Expires">{def.daysUntilExpiry !== null ? `after ${def.daysUntilExpiry} days` : 'never'}</Row>
        <Row label="Weight">{def.poolWeight}</Row>
      </Section>

      {/* Prerequisites */}
      <Section label={`Prerequisites (${def.prerequisites.length})`}>
        {def.prerequisites.length === 0
          ? <span className="text-silk/30 italic">Always eligible (pool event)</span>
          : def.prerequisites.map((p, i) => <PrereqRow key={i} prereq={p} onNavigate={onNavigate} />)
        }
      </Section>

      {/* Graph edges */}
      {def.graphEdges && (
        <Section label="Graph Edges">
          {def.graphEdges.success?.map(id => (
            <button key={id} className="text-[9px] hover:underline block" style={{ color: '#00d48a88' }}
              onClick={() => onNavigate(id)}>→✓ {EVENT_DEFINITIONS_BY_ID[id]?.title ?? id}</button>
          ))}
          {def.graphEdges.failure?.map(id => (
            <button key={id} className="text-[9px] hover:underline block" style={{ color: '#e0403088' }}
              onClick={() => onNavigate(id)}>→✗ {EVENT_DEFINITIONS_BY_ID[id]?.title ?? id}</button>
          ))}
          {def.graphEdges.choiceEdges?.map(ce => (
            <div key={ce.choiceId} className="ml-2 mt-1">
              <div className="text-[8px] text-silk/40">choice: {ce.choiceId}</div>
              {ce.success?.map(id => (
                <button key={id} className="text-[8px] hover:underline block" style={{ color: '#d4a01788' }}
                  onClick={() => onNavigate(id)}>→✓ {EVENT_DEFINITIONS_BY_ID[id]?.title ?? id}</button>
              ))}
              {ce.failure?.map(id => (
                <button key={id} className="text-[8px] hover:underline block" style={{ color: '#c0602088' }}
                  onClick={() => onNavigate(id)}>→✗ {EVENT_DEFINITIONS_BY_ID[id]?.title ?? id}</button>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* Dilemma */}
      {def.dilemma && (
        <Section label={`Dilemma — ${def.dilemma.timing}`}>
          <p className="text-silk/50 text-[9px] leading-relaxed mb-2 italic">{def.dilemma.prompt}</p>
          <div className="space-y-2">
            {def.dilemma.choices.map(choice => (
              <div key={choice.id} className="rounded p-2"
                style={{ background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.15)' }}>
                <div className="font-semibold text-[10px]" style={{ color: 'rgba(255,200,60,0.85)' }}>
                  {choice.label}
                </div>
                <div className="text-[8px] text-silk/40 mt-0.5 leading-relaxed">{choice.description}</div>
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {choice.overrideStats && (
                    <span className="text-[7px] px-1 rounded"
                      style={{ background: 'rgba(120,180,255,0.12)', color: 'rgba(120,180,255,0.7)' }}>
                      {choice.overrideStats.map(s => STAT_LABELS[s].en).join('+')}
                      {choice.overrideThreshold != null && ` ≥${choice.overrideThreshold}`}
                    </span>
                  )}
                  {choice.skipDiceRoll && (
                    <span className="text-[7px] px-1 rounded"
                      style={{ background: 'rgba(180,120,255,0.12)', color: 'rgba(180,120,255,0.7)' }}>no dice</span>
                  )}
                  {choice.moralWeight && Object.entries(choice.moralWeight).map(([k, v]) => (
                    <span key={k} className="text-[7px] px-1 rounded"
                      style={{
                        background: (v as number) > 0 ? 'rgba(0,180,100,0.12)' : 'rgba(220,60,60,0.12)',
                        color: (v as number) > 0 ? 'rgba(0,200,120,0.7)' : 'rgba(220,80,80,0.7)',
                      }}>
                      {k} {(v as number) > 0 ? '+' : ''}{v as number}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[8px] uppercase tracking-widest text-silk/30 mb-1">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-silk/35 w-16 flex-shrink-0">{label}</span>
      <span className="text-parchment/65">{children}</span>
    </div>
  )
}

function PrereqRow({ prereq, onNavigate }: { prereq: import('./types').EventPrerequisite; onNavigate: (id: string) => void }) {
  switch (prereq.kind) {
    case 'eventResolved':
      return (
        <div className="flex items-center gap-1">
          <span style={{ color: prereq.resolution ? (prereq.resolution === 'success' || prereq.resolution === 'criticalSuccess' ? '#00d48a' : '#e04030') : 'rgba(232,213,176,0.5)' }}>
            {prereq.resolution ?? 'any'}
          </span>
          <button className="text-left hover:underline truncate" style={{ color: 'rgba(232,213,176,0.6)' }}
            onClick={() => onNavigate(prereq.defId)}>
            {EVENT_DEFINITIONS_BY_ID[prereq.defId]?.title ?? prereq.defId}
          </button>
        </div>
      )
    case 'eventNotResolved':
      return <div className="flex items-center gap-1"><span style={{ color: 'rgba(232,213,176,0.4)' }}>not resolved:</span><button className="hover:underline" style={{ color: 'rgba(232,213,176,0.6)' }} onClick={() => onNavigate(prereq.defId)}>{EVENT_DEFINITIONS_BY_ID[prereq.defId]?.title ?? prereq.defId}</button></div>
    case 'choiceMade':
      return <div style={{ color: 'rgba(255,180,0,0.6)' }}>choice: {prereq.choiceId} in <button className="hover:underline" onClick={() => onNavigate(prereq.eventDefId)}>{EVENT_DEFINITIONS_BY_ID[prereq.eventDefId]?.title ?? prereq.eventDefId}</button></div>
    case 'choiceNotMade':
      return <div style={{ color: 'rgba(232,213,176,0.4)' }}>not choice: {prereq.choiceId}</div>
    case 'dayMin':
      return <div style={{ color: 'rgba(232,213,176,0.5)' }}>Day ≥ {prereq.day}</div>
    case 'dayMax':
      return <div style={{ color: 'rgba(232,213,176,0.5)' }}>Day ≤ {prereq.day}</div>
    case 'locationUnlocked':
      return <div style={{ color: 'rgba(232,213,176,0.5)' }}>🔓 {prereq.locationId}</div>
    case 'reputationMin':
      return <div style={{ color: 'rgba(232,213,176,0.5)' }}>{prereq.metric} ≥ {prereq.value}</div>
    case 'reputationMax':
      return <div style={{ color: 'rgba(232,213,176,0.5)' }}>{prereq.metric} ≤ {prereq.value}</div>
    case 'anyOf':
      return (
        <div className="pl-2 border-l" style={{ borderColor: 'rgba(232,213,176,0.1)' }}>
          <div className="text-[7px] text-silk/30 mb-0.5">ANY OF:</div>
          {prereq.conditions.map((c, i) => <PrereqRow key={i} prereq={c} onNavigate={onNavigate} />)}
        </div>
      )
    default:
      return <div style={{ color: 'rgba(232,213,176,0.4)' }}>{prereq.kind}</div>
  }
}
