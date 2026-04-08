// =============================================================================
// Game.tsx — Main game component
// Manages phases: creation → tutorial → gameplay
// This is what the real product looks like (not the dev playground).
// =============================================================================

import { useState, useCallback } from 'react'
import type { StatName } from '@core/types'
import { CharacterCreation } from './phases/CharacterCreation'
import { Tutorial } from './phases/Tutorial'
import { GamePlay } from './phases/GamePlay'
import {
  BASE_STATS,
  FAMILY_BACKGROUNDS, EDUCATIONS, DISPOSITIONS, MAID_ARCHETYPES,
  type CreationChoices,
} from './data/creationData'

type GamePhase = 'title' | 'creation' | 'tutorial' | 'playing'

export function Game() {
  const [phase, setPhase] = useState<GamePhase>('title')
  const [creationChoices, setCreationChoices] = useState<CreationChoices | null>(null)
  const [finalStats, setFinalStats] = useState<Record<StatName, number> | null>(null)

  const buildStats = useCallback((choices: CreationChoices, tutorialBonuses?: Partial<Record<StatName, number>>) => {
    const stats = { ...BASE_STATS } as Record<StatName, number>
    // Layer 1: background
    for (const [k, v] of Object.entries(choices.background.statBonuses)) {
      stats[k as StatName] += v
    }
    // Layer 2: educations
    for (const ed of choices.educations) {
      stats[ed.stat] += 1
    }
    // Tutorial bonuses
    if (tutorialBonuses) {
      for (const [k, v] of Object.entries(tutorialBonuses)) {
        stats[k as StatName] += v
      }
    }
    return stats
  }, [])

  const handleCreationComplete = useCallback((choices: CreationChoices) => {
    setCreationChoices(choices)
    setPhase('tutorial')
  }, [])

  const handleCreationSkip = useCallback(() => {
    // Quick start with defaults
    const defaults: CreationChoices = {
      background: FAMILY_BACKGROUNDS[0],
      educations: [EDUCATIONS[0], EDUCATIONS[1]],
      disposition: DISPOSITIONS[0],
      maidArchetype: MAID_ARCHETYPES[0],
    }
    setCreationChoices(defaults)
    setFinalStats(buildStats(defaults))
    setPhase('playing')
  }, [buildStats])

  const handleTutorialComplete = useCallback((bonusStats: Partial<Record<StatName, number>>) => {
    if (!creationChoices) return
    setFinalStats(buildStats(creationChoices, bonusStats))
    setPhase('playing')
  }, [creationChoices, buildStats])

  const handleTutorialSkip = useCallback(() => {
    if (!creationChoices) return
    setFinalStats(buildStats(creationChoices))
    setPhase('playing')
  }, [creationChoices, buildStats])

  if (phase === 'title') {
    return <TitleScreen onNewGame={() => setPhase('creation')} onSkipToGame={handleCreationSkip} />
  }

  if (phase === 'creation') {
    return <CharacterCreation onComplete={handleCreationComplete} onSkip={handleCreationSkip} />
  }

  if (phase === 'tutorial' && creationChoices) {
    return <Tutorial choices={creationChoices} onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
  }

  if (phase === 'playing' && finalStats && creationChoices) {
    return (
      <GamePlay
        stats={finalStats}
        silver={creationChoices.background.silver}
        choices={creationChoices}
      />
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// Title Screen
// ---------------------------------------------------------------------------

function TitleScreen({ onNewGame, onSkipToGame }: { onNewGame: () => void; onSkipToGame: () => void }) {
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
        <button onClick={onNewGame}
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
      <div className="absolute bottom-4 text-[10px] text-silk/10">v0.1.0 — Act 1: Taizong's Court</div>
    </div>
  )
}
