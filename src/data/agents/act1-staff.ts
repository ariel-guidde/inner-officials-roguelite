import type { Agent } from '@core/types'

// =============================================================================
// Act 1 — Palace Staff: Eunuchs, Religious, Merchants, Physicians
// =============================================================================

// ---- Eunuchs ----------------------------------------------------------------

export const CHIEF_EUNUCH_CHEN: Agent = {
  id: 'eunuch-chen',
  name: 'Chief Eunuch Chen',
  chineseName: '陈公公',
  portraitId: 'eunuch-chen',
  tier: 'silver',
  tags: ['male', 'servant', 'eunuch'],
  conditions: [],
  title: 'Chief Eunuch',
  stats: {
    beauty: 0, cunning: 5, eloquence: 3, discretion: 5,
    resolve: 3, vitality: 1, resourcefulness: 4, scholarship: 2,
    spiritualArts: 0,
  },
}

export const EUNUCH_GAO: Agent = {
  id: 'eunuch-gao',
  name: 'Eunuch Gao',
  chineseName: '高内侍',
  portraitId: 'eunuch-gao',
  tier: 'bronze',
  tags: ['male', 'servant', 'eunuch', 'follower'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 3, eloquence: 0, discretion: 4,
    resolve: 2, vitality: 0, resourcefulness: 3, scholarship: 0,
    spiritualArts: 0,
  },
}

// ---- Religious --------------------------------------------------------------

export const XUANZANG: Agent = {
  id: 'xuanzang',
  name: 'Xuanzang',
  chineseName: '玄奘',
  portraitId: 'xuanzang',
  tier: 'gold',
  tags: ['male', 'commoner', 'priest'],
  conditions: [],
  title: 'Master Tripitaka',
  stats: {
    beauty: 0, cunning: 0, eloquence: 5, discretion: 0,
    resolve: 5, vitality: 0, resourcefulness: 0, scholarship: 5,
    spiritualArts: 5,
  },
}

export const TAOIST_MASTER_SUN: Agent = {
  id: 'sun-taoist',
  name: 'Taoist Master Sun',
  chineseName: '孙道长',
  portraitId: 'sun-taoist',
  tier: 'silver',
  tags: ['male', 'noble', 'priest'],
  conditions: [],
  title: 'Court Taoist',
  stats: {
    beauty: 0, cunning: 3, eloquence: 3, discretion: 4,
    resolve: 3, vitality: 0, resourcefulness: 0, scholarship: 4,
    spiritualArts: 4,
  },
}

export const NUN_MINGZHU: Agent = {
  id: 'mingzhu',
  name: 'Nun Mingzhu',
  chineseName: '明珠师太',
  portraitId: 'mingzhu',
  tier: 'bronze',
  tags: ['female', 'commoner', 'priest', 'follower'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 0, eloquence: 0, discretion: 0,
    resolve: 0, vitality: 0, resourcefulness: 0, scholarship: 2,
    spiritualArts: 4,
  },
}

// ---- Palace Staff -----------------------------------------------------------

export const DR_SUN: Agent = {
  id: 'sun-physician',
  name: 'Dr. Sun',
  chineseName: '孙太医',
  portraitId: 'sun-physician',
  tier: 'bronze',
  tags: ['male', 'commoner', 'physician'],
  conditions: [],
  title: 'Palace Physician',
  stats: {
    beauty: 0, cunning: 2, eloquence: 0, discretion: 3,
    resolve: 0, vitality: 3, resourcefulness: 0, scholarship: 4,
    spiritualArts: 0,
  },
}

export const COOK_MA: Agent = {
  id: 'cook-ma',
  name: 'Cook Ma',
  chineseName: '马厨',
  portraitId: 'cook-ma',
  tier: 'clay',
  tags: ['male', 'commoner', 'cook'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 1, eloquence: 0, discretion: 2,
    resolve: 0, vitality: 3, resourcefulness: 3, scholarship: 0,
    spiritualArts: 0,
  },
}

// ---- Merchants --------------------------------------------------------------

export const MADAME_QIAN: Agent = {
  id: 'qian',
  name: 'Madame Qian',
  chineseName: '钱夫人',
  portraitId: 'qian',
  tier: 'silver',
  tags: ['female', 'commoner', 'merchant'],
  conditions: [],
  stats: {
    beauty: 0, cunning: 4, eloquence: 3, discretion: 3,
    resolve: 0, vitality: 0, resourcefulness: 5, scholarship: 0,
    spiritualArts: 0,
  },
}

export const ACT1_STAFF: Agent[] = [
  CHIEF_EUNUCH_CHEN,
  EUNUCH_GAO,
  XUANZANG,
  TAOIST_MASTER_SUN,
  NUN_MINGZHU,
  DR_SUN,
  COOK_MA,
  MADAME_QIAN,
]
