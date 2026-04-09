// =============================================================================
// DebugEventPanel — View event definitions & runtime states. Force-spawn.
// View narrative log.
// =============================================================================

import { useState } from 'react'
import { useGameState, useGameDispatch } from '@core/GameStateContext'
import { ALL_EVENT_DEFINITIONS, EVENT_DEFINITIONS_BY_ID, definitionToEvent } from '@modules/events'
import type { EventRuntimeState, EventState } from '@modules/events'

type ViewMode = 'events' | 'narrative'

const STATE_COLORS: Record<EventState, string> = {
  unmet: '#666',
  ready: '#d4a017',
  onMap: '#40a060',
  resolved: '#4080c0',
  skipped: '#888',
}

export function DebugEventPanel() {
  const { state } = useGameState()
  const dispatch = useGameDispatch()
  const [view, setView] = useState<ViewMode>('events')
  const [filter, setFilter] = useState('')

  const forceSpawn = (defId: string) => {
    const def = EVENT_DEFINITIONS_BY_ID[defId]
    if (!def) return
    // Check if any map node has this location
    const node = state.mapNodes.find(n => n.id === def.locationId)
    if (!node) {
      // Try to put on first available node
      if (state.mapNodes.length === 0) return
    }
    const targetLocation = node?.id ?? state.mapNodes[0]?.id
    if (!targetLocation) return

    const event = definitionToEvent(def)
    const runtimeState: EventRuntimeState = {
      defId: def.id,
      state: 'onMap',
      dayPlaced: state.currentDay,
    }
    dispatch({ type: 'SPAWN_EVENT', node: targetLocation, event, runtimeState })
  }

  const getDefState = (defId: string): EventRuntimeState | undefined => {
    return state.eventStates[defId]
  }

  const filteredDefs = ALL_EVENT_DEFINITIONS.filter(d =>
    !filter || d.title.toLowerCase().includes(filter.toLowerCase()) || d.id.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Tab row */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => setView('events')}
          style={{ ...tabStyle, opacity: view === 'events' ? 1 : 0.5 }}
        >
          Events ({ALL_EVENT_DEFINITIONS.length})
        </button>
        <button
          onClick={() => setView('narrative')}
          style={{ ...tabStyle, opacity: view === 'narrative' ? 1 : 0.5 }}
        >
          Narrative ({state.narrativeLog.length})
        </button>
      </div>

      {view === 'events' && (
        <>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter events..."
            style={inputStyle}
          />
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filteredDefs.map(def => {
              const rs = getDefState(def.id)
              const currentState: EventState = rs?.state ?? 'unmet'
              return (
                <div
                  key={def.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span
                    style={{
                      color: STATE_COLORS[currentState],
                      fontSize: 9,
                      width: 50,
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                    }}
                  >
                    {currentState}
                  </span>
                  <span style={{ color: '#e8d5b0', fontSize: 10, flex: 1 }}>
                    {def.title}
                  </span>
                  <span style={{ color: '#666', fontSize: 9 }}>
                    {def.type} | {def.locationId}
                  </span>
                  {currentState !== 'onMap' && (
                    <button onClick={() => forceSpawn(def.id)} style={btnStyle}>
                      Spawn
                    </button>
                  )}
                </div>
              )
            })}
            {filteredDefs.length === 0 && (
              <div style={{ color: '#666', fontSize: 10, padding: 8 }}>No matching events.</div>
            )}
          </div>
        </>
      )}

      {view === 'narrative' && (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {state.narrativeLog.length === 0 && (
            <div style={{ color: '#666', fontSize: 10, padding: 8 }}>Narrative log is empty.</div>
          )}
          {[...state.narrativeLog].reverse().map((entry, i) => (
            <div
              key={i}
              style={{
                padding: '2px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 10,
              }}
            >
              <span style={{ color: '#888', marginRight: 6 }}>D{entry.day}</span>
              <span style={{ color: '#d4a017', marginRight: 6 }}>{entry.kind}</span>
              <span style={{ color: '#aaa' }}>
                {narrativeEntrySummary(entry)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function narrativeEntrySummary(entry: { kind: string; [k: string]: unknown }): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(entry)) {
    if (k === 'day' || k === 'kind') continue
    parts.push(`${k}=${String(v)}`)
  }
  return parts.join(' ')
}

const tabStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '3px 8px',
  fontSize: 10,
  borderRadius: 3,
  cursor: 'pointer',
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '2px 6px',
  fontSize: 10,
  borderRadius: 3,
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#e8d5b0',
  padding: '3px 6px',
  fontSize: 11,
  borderRadius: 3,
  width: '100%',
  boxSizing: 'border-box',
}
