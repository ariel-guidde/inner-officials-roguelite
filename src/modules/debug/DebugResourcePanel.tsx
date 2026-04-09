// =============================================================================
// DebugResourcePanel — Edit silver, golden dice, reputation, intelligence.
// =============================================================================

import { useGameState, useGameDispatch } from '@core/GameStateContext'
import type { ReputationState } from '@core/types'
import { ALL_INTELLIGENCE_TYPES, INTELLIGENCE_LABELS, AGENT_TIER_ORDER } from '@core/types'
import type { IntelligenceType, AgentTier } from '@core/types'

const REP_KEYS: (keyof ReputationState)[] = [
  'virtue', 'ruthlessness', 'imperialFavor', 'shadowReach', 'heavenlySight', 'slander',
]

export function DebugResourcePanel() {
  const { state } = useGameState()
  const dispatch = useGameDispatch()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Silver */}
      <Row label="Silver" value={state.silver}>
        <button onClick={() => dispatch({ type: 'CHANGE_SILVER', delta: 1 })} style={btnStyle}>+1</button>
        <button onClick={() => dispatch({ type: 'CHANGE_SILVER', delta: 5 })} style={btnStyle}>+5</button>
        <button onClick={() => dispatch({ type: 'CHANGE_SILVER', delta: -1 })} style={btnStyle}>-1</button>
        <button onClick={() => dispatch({ type: 'CHANGE_SILVER', delta: -state.silver })} style={btnStyle}>Zero</button>
      </Row>

      {/* Golden dice */}
      <Row label="Golden Dice" value={state.goldenDice}>
        <button onClick={() => dispatch({ type: 'CHANGE_GOLDEN_DICE', delta: 1 })} style={btnStyle}>+1</button>
        <button onClick={() => dispatch({ type: 'CHANGE_GOLDEN_DICE', delta: -1 })} style={btnStyle}>-1</button>
      </Row>

      {/* Reputation */}
      <div>
        <div style={{ color: '#999', fontSize: 10, marginBottom: 4 }}>Reputation</div>
        {REP_KEYS.map(key => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ color: '#888', fontSize: 10, width: 90, textTransform: 'capitalize' }}>{key}</span>
            <span style={{ color: '#e8d5b0', fontSize: 11, width: 30, textAlign: 'right' }}>
              {state.reputation[key]}
            </span>
            <button onClick={() => dispatch({ type: 'CHANGE_REPUTATION', deltas: { [key]: 5 } })} style={btnStyle}>+5</button>
            <button onClick={() => dispatch({ type: 'CHANGE_REPUTATION', deltas: { [key]: -5 } })} style={btnStyle}>-5</button>
          </div>
        ))}
      </div>

      {/* Intelligence */}
      <div>
        <div style={{ color: '#999', fontSize: 10, marginBottom: 4 }}>Intelligence</div>
        <table style={{ fontSize: 10, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {AGENT_TIER_ORDER.map(t => <th key={t} style={thStyle}>{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {ALL_INTELLIGENCE_TYPES.map(iType => (
              <tr key={iType}>
                <td style={{ ...tdStyle, color: '#888' }}>{INTELLIGENCE_LABELS[iType]}</td>
                {AGENT_TIER_ORDER.map(tier => (
                  <td key={tier} style={tdStyle}>
                    <span style={{ color: '#e8d5b0', marginRight: 2 }}>
                      {state.intelligence[iType][tier]}
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'ADD_INTELLIGENCE', intelType: iType as IntelligenceType, tier: tier as AgentTier, amount: 1 })}
                      style={{ ...btnStyle, padding: '0 3px', fontSize: 9 }}
                    >
                      +
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#999', fontSize: 11, width: 80 }}>{label}:</span>
      <span style={{ color: '#e8d5b0', fontWeight: 'bold', width: 30 }}>{value}</span>
      {children}
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

const thStyle: React.CSSProperties = {
  color: '#666',
  padding: '1px 6px',
  textAlign: 'center',
  fontSize: 9,
  textTransform: 'capitalize',
}

const tdStyle: React.CSSProperties = {
  padding: '1px 4px',
  textAlign: 'center',
}
