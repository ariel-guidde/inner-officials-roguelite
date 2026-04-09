import type { Agent } from '@core/types'

// =============================================================================
// Act 1 — Protagonist's Household (Chunhua variants + background agents)
// =============================================================================

// ---- Chunhua base stats (shared across archetypes) --------------------------

const CHUNHUA_BASE = {
  name: 'Chunhua',
  chineseName: '春花',
  portraitId: 'chunhua',
  tier: 'bronze' as const,
  tags: ['female', 'servant', 'maid', 'follower', 'scapegoat-eligible'] as const,
  conditions: [] as const,
  resentment: 0,
} satisfies Partial<Agent>

// Five archetype variants — same person, different emphasis from background.

/** Eyes archetype: observant, information-gathering. */
export const CHUNHUA_EYES: Agent = {
  ...CHUNHUA_BASE,
  id: 'chunhua-eyes',
  tags: [...CHUNHUA_BASE.tags],
  conditions: [],
  stats: {
    beauty: 2, cunning: 4, eloquence: 2, discretion: 3,
    resolve: 2, vitality: 2, resourcefulness: 3, scholarship: 1,
    spiritualArts: 1,
  },
}

/** Voice archetype: socially adept, rumor-spreading. */
export const CHUNHUA_VOICE: Agent = {
  ...CHUNHUA_BASE,
  id: 'chunhua-voice',
  tags: [...CHUNHUA_BASE.tags],
  conditions: [],
  stats: {
    beauty: 2, cunning: 3, eloquence: 4, discretion: 2,
    resolve: 2, vitality: 2, resourcefulness: 3, scholarship: 1,
    spiritualArts: 1,
  },
}

/** Shield archetype: protective, resilient. */
export const CHUNHUA_SHIELD: Agent = {
  ...CHUNHUA_BASE,
  id: 'chunhua-shield',
  tags: [...CHUNHUA_BASE.tags],
  conditions: [],
  stats: {
    beauty: 2, cunning: 3, eloquence: 2, discretion: 3,
    resolve: 3, vitality: 3, resourcefulness: 2, scholarship: 1,
    spiritualArts: 1,
  },
}

/** Hands archetype: resourceful, practical problem-solver. */
export const CHUNHUA_HANDS: Agent = {
  ...CHUNHUA_BASE,
  id: 'chunhua-hands',
  tags: [...CHUNHUA_BASE.tags],
  conditions: [],
  stats: {
    beauty: 2, cunning: 3, eloquence: 2, discretion: 3,
    resolve: 2, vitality: 2, resourcefulness: 4, scholarship: 1,
    spiritualArts: 1,
  },
}

/** Heart archetype: emotionally intelligent, loyal. */
export const CHUNHUA_HEART: Agent = {
  ...CHUNHUA_BASE,
  id: 'chunhua-heart',
  tags: [...CHUNHUA_BASE.tags],
  conditions: [],
  stats: {
    beauty: 2, cunning: 3, eloquence: 3, discretion: 3,
    resolve: 2, vitality: 2, resourcefulness: 2, scholarship: 1,
    spiritualArts: 2,
  },
}

export const CHUNHUA_VARIANTS: Agent[] = [
  CHUNHUA_EYES, CHUNHUA_VOICE, CHUNHUA_SHIELD, CHUNHUA_HANDS, CHUNHUA_HEART,
]

// ---- Background-specific starting agents ------------------------------------

/** Scholar's Daughter background. */
export const OLD_TUTOR_WANG: Agent = {
  id: 'tutor-wang',
  name: 'Old Tutor Wang',
  portraitId: 'tutor-wang',
  tier: 'bronze',
  tags: ['male', 'commoner', 'scholar'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 2, eloquence: 0, discretion: 0,
    resolve: 0, vitality: 0, resourcefulness: 0, scholarship: 4,
    spiritualArts: 0,
  },
}

/** General's Daughter background. */
export const SERGEANT_LUO: Agent = {
  id: 'sergeant-luo',
  name: 'Sergeant Luo',
  portraitId: 'sergeant-luo',
  tier: 'bronze',
  tags: ['male', 'commoner', 'guard'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 0, eloquence: 0, discretion: 0,
    resolve: 3, vitality: 3, resourcefulness: 0, scholarship: 0,
    spiritualArts: 0,
    martial: 2,
  },
}

/** Merchant's Daughter background. */
export const COUSIN_BAO: Agent = {
  id: 'cousin-bao',
  name: 'Cousin Bao',
  chineseName: '表哥宝',
  portraitId: 'cousin-bao',
  tier: 'bronze',
  tags: ['male', 'commoner', 'merchant', 'follower'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 3, eloquence: 0, discretion: 0,
    resolve: 0, vitality: 0, resourcefulness: 3, scholarship: 0,
    spiritualArts: 0,
  },
}

/** Beauty of the Province background. */
export const LADY_FANG: Agent = {
  id: 'lady-fang',
  name: 'Lady Fang',
  portraitId: 'lady-fang',
  tier: 'bronze',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 9,
  stats: {
    beauty: 3, cunning: 0, eloquence: 2, discretion: 0,
    resolve: 0, vitality: 0, resourcefulness: 0, scholarship: 0,
    spiritualArts: 0,
  },
}

export const BACKGROUND_AGENTS: Agent[] = [
  OLD_TUTOR_WANG, SERGEANT_LUO, COUSIN_BAO, LADY_FANG,
]

export const ACT1_HOUSEHOLD: Agent[] = [
  ...CHUNHUA_VARIANTS,
  ...BACKGROUND_AGENTS,
]
