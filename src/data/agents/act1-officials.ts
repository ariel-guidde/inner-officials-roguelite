import type { Agent } from '@core/types'

// =============================================================================
// Act 1 — Outer Court Officials
// =============================================================================

export const ZHANGSUN_WUJI: Agent = {
  id: 'zhangsun',
  name: 'Zhangsun Wuji',
  chineseName: '长孙无忌',
  portraitId: 'zhangsun',
  tier: 'gold',
  tags: ['male', 'imperial', 'scholar'],
  conditions: [],
  title: 'Chancellor',
  stats: {
    beauty: 0, cunning: 5, eloquence: 4, discretion: 3,
    resolve: 4, vitality: 0, resourcefulness: 0, scholarship: 5,
    spiritualArts: 0,
  },
}

export const CHU_SUILIANG: Agent = {
  id: 'chu-suiliang',
  name: 'Chu Suiliang',
  chineseName: '褚遂良',
  portraitId: 'chu-suiliang',
  tier: 'gold',
  tags: ['male', 'noble', 'scholar'],
  conditions: [],
  title: 'Chancellor',
  stats: {
    beauty: 0, cunning: 3, eloquence: 5, discretion: 2,
    resolve: 5, vitality: 0, resourcefulness: 0, scholarship: 5,
    spiritualArts: 0,
  },
}

export const LI_JI: Agent = {
  id: 'li-ji',
  name: 'Li Ji',
  chineseName: '李勣',
  portraitId: 'li-ji',
  tier: 'gold',
  tags: ['male', 'commoner', 'guard'],
  conditions: [],
  title: 'Grand General',
  stats: {
    beauty: 0, cunning: 4, eloquence: 2, discretion: 4,
    resolve: 5, vitality: 3, resourcefulness: 4, scholarship: 0,
    spiritualArts: 0,
    martial: 5,
  },
}

export const SECRETARY_LIU: Agent = {
  id: 'liu',
  name: 'Secretary Liu',
  chineseName: '刘中书',
  portraitId: 'liu',
  tier: 'silver',
  tags: ['male', 'noble', 'scholar'],
  conditions: [],
  title: 'Secretariat Drafter',
  stats: {
    beauty: 0, cunning: 3, eloquence: 4, discretion: 3,
    resolve: 2, vitality: 0, resourcefulness: 0, scholarship: 4,
    spiritualArts: 0,
  },
}

export const CENSOR_LIANG: Agent = {
  id: 'liang',
  name: 'Censor Liang',
  chineseName: '梁御史',
  portraitId: 'liang',
  tier: 'bronze',
  tags: ['male', 'commoner', 'scholar'],
  conditions: [],
  title: 'Investigating Censor',
  stats: {
    beauty: 0, cunning: 4, eloquence: 3, discretion: 2,
    resolve: 4, vitality: 0, resourcefulness: 0, scholarship: 3,
    spiritualArts: 0,
  },
}

export const GENERAL_QIN: Agent = {
  id: 'qin',
  name: 'General Qin',
  chineseName: '秦将军',
  portraitId: 'qin',
  tier: 'silver',
  tags: ['male', 'noble', 'guard'],
  conditions: [],
  title: 'Palace Guard Commander',
  stats: {
    beauty: 0, cunning: 2, eloquence: 1, discretion: 2,
    resolve: 4, vitality: 4, resourcefulness: 3, scholarship: 0,
    spiritualArts: 0,
    martial: 4,
  },
}

export const ACT1_OFFICIALS: Agent[] = [
  ZHANGSUN_WUJI,
  CHU_SUILIANG,
  LI_JI,
  SECRETARY_LIU,
  CENSOR_LIANG,
  GENERAL_QIN,
]
