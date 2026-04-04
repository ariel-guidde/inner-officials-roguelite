import type { Equipment } from '@core/types'

// =============================================================================
// Sample equipment items for Playground testing.
// Covers all 4 slots and a spread of tiers/requirements.
// =============================================================================

// ---------------------------------------------------------------------------
// ATTIRE
// ---------------------------------------------------------------------------

export const ATTIRE_SIMPLE_COTTON: Equipment = {
  id: 'attire-cotton-robe',
  name: 'Simple Cotton Robe',
  slot: 'attire',
  tier: 'clay',
  itemTags: ['court'],
  statBonus: {},
  requires: {},
}

export const ATTIRE_COURT_CEREMONIAL: Equipment = {
  id: 'attire-court-ceremonial',
  name: 'Court Ceremonial Dress',
  slot: 'attire',
  tier: 'bronze',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 2 },
  requires: { anyTag: ['concubine', 'palace-lady'], minStats: { beauty: 2 } },
  description: '+2 Beauty on court events.',
}

export const ATTIRE_SCHOLARS_ROBE: Equipment = {
  id: 'attire-scholars-robe',
  name: "Scholar's Formal Robe",
  slot: 'attire',
  tier: 'bronze',
  itemTags: ['court', 'scholarly'],
  statBonus: { scholarship: 1 },
  requires: { anyTag: ['scholar', 'official'] },
}

export const ATTIRE_GUARD_UNIFORM: Equipment = {
  id: 'attire-guard-uniform',
  name: 'Guard Uniform',
  slot: 'attire',
  tier: 'clay',
  itemTags: ['court'],
  statBonus: { resolve: 1 },
  requires: { tags: ['guard'] },
}

export const ATTIRE_FESTIVAL_GOWN: Equipment = {
  id: 'attire-festival-gown',
  name: 'Festival Performance Gown',
  slot: 'attire',
  tier: 'silver',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 3, eloquence: 1 },
  requires: { anyTag: ['concubine', 'entertainer'], tags: ['female'], minStats: { beauty: 4 } },
  description: '+3 Beauty and +1 Eloquence at performances.',
}

export const ATTIRE_IMPERIAL_SILK: Equipment = {
  id: 'attire-imperial-silk',
  name: 'Imperial-Pattern Silk',
  slot: 'attire',
  tier: 'gold',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 2 },
  requires: { anyTag: ['imperial'], minTier: 'gold' },
  description: '+2 Beauty; unlocks Imperial Wing events.',
}

// ---------------------------------------------------------------------------
// ACCESSORIES
// ---------------------------------------------------------------------------

export const ACC_PLAIN_HAIRPIN: Equipment = {
  id: 'acc-plain-hairpin',
  name: 'Plain Hairpin',
  slot: 'accessory',
  tier: 'clay',
  itemTags: [],
  statBonus: {},
  requires: { tags: ['female'] },
}

export const ACC_JADE_HAIRPIN: Equipment = {
  id: 'acc-jade-hairpin',
  name: 'Jade Hairpin',
  slot: 'accessory',
  tier: 'bronze',
  itemTags: ['spiritual'],
  statBonus: { spiritualArts: 1 },
  requires: { tags: ['female'] },
}

export const ACC_GOLD_PHOENIX: Equipment = {
  id: 'acc-gold-phoenix',
  name: 'Gold Phoenix Ornament',
  slot: 'accessory',
  tier: 'silver',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 2, eloquence: 1 },
  requires: { anyTag: ['noble', 'concubine', 'imperial'], minStats: { beauty: 3 } },
}

export const ACC_PRAYER_BEADS: Equipment = {
  id: 'acc-prayer-beads',
  name: 'Prayer Bead Bracelet',
  slot: 'accessory',
  tier: 'clay',
  itemTags: ['spiritual'],
  statBonus: { spiritualArts: 1, resolve: 1 },
  requires: {},
}

export const ACC_SCHOLARS_PENDANT: Equipment = {
  id: 'acc-scholars-pendant',
  name: "Scholar's Ink Pendant",
  slot: 'accessory',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 1 },
  requires: { anyTag: ['scholar'] },
}

export const ACC_JADE_THUMB_RING: Equipment = {
  id: 'acc-jade-thumb-ring',
  name: 'Jade Thumb Ring',
  slot: 'accessory',
  tier: 'bronze',
  itemTags: [],
  statBonus: { martial: 1 },
  requires: { tags: ['guard'], minMartial: 1 },
}

// ---------------------------------------------------------------------------
// TOOLS
// ---------------------------------------------------------------------------

