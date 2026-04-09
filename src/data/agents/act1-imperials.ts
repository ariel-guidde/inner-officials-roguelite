import type { Agent } from '@core/types'

// =============================================================================
// Act 1 — Imperial Family
// =============================================================================

export const EMPEROR_TAIZONG: Agent = {
  id: 'taizong',
  name: 'Emperor Taizong',
  chineseName: '太宗 李世民',
  portraitId: 'taizong',
  tier: 'jade',
  tags: ['male', 'imperial'],
  conditions: [],
  title: 'Emperor',
  stats: {
    beauty: 2, cunning: 5, eloquence: 4, discretion: 3,
    resolve: 5, vitality: 3, resourcefulness: 4, scholarship: 4,
    spiritualArts: 2,
  },
}

export const PRINCE_CHENGQIAN: Agent = {
  id: 'chengqian',
  name: 'Prince Chengqian',
  chineseName: '李承乾',
  portraitId: 'chengqian',
  tier: 'gold',
  tags: ['male', 'imperial'],
  conditions: [],
  title: 'Crown Prince',
  stats: {
    beauty: 3, cunning: 3, eloquence: 3, discretion: 1,
    resolve: 2, vitality: 2, resourcefulness: 2, scholarship: 3,
    spiritualArts: 1,
  },
}

export const PRINCE_TAI: Agent = {
  id: 'tai',
  name: 'Prince Tai',
  chineseName: '李泰',
  portraitId: 'tai',
  tier: 'gold',
  tags: ['male', 'imperial'],
  conditions: [],
  title: 'Prince of Wei',
  stats: {
    beauty: 2, cunning: 5, eloquence: 5, discretion: 4,
    resolve: 3, vitality: 2, resourcefulness: 3, scholarship: 5,
    spiritualArts: 2,
  },
}

export const PRINCE_ZHI: Agent = {
  id: 'zhi',
  name: 'Prince Zhi',
  chineseName: '李治',
  portraitId: 'zhi',
  tier: 'silver',
  tags: ['male', 'imperial'],
  conditions: [],
  title: 'Prince of Jin',
  stats: {
    beauty: 3, cunning: 2, eloquence: 4, discretion: 2,
    resolve: 1, vitality: 2, resourcefulness: 2, scholarship: 4,
    spiritualArts: 3,
  },
}

export const CHENG_XINNU: Agent = {
  id: 'xinnu',
  name: 'Cheng Xinnu',
  chineseName: '称心',
  portraitId: 'xinnu',
  tier: 'bronze',
  tags: ['male', 'commoner', 'entertainer'],
  conditions: [],
  stats: {
    beauty: 5, cunning: 1, eloquence: 3, discretion: 1,
    resolve: 1, vitality: 2, resourcefulness: 1, scholarship: 1,
    spiritualArts: 0,
  },
}

export const ACT1_IMPERIALS: Agent[] = [
  EMPEROR_TAIZONG,
  PRINCE_CHENGQIAN,
  PRINCE_TAI,
  PRINCE_ZHI,
  CHENG_XINNU,
]
