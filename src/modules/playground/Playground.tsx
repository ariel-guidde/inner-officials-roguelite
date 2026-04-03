// =============================================================================
// Playground — dev harness
// Imports all 3 modules; renders a config sidebar + live preview pane.
// =============================================================================

import { useState } from 'react'
import type { DiceRollConfig, DiceRollResult, GameEvent, LocationId, StatName } from '@core/types'
import { bus } from '@core/events'
import { rollDice, passChance, rollFeeling } from '@modules/dice'
import { Dice }       from '@modules/dice'
import { Map }        from '@modules/map'
import { Characters } from '@modules/characters'
import { DICE_DEFAULTS }       from './configs/diceDefaults'
import { MAP_DEFAULTS }        from './configs/mapDefaults'
import { CHARACTERS_DEFAULTS } from './configs/charactersDefaults'

type ActiveModule = 'dice' | 'map' | 'characters'

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

  // Golden dice live outside the roll config — they're spent post-result
  const [goldenDiceAvailable, setGoldenDiceAvailable] = useState(3)
  const [goldenDiceSpent, setGoldenDiceSpent] = useState(0)

  const logEvent = (msg: string) =>
    setEventLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)])

  const handleRollSettled = (result: DiceRollResult) => {
    setLastResult(result)
    setPendingRoll(null)
    bus.emit('dice:rollSettled', result)
    logEvent(`dice:rollSettled — ${result.successes} successes, ${result.isSuccess ? '✓ PASS' : '✗ FAIL'}`)
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
            {(['dice', 'map', 'characters'] as ActiveModule[]).map((m) => (
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
            />
          )}
          {activeModule === 'map' && (
            <MapControls selectedNodeId={selectedNodeId} />
          )}
          {activeModule === 'characters' && (
            <CharactersControls selectedAgentId={selectedAgentId} />
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
              agents={CHARACTERS_DEFAULTS}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              showPoolSummary
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
}: {
  config: DiceRollConfig
  onChange: (c: DiceRollConfig) => void
  passProb: number
  goldenDiceAvailable: number
  onGoldenDiceAvailableChange: (n: number) => void
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

      <div className="pt-2 border-t border-silk/10">
        <Slider
          label="Golden Dice 🌕"
          value={goldenDiceAvailable}
          min={0} max={5}
          onChange={onGoldenDiceAvailableChange}
        />
        <p className="text-xs text-silk/30 mt-1">Spent after the roll, not before</p>
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

function CharactersControls({ selectedAgentId }: { selectedAgentId: string | null }) {
  return (
    <div className="text-xs text-silk/50 space-y-2">
      <p>Click any card to select an agent.</p>
      {selectedAgentId && (
        <p>Selected: <span className="text-parchment font-mono">{selectedAgentId}</span></p>
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
