// =============================================================================
// DebugOverlay — Collapsible side panel with tabbed debug panels.
// Toggle: backtick key (`) or button in bottom-right corner.
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import { DebugStatePanel } from './DebugStatePanel'
import { DebugResourcePanel } from './DebugResourcePanel'
import { DebugAgentPanel } from './DebugAgentPanel'
import { DebugEventPanel } from './DebugEventPanel'

type TabId = 'state' | 'resources' | 'agents' | 'events'

const TABS: { id: TabId; label: string }[] = [
  { id: 'state', label: 'State' },
  { id: 'resources', label: 'Resources' },
  { id: 'agents', label: 'Agents' },
  { id: 'events', label: 'Events' },
]

const PANEL_WIDTH = 380

export function DebugOverlay() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('state')

  const toggle = useCallback(() => setOpen(o => !o), [])

  // Keyboard shortcut: backtick
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't toggle if user is typing in an input
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          zIndex: 9999,
          background: open ? 'rgba(200,60,60,0.3)' : 'rgba(232,213,176,0.08)',
          border: `1px solid ${open ? 'rgba(200,60,60,0.4)' : 'rgba(232,213,176,0.15)'}`,
          color: open ? '#e06040' : 'rgba(232,213,176,0.35)',
          padding: '4px 8px',
          fontSize: 10,
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: 'monospace',
          transition: 'all 0.15s',
        }}
      >
        {open ? 'Close Debug [`]' : 'Debug [`]'}
      </button>

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          zIndex: 9998,
          background: 'rgba(18, 16, 14, 0.95)',
          borderLeft: '1px solid rgba(232,213,176,0.12)',
          transform: open ? 'translateX(0)' : `translateX(${PANEL_WIDTH}px)`,
          transition: 'transform 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#e8d5b0', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
            DEBUG
          </span>
          <button
            onClick={toggle}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            x
          </button>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: tab === t.id ? 'rgba(232,213,176,0.08)' : 'transparent',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid #d4a017' : '2px solid transparent',
                color: tab === t.id ? '#e8d5b0' : '#666',
                padding: '6px 4px',
                fontSize: 10,
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.1s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
          }}
        >
          {tab === 'state' && <DebugStatePanel />}
          {tab === 'resources' && <DebugResourcePanel />}
          {tab === 'agents' && <DebugAgentPanel />}
          {tab === 'events' && <DebugEventPanel />}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '4px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: '#444',
            fontSize: 9,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          Press ` to toggle | All edits go through GameStateContext
        </div>
      </div>
    </>
  )
}
