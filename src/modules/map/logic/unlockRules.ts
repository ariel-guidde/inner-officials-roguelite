// Pure functions — no React, no store imports.
// Takes game state slices and returns which locations should be unlocked/visible.

import type { HaremRank, LocationId, ReputationState } from '@core/types'

interface UnlockInput {
  haremRank: HaremRank
  reputation: ReputationState
  currentDay: number
  isFestivalActive?: boolean
}

/** Returns the set of location IDs that should be unlocked given current state. */
export function getUnlockedNodes(input: UnlockInput): Set<LocationId> {
  const { haremRank, reputation, isFestivalActive = false } = input
  const unlocked = new Set<LocationId>()

  // Always unlocked
  unlocked.add('chambers')
  unlocked.add('innerCourt')
  unlocked.add('householdOffice')
  unlocked.add('imperialLibrary')

  // Rank-gated
  if (haremRank <= 7) unlocked.add('imperialGardens')  // rank 7 Jieyu+

  // Reputation-gated
  if (reputation.shadowReach >= 3) {
    unlocked.add('wuFamilyNetwork')
    unlocked.add('eunuchQuarter')
  }
  if (reputation.shadowReach >= 5) {
    unlocked.add('tradeQuarter')
  }
  if (reputation.virtue >= 3) {
    unlocked.add('buddhistTemple')
  }

  // Emperor's Quarters — invitation only (controlled by active events, not unlocked statically)
  // Leave locked here; the game shell unlocks it when an invitation event is active.

  // Physician — unlocks when any agent has an injury/illness (handled by game shell)
  unlocked.add('palacePhysician') // always visible, always accessible

  // Festival grounds — only during festivals
  if (isFestivalActive) unlocked.add('festivalGrounds')

  return unlocked
}

/** Returns locations that are visible but not yet accessible (grayed out hint). */
export function getVisibleNodes(input: UnlockInput): Set<LocationId> {
  const visible = getUnlockedNodes(input)

  // Visible before unlocked (show them grayed)
  if (input.reputation.shadowReach >= 1) {
    visible.add('wuFamilyNetwork')
    visible.add('eunuchQuarter')
  }
  visible.add('tradeQuarter')
  visible.add('buddhistTemple')
  visible.add('imperialGardens')

  return visible
}
