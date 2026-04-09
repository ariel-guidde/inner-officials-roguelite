import type { Agent } from '@core/types'
import {
  ATTIRE_CRIMSON_COURT_DRESS, ATTIRE_GUARD_LEATHER, ATTIRE_GOLDEN_CLOUD_ROBE,
  ATTIRE_SCHOLARS_INDIGO, ATTIRE_PEONY_BROCADE,
  ACC_JADE_BUTTERFLY_PIN, ACC_GOLD_PHOENIX_CROWN, ACC_PRAYER_BEAD_BRACELET, ACC_SCHOLARS_INK_PENDANT,
  TOOL_MEDICINE_POUCH, TOOL_ACCOUNT_LEDGER, TOOL_FOUR_TREASURES, TOOL_BRONZE_INCENSE,
  WEAP_PALACE_DAGGER, WEAP_OFFICERS_SWORD,
} from './equipmentDefaults'

/** Full sample cast for Playground testing. */
export const CHARACTERS_DEFAULTS: Agent[] = [
  // ── Protagonist ──────────────────────────────────────────────────────────
  {
    id: 'protagonist',
    name: 'Lady Wu',
    portraitId: 'Concubine1',
    tier: 'silver',
    isProtagonist: true,
    haremRank: 9,
    tags: ['female', 'noble', 'concubine', 'protagonist'],
    conditions: [],
    stats: {
      beauty: 6, cunning: 3, eloquence: 4, discretion: 2,
      resolve: 2, vitality: 2, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
    },
    equipment: {
      attire:    ATTIRE_CRIMSON_COURT_DRESS,
      accessory: ACC_JADE_BUTTERFLY_PIN,
      tool:      null,
    },
  },

  // ── Chunhua (loyal maid) ─────────────────────────────────────────────────
  {
    id: 'chunhua',
    name: 'Chunhua',
    portraitId: 'Servant 1',
    tier: 'bronze',
    tags: ['female', 'servant', 'maid', 'follower'],
    conditions: [],
    resentment: 2,
    stats: {
      beauty: 2, cunning: 3, eloquence: 2, discretion: 3,
      resolve: 2, vitality: 2, resourcefulness: 2, spiritualArts: 1, scholarship: 1,
    },
    equipment: {
      attire:    null,
      accessory: null,
      tool:      null,
    },
  },

  // ── Sergeant Luo ─────────────────────────────────────────────────────────
  {
    id: 'guard-luo',
    name: 'Sergeant Luo',
    portraitId: 'guard-luo',
    tier: 'bronze',
    tags: ['male', 'commoner', 'guard', 'follower'],
    conditions: [],
    stats: {
      beauty: 1, cunning: 1, eloquence: 1, discretion: 1,
      resolve: 3, vitality: 3, resourcefulness: 2, spiritualArts: 0, scholarship: 0,
      martial: 2,
    },
    equipment: {
      attire:    ATTIRE_GUARD_LEATHER,
      accessory: null,
      tool:      null,
      weapon:    WEAP_OFFICERS_SWORD,
    },
  },

  // ── Chief Eunuch Wei ──────────────────────────────────────────────────────
  {
    id: 'eunuch-wei',
    name: 'Chief Eunuch Wei',
    portraitId: 'eunuch-wei',
    tier: 'silver',
    title: 'Chief Eunuch',
    tags: ['male', 'servant', 'eunuch', 'follower'],
    conditions: [],
    stats: {
      beauty: 1, cunning: 4, eloquence: 3, discretion: 4,
      resolve: 2, vitality: 1, resourcefulness: 3, spiritualArts: 1, scholarship: 2,
    },
    equipment: {
      attire:    null,
      accessory: null,
      tool:      TOOL_ACCOUNT_LEDGER,
    },
  },

  // ── Dr. Han (Palace Physician) ────────────────────────────────────────────
  {
    id: 'physician-han',
    name: 'Dr. Han',
    portraitId: 'physician-han',
    tier: 'bronze',
    title: 'Palace Physician',
    tags: ['male', 'official', 'physician', 'follower'],
    conditions: [],
    stats: {
      beauty: 1, cunning: 2, eloquence: 2, discretion: 2,
      resolve: 1, vitality: 2, resourcefulness: 2, spiritualArts: 1, scholarship: 4,
    },
    equipment: {
      attire:    ATTIRE_SCHOLARS_INDIGO,
      accessory: ACC_SCHOLARS_INK_PENDANT,
      tool:      TOOL_MEDICINE_POUCH,
    },
  },

  // ── The Emperor ───────────────────────────────────────────────────────────
  {
    id: 'emperor',
    name: 'Emperor Gaozong',
    portraitId: 'emperor',
    tier: 'jade',
    title: 'Emperor',
    tags: ['male', 'imperial'],
    conditions: [],
    stats: {
      beauty: 5, cunning: 6, eloquence: 5, discretion: 4,
      resolve: 5, vitality: 4, resourcefulness: 4, spiritualArts: 3, scholarship: 5,
    },
    equipment: {
      attire:    ATTIRE_GOLDEN_CLOUD_ROBE,
      accessory: null,
      tool:      null,
    },
  },

  // ── Empress Wang (Rank 1) ─────────────────────────────────────────────────
  {
    id: 'empress-wang',
    name: 'Empress Wang',
    portraitId: 'empress-wang',
    tier: 'gold',
    haremRank: 1,
    tags: ['female', 'imperial', 'empress'],
    conditions: [],
    stats: {
      beauty: 6, cunning: 7, eloquence: 6, discretion: 5,
      resolve: 5, vitality: 3, resourcefulness: 4, spiritualArts: 2, scholarship: 4,
    },
    equipment: {
      attire:    ATTIRE_GOLDEN_CLOUD_ROBE,
      accessory: ACC_GOLD_PHOENIX_CROWN,
      tool:      null,
    },
  },

  // ── Noble Consort Xiao (Rank 2 — Guifei) ─────────────────────────────────
  {
    id: 'consort-xiao',
    name: 'Noble Consort Xiao',
    portraitId: 'Consort 1',
    tier: 'gold',
    haremRank: 2,
    tags: ['female', 'imperial', 'concubine'],
    conditions: [],
    stats: {
      beauty: 8, cunning: 5, eloquence: 6, discretion: 4,
      resolve: 3, vitality: 5, resourcefulness: 3, spiritualArts: 2, scholarship: 3,
    },
    equipment: {
      attire:    ATTIRE_PEONY_BROCADE,
      accessory: ACC_GOLD_PHOENIX_CROWN,
      tool:      null,
    },
  },

  // ── Virtuous Consort Yang (Rank 4 — Guipin) ──────────────────────────────
  {
    id: 'consort-yang',
    name: 'Consort Yang',
    portraitId: 'consort-yang',
    tier: 'silver',
    haremRank: 4,
    tags: ['female', 'noble', 'concubine'],
    conditions: [],
    stats: {
      beauty: 5, cunning: 4, eloquence: 5, discretion: 3,
      resolve: 3, vitality: 4, resourcefulness: 2, spiritualArts: 3, scholarship: 2,
    },
    equipment: {
      attire:    ATTIRE_CRIMSON_COURT_DRESS,
      accessory: ACC_PRAYER_BEAD_BRACELET,
      tool:      TOOL_BRONZE_INCENSE,
    },
  },

  // ── Lady Chen (Rank 6 — Zhaoyi) ───────────────────────────────────────────
  {
    id: 'lady-chen',
    name: 'Lady Chen',
    portraitId: 'lady-chen',
    tier: 'silver',
    haremRank: 6,
    tags: ['female', 'noble', 'concubine'],
    conditions: ['disgraced'],
    stats: {
      beauty: 4, cunning: 3, eloquence: 4, discretion: 3,
      resolve: 3, vitality: 3, resourcefulness: 2, spiritualArts: 1, scholarship: 3,
    },
    equipment: {
      attire:    null,
      accessory: null,
      tool:      null,
    },
  },

  // ── Lady Liu (Rank 7 — Jieyu) ─────────────────────────────────────────────
  {
    id: 'lady-liu',
    name: 'Lady Liu',
    portraitId: 'lady-liu',
    tier: 'bronze',
    haremRank: 7,
    tags: ['female', 'noble', 'concubine'],
    conditions: [],
    stats: {
      beauty: 4, cunning: 2, eloquence: 3, discretion: 2,
      resolve: 2, vitality: 3, resourcefulness: 1, spiritualArts: 2, scholarship: 2,
    },
    equipment: {
      attire:    ATTIRE_CRIMSON_COURT_DRESS,
      accessory: null,
      tool:      null,
    },
  },

  // ── Lady Mei (Rank 8 — Meiren) ────────────────────────────────────────────
  {
    id: 'lady-mei',
    name: 'Lady Mei',
    portraitId: 'lady-mei',
    tier: 'bronze',
    haremRank: 8,
    tags: ['female', 'commoner', 'concubine', 'scapegoat-eligible'],
    conditions: ['pregnant'],
    stats: {
      beauty: 5, cunning: 1, eloquence: 2, discretion: 1,
      resolve: 2, vitality: 4, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
    },
    equipment: {
      attire:    null,
      accessory: null,
      tool:      null,
    },
  },

  // ── Palace Maid Xiu ───────────────────────────────────────────────────────
  {
    id: 'maid-xiu',
    name: 'Maid Xiu',
    portraitId: 'Servant 2',
    tier: 'clay',
    tags: ['female', 'servant', 'maid', 'scapegoat-eligible'],
    conditions: [],
    stats: {
      beauty: 2, cunning: 1, eloquence: 1, discretion: 1,
      resolve: 1, vitality: 2, resourcefulness: 1, spiritualArts: 0, scholarship: 0,
    },
    equipment: {
      attire:    null,
      accessory: null,
      tool:      null,
    },
  },

  // ── Scholar Hong ──────────────────────────────────────────────────────────
  {
    id: 'scholar-hong',
    name: 'Scholar Hong',
    portraitId: 'scholar-hong',
    tier: 'bronze',
    title: 'Court Scholar',
    tags: ['male', 'official', 'scholar', 'follower'],
    conditions: [],
    stats: {
      beauty: 1, cunning: 3, eloquence: 3, discretion: 2,
      resolve: 2, vitality: 1, resourcefulness: 1, spiritualArts: 1, scholarship: 5,
    },
    equipment: {
      attire:    ATTIRE_SCHOLARS_INDIGO,
      accessory: ACC_SCHOLARS_INK_PENDANT,
      tool:      TOOL_FOUR_TREASURES,
    },
  },
]
