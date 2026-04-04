// =============================================================================
// Playground — dev harness
// Imports all 3 modules; renders a config sidebar + live preview pane.
// =============================================================================

import { useState, useEffect } from 'react'
import type { Agent, AgentCondition, AgentTier, DiceRollConfig, DiceRollResult, Equipment, EquipmentSlot, GameEvent, LocationId, StatName } from '@core/types'
import { ALL_STATS, STAT_LABELS, CONDITION_LABELS, AGENT_TIER_ORDER } from '@core/types'
import { bus } from '@core/events'
import { rollDice, passChance, rollFeeling } from '@modules/dice'
import { Dice }       from '@modules/dice'
import { Map }        from '@modules/map'
import { Characters, meetsRequirements } from '@modules/characters'
import { Inventory }  from '@modules/inventory'
import { DICE_DEFAULTS }       from './configs/diceDefaults'
import { MAP_DEFAULTS }        from './configs/mapDefaults'
import { CHARACTERS_DEFAULTS } from './configs/charactersDefaults'
import { ALL_EQUIPMENT }       from './configs/equipmentDefaults'

type ActiveModule = 'dice' | 'map' | 'characters' | 'inventory'

export interface PlaygroundProps {
  activeModule?: ActiveModule
  showEventLog?: boolean
}

