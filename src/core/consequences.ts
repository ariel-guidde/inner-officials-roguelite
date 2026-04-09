// =============================================================================
// Consequence processor — the SINGLE place that applies consequences.
// Takes a list of Consequence objects + current state, returns actions + narrative.
// Called by the game loop after event resolution or dilemma choice.
// =============================================================================

import type { Consequence, ReputationState } from './types'
import type { GameAction, GameState } from './gameState'
import type { NarrativeEntry } from '@modules/narrative'

export interface ConsequenceResult {
  actions: GameAction[]
  narrativeEntries: NarrativeEntry[]
}

export function processConsequences(
  consequences: Consequence[],
  state: GameState,
  source: string, // e.g. "event:yang-tea" or "dilemma:yang-tea-dilemma:yang-honesty"
): ConsequenceResult {
  const actions: GameAction[] = []
  const narrativeEntries: NarrativeEntry[] = []
  const day = state.currentDay

  for (const c of consequences) {
    switch (c.kind) {
      case 'silver':
        actions.push({ type: 'CHANGE_SILVER', delta: c.amount })
        narrativeEntries.push({ day, kind: 'silver_change', amount: c.amount, source })
        break

      case 'intelligence':
        actions.push({ type: 'ADD_INTELLIGENCE', intelType: c.type, tier: 'clay', amount: c.amount })
        narrativeEntries.push({ day, kind: 'intelligence_acquired', intelType: c.type, tier: 'clay', source })
        break

      case 'goldenDice':
        actions.push({ type: 'CHANGE_GOLDEN_DICE', delta: c.amount })
        break

      case 'equipment':
        actions.push({ type: 'ADD_EQUIPMENT', equipmentId: c.equipmentId })
        narrativeEntries.push({ day, kind: 'equipment_acquired', equipmentId: c.equipmentId, source })
        break

      case 'condition': {
        const agent = state.agents[c.agentId]
        if (agent && !agent.conditions.includes(c.condition)) {
          actions.push({
            type: 'UPDATE_AGENT',
            agentId: c.agentId,
            patch: { conditions: [...agent.conditions, c.condition] },
          })
          narrativeEntries.push({ day, kind: 'condition_gained', agentId: c.agentId, condition: c.condition })
        }
        break
      }

      case 'removeCondition': {
        const agent2 = state.agents[c.agentId]
        if (agent2) {
          actions.push({
            type: 'UPDATE_AGENT',
            agentId: c.agentId,
            patch: { conditions: agent2.conditions.filter(cond => cond !== c.condition) },
          })
          narrativeEntries.push({ day, kind: 'condition_removed', agentId: c.agentId, condition: c.condition })
        }
        break
      }

      case 'unlockLocation':
        // TODO: implement location unlock in map nodes
        break

      case 'relationship':
        narrativeEntries.push({ day, kind: 'prince_interaction', princeId: c.npcId, nature: `relationship ${c.delta > 0 ? '+' : ''}${c.delta}` })
        break

      case 'narrative':
        narrativeEntries.push({ day, kind: 'day_note', text: c.text })
        break

      case 'triggerEvent':
        // Events don't trigger directly — they become eligible through prerequisites.
        // Record the intent so prerequisite evaluation can pick it up.
        narrativeEntries.push({ day, kind: 'day_note', text: `Event triggered: ${c.eventId}` })
        break

      case 'rerolls':
        // TODO: implement reroll resource
        break
    }
  }

  return { actions, narrativeEntries }
}

/**
 * Process reputation changes and generate narrative entries for milestones.
 */
export function processReputationChange(
  deltas: Partial<ReputationState>,
  state: GameState,
  source: string,
): ConsequenceResult {
  const actions: GameAction[] = [{ type: 'CHANGE_REPUTATION', deltas }]
  const narrativeEntries: NarrativeEntry[] = []
  const day = state.currentDay

  const milestones = [3, 5, 10, 15, 20]
  for (const [metric, delta] of Object.entries(deltas)) {
    if (!delta || delta === 0) continue
    const oldVal = state.reputation[metric as keyof ReputationState] ?? 0
    const newVal = oldVal + delta
    narrativeEntries.push({ day, kind: 'reputation_change', metric, oldValue: oldVal, newValue: newVal })

    // Check milestone crossings
    for (const m of milestones) {
      if (oldVal < m && newVal >= m) {
        narrativeEntries.push({ day, kind: 'reputation_milestone', metric, value: m })
      }
    }
  }

  return { actions, narrativeEntries }
}
