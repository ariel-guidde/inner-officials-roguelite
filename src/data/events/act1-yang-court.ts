// =============================================================================
// Act 1 — Consort Yang's Court (杨妃理事)
// Gatekeeper storyline. Yang evaluates you and controls access to the court.
// =============================================================================

import { defineEvent } from './eventFactory'

export const YANG_TEA = defineEvent({
  id: 'yang-tea',
  storylineId: 'yang-court',
  title: 'Summoned to Tea',
  description:
    'Consort Yang summons all new concubines to the Imperial Gardens. She pours tea with exacting grace, studying each face. This is not hospitality — it is inspection.',
  type: 'social',
  location: 'imperialGardens',
  stats: ['beauty', 'eloquence'],
  threshold: 2,
  urgency: 'opportunity',
  expiry: 3,
  forced: true,
  weight: 5,
  prerequisites: [{ kind: 'dayMin', day: 5 }],
  slots: [
    { id: 'yang-tea-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'yang-tea-approach',
    timing: 'before-roll',
    prompt: 'Yang watches you over the rim of her cup. How do you present yourself?',
    choices: [
      {
        id: 'yang-tea-defer',
        label: 'Deferential and quiet',
        overrideThreshold: 1,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'yang-tea-competent',
        label: 'Competent and useful',
        description: 'Show her you can be an asset, not merely decoration.',
      },
      {
        id: 'yang-tea-bold',
        label: 'Bold and memorable',
        overrideThreshold: 3,
        moralWeight: { imperialFavor: 1 },
      },
    ],
  },
  graphEdges: {
    success: ['yang-assignment'],
    choiceEdges: [
      { choiceId: 'yang-tea-competent', success: ['yang-assignment'] },
    ],
  },
})

export const YANG_ASSIGNMENT = defineEvent({
  id: 'yang-assignment',
  storylineId: 'yang-court',
  title: 'The Silk Discrepancy',
  description:
    'Yang tasks you with auditing the silk allocation for junior consorts. Someone is skimming — find out who.',
  type: 'estateManagement',
  location: 'householdOffice',
  stats: ['cunning', 'resourcefulness'],
  threshold: 2,
  duration: 2,
  urgency: 'timed',
  expiry: 5,
  weight: 3,
  prerequisites: [
    { kind: 'eventResolved', defId: 'yang-tea', resolution: 'success' },
    { kind: 'choiceMade', eventDefId: 'yang-tea', choiceId: 'yang-tea-competent' },
  ],
  slots: [
    { id: 'yang-assign-s1', isMandatory: true, requiredTags: ['protagonist'] },
    { id: 'yang-assign-s2', isMandatory: false, requiredTags: ['follower'] },
  ],
  dilemma: {
    id: 'yang-assignment-maid',
    timing: 'after-success',
    prompt: 'You catch the thieving maid red-handed. What do you do with her?',
    choices: [
      {
        id: 'yang-assign-report',
        label: 'Report her to Yang',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'yang-assign-confront',
        label: 'Confront her privately',
        overrideStats: ['cunning', 'discretion'],
        overrideThreshold: 2,
        moralWeight: { shadowReach: 1 },
      },
      {
        id: 'yang-assign-leverage',
        label: 'Keep the evidence for yourself',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 1 },
      },
    ],
  },
  graphEdges: { success: ['yang-warning'] },
})

export const YANG_WARNING = defineEvent({
  id: 'yang-warning',
  storylineId: 'yang-court',
  title: "Yang's Warning",
  description:
    'Yang pulls you aside among the plum trees. Her voice is soft but her words cut: "The princes are dragons. A cairen who reaches for a dragon gets burned."',
  type: 'social',
  location: 'imperialGardens',
  stats: ['discretion'],
  threshold: 0,
  urgency: 'routine',
  forced: true,
  weight: 4,
  prerequisites: [
    { kind: 'reputationMin', metric: 'imperialFavor', value: 2 },
    { kind: 'dayMin', day: 10 },
  ],
  slots: [
    { id: 'yang-warn-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  graphEdges: { success: ['yang-favor-returned'] },
})

export const YANG_FAVOR_RETURNED = defineEvent({
  id: 'yang-favor-returned',
  storylineId: 'yang-court',
  title: 'A Favor Returned',
  description:
    'Yang asks you to repay her patronage — by abandoning your prince. Her tone is gentle, her meaning absolute.',
  type: 'social',
  location: 'innerCourt',
  stats: ['eloquence', 'resolve'],
  threshold: 2,
  urgency: 'timed',
  expiry: 3,
  weight: 4,
  prerequisites: [
    { kind: 'eventResolved', defId: 'yang-warning' },
    { kind: 'reputationMin', metric: 'imperialFavor', value: 3 },
  ],
  slots: [
    { id: 'yang-favor-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'yang-favor-choice',
    timing: 'standalone',
    prompt: 'Yang waits for your answer. Her silence is heavier than any command.',
    choices: [
      {
        id: 'yang-favor-obey',
        label: 'Obey her',
        skipDiceRoll: true,
        moralWeight: { virtue: 1, imperialFavor: 2 },
      },
      {
        id: 'yang-favor-refuse',
        label: 'Refuse respectfully',
        skipDiceRoll: true,
        moralWeight: { imperialFavor: -1 },
      },
      {
        id: 'yang-favor-lie',
        label: 'Lie to her face',
        overrideStats: ['discretion'],
        overrideThreshold: 3,
        moralWeight: { ruthlessness: 1, shadowReach: 1 },
      },
    ],
  },
})

export const YANG_COURT_EVENTS = [
  YANG_TEA,
  YANG_ASSIGNMENT,
  YANG_WARNING,
  YANG_FAVOR_RETURNED,
]