export function Playground({ activeModule: initialModule = 'dice', showEventLog = true }: PlaygroundProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>(initialModule)
  const [diceConfig, setDiceConfig] = useState<DiceRollConfig>(DICE_DEFAULTS)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)
  const [pendingRoll, setPendingRoll] = useState<DiceRollConfig | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<LocationId | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem('playground-agents')
      return saved ? (JSON.parse(saved) as Agent[]) : CHARACTERS_DEFAULTS
    } catch { return CHARACTERS_DEFAULTS }
  })
  // Items in the pool = ALL_EQUIPMENT minus whatever is equipped by any agent
  const equippedIds = new Set(
    agents.flatMap(a => Object.values(a.equipment ?? {}).filter(Boolean).map((e) => (e as Equipment).id))
  )
  const poolItems = ALL_EQUIPMENT.filter(e => !equippedIds.has(e.id))

  // Persist agents to localStorage on every change
  useEffect(() => {
    localStorage.setItem('playground-agents', JSON.stringify(agents))
  }, [agents])

  const handleAgentUpdate = (agentId: string, patch: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...patch } : a))
  }

  const handleEquip = (agentId: string, slot: EquipmentSlot, item: Equipment) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a
      return { ...a, equipment: { ...a.equipment, [slot]: item } }
    }))
  }

  const handleUnequip = (agentId: string, slot: EquipmentSlot) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a
      return { ...a, equipment: { ...a.equipment, [slot]: null } }
    }))
  }

  // Golden dice — post-result auto-successes
  const [goldenDiceAvailable, setGoldenDiceAvailable] = useState(3)
  const [goldenDiceSpent, setGoldenDiceSpent] = useState(0)
  // Rerolls — post-result full re-roll resource
  const [rerollsAvailable, setRerollsAvailable] = useState(2)

  const logEvent = (msg: string) =>
    setEventLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)])

  const handleRollSettled = (result: DiceRollResult) => {
    // Re-apply any golden dice that carried over from a reroll
    let final = result
    if (goldenDiceSpent > 0) {
      const successes = result.successes + goldenDiceSpent
      final = {
        ...result,
        successes,
        isSuccess: successes >= diceConfig.threshold,
        isCriticalFailure: false,
        margin: successes - diceConfig.threshold,
      }
    }
    setLastResult(final)
    setPendingRoll(null)
    bus.emit('dice:rollSettled', final)
    logEvent(`dice:rollSettled — ${final.successes} successes (${goldenDiceSpent > 0 ? `+${goldenDiceSpent} golden` : 'no golden'}), ${final.isSuccess ? '✓ PASS' : '✗ FAIL'}`)
  }

  const handleTriggerRoll = () => {
    const config = { ...diceConfig, goldenDice: 0 }
    setGoldenDiceSpent(0)
    setLastResult(null)
    setPendingRoll(config)
    bus.emit('dice:rollRequested', config)
    logEvent(`dice:rollRequested — pool ${diceConfig.pool}, threshold ${diceConfig.threshold}`)
  }

  const handleSpendGoldenDie = () => {
    if (goldenDiceAvailable <= 0 || !lastResult) return
    setGoldenDiceAvailable((n) => n - 1)
    setGoldenDiceSpent((n) => n + 1)
    // Patch the result directly — golden dice are auto-successes
    setLastResult((prev) => {
      if (!prev) return prev
      const successes = prev.successes + 1
      return {
        ...prev,
        successes,
        isSuccess: successes >= diceConfig.threshold,
        isCriticalFailure: false,
        margin: successes - diceConfig.threshold,
      }
    })
    logEvent(`golden die spent — ${goldenDiceAvailable - 1} remaining`)
  }

  const handleReroll = () => {
    if (rerollsAvailable <= 0) return
    setRerollsAvailable((n) => n - 1)
    // golden dice stay in the scene and carry their successes into the new result
    setLastResult(null)
    setPendingRoll({ ...diceConfig, goldenDice: 0 })
    logEvent(`reroll spent — ${rerollsAvailable - 1} remaining, ${goldenDiceSpent} golden die${goldenDiceSpent !== 1 ? 's' : ''} carry over`)
  }

  const handleNodeClick = (locationId: LocationId) => {
    setSelectedNodeId(locationId)
    bus.emit('map:nodeSelected', { locationId })
    logEvent(`map:nodeSelected — ${locationId}`)
  }

  const handleEventClick = (event: GameEvent) => {
    bus.emit('map:eventOpened', { eventId: event.id })
    logEvent(`map:eventOpened — ${event.title}`)
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId)
    bus.emit('characters:agentSelected', { agentId })
    logEvent(`characters:agentSelected — ${agentId}`)
  }

  // Probability shown pre-roll: no golden dice (they're a post-roll choice)
  const passProbability = passChance(diceConfig.pool, diceConfig.threshold, diceConfig.difficulty, 0)

  return (
    <div className="flex h-screen bg-ink text-parchment font-sans overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 bg-ink border-r border-silk/20 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-silk/20">
          <h1 className="font-serif text-lg text-gold font-bold">Inner Officials</h1>
          <p className="text-xs text-silk/50 mt-0.5">Dev Playground</p>
        </div>

        {/* Module selector */}
        <div className="p-4 border-b border-silk/20">
          <label className="text-xs uppercase tracking-wider text-silk/50 block mb-2">Module</label>
          <div className="flex gap-1">
            {(['dice', 'map', 'characters', 'inventory'] as ActiveModule[]).map((m) => (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={`flex-1 py-1.5 text-xs rounded capitalize transition-colors
                  ${activeModule === m
                    ? 'bg-vermilion text-parchment'
                    : 'bg-silk/10 text-silk/60 hover:bg-silk/20'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Module-specific controls */}
        <div className="p-4 flex-1">
          {activeModule === 'dice' && (
            <DiceControls
              config={diceConfig}
              onChange={setDiceConfig}
              passProb={passProbability}
              goldenDiceAvailable={goldenDiceAvailable}
              onGoldenDiceAvailableChange={setGoldenDiceAvailable}
              rerollsAvailable={rerollsAvailable}
              onRerollsAvailableChange={setRerollsAvailable}
            />
          )}
          {activeModule === 'map' && (
            <MapControls selectedNodeId={selectedNodeId} />
          )}
          {activeModule === 'characters' && (
            <CharactersControls
              agents={agents}
              poolItems={poolItems}
              selectedAgentId={selectedAgentId}
              onSelect={setSelectedAgentId}
              onAgentUpdate={handleAgentUpdate}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          )}
          {activeModule === 'inventory' && (
            <div className="text-xs text-silk/40 space-y-1">
              <p>Click an agent to manage their loadout.</p>
              <p>Hover items to preview. Click Equip to assign.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Preview pane ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Module preview */}
        <div className="flex-1 p-6 overflow-auto">
          {activeModule === 'dice' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-silk/70 text-sm">Dice Module Preview</h2>
                <button
                  onClick={handleTriggerRoll}
                  className="px-4 py-1.5 bg-vermilion hover:bg-vermilion/80 text-parchment text-sm rounded transition-colors"
                >
                  Roll {diceConfig.pool}d
                </button>
              </div>
              <Dice
                rollConfig={pendingRoll}
                onRollSettled={handleRollSettled}
                onRollStarted={() => logEvent('dice:rollStarted')}
                canvasHeight="400px"
                goldenDiceSpent={goldenDiceSpent}
                displayResult={lastResult}
                onDismiss={() => {
                  setLastResult(null)
                  setGoldenDiceSpent(0)
                  setPendingRoll(null)
                  logEvent('result dismissed')
                }}
                onReroll={rerollsAvailable > 0 && lastResult ? handleReroll : undefined}
              />
              {lastResult && goldenDiceAvailable > 0 && (
                <button
                  onClick={handleSpendGoldenDie}
                  className="self-center px-4 py-1.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-sm rounded transition-colors"
                >
                  Add Golden Die 🌕 ({goldenDiceAvailable} remaining)
                </button>
              )}
            </div>
          )}

          {activeModule === 'map' && (
            <div className="h-[600px]">
              <Map
                nodes={MAP_DEFAULTS}
                selectedNodeId={selectedNodeId}
                onNodeClick={handleNodeClick}
                onEventClick={handleEventClick}
              />
            </div>
          )}

          {activeModule === 'characters' && (
            <Characters
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              showPoolSummary
            />
          )}

          {activeModule === 'inventory' && (
            <Inventory
              poolItems={poolItems}
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          )}
        </div>

        {/* Event log */}
        {showEventLog && (
          <div className="h-36 border-t border-silk/20 bg-ink/80 overflow-y-auto p-3">
            <div className="text-xs uppercase tracking-wider text-silk/30 mb-2">Event Log</div>
            {eventLog.length === 0
              ? <div className="text-xs text-silk/20 italic">No events yet</div>
              : eventLog.map((entry, i) => (
                  <div key={i} className="text-xs text-silk/60 font-mono leading-5">{entry}</div>
                ))
            }
          </div>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-controls (Playground-internal — not exported)
// ---------------------------------------------------------------------------

function DiceControls({
  config,
  onChange,
  passProb,
  goldenDiceAvailable,
  onGoldenDiceAvailableChange,
  rerollsAvailable,
  onRerollsAvailableChange,
}: {
  config: DiceRollConfig
  onChange: (c: DiceRollConfig) => void
  passProb: number
  goldenDiceAvailable: number
  onGoldenDiceAvailableChange: (n: number) => void
  rerollsAvailable: number
  onRerollsAvailableChange: (n: number) => void
}) {
  const set = (patch: Partial<DiceRollConfig>) => onChange({ ...config, ...patch })

  return (
    <div className="space-y-4 text-sm">
      <Slider label="Pool"      value={config.pool}      min={0}  max={16} onChange={(v) => set({ pool: v })} />
      <Slider label="Threshold" value={config.threshold} min={1}  max={12} onChange={(v) => set({ threshold: v })} />

      <div>
        <label className="text-xs text-silk/50 uppercase tracking-wider block mb-1">Tier</label>
        <select
          className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
          value={config.tier}
          onChange={(e) => set({ tier: e.target.value as DiceRollConfig['tier'] })}
        >
          {(['clay', 'bronze', 'silver', 'gold', 'jade'] as const).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-silk/50 uppercase tracking-wider block mb-1">Difficulty</label>
        <select
          className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
          value={config.difficulty}
          onChange={(e) => set({ difficulty: e.target.value as DiceRollConfig['difficulty'] })}
        >
          <option value="gentle">Gentle (60%)</option>
          <option value="standard">Standard (50%)</option>
          <option value="ruthless">Ruthless (40%)</option>
        </select>
      </div>

      <div className="pt-2 border-t border-silk/10 space-y-3">
        <div>
          <Slider
            label="Golden Dice 🌕"
            value={goldenDiceAvailable}
            min={0} max={5}
            onChange={onGoldenDiceAvailableChange}
          />
          <p className="text-xs text-silk/30 mt-1">Auto-success, spent after roll</p>
        </div>
        <div>
          <Slider
            label="Rerolls ↺"
            value={rerollsAvailable}
            min={0} max={5}
            onChange={onRerollsAvailableChange}
          />
          <p className="text-xs text-silk/30 mt-1">Re-roll all dice, spent after roll</p>
        </div>
      </div>

      <div className="pt-2 border-t border-silk/10 text-xs text-silk/60">
        Pass chance: <span className="text-gold font-bold">{(passProb * 100).toFixed(1)}%</span>
        <span className="ml-2 text-silk/40">({rollFeeling(passProb)})</span>
      </div>
    </div>
  )
}

function MapControls({ selectedNodeId }: { selectedNodeId: LocationId | null }) {
  return (
    <div className="text-xs text-silk/50 space-y-2">
      <p>Click any node on the map to select it.</p>
      {selectedNodeId && (
        <p>Selected: <span className="text-parchment font-mono">{selectedNodeId}</span></p>
      )}
    </div>
  )
}

const ALL_CONDITIONS: AgentCondition[] = [
  'poisoned', 'ill', 'injured', 'disgraced', 'imprisoned', 'mourning', 'pregnant', 'cursed',
]

const SLOT_ICONS: Record<EquipmentSlot, string> = { attire: '👘', accessory: '💎', tool: '📜', weapon: '⚔' }
const SLOT_LABELS: Record<EquipmentSlot, string> = { attire: 'Attire', accessory: 'Accessory', tool: 'Tool', weapon: 'Weapon' }

function CharactersControls({
  agents, poolItems, selectedAgentId, onSelect, onAgentUpdate, onEquip, onUnequip,
}: {
  agents: Agent[]
  poolItems: Equipment[]
  selectedAgentId: string | null
  onSelect: (id: string) => void
  onAgentUpdate: (id: string, patch: Partial<Agent>) => void
  onEquip: (agentId: string, slot: EquipmentSlot, item: Equipment) => void
  onUnequip: (agentId: string, slot: EquipmentSlot) => void
}) {
  const agent = agents.find(a => a.id === selectedAgentId) ?? null
  const isGuard = agent?.tags.includes('guard') ?? false
  const agentSlots: EquipmentSlot[] = isGuard
    ? ['attire', 'accessory', 'tool', 'weapon']
    : ['attire', 'accessory', 'tool']

  const setCondition = (c: AgentCondition, on: boolean) => {
    if (!agent) return
    const conditions = on
      ? [...agent.conditions, c]
      : agent.conditions.filter(x => x !== c)
    onAgentUpdate(agent.id, { conditions })
  }

  const setStat = (s: StatName, delta: number) => {
    if (!agent) return
    const next = Math.max(0, Math.min(10, (agent.stats[s] ?? 0) + delta))
    onAgentUpdate(agent.id, { stats: { ...agent.stats, [s]: next } })
  }

  const setMartial = (delta: number) => {
    if (!agent) return
    onAgentUpdate(agent.id, { stats: { ...agent.stats, martial: Math.max(0, Math.min(5, (agent.stats.martial ?? 0) + delta)) } })
  }

  return (
    <div className="text-xs space-y-4 overflow-y-auto">
      {/* Agent selector + reset */}
      <div className="flex gap-1.5 items-end">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">Agent</label>
          <select
            className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
            value={selectedAgentId ?? ''}
            onChange={e => onSelect(e.target.value)}
          >
            <option value="">— select —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => { localStorage.removeItem('playground-agents'); window.location.reload() }}
          className="px-2 py-1 text-[10px] rounded bg-silk/10 hover:bg-silk/20 text-silk/40 hover:text-parchment transition-colors flex-shrink-0"
          title="Reset all agents to defaults">
          Reset
        </button>
      </div>

      {agent && (
        <>
          {/* Tier */}
          <div>
            <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">Tier</label>
            <select
              className="w-full bg-silk/10 border border-silk/20 rounded px-2 py-1 text-parchment text-xs"
              value={agent.tier}
              onChange={e => onAgentUpdate(agent.id, { tier: e.target.value as AgentTier })}
            >
              {AGENT_TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Equipment slots */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Equipment</div>
            <div className="space-y-1.5">
              {agentSlots.map(slot => {
                const current = agent.equipment?.[slot] ?? null
                // Items for this slot that exist in pool OR are currently equipped in this slot
                const available = [
                  ...(current ? [current] : []),
                  ...poolItems.filter(i => i.slot === slot),
                ]
                return (
                  <div key={slot} className="flex items-center gap-1.5">
                    <span className="text-sm w-5 flex-shrink-0">{SLOT_ICONS[slot]}</span>
                    <select
                      className="flex-1 bg-silk/10 border border-silk/20 rounded px-1.5 py-0.5 text-parchment text-[10px] min-w-0"
                      value={current?.id ?? ''}
                      onChange={e => {
                        if (!e.target.value) { onUnequip(agent.id, slot); return }
                        const item = available.find(i => i.id === e.target.value)
                        if (!item) return
                        if (!meetsRequirements(agent, item)) return
                        onEquip(agent.id, slot, item)
                      }}
                    >
                      <option value="">— {SLOT_LABELS[slot]} —</option>
                      {available.map(item => {
                        const ok = meetsRequirements(agent, item)
                        return <option key={item.id} value={item.id} disabled={!ok}>{ok ? '' : '✕ '}{item.name}</option>
                      })}
                    </select>
                    {current && (
                      <button onClick={() => onUnequip(agent.id, slot)}
                        className="text-[10px] text-silk/30 hover:text-red-400 transition-colors flex-shrink-0">✕</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Conditions</div>
            <div className="grid grid-cols-2 gap-1">
              {ALL_CONDITIONS.map(c => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agent.conditions.includes(c)}
                    onChange={e => setCondition(c, e.target.checked)}
                    className="accent-vermilion"
                  />
                  <span className="text-silk/60 leading-tight">{CONDITION_LABELS[c].en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resentment (only if field exists on agent) */}
          {'resentment' in agent && (
            <div>
              <label className="text-xs uppercase tracking-wider text-silk/50 block mb-1">
                Resentment — {agent.resentment ?? 0}/5
              </label>
              <input
                type="range" min={0} max={5} value={agent.resentment ?? 0}
                onChange={e => onAgentUpdate(agent.id, { resentment: Number(e.target.value) })}
                className="w-full accent-vermilion"
              />
            </div>
          )}

          {/* Stats */}
          <div>
            <div className="text-xs uppercase tracking-wider text-silk/50 mb-1">Base Stats</div>
            <div className="space-y-1">
              {ALL_STATS.map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className="text-silk/50 w-24 flex-shrink-0 truncate">{STAT_LABELS[s].en}</span>
                  <button onClick={() => setStat(s, -1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">−</button>
                  <span className="text-parchment font-bold w-4 text-center tabular-nums">{agent.stats[s] ?? 0}</span>
                  <button onClick={() => setStat(s, +1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">+</button>
                </div>
              ))}
              {isGuard && (
                <div className="flex items-center gap-1.5">
                  <span className="text-silk/50 w-24 flex-shrink-0">Martial</span>
                  <button onClick={() => setMartial(-1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">−</button>
                  <span className="text-parchment font-bold w-4 text-center tabular-nums">{agent.stats.martial ?? 0}</span>
                  <button onClick={() => setMartial(+1)} className="px-1.5 py-0.5 bg-silk/10 hover:bg-silk/20 rounded text-silk/70">+</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!agent && (
        <p className="text-silk/30 italic">Select an agent above or click a card.</p>
      )}
    </div>
  )
}

function Slider({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-silk/50 mb-1">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-parchment font-bold">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-vermilion"
      />
    </div>
  )
}


export default Playground
