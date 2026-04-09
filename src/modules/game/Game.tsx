// =============================================================================
// Game.tsx — Main game component
// Manages phases: creation -> tutorial -> gameplay
// Wraps everything in GameStateProvider so all children share context.
// =============================================================================

import { useState, useCallback } from 'react'
import type { StatName, StatBlock, AgentTier, Agent } from '@core/types'
import { RANK_TITLES } from '@core/types'
import { GameStateProvider, useGameState } from '@core/GameStateContext'
import { STARTING_EQUIPMENT } from '@data/equipment'
import { CharacterCreation } from './phases/CharacterCreation'
import { Tutorial } from './phases/Tutorial'
import { GamePlay } from './phases/GamePlay'
import {
  BASE_STATS,
  FAMILY_BACKGROUNDS, EDUCATIONS, PASSIONS,
  type CreationChoices,
} from './data/creationData'

// ---------------------------------------------------------------------------
// Inner component that can use the context
// ---------------------------------------------------------------------------

function GameInner() {
  const { state, dispatch } = useGameState()
  const phase = state.phase

  const [creationChoices, setCreationChoices] = useState<CreationChoices | null>(null)

  const buildStats = useCallback((choices: CreationChoices, tutorialBonuses?: Partial<Record<StatName, number>>) => {
    const stats = { ...BASE_STATS } as Record<StatName, number>
    for (const [k, v] of Object.entries(choices.background.statBonus)) {
      stats[k as StatName] += v
    }
    stats[choices.education.stat] += 1
    stats[choices.passion.stat] += 1
    if (tutorialBonuses) {
      for (const [k, v] of Object.entries(tutorialBonuses)) {
        stats[k as StatName] += v
      }
    }
    return stats
  }, [])

  /** Initialize the game state for a set of creation choices + final stats. */
  const initializeGameState = useCallback((choices: CreationChoices, stats: Record<StatName, number>) => {
    const haremRank = 9
    const rankTitle = RANK_TITLES[haremRank].en.split(' — ')[0]

    // Add protagonist
    const protagonist: Agent = {
      id: 'protagonist-wu',
      name: `${rankTitle} Wu`,
      portraitId: 'Concubine1',
      tier: 'bronze' as AgentTier,
      stats: { ...stats } as StatBlock,
      conditions: [],
      tags: ['female', 'concubine', 'protagonist'],
      isProtagonist: true,
      haremRank,
    }
    dispatch({ type: 'ADD_AGENT', agent: protagonist })

    // Add Chunhua — background affects her lean
    const chunhuaStats: StatBlock = {
      beauty: 2, cunning: 1, eloquence: 1, discretion: 1,
      resolve: 1, vitality: 1, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
    }
    for (const [k, v] of Object.entries(choices.background.chunhuaLean)) {
      (chunhuaStats as Record<string, number>)[k] = (chunhuaStats as Record<string, number>)[k] + v
    }
    const chunhua: Agent = {
      id: 'chunhua',
      name: 'Chunhua',
      portraitId: 'Servant 1',
      tier: 'bronze' as AgentTier,
      stats: chunhuaStats,
      conditions: [],
      tags: ['female', 'servant', 'maid', 'follower'],
    }
    dispatch({ type: 'ADD_AGENT', agent: chunhua })

    // Add starting equipment
    for (const eq of STARTING_EQUIPMENT) {
      dispatch({ type: 'ADD_EQUIPMENT', equipmentId: eq.id })
    }

    // Calligraphy education gives starting brush
    if (choices.education.id === 'calligraphy') {
      dispatch({ type: 'ADD_EQUIPMENT', equipmentId: 'tool-lotus-brush' })
    }

    // Set silver from background
    dispatch({ type: 'CHANGE_SILVER', delta: choices.background.silver - 3 })

    // Set initial intelligence (1 clay gossip)
    dispatch({ type: 'ADD_INTELLIGENCE', intelType: 'gossip', tier: 'clay', amount: 1 })

    // Transition to playing
    dispatch({ type: 'SET_PHASE', phase: 'playing' })
  }, [dispatch])

  const handleCreationComplete = useCallback((choices: CreationChoices) => {
    setCreationChoices(choices)
    dispatch({ type: 'SET_PHASE', phase: 'tutorial' })
  }, [dispatch])

  const handleCreationSkip = useCallback(() => {
    const defaults: CreationChoices = {
      background: FAMILY_BACKGROUNDS[0],
      education: EDUCATIONS[0],
      passion: PASSIONS[0],
    }
    setCreationChoices(defaults)
    const stats = buildStats(defaults)
    initializeGameState(defaults, stats)
  }, [buildStats, initializeGameState])

  const handleTutorialComplete = useCallback((bonusStats: Partial<Record<StatName, number>>) => {
    if (!creationChoices) return
    const stats = buildStats(creationChoices, bonusStats)
    initializeGameState(creationChoices, stats)
  }, [creationChoices, buildStats, initializeGameState])

  const handleTutorialSkip = useCallback(() => {
    if (!creationChoices) return
    const stats = buildStats(creationChoices)
    initializeGameState(creationChoices, stats)
  }, [creationChoices, buildStats, initializeGameState])

  if (phase === 'creation') {
    return <TitleOrCreation
      onSkipToGame={handleCreationSkip}
      onCreationComplete={handleCreationComplete}
    />
  }

  if (phase === 'tutorial' && creationChoices) {
    return <Tutorial choices={creationChoices} onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
  }

  if (phase === 'playing') {
    return <GamePlay />
  }

  // Ending or unknown phase — show title
  return <TitleOrCreation
    onSkipToGame={handleCreationSkip}
    onCreationComplete={handleCreationComplete}
  />
}

