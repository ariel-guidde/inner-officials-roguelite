// =============================================================================
// DebugAgentPanel — List agents, modify conditions, add/remove.
// =============================================================================

import { useState } from 'react'
import { useGameState, useGameDispatch } from '@core/GameStateContext'
import { ALL_STATS, STAT_ABBREVIATIONS, AGENT_TIER_ORDER, CONDITION_LABELS } from '@core/types'
import type { Agent, AgentCondition, AgentTier } from '@core/types'

const ALL_CONDITIONS: AgentCondition[] = [
  'poisoned', 'ill', 'injured', 'disgraced', 'imprisoned', 'mourning', 'pregnant', 'cursed',
]

export function DebugAgentPanel() {
  const { state } = useGameState()
  const dispatch = useGameDispatch()
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState<AgentTier>('bronze')
  const agents = Object.values(state.agents)

  const addAgent = () => {
    if (!newName.trim()) return
    const id = `debug-agent-${Date.now()}`
    const agent: Agent = {
      id,
      name: newName.trim(),
      portraitId: 'default',
      tier: newTier,
      stats: Object.fromEntries(ALL_STATS.map(s => [s, 3])) as Agent['stats'],
      conditions: [],
      tags: ['female', 'commoner', 'follower'],
    }
    dispatch({ type: 'ADD_AGENT', agent })
    setNewName('')
  }

  const toggleCondition = (agentId: string, condition: AgentCondition) => {
    const agent = state.agents[agentId]
    if (!agent) return
    const has = agent.conditions.includes(condition)
    dispatch({
      type: 'UPDATE_AGENT',
      agentId,
      patch: {
        conditions: has
          ? agent.conditions.filter(c => c !== condition)
          : [...agent.conditions, condition],
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Add agent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Agent name"
          style={inputStyle}
        />
        <select
          value={newTier}
          onChange={e => setNewTier(e.target.value as AgentTier)}
          style={{ ...inputStyle, width: 70 }}
        >
          {AGENT_TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={addAgent} style={btnStyle}>Add</button>
      </div>

      {agents.length === 0 && (
        <div style={{ color: '#666', fontSize: 10 }}>No agents in state.</div>
      )}

      {/* Agent list */}
      {agents.map(agent => (
        <div
          key={agent.id}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            padding: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: '#e8d5b0', fontSize: 11, fontWeight: 'bold' }}>
              {agent.name}
            </span>
            <span style={{ color: '#888', fontSize: 9 }}>
              [{agent.tier}] {agent.id.slice(0, 12)}...
            </span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_AGENT', agentId: agent.id })}
              style={{ ...btnStyle, color: '#e06040', marginLeft: 'auto' }}
            >
              Remove
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
            {ALL_STATS.map(s => (
              <span key={s} style={{ fontSize: 9, color: '#999' }}>
                {STAT_ABBREVIATIONS[s]}:{agent.stats[s]}
              </span>
            ))}
          </div>

          {/* Conditions */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {ALL_CONDITIONS.map(c => {
              const active = agent.conditions.includes(c)
              return (
                <button
                  key={c}
                  onClick={() => toggleCondition(agent.id, c)}
                  style={{
                    ...btnStyle,
                    fontSize: 9,
                    padding: '1px 4px',
                    background: active ? 'rgba(200,60,60,0.3)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#e06040' : '#666',
                  }}
                >
                  {CONDITION_LABELS[c].en}
                </button>
              )
            })}
          </div>
        </div>
      ))}
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
  width: 100,
  borderRadius: 3,
}
