// =============================================================================
// DebugStatePanel — View/edit day, phase, Taizong health.
// =============================================================================

import { useState } from 'react'
import { useGameState, useGameDispatch } from '@core/GameStateContext'
import type { GameState } from '@core/gameState'

const PHASES: GameState['phase'][] = ['creation', 'tutorial', 'playing', 'ending']

export function DebugStatePanel() {
  const { state } = useGameState()
  const dispatch = useGameDispatch()
  const [dayInput, setDayInput] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Current day */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 11 }}>Day:</span>
        <span style={{ color: '#e8d5b0', fontWeight: 'bold' }}>{state.currentDay}</span>
        <button onClick={() => dispatch({ type: 'ADVANCE_DAY' })} style={btnStyle}>
          Advance Day
        </button>
      </div>

      {/* Set day */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 11 }}>Set day:</span>
        <input
          type="number"
          value={dayInput}
          onChange={e => setDayInput(e.target.value)}
          placeholder="day #"
          style={inputStyle}
        />
        <button
          onClick={() => {
            const d = parseInt(dayInput, 10)
            if (d > 0) dispatch({ type: 'SET_DAY', day: d })
          }}
          style={btnStyle}
        >
          Set
        </button>
      </div>

      {/* Phase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 11 }}>Phase:</span>
        <span style={{ color: '#e8d5b0' }}>{state.phase}</span>
        {PHASES.map(p => (
          <button
            key={p}
            disabled={state.phase === p}
            onClick={() => dispatch({ type: 'SET_PHASE', phase: p })}
            style={{
              ...btnStyle,
              opacity: state.phase === p ? 0.4 : 1,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Taizong health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 11 }}>Taizong HP:</span>
        <span style={{ color: state.taizongHealth <= 20 ? '#e06040' : '#e8d5b0', fontWeight: 'bold' }}>
          {state.taizongHealth}
        </span>
        <span style={{ color: '#666', fontSize: 10 }}>
          (decay: {state.taizongDecayRate}/day)
        </span>
        <button onClick={() => dispatch({ type: 'DAMAGE_TAIZONG', amount: 10 })} style={btnStyle}>
          -10
        </button>
        <button onClick={() => dispatch({ type: 'HEAL_TAIZONG', amount: 10 })} style={btnStyle}>
          +10
        </button>
        <button onClick={() => dispatch({ type: 'DAMAGE_TAIZONG', amount: state.taizongHealth })} style={btnStyle}>
          Kill
        </button>
      </div>

      {/* Harem rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 11 }}>Harem Rank:</span>
        <span style={{ color: '#e8d5b0' }}>{state.haremRank}</span>
        <button
          onClick={() => { if (state.haremRank > 1) dispatch({ type: 'SET_HAREM_RANK', rank: (state.haremRank - 1) as 1|2|3|4|5|6|7|8|9 }) }}
          style={btnStyle}
        >
          Promote
        </button>
        <button
          onClick={() => { if (state.haremRank < 9) dispatch({ type: 'SET_HAREM_RANK', rank: (state.haremRank + 1) as 1|2|3|4|5|6|7|8|9 }) }}
          style={btnStyle}
        >
          Demote
        </button>
      </div>

      {/* Run info */}
      <div style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
        Run: {state.runId.slice(0, 8)}... | Ending: {state.endingCondition ?? 'none'}
      </div>
    </div>
  )
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
  padding: '2px 4px',
  fontSize: 11,
  width: 50,
  borderRadius: 3,
}
