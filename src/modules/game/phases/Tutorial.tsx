// =============================================================================
// Tutorial — The Four Virtues Selection (四德选秀)
// 4 stages, each teaching a core mechanic on a simplified map.
// =============================================================================

import { useState } from 'react'
import type { StatName, DiceRollConfig, DiceRollResult } from '@core/types'
import { STAT_LABELS } from '@core/types'
import { Dice } from '@modules/dice'
import type { CreationChoices } from '../data/creationData'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TutorialChoice {
  id: string
  label: string
  description: string
  effect: string
  statBonus?: Partial<Record<StatName, number>>
  reputationEffect?: string
}

interface TutorialStage {
  id: string
  number: number
  virtue: string
  title: string
  location: string
  teaches: string
  narrative: string
  choices?: TutorialChoice[]
  diceCheck?: { stats: StatName[]; threshold: number }
  // For stage 2: equip an item before rolling
  hasEquipStep?: boolean
  // For stage 3: agent assignment teaching
  hasAgentSlot?: boolean
  // For stage 4: multiple locations
  subLocations?: { id: string; name: string; stat: StatName; threshold: number; cost?: number }[]
}

const STAGES: TutorialStage[] = [
  {
    id: 'virtue',
    number: 1,
    virtue: 'Virtue',
    title: 'The Interview',
    location: 'Interview Chamber',
    teaches: 'Dilemma choices and consequences',
    narrative: 'Chief Eunuch Chen conducts private interviews. He asks questions not to judge your answers, but to understand your nature. There are no wrong responses — only choices that reveal who you are.',
    choices: [
      { id: 'serve', label: 'To serve the Emperor faithfully', description: 'The proper answer. Perhaps even sincere.', effect: 'Virtue +1', statBonus: {}, reputationEffect: 'virtue' },
      { id: 'elevate', label: 'To elevate the Wu name', description: 'Honest about your family\'s ambitions.', effect: 'No change — practical', statBonus: {} },
      { id: 'chose', label: 'I chose to come', description: 'Bold. He raises an eyebrow.', effect: 'Resolve +1', statBonus: { resolve: 1 } },
      { id: 'debts', label: 'Because my father\'s debts required it', description: 'Painfully honest. He respects it.', effect: 'Cunning +1', statBonus: { cunning: 1 } },
    ],
  },
  {
    id: 'speech',
    number: 2,
    virtue: 'Speech',
    title: 'The Poetry Recitation',
    location: 'The Library',
    teaches: 'Equipment and dice checks',
    narrative: 'Candidates are gathered in the library. Consort Xu presides. Before you begin, a servant places a writing set before each candidate — brush, ink, paper. You notice your Lotus Petal Brush among your belongings. Equipping it will sharpen your calligraphy.\n\nEquip the brush to your tool slot, then recite your poem. Your Eloquence and Scholarship determine your dice pool — equipment bonuses count.',
    hasEquipStep: true,
    diceCheck: { stats: ['eloquence', 'scholarship'], threshold: 2 },
    choices: [
      { id: 'help-song', label: 'Whisper a hint to Lady Song', description: 'The candidate beside you is frozen with panic. Her brush hasn\'t moved.', effect: 'Virtue +1, Song favor', statBonus: {}, reputationEffect: 'virtue' },
      { id: 'ignore-song', label: 'Stay focused on your own work', description: 'You have your own performance to worry about.', effect: 'No change', statBonus: {} },
      { id: 'lead-song', label: 'Recite loudly so she can follow', description: 'Risky — the examiners might notice. But if it works, you both shine.', effect: 'Eloquence +1 (if brave)', statBonus: { eloquence: 1 } },
    ],
  },
  {
    id: 'deportment',
    number: 3,
    virtue: 'Deportment',
    title: 'The Formal Presentation',
    location: 'Presentation Hall',
    teaches: 'Assigning agents to event slots',
    narrative: 'You are presented before the panel of senior consorts. But this isn\'t just about you — Chunhua stands with you. A maid reflects on her mistress. Assign her to the support slot to strengthen your performance.',
    hasAgentSlot: true,
    diceCheck: { stats: ['beauty', 'discretion'], threshold: 2 },
    choices: [
      { id: 'seat-order', label: 'Pour tea in seat order', description: 'Safe. Nobody notices. But you missed the real test.', effect: 'No change', statBonus: {} },
      { id: 'rank-order', label: 'Pour tea in correct rank order', description: 'The seating was deliberately wrong. You noticed.', effect: 'Scholarship +1, Yang impressed', statBonus: { scholarship: 1 } },
    ],
  },
  {
    id: 'skills',
    number: 4,
    virtue: 'Skills',
    title: 'The Household Test',
    location: 'The Palace Grounds',
    teaches: 'Map with multiple locations and resource management',
    narrative: 'A practical test. You\'re given 2 silver and one day to prepare a gift for the Emperor\'s upcoming birthday. Three workshops are available — but you only have time for two.',
    subLocations: [
      { id: 'silk', name: 'Silk Workshop', stat: 'resourcefulness', threshold: 2, cost: 1 },
      { id: 'calligraphy', name: 'Calligraphy Room', stat: 'scholarship', threshold: 2, cost: 1 },
      { id: 'kitchen', name: 'Palace Kitchen', stat: 'vitality', threshold: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  choices: CreationChoices
  onComplete: (bonusStats: Partial<Record<StatName, number>>) => void
  onSkip: () => void
}

// ---------------------------------------------------------------------------
// Tutorial Component
// ---------------------------------------------------------------------------

export function Tutorial({ choices, onComplete, onSkip }: Props) {
  const [stageIndex, setStageIndex] = useState(0)
  const [bonusStats, setBonusStats] = useState<Partial<Record<StatName, number>>>({})
  const [stageState, setStageState] = useState<'narrative' | 'action' | 'result'>('narrative')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [chunhuaAssigned, setChunhuaAssigned] = useState(false)

  // Dice state
  const [rollConfig, setRollConfig] = useState<DiceRollConfig | null>(null)
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null)

  // Stage 2 equip state
  const [brushEquipped, setBrushEquipped] = useState(false)

  // Stage 4 state
  const [visitedLocations, setVisitedLocations] = useState<string[]>([])
  const [silverSpent, setSilverSpent] = useState(0)
  const [stage4Results, setStage4Results] = useState<Record<string, boolean>>({})

  const stage = STAGES[stageIndex]
  const isLastStage = stageIndex === STAGES.length - 1

  const addBonus = (stat: StatName, amount: number) => {
    setBonusStats(prev => ({ ...prev, [stat]: (prev[stat] ?? 0) + amount }))
  }

  const handleChoicePick = (choice: TutorialChoice) => {
    setSelectedChoice(choice.id)
    if (choice.statBonus) {
      for (const [stat, val] of Object.entries(choice.statBonus)) {
        if (val) addBonus(stat as StatName, val)
      }
    }
    setStageState('result')
  }

  const handleDiceRoll = () => {
    if (!stage.diceCheck) return
    const pool = stage.diceCheck.stats.reduce((sum, s) => {
      // Use base 2 + any bonuses from creation choices for tutorial
      return sum + 2
    }, 0)
    setRollConfig({
      pool: Math.max(1, pool),
      threshold: stage.diceCheck.threshold,
      tier: 'clay',
      difficulty: 'gentle',
      goldenDice: 0,
      eventLabel: stage.title,
    })
  }

  const handleRollSettled = (result: DiceRollResult) => {
    setRollResult(result)
  }

  const handleStage4Location = (locId: string) => {
    const loc = stage.subLocations?.find(l => l.id === locId)
    if (!loc || visitedLocations.includes(locId) || visitedLocations.length >= 2) return
    if (loc.cost && silverSpent + loc.cost > 2) return

    setVisitedLocations(prev => [...prev, locId])
    if (loc.cost) setSilverSpent(prev => prev + loc.cost!)
    // Simplified: auto-succeed for tutorial
    setStage4Results(prev => ({ ...prev, [locId]: true }))
  }

  const advanceStage = () => {
    if (isLastStage) {
      onComplete(bonusStats)
    } else {
      setStageIndex(prev => prev + 1)
      setStageState('narrative')
      setSelectedChoice(null)
      setRollConfig(null)
      setRollResult(null)
      setChunhuaAssigned(false)
      setBrushEquipped(false)
      setVisitedLocations([])
      setSilverSpent(0)
      setStage4Results({})
    }
  }

  return (
    <div className="fixed inset-0 bg-ink flex">
      {/* Left: simplified map / location */}
      <div className="w-1/2 flex flex-col items-center justify-center relative"
        style={{ background: 'radial-gradient(ellipse at center, rgba(26,18,9,1) 0%, rgba(10,6,4,1) 100%)' }}>

        {/* Stage 4: multiple location nodes */}
        {stage.id === 'skills' ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-xs text-silk/30 uppercase tracking-widest mb-2">Choose 2 of 3 locations</div>
            <div className="text-sm text-gold/60 mb-4">Silver remaining: {2 - silverSpent}</div>
            <div className="flex gap-8">
              {stage.subLocations?.map(loc => {
                const visited = visitedLocations.includes(loc.id)
                const succeeded = stage4Results[loc.id]
                const canVisit = !visited && visitedLocations.length < 2 && (!loc.cost || silverSpent + loc.cost <= 2)
                return (
                  <button key={loc.id} onClick={() => handleStage4Location(loc.id)}
                    disabled={!canVisit && !visited}
                    className="flex flex-col items-center gap-2 transition-all"
                    style={{ opacity: canVisit || visited ? 1 : 0.3 }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: visited ? (succeeded ? 'rgba(0,168,107,0.15)' : 'rgba(224,64,48,0.15)') : 'rgba(232,213,176,0.05)',
                        border: `2px solid ${visited ? (succeeded ? 'rgba(0,168,107,0.5)' : 'rgba(224,64,48,0.5)') : canVisit ? 'rgba(255,215,0,0.3)' : 'rgba(232,213,176,0.1)'}`,
                      }}>
                      <span className="text-2xl">{loc.id === 'silk' ? '🧵' : loc.id === 'calligraphy' ? '🖊' : '🍳'}</span>
                    </div>
                    <span className="text-xs text-parchment/70">{loc.name}</span>
                    {loc.cost && <span className="text-[9px] text-gold/40">{loc.cost} silver</span>}
                    {visited && <span className="text-[9px]" style={{ color: succeeded ? '#00a86b' : '#e04030' }}>{succeeded ? '✓' : '✗'}</span>}
                  </button>
                )
              })}
            </div>
            {visitedLocations.length === 2 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-parchment/70 mb-2">
                  Gift prepared: {Object.values(stage4Results).filter(Boolean).length} of 2 components
                </div>
              </div>
            )}
          </div>
        ) : stage.diceCheck && stageState === 'action' ? (
          /* Dice rolling area */
          <div className="w-full h-64">
            <Dice
              rollConfig={rollConfig}
              onRollSettled={handleRollSettled}
              canvasHeight="256px"
              goldenDiceSpent={0}
              displayResult={rollResult}
              onDismiss={() => {}}
            />
          </div>
        ) : (
          /* Location node */
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,215,0,0.08)', border: '2px solid rgba(255,215,0,0.3)' }}>
              <span className="text-3xl">
                {stage.number === 1 ? '🏛' : stage.number === 2 ? '📚' : '🎭'}
              </span>
            </div>
            <span className="text-sm text-gold/60 font-serif">{stage.location}</span>

            {/* Equipment teaching for stage 2 */}
            {stage.hasEquipStep && stageState === 'action' && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="text-xs text-silk/30 uppercase tracking-widest">Equipment</div>
                <button onClick={() => setBrushEquipped(!brushEquipped)}
                  className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: brushEquipped ? 'rgba(0,168,107,0.12)' : 'rgba(232,213,176,0.05)',
                    border: `1px solid ${brushEquipped ? 'rgba(0,168,107,0.4)' : 'rgba(232,213,176,0.15)'}`,
                  }}>
                  <span className="text-lg">🖊</span>
                  <span className="text-[10px] font-serif" style={{ color: brushEquipped ? '#00a86b' : 'rgba(232,213,176,0.4)' }}>
                    Lotus Petal Brush
                  </span>
                  <span className="text-[8px]" style={{ color: brushEquipped ? '#00a86b' : 'rgba(232,213,176,0.25)' }}>
                    {brushEquipped ? '✓ Equipped — Scholarship +1' : 'Click to equip (Tool slot)'}
                  </span>
                </button>
              </div>
            )}

            {/* Agent slot teaching for stage 3 */}
            {stage.hasAgentSlot && stageState === 'action' && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="text-xs text-silk/30 uppercase tracking-widest">Agent Slots</div>
                <div className="flex gap-3">
                  {/* Your slot (mandatory) */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-18 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,215,0,0.1)', border: '2px solid rgba(255,215,0,0.4)' }}>
                      <span className="text-xs text-gold/70">You</span>
                    </div>
                    <span className="text-[8px] text-red-400">required</span>
                  </div>
                  {/* Chunhua slot (optional) */}
                  <button onClick={() => setChunhuaAssigned(!chunhuaAssigned)}
                    className="flex flex-col items-center gap-1">
                    <div className="w-14 h-18 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: chunhuaAssigned ? 'rgba(205,127,50,0.15)' : 'rgba(232,213,176,0.05)',
                        border: `2px dashed ${chunhuaAssigned ? 'rgba(205,127,50,0.5)' : 'rgba(232,213,176,0.15)'}`,
                      }}>
                      <span className="text-xs" style={{ color: chunhuaAssigned ? '#cd7f32' : 'rgba(232,213,176,0.3)' }}>
                        {chunhuaAssigned ? 'CH' : '+'}
                      </span>
                    </div>
                    <span className="text-[8px] text-silk/30">optional</span>
                  </button>
                </div>
                {chunhuaAssigned && (
                  <div className="text-[10px] text-silk/40 mt-1">Chunhua adds her stats to your pool</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mechanic being taught */}
        <div className="absolute bottom-6 text-center">
          <div className="text-[9px] uppercase tracking-widest text-silk/20 mb-1">This stage teaches</div>
          <div className="text-xs text-gold/50">{stage.teaches}</div>
        </div>
      </div>

      {/* Right: narrative + choices */}
      <div className="w-1/2 flex flex-col border-l" style={{ borderColor: 'rgba(232,213,176,0.08)' }}>
        {/* Stage header */}
        <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(232,213,176,0.08)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-serif text-lg text-parchment">{stage.title}</div>
                <div className="text-xs text-silk/30">{stage.virtue} — Stage {stage.number} of 4</div>
              </div>
            </div>
            <button onClick={onSkip} className="text-[10px] text-silk/20 hover:text-silk/50 transition-colors">skip tutorial</button>
          </div>
          {/* Progress */}
          <div className="flex gap-1">
            {STAGES.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full"
                style={{ background: i <= stageIndex ? 'rgba(255,215,0,0.6)' : 'rgba(232,213,176,0.1)' }} />
            ))}
          </div>
        </div>

        {/* Narrative content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {stageState === 'narrative' && (
            <div>
              <p className="text-sm text-silk/60 leading-relaxed font-serif italic mb-6">{stage.narrative}</p>
              <button onClick={() => setStageState('action')}
                className="px-5 py-2.5 rounded-lg font-serif text-sm transition-all hover:brightness-125"
                style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.8)' }}>
                Begin →
              </button>
            </div>
          )}

          {stageState === 'action' && stage.id === 'skills' && (
            <div>
              <p className="text-sm text-silk/50 leading-relaxed mb-4">
                Select two locations on the map to prepare your gift. Each requires a skill check and may cost silver.
                You cannot visit all three — choose wisely.
              </p>
              {visitedLocations.length >= 2 && (
                <button onClick={() => setStageState('result')}
                  className="px-5 py-2.5 rounded-lg font-serif text-sm transition-all hover:brightness-125"
                  style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.8)' }}>
                  Present your gift →
                </button>
              )}
            </div>
          )}

          {stageState === 'action' && stage.choices && stage.id !== 'skills' && !stage.diceCheck && (
            <div className="space-y-2">
              {stage.choices.map(choice => (
                <button key={choice.id}
                  className="w-full text-left rounded-lg p-3 transition-all hover:brightness-110"
                  style={{ background: 'rgba(255,180,0,0.05)', border: '1px solid rgba(255,180,0,0.15)' }}
                  onClick={() => handleChoicePick(choice)}>
                  <div className="font-serif text-sm" style={{ color: 'rgba(255,200,60,0.85)' }}>{choice.label}</div>
                  <div className="text-[10px] text-silk/40 mt-0.5">{choice.description}</div>
                  <div className="text-[9px] mt-1" style={{ color: 'rgba(0,200,120,0.6)' }}>{choice.effect}</div>
                </button>
              ))}
            </div>
          )}

          {stageState === 'action' && stage.diceCheck && !rollResult && (
            <div>
              <p className="text-sm text-silk/50 leading-relaxed mb-4">
                Your dice pool is formed from {stage.diceCheck.stats.map(s => STAT_LABELS[s].en).join(' + ')}.
                You need {stage.diceCheck.threshold} successes.
              </p>
              {!rollConfig && (
                <button onClick={handleDiceRoll}
                  className="px-5 py-2.5 rounded-lg font-serif text-sm transition-all hover:brightness-125"
                  style={{ background: 'rgba(204,43,0,0.15)', border: '1px solid rgba(204,43,0,0.4)', color: 'rgba(230,100,70,0.9)' }}>
                  Roll dice
                </button>
              )}
            </div>
          )}

          {stageState === 'action' && stage.diceCheck && rollResult && !selectedChoice && stage.choices && (
            <div>
              <div className="mb-4">
                <div className="text-lg font-serif font-bold"
                  style={{ color: rollResult.isSuccess ? '#00a86b' : '#e04030' }}>
                  {rollResult.isSuccess ? '✓ Success' : '✗ Failed'}
                </div>
                <div className="text-xs text-silk/40">{rollResult.successes} of {stage.diceCheck.threshold} needed</div>
              </div>
              <div className="text-xs text-silk/30 uppercase tracking-widest mb-2">Then...</div>
              <div className="space-y-2">
                {stage.choices.map(choice => (
                  <button key={choice.id}
                    className="w-full text-left rounded-lg p-3 transition-all hover:brightness-110"
                    style={{ background: 'rgba(255,180,0,0.05)', border: '1px solid rgba(255,180,0,0.15)' }}
                    onClick={() => handleChoicePick(choice)}>
                    <div className="font-serif text-sm" style={{ color: 'rgba(255,200,60,0.85)' }}>{choice.label}</div>
                    <div className="text-[10px] text-silk/40 mt-0.5">{choice.description}</div>
                    <div className="text-[9px] mt-1" style={{ color: 'rgba(0,200,120,0.6)' }}>{choice.effect}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stageState === 'result' && (
            <div className="flex flex-col items-center text-center gap-4 pt-8">
              {selectedChoice && (
                <div className="text-sm text-silk/50 italic font-serif">
                  {stage.choices?.find(c => c.id === selectedChoice)?.description}
                </div>
              )}
              {stage.id === 'skills' && (
                <div className="text-sm text-silk/50">
                  {Object.values(stage4Results).filter(Boolean).length >= 2
                    ? 'An excellent gift. Consort Yang is impressed.'
                    : Object.values(stage4Results).filter(Boolean).length === 1
                    ? 'An adequate gift. You pass.'
                    : 'A modest offering. There\'s no penalty — but no praise either.'}
                </div>
              )}
              <button onClick={advanceStage}
                className="px-6 py-2.5 rounded-lg font-serif text-sm font-semibold transition-all hover:brightness-125 mt-4"
                style={{
                  background: isLastStage ? 'rgba(255,215,0,0.15)' : 'rgba(232,213,176,0.1)',
                  border: `1px solid ${isLastStage ? 'rgba(255,215,0,0.4)' : 'rgba(232,213,176,0.2)'}`,
                  color: isLastStage ? 'rgba(255,215,0,0.9)' : 'rgba(232,213,176,0.7)',
                }}>
                {isLastStage ? 'Enter the Palace →' : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