export const TOOL_BRUSH_SET: Equipment = {
  id: 'tool-brush-set',
  name: "Scholar's Brush Set",
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 1 },
  requires: { anyTag: ['scholar'], minStats: { scholarship: 2 } },
}

export const TOOL_MEDICINE_CHEST: Equipment = {
  id: 'tool-medicine-chest',
  name: 'Medicine Chest',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['medicinal'],
  statBonus: { vitality: 1 },
  requires: { anyTag: ['physician'], minStats: { scholarship: 3 } },
  description: '+1 Vitality on healing events. Can treat Ill/Poisoned.',
}

export const TOOL_INCENSE_BURNER: Equipment = {
  id: 'tool-incense-burner',
  name: 'Incense Burner',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['spiritual', 'ceremonial'],
  statBonus: { spiritualArts: 2 },
  requires: { anyTag: ['priest'], minStats: { spiritualArts: 2 } },
}

export const TOOL_ACCOUNT_LEDGER: Equipment = {
  id: 'tool-account-ledger',
  name: 'Account Ledger',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { resourcefulness: 2 },
  requires: { anyTag: ['eunuch', 'merchant'], minStats: { cunning: 2 } },
}

export const TOOL_SURVEILLANCE_DOSSIER: Equipment = {
  id: 'tool-surveillance-dossier',
  name: 'Surveillance Dossier',
  slot: 'tool',
  tier: 'silver',
  itemTags: ['covert'],
  statBonus: { discretion: 1 },
  requires: { minStats: { cunning: 3, discretion: 2 } },
  description: '+1 Discretion; enables Eavesdropping and Informant events.',
}

export const TOOL_DIVINATION_STICKS: Equipment = {
  id: 'tool-divination-sticks',
  name: 'Divination Sticks',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['spiritual'],
  statBonus: { spiritualArts: 1 },
  requires: { anyTag: ['priest'], minStats: { spiritualArts: 1 } },
}

// ---------------------------------------------------------------------------
// WEAPONS (guards only)
// ---------------------------------------------------------------------------

export const WEAP_PALACE_BLADE: Equipment = {
  id: 'weap-palace-blade',
  name: 'Palace Short Blade',
  slot: 'weapon',
  tier: 'clay',
  itemTags: [],
  statBonus: { martial: 1 },
  requires: { tags: ['guard'] },
}

export const WEAP_OFFICERS_SWORD: Equipment = {
  id: 'weap-officers-sword',
  name: "Officer's Sword",
  slot: 'weapon',
  tier: 'bronze',
  itemTags: ['court'],
  statBonus: { martial: 2 },
  requires: { tags: ['guard'], minMartial: 2 },
  description: '+2 Martial; +1 on Eloquence checks with physical threat.',
}

export const WEAP_BOW_QUIVER: Equipment = {
  id: 'weap-bow-quiver',
  name: 'Bow and Quiver',
  slot: 'weapon',
  tier: 'bronze',
  itemTags: [],
  statBonus: { martial: 1 },
  requires: { tags: ['guard'], minMartial: 2 },
  description: 'Enables Ranged Combat and Assassination-Intercept events.',
}

export const WEAP_COMMANDERS_HALBERD: Equipment = {
  id: 'weap-commanders-halberd',
  name: "Commander's Halberd",
  slot: 'weapon',
  tier: 'silver',
  itemTags: [],
  statBonus: { martial: 3 },
  requires: { tags: ['guard'], minMartial: 3, minTier: 'silver' },
  description: 'Enables Multi-Opponent events.',
}

// ---------------------------------------------------------------------------
// ALL items flat list (for Inventory panel)
// ---------------------------------------------------------------------------

export const ALL_EQUIPMENT: Equipment[] = [
  ATTIRE_SIMPLE_COTTON, ATTIRE_COURT_CEREMONIAL, ATTIRE_SCHOLARS_ROBE,
  ATTIRE_GUARD_UNIFORM, ATTIRE_FESTIVAL_GOWN, ATTIRE_IMPERIAL_SILK,
  ACC_PLAIN_HAIRPIN, ACC_JADE_HAIRPIN, ACC_GOLD_PHOENIX,
  ACC_PRAYER_BEADS, ACC_SCHOLARS_PENDANT, ACC_JADE_THUMB_RING,
  TOOL_BRUSH_SET, TOOL_MEDICINE_CHEST, TOOL_INCENSE_BURNER,
  TOOL_ACCOUNT_LEDGER, TOOL_SURVEILLANCE_DOSSIER, TOOL_DIVINATION_STICKS,
  WEAP_PALACE_BLADE, WEAP_OFFICERS_SWORD, WEAP_BOW_QUIVER, WEAP_COMMANDERS_HALBERD,
]