// ---------------------------------------------------------------------------
// TitleOrCreation — handles title screen + creation flow
// ---------------------------------------------------------------------------

function TitleOrCreation({ onSkipToGame, onCreationComplete }: {
  onSkipToGame: () => void
  onCreationComplete: (choices: CreationChoices) => void
}) {
  const [showingCreation, setShowingCreation] = useState(false)

  if (showingCreation) {
    return <CharacterCreation onComplete={onCreationComplete} onSkip={onSkipToGame} />
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center top, rgba(26,18,9,1) 0%, rgba(5,3,1,1) 70%)' }}>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl text-gold mb-2" style={{ textShadow: '0 0 40px rgba(255,215,0,0.2)' }}>
          Inner Officials
        </h1>
        <div className="font-serif text-lg text-silk/30 tracking-widest">The Inner Court</div>
        <div className="text-xs text-silk/15 mt-4 max-w-md leading-relaxed">
          The Tang Dynasty imperial court. A young woman enters the palace.
          What she becomes is up to you.
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3 w-64">
        <button onClick={() => setShowingCreation(true)}
          className="px-6 py-3 rounded-lg font-serif text-base transition-all hover:brightness-125"
          style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'rgba(255,215,0,0.85)',
          }}>
          New Game
        </button>
        <button onClick={onSkipToGame}
          className="px-6 py-3 rounded-lg font-serif text-sm transition-all hover:brightness-125"
          style={{
            background: 'rgba(232,213,176,0.05)',
            border: '1px solid rgba(232,213,176,0.1)',
            color: 'rgba(232,213,176,0.4)',
          }}>
          Quick Start
        </button>
      </div>

      {/* Version */}
      <div className="absolute bottom-4 text-[10px] text-silk/10">v0.1.0 -- Act 1: Taizong's Court</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root export — wraps everything in the provider
// ---------------------------------------------------------------------------

export function Game({ children }: { children?: React.ReactNode }) {
  return (
    <GameStateProvider>
      <GameInner />
      {children}
    </GameStateProvider>
  )
}
