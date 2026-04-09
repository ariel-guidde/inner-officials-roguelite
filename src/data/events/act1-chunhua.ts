// =============================================================================
// Act 1 — Chunhua's Heart (春花心事)
// Emotional core. Your only guaranteed relationship. Resentment tracker.
// =============================================================================

import { defineEvent } from './eventFactory'

export const CHUNHUA_GUARD = defineEvent({
  id: 'chunhua-guard',
  storylineId: 'chunhua-heart',
  title: 'The Guard at the Gate',
  description:
    'Chunhua lingers near the east corridor, stealing glances at the young guard on post. Private Chen watches her right back.',
  type: 'personal',
  location: 'chambers',
  stats: ['discretion'],
  threshold: 0,
  urgency: 'routine',
  weight: 3,
  prerequisites: [{ kind: 'dayMin', day: 3 }],
  slots: [
    { id: 'chunhua-guard-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'chunhua-guard-choice',
    timing: 'standalone',
    prompt: 'You notice the stolen glances. Chunhua is yours to command — but she is also a person.',
    choices: [
      {
        id: 'chunhua-guard-encourage',
        label: 'Encourage her carefully',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'chunhua-guard-forbid',
        label: 'Forbid all contact',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 1 },
      },
      {
        id: 'chunhua-guard-ignore',
        label: 'Look away and say nothing',
        skipDiceRoll: true,
      },
    ],
  },
  graphEdges: { success: ['chunhua-fear'] },
})

export const CHUNHUA_FEAR = defineEvent({
  id: 'chunhua-fear',
  storylineId: 'chunhua-heart',
  title: "Chunhua's Fear",
  description:
    'Chunhua is pale when she finds you. She overheard whispers in the servants\' corridor — someone is plotting against you.',
  type: 'investigation',
  location: 'chambers',
  stats: ['cunning', 'discretion'],
  threshold: 2,
  urgency: 'timed',
  expiry: 4,
  weight: 3,
  prerequisites: [
    { kind: 'dayMin', day: 10 },
    { kind: 'eventResolved', defId: 'chunhua-guard' },
  ],
  slots: [
    { id: 'chunhua-fear-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  graphEdges: { success: ['chunhua-request'] },
})

export const CHUNHUA_REQUEST = defineEvent({
  id: 'chunhua-request',
  storylineId: 'chunhua-heart',
  title: 'The Request',
  description:
    'Chunhua kneels before you, hands clasped. She asks for a single day at the temple. She will not say why.',
  type: 'personal',
  location: 'chambers',
  stats: ['resolve'],
  threshold: 0,
  urgency: 'routine',
  weight: 2,
  prerequisites: [
    { kind: 'dayMin', day: 15 },
    { kind: 'eventResolved', defId: 'chunhua-fear' },
  ],
  slots: [
    { id: 'chunhua-req-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'chunhua-request-choice',
    timing: 'standalone',
    prompt: 'She meets your eyes — something she almost never does.',
    choices: [
      {
        id: 'chunhua-req-grant',
        label: 'Grant the day',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'chunhua-req-deny',
        label: 'Deny her',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 1 },
      },
      {
        id: 'chunhua-req-accompany',
        label: 'Go with her to the temple',
        prerequisites: [{ kind: 'locationUnlocked', locationId: 'buddhistTemple' }],
        skipDiceRoll: true,
        moralWeight: { virtue: 1, heavenlySight: 1 },
      },
    ],
  },
  graphEdges: {
    choiceEdges: [
      { choiceId: 'chunhua-req-deny', success: ['chunhua-breaking'] },
    ],
  },
})

export const CHUNHUA_BREAKING = defineEvent({
  id: 'chunhua-breaking',
  storylineId: 'chunhua-heart',
  title: 'The Breaking Point',
  description:
    'Chunhua stands rigid in the doorway. Her voice shakes: "I am not a tool. I am a person."',
  type: 'personal',
  location: 'chambers',
  stats: ['resolve', 'eloquence'],
  threshold: 2,
  urgency: 'crisis',
  forced: true,
  weight: 5,
  prerequisites: [
    { kind: 'eventResolved', defId: 'chunhua-request' },
  ],
  slots: [
    { id: 'chunhua-break-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
  dilemma: {
    id: 'chunhua-breaking-choice',
    timing: 'standalone',
    prompt: 'Her bags are packed. One wrong word and she walks out of your life.',
    choices: [
      {
        id: 'chunhua-break-apologize',
        label: 'Apologize sincerely',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
      },
      {
        id: 'chunhua-break-threaten',
        label: 'Remind her of her place',
        skipDiceRoll: true,
        moralWeight: { ruthlessness: 1 },
      },
      {
        id: 'chunhua-break-release',
        label: 'Let her go',
        skipDiceRoll: true,
        moralWeight: { virtue: 1 },
        immediateConsequences: [
          { kind: 'narrative', text: 'Chunhua bows once — to the woman you were, not the one you became — and leaves.' },
        ],
      },
      {
        id: 'chunhua-break-promise',
        label: 'Promise to change — and mean it',
        overrideStats: ['resolve'],
        overrideThreshold: 3,
        moralWeight: { virtue: 1 },
      },
    ],
  },
})

export const CHUNHUA_EVENTS = [
  CHUNHUA_GUARD,
  CHUNHUA_FEAR,
  CHUNHUA_REQUEST,
  CHUNHUA_BREAKING,
]
