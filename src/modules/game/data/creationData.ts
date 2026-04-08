// =============================================================================
// Character creation data — backgrounds, educations, dispositions, maid archetypes
// =============================================================================

import type { ReputationState, StatName } from '@core/types'

// ---------------------------------------------------------------------------
// Layer 1: Family Background
// ---------------------------------------------------------------------------

export interface FamilyBackground {
  id: string
  name: string
  description: string
  silver: number
  statBonuses: Partial<Record<StatName, number>>
  connection: string
}

export const FAMILY_BACKGROUNDS: FamilyBackground[] = [
  {
    id: 'noble-clan',
    name: 'Noble Clan',

    description: 'The Wus married into the Li clan\'s orbit. Your blood opens doors — but also invites scrutiny.',
    silver: 3,
    statBonuses: { eloquence: 1, scholarship: 1 },
    connection: 'Zhangsun Wuji knows your father',
  },
  {
    id: 'military-family',
    name: 'Military Family',

    description: 'Your father rode with the founders. The sword on your wall is not decorative.',
    silver: 3,
    statBonuses: { resolve: 1, vitality: 1 },
    connection: 'General Li Ji served with your father',
  },
  {
    id: 'merchant-wealth',
    name: 'Merchant Wealth',

    description: 'Your family trades in silk, salt, and favors. You arrived with more silver than the other girls.',
    silver: 7,
    statBonuses: { resourcefulness: 1, cunning: 1 },
    connection: 'Trade Quarter contacts from day 1',
  },
  {
    id: 'scholar-official',
    name: 'Scholar-Official',

    description: 'Your household smelled of ink. You read the classics before you read people.',
    silver: 4,
    statBonuses: { scholarship: 2 },
    connection: 'Consort Xu heard of your father\'s library',
  },
  {
    id: 'provincial-gentry',
    name: 'Provincial Gentry',

    description: 'Far from the capital, your family rules a small world. Now you\'ve entered a larger one.',
    silver: 4,
    statBonuses: { vitality: 1, resourcefulness: 1 },
    connection: 'Wu family network available early',
  },
  {
    id: 'fallen-aristocracy',
    name: 'Fallen Aristocracy',

    description: 'Your clan once held three ministries. Now they hold debts. You are here to change that.',
    silver: 2,
    statBonuses: { eloquence: 1, discretion: 1 },
    connection: 'Older consorts remember your grandmother',
  },
  {
    id: 'temple-patronage',
    name: 'Temple Patronage',

    description: 'Your family endowed a temple. The monks raised you as much as your parents did.',
    silver: 3,
    statBonuses: { spiritualArts: 2 },
    connection: 'Nun Mingzhu, access to Buddhist network',
  },
  {
    id: 'imperial-favor',
    name: 'Imperial Favor',

    description: 'A poem about your beauty reached the Emperor. You were summoned by name. Everyone already hates you.',
    silver: 2,
    statBonuses: { beauty: 2 },
    connection: 'Taizong specifically requested you',
  },
]

// ---------------------------------------------------------------------------
// Layer 2: Education (pick 2)
// ---------------------------------------------------------------------------

export interface Education {
  id: string
  name: string
  stat: StatName
  benefit: string
  flavor: string
}

export const EDUCATIONS: Education[] = [
  { id: 'classical-literature', name: 'Classical Literature', stat: 'scholarship', benefit: 'Can identify forgeries and historical references', flavor: 'You\'ve read the Five Classics and the histories.' },
  { id: 'calligraphy', name: 'Calligraphy', stat: 'eloquence', benefit: 'Starting equipment: Calligraphy Set', flavor: 'Your hand is beautiful. In this court, that\'s a qualification.' },
  { id: 'music', name: 'Music', stat: 'beauty', benefit: 'Can participate in musical events', flavor: 'The pipa, the guqin. Music opens rooms that words cannot.' },
  { id: 'medicine', name: 'Medicine & Herbs', stat: 'vitality', benefit: 'Can identify poisons; bonus in physician events', flavor: 'Your mother taught you which plants heal and which ones don\'t.' },
  { id: 'needlework', name: 'Needlework & Weaving', stat: 'resourcefulness', benefit: 'Starting equipment: Embroidered Sash', flavor: 'Your silk work is exceptional. Patterns carry meaning.' },
  { id: 'household-mgmt', name: 'Household Management', stat: 'cunning', benefit: 'Bonus to estate/budget events', flavor: 'You ran your family\'s household accounts.' },
  { id: 'riding', name: 'Riding & Outdoors', stat: 'resolve', benefit: 'Can participate in hunt events; impresses Taizong', flavor: 'Unusual for a woman. Your father raised you differently.' },
  { id: 'buddhist-study', name: 'Buddhist Study', stat: 'spiritualArts', benefit: 'Bonus at temple events; can quote sutras', flavor: 'Impermanence, suffering, emptiness.' },
  { id: 'court-etiquette', name: 'Court Etiquette', stat: 'discretion', benefit: 'Fewer protocol mistakes; bonus to first impressions', flavor: 'You know every bow, every precedence.' },
  { id: 'painting', name: 'Painting', stat: 'beauty', benefit: 'Can create gifts; bonus in cultural events', flavor: 'Your eye sees composition in everything.' },
  { id: 'politics-law', name: 'Politics & Law', stat: 'cunning', benefit: 'Can understand edicts and legal proceedings', flavor: 'Your father discussed governance at dinner. You listened.' },
  { id: 'taoist-philosophy', name: 'Taoist Philosophy', stat: 'spiritualArts', benefit: 'Can discuss with Taoist Master Sun', flavor: 'The Dao that can be spoken is not the eternal Dao.' },
]

