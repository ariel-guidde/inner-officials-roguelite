// =============================================================================
// Act 1 — Standalone Pool Events
// Repeatable or one-shot events with no storyline prerequisites.
// Flavor, resources, and texture of palace daily life.
// =============================================================================

import { defineEvent } from './eventFactory'

export const POOL_POETRY_CONTEST = defineEvent({
  id: 'pool-poetry-contest',
  title: 'The Poetry Circle',
  description:
    'Consorts gather in the Imperial Library to compose and recite verse. Consort Xu presides. Prince Zhi has been seen in the back row.',
  type: 'social',
  location: 'imperialLibrary',
  stats: ['scholarship', 'eloquence'],
  threshold: 2,
  urgency: 'routine',
  weight: 3,
  repeatable: true,
  prerequisites: [{ kind: 'dayMin', day: 8 }],
  slots: [
    { id: 'poetry-s1', isMandatory: true, requiredTags: ['protagonist'] },
    { id: 'poetry-s2', isMandatory: false, requiredTags: ['follower'] },
  ],
})

export const POOL_MIDNIGHT_OFFERING = defineEvent({
  id: 'pool-midnight-offering',
  title: 'Midnight Offering',
  description:
    'A lone candle burns in the temple at midnight. Someone left fresh incense and a prayer slip at the altar. The monks say nothing — but the handwriting looks familiar.',
  type: 'spiritual',
  location: 'buddhistTemple',
  stats: ['spiritualArts', 'discretion'],
  threshold: 2,
  urgency: 'routine',
  weight: 2,
  repeatable: true,
  prerequisites: [{ kind: 'locationUnlocked', locationId: 'buddhistTemple' }],
  slots: [
    { id: 'midnight-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_FESTIVAL_PREP = defineEvent({
  id: 'pool-festival-prep',
  title: 'Festival Preparations',
  description:
    'The palace buzzes with preparation for a seasonal celebration. Lanterns need hanging, menus need approving, and someone must settle the argument between the cooks.',
  type: 'estateManagement',
  location: 'festivalGrounds',
  stats: ['resourcefulness', 'eloquence'],
  threshold: 2,
  urgency: 'routine',
  weight: 3,
  repeatable: true,
  prerequisites: [],
  slots: [
    { id: 'festival-s1', isMandatory: true, requiredTags: ['protagonist'] },
    { id: 'festival-s2', isMandatory: false, requiredTags: [], anyRequiredTag: ['maid', 'eunuch'] },
  ],
})

export const POOL_MORNING_GOSSIP = defineEvent({
  id: 'pool-morning-gossip',
  title: 'Morning Audience Gossip',
  description:
    'Waiting for the audience to begin, the junior consorts whisper. Silk debts, illicit letters, an eunuch seen where he should not have been.',
  type: 'social',
  location: 'innerCourt',
  stats: ['cunning', 'discretion'],
  threshold: 1,
  urgency: 'routine',
  weight: 4,
  repeatable: true,
  prerequisites: [],
  slots: [
    { id: 'gossip-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_SILK_WEAVING = defineEvent({
  id: 'pool-silk-weaving',
  title: 'Silk Weaving Competition',
  description:
    'An annual contest among lower-ranked consorts. The prize is modest but Yang is watching — and she remembers winners.',
  type: 'ceremony',
  location: 'chambers',
  stats: ['resourcefulness', 'beauty'],
  threshold: 2,
  urgency: 'opportunity',
  expiry: 3,
  weight: 2,
  prerequisites: [{ kind: 'dayMin', day: 12 }],
  slots: [
    { id: 'silk-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_EUNUCH_FAVOR = defineEvent({
  id: 'pool-eunuch-favor',
  title: 'A Small Favor for Eunuch Gao',
  description:
    'Chief Eunuch Gao needs a discreet errand run — a letter delivered where no one is watching. The reward is his goodwill, which is worth more than silver.',
  type: 'dominion',
  location: 'eunuchQuarter',
  stats: ['discretion', 'cunning'],
  threshold: 2,
  urgency: 'routine',
  weight: 2,
  repeatable: true,
  prerequisites: [],
  slots: [
    { id: 'eunuch-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_GARDEN_ENCOUNTER = defineEvent({
  id: 'pool-garden-encounter',
  title: 'An Unexpected Encounter',
  description:
    'You round a corner in the Imperial Gardens and nearly collide with someone you were not meant to see here. A heartbeat of shared surprise.',
  type: 'social',
  location: 'imperialGardens',
  stats: ['beauty', 'eloquence'],
  threshold: 1,
  urgency: 'routine',
  weight: 3,
  repeatable: true,
  prerequisites: [],
  slots: [
    { id: 'garden-enc-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_PHYSICIAN_VISIT = defineEvent({
  id: 'pool-physician-visit',
  title: 'Routine Examination',
  description:
    'The palace physician insists on a seasonal check-up. Tongue, pulse, complexion — and questions that probe more than health.',
  type: 'personal',
  location: 'palacePhysician',
  stats: ['vitality', 'discretion'],
  threshold: 1,
  urgency: 'routine',
  weight: 2,
  repeatable: true,
  prerequisites: [],
  slots: [
    { id: 'physician-s1', isMandatory: true, requiredTags: ['protagonist'] },
  ],
})

export const POOL_EVENTS = [
  POOL_POETRY_CONTEST,
  POOL_MIDNIGHT_OFFERING,
  POOL_FESTIVAL_PREP,
  POOL_MORNING_GOSSIP,
  POOL_SILK_WEAVING,
  POOL_EUNUCH_FAVOR,
  POOL_GARDEN_ENCOUNTER,
  POOL_PHYSICIAN_VISIT,
]
