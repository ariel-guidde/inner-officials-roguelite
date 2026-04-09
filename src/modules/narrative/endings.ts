// =============================================================================
// Ending calculator — analyzes the narrative log to determine the ending.
// Called when Taizong's health hits 0 (or the game otherwise ends).
// =============================================================================

import type { GameState } from '@core/gameState'
import type { NarrativeIndex } from './types'
import { buildIndex, countPrinceInteractions, getEntriesByKind } from './narrativeIndex'

export interface EndingResult {
  id: string
  title: string
  summary: string
  details: string[]
}

export function calculateEnding(state: GameState): EndingResult {
  const index = buildIndex(state.narrativeLog)
  const details: string[] = []

  // Count prince interactions
  const chengqianCount = countPrinceInteractions(index, 'chengqian')
  const taiCount = countPrinceInteractions(index, 'tai')
  const zhiCount = countPrinceInteractions(index, 'zhi')
  const dominantPrince =
    zhiCount > taiCount && zhiCount > chengqianCount ? 'zhi'
    : taiCount > chengqianCount ? 'tai'
    : chengqianCount > 0 ? 'chengqian'
    : null

  // Check for a son (pregnancy → resolved successfully)
  const hasSon = getEntriesByKind(index, 'event_resolved')
    .some(e => e.kind === 'event_resolved' && e.eventId.includes('pregnancy') && e.resolution === 'success')

  // Reputation summary
  const rep = state.reputation
  const highestRep = Object.entries(rep)
    .filter(([k]) => k !== 'slander')
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]

  // Rank achieved
  const rankAchieved = state.haremRank

  // Build details
  details.push(`Survived ${state.currentDay} days in the palace.`)
  details.push(`Reached rank ${rankAchieved}.`)

  if (highestRep && (highestRep[1] as number) > 0) {
    details.push(`Known for ${highestRep[0]} (${highestRep[1]}).`)
  }

  if (dominantPrince) {
    const princeName = dominantPrince === 'zhi' ? 'Prince Zhi' : dominantPrince === 'tai' ? 'Prince Tai' : 'Prince Chengqian'
    details.push(`Closest to ${princeName} (${Math.max(chengqianCount, taiCount, zhiCount)} interactions).`)
  }

  const agentCount = Object.keys(state.agents).length
  details.push(`${agentCount} agents in your service.`)

  const totalEvents = getEntriesByKind(index, 'event_resolved').length
  details.push(`${totalEvents} events resolved.`)

  const choicesMade = getEntriesByKind(index, 'choice_made').length
  details.push(`${choicesMade} decisions made.`)

  // Determine ending
  if (state.taizongHealth <= 0) {
    // Emperor died
    if (hasSon) {
      return {
        id: 'dowager',
        title: 'The Dowager',
        summary: 'The Emperor is dead. But you carry his blood. No one can send you away.',
        details,
      }
    }

    if (dominantPrince && Math.max(chengqianCount, taiCount, zhiCount) >= 3) {
      const princeName = dominantPrince === 'zhi' ? 'Prince Zhi' : dominantPrince === 'tai' ? 'Prince Tai' : 'Prince Chengqian'
      return {
        id: `recalled-${dominantPrince}`,
        title: 'Recalled from the Nunnery',
        summary: `The nunnery walls closed around you. Then a messenger arrived. ${princeName} remembered.`,
        details,
      }
    }

    return {
      id: 'nunnery',
      title: 'The Nunnery',
      summary: 'The Emperor is dead. You are sent to Ganye Temple with the other childless concubines. No one comes for you.',
      details,
    }
  }

  // Game ended for other reasons
  if (rep.slander >= 3) {
    return {
      id: 'disgraced',
      title: 'Disgraced',
      summary: 'The slander was too much. You were stripped of rank and confined.',
      details,
    }
  }

  return {
    id: 'survived',
    title: 'The Palace Endures',
    summary: 'The days continue. The palace remembers what you did — and what you chose not to do.',
    details,
  }
}
