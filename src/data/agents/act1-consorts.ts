import type { Agent } from '@core/types'

// =============================================================================
// Act 1 — Taizong's Consorts (Inner Court)
// =============================================================================

export const CONSORT_YANG: Agent = {
  id: 'yang',
  name: 'Consort Yang',
  chineseName: '杨贵妃',
  portraitId: 'yang',
  tier: 'gold',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 2,
  stats: {
    beauty: 4, cunning: 4, eloquence: 4, discretion: 3,
    resolve: 3, vitality: 3, resourcefulness: 3, scholarship: 3,
    spiritualArts: 2,
  },
}

export const CONSORT_XU: Agent = {
  id: 'xu',
  name: 'Consort Xu',
  chineseName: '徐贤妃',
  portraitId: 'xu',
  tier: 'silver',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 4,
  stats: {
    beauty: 3, cunning: 3, eloquence: 5, discretion: 3,
    resolve: 3, vitality: 2, resourcefulness: 2, scholarship: 5,
    spiritualArts: 2,
  },
}

export const LADY_JIANG: Agent = {
  id: 'jiang',
  name: 'Lady Jiang',
  chineseName: '蒋修仪',
  portraitId: 'jiang',
  tier: 'silver',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 5,
  stats: {
    beauty: 4, cunning: 3, eloquence: 2, discretion: 4,
    resolve: 2, vitality: 3, resourcefulness: 2, scholarship: 2,
    spiritualArts: 1,
  },
}

export const LADY_ZHENG: Agent = {
  id: 'zheng',
  name: 'Lady Zheng',
  chineseName: '郑充媛',
  portraitId: 'zheng',
  tier: 'silver',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 6,
  stats: {
    beauty: 3, cunning: 5, eloquence: 4, discretion: 3,
    resolve: 2, vitality: 2, resourcefulness: 3, scholarship: 3,
    spiritualArts: 1,
  },
}

export const LADY_SONG: Agent = {
  id: 'song',
  name: 'Lady Song',
  chineseName: '宋婕妤',
  portraitId: 'song',
  tier: 'bronze',
  tags: ['female', 'commoner', 'concubine'],
  conditions: [],
  haremRank: 7,
  stats: {
    beauty: 5, cunning: 1, eloquence: 2, discretion: 1,
    resolve: 2, vitality: 3, resourcefulness: 1, scholarship: 1,
    spiritualArts: 2,
  },
}

export const LADY_PEI: Agent = {
  id: 'pei',
  name: 'Lady Pei',
  chineseName: '裴美人',
  portraitId: 'pei',
  tier: 'bronze',
  tags: ['female', 'noble', 'concubine'],
  conditions: [],
  haremRank: 8,
  stats: {
    beauty: 3, cunning: 2, eloquence: 3, discretion: 2,
    resolve: 3, vitality: 2, resourcefulness: 2, scholarship: 2,
    spiritualArts: 1,
  },
}

export const ACT1_CONSORTS: Agent[] = [
  CONSORT_YANG,
  CONSORT_XU,
  LADY_JIANG,
  LADY_ZHENG,
  LADY_SONG,
  LADY_PEI,
]