// ---------------------------------------------------------------------------
// Layer 3a: Disposition
// ---------------------------------------------------------------------------

export interface Disposition {
  id: string
  name: string
  description: string
  reputationBonuses: Partial<Record<keyof ReputationState, number>>
}

export const DISPOSITIONS: Disposition[] = [
  { id: 'kindhearted', name: 'Kind-hearted', description: 'NPCs trust you faster. Ruthless choices cost more Virtue.', reputationBonuses: { virtue: 2 } },
  { id: 'ambitious', name: 'Ambitious', description: 'Taizong and Tai notice ambition. Zhi is wary.', reputationBonuses: { imperialFavor: 1 } },
  { id: 'cautious', name: 'Cautious', description: 'Better at avoiding scandal. Slower to build relationships.', reputationBonuses: { shadowReach: 1 } },
  { id: 'passionate', name: 'Passionate', description: 'Stronger emotional reactions from NPCs. Bigger swings.', reputationBonuses: {} },
  { id: 'devout', name: 'Devout', description: 'Temple access easier. Perceived as non-threatening.', reputationBonuses: { heavenlySight: 1, virtue: 1 } },
  { id: 'cunning-disp', name: 'Cunning', description: 'Better at reading people. NPCs are also more suspicious.', reputationBonuses: { shadowReach: 1 } },
  { id: 'proud', name: 'Proud', description: 'You don\'t back down. Resolve checks easier, but enemies faster.', reputationBonuses: { ruthlessness: 1 } },
]

// ---------------------------------------------------------------------------
// Layer 3b: Chunhua's Archetype
// ---------------------------------------------------------------------------

export interface MaidArchetype {
  id: string
  name: string
  description: string
  strongStats: Partial<Record<StatName, number>>
  flavor: string
}

export const MAID_ARCHETYPES: MaidArchetype[] = [
  { id: 'the-eyes', name: 'The Eyes', description: 'Best at intelligence gathering. She reports what she sees.', strongStats: { cunning: 4, discretion: 4 }, flavor: 'Observant, quiet, misses nothing.' },
  { id: 'the-voice', name: 'The Voice', description: 'Best at social events. She builds her own network among servants.', strongStats: { eloquence: 4, cunning: 3 }, flavor: 'Talkative, charming, makes friends easily.' },
  { id: 'the-shield', name: 'The Shield', description: 'Best at crisis events. She\'ll stand between you and danger.', strongStats: { resolve: 4, vitality: 3 }, flavor: 'Protective, stubborn, physically tough.' },
  { id: 'the-hands', name: 'The Hands', description: 'Best at household events. She keeps your quarters running.', strongStats: { resourcefulness: 4, discretion: 3 }, flavor: 'Practical, organized, fixes everything.' },
  { id: 'the-heart', name: 'The Heart', description: 'Best at personal events. She grounds you emotionally.', strongStats: { spiritualArts: 3, eloquence: 3 }, flavor: 'Empathetic, wise beyond her years.' },
]

// ---------------------------------------------------------------------------
// Derived: build starting state from choices
// ---------------------------------------------------------------------------

export const BASE_STATS: Record<StatName, number> = {
  beauty: 2, cunning: 2, eloquence: 2, discretion: 1,
  resolve: 2, vitality: 2, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
}

export interface CreationChoices {
  background: FamilyBackground
  educations: [Education, Education]
  disposition: Disposition
  maidArchetype: MaidArchetype
}
