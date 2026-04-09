// =============================================================================
// Act 1 — The Elixir Question (丹药之惑)
// Taizong's health. Moral dilemma: save the Emperor or let him die?
// =============================================================================

import { defineEvent } from './eventFactory'

export const ELIXIR_COUGHING = defineEvent({
  id: 'elixir-coughing',
  storylineId: 'elixir-question',
  title: 'The Coughing Emperor',
  description:
    'At morning audience the Emperor doubles over, coughing into his sleeve. The court pretends not to notice. Only Taoist Master Sun looks pleased.',
  type: 'investigation',
  location: 'innerCourt',
  stats: ['discretion'],
  threshold: 0,
  urgency: 'routine',
  weight: 3,
  prerequisites: [{ kind: 'dayMin', day: 8 }],
  slots: [
    { id: 'elixir-cough-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  graphEdges: { success: ['elixir-sulfur'] },
})

export const ELIXIR_SULFUR = defineEvent({
  id: 'elixir-sulfur',
  storylineId: 'elixir-question',
  title: 'The Sulfur Smell',
  description:
    'You visit the physician\'s wing for a minor complaint. The air reeks of sulfur. Dr. Sun flinches when you mention it.',
  type: 'investigation',
  location: 'palacePhysician',
  stats: ['cunning', 'scholarship'],
  threshold: 2,
  urgency: 'opportunity',
  expiry: 5,
  weight: 3,
  prerequisites: [
    { kind: 'eventResolved', defId: 'elixir-coughing' },
  ],
  slots: [
    { id: 'elixir-sulfur-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  graphEdges: { success: ['elixir-investigate'] },
})

export const ELIXIR_INVESTIGATE = defineEvent({
  id: 'elixir-investigate',
  storylineId: 'elixir-question',
  title: 'Investigating the Elixirs',
  description:
    'Ancient texts, coded recipes, traces of mercury and lead. The longevity elixirs are killing the Emperor one dose at a time.',
  type: 'investigation',
  location: 'imperialLibrary',
  stats: ['scholarship', 'cunning'],
  threshold: 3,
  duration: 2,
  urgency: 'timed',
  expiry: 6,
  weight: 3,
  prerequisites: [
    { kind: 'eventResolved', defId: 'elixir-sulfur', resolution: 'success' },
  ],
  slots: [
    { id: 'elixir-inv-s1', isMandatory: true, requiredTags: ['protagonist'] },
    { id: 'elixir-inv-s2', isMandatory: false, requiredTags: ['scholar'] },
  ],
  dilemma: {
    id: 'elixir-knowledge',
    timing: 'standalone',
    prompt: 'You hold proof the Emperor is being slowly poisoned. The knowledge burns in your hands.',
    choices: [
      {
        id: 'elixir-tell-emperor',
        label: 'Tell the Emperor directly',
        overrideStats: ['resolve', 'eloquence'],
        overrideThreshold: 4,
        moralWeight: { virtue: 1, imperialFavor: 3 },
      },
      {
        id: 'elixir-tell-yang',
        label: 'Tell Consort Yang',
        skipDiceRoll: true,
        moralWeight: { imperialFavor: 2 },
      },
      {
        id: 'elixir-tell-zhi',
        label: 'Tell Prince Zhi',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'elixir-tell-tai',
        label: 'Tell Prince Tai',
        skipDiceRoll: true,
        moralWeight: { shadowReach: 1 },
      },
      {
        id: 'elixir-keep-silent',
        label: 'Keep silent and let fate decide',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 1 },
      },
      {
        id: 'elixir-help-taoists',
        label: 'Supply Master Sun with rarer herbs',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 2, shadowReach: 1 },
        cost: { silver: 5 },
      },
    ],
  },
  graphEdges: {
    choiceEdges: [
      { choiceId: 'elixir-tell-emperor', success: ['elixir-garden-walk'] },
    ],
  },
})

export const ELIXIR_GARDEN_WALK = defineEvent({
  id: 'elixir-garden-walk',
  storylineId: 'elixir-question',
  title: "The Emperor's Garden Walk",
  description:
    'Taizong asks you to walk with him among the peonies. He is quiet for a long time. Then: "Why did you risk telling me? Everyone else was silent."',
  type: 'imperialFavor',
  location: 'imperialGardens',
  stats: ['eloquence', 'resolve'],
  threshold: 3,
  urgency: 'opportunity',
  forced: true,
  expiry: 2,
  weight: 5,
  prerequisites: [
    { kind: 'choiceMade', eventDefId: 'elixir-investigate', choiceId: 'elixir-tell-emperor' },
  ],
  slots: [
    { id: 'elixir-walk-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'elixir-walk-why',
    timing: 'before-roll',
    prompt: 'His eyes search yours. Why DID you tell him?',
    choices: [
      {
        id: 'elixir-walk-right',
        label: 'Because it was right',
        overrideStats: ['resolve'],
        moralWeight: { virtue: 1, imperialFavor: 2 },
      },
      {
        id: 'elixir-walk-truth',
        label: 'Because you deserve the truth',
        overrideStats: ['eloquence'],
        moralWeight: { imperialFavor: 3 },
      },
      {
        id: 'elixir-walk-live',
        label: 'Because I want you to live',
        overrideStats: ['beauty', 'resolve'],
        overrideThreshold: 4,
        moralWeight: { imperialFavor: 4 },
      },
    ],
  },
})

export const ELIXIR_EVENTS = [
  ELIXIR_COUGHING,
  ELIXIR_SULFUR,
  ELIXIR_INVESTIGATE,
  ELIXIR_GARDEN_WALK,
]
