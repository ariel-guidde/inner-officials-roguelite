import type { Equipment } from '@core/types'

// =============================================================================
// Equipment catalog — named items for the Tang court setting.
// =============================================================================

// ---------------------------------------------------------------------------
// ATTIRE
// ---------------------------------------------------------------------------

export const ATTIRE_PLAIN_HEMP: Equipment = {
  id: 'attire-plain-hemp',
  name: 'Plain Hemp Dress',
  slot: 'attire',
  tier: 'clay',
  itemTags: [],
  statBonus: {},
  requires: {},
}

export const ATTIRE_BLUE_PHOENIX_ROBE: Equipment = {
  id: 'attire-blue-phoenix',
  name: 'Blue Phoenix Summer Robe',
  slot: 'attire',
  tier: 'bronze',
  itemTags: ['court'],
  statBonus: { beauty: 1, eloquence: 1 },
  requires: { tags: ['female'] },
  description: 'Light silk with embroidered phoenix motifs. Worn at informal court gatherings.',
}

export const ATTIRE_PEONY_BROCADE: Equipment = {
  id: 'attire-peony-brocade',
  name: 'Peony Brocade Gown',
  slot: 'attire',
  tier: 'silver',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 3, eloquence: 1 },
  requires: { tags: ['female'], minStats: { beauty: 3 } },
  description: 'Layers of peony-patterned silk. The kind of gown that makes a room go quiet.',
}

export const ATTIRE_CRIMSON_COURT_DRESS: Equipment = {
  id: 'attire-crimson-court',
  name: 'Crimson Court Dress',
  slot: 'attire',
  tier: 'bronze',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 2 },
  requires: { anyTag: ['concubine', 'palace-lady'] },
  description: 'Standard formal wear for morning audience. Correct, unremarkable.',
}

export const ATTIRE_MOURNING_WHITE: Equipment = {
  id: 'attire-mourning-white',
  name: 'Mourning White Silk',
  slot: 'attire',
  tier: 'clay',
  itemTags: ['ceremonial'],
  statBonus: { resolve: 1 },
  requires: {},
  description: 'Worn during periods of mourning. Projects dignity in grief.',
}

export const ATTIRE_SCHOLARS_INDIGO: Equipment = {
  id: 'attire-scholars-indigo',
  name: "Scholar's Indigo Robe",
  slot: 'attire',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 1 },
  requires: { anyTag: ['scholar', 'official'] },
}

export const ATTIRE_GUARD_LEATHER: Equipment = {
  id: 'attire-guard-leather',
  name: 'Palace Guard Leather',
  slot: 'attire',
  tier: 'clay',
  itemTags: [],
  statBonus: { resolve: 1 },
  requires: { tags: ['guard'] },
}

export const ATTIRE_GOLDEN_CLOUD_ROBE: Equipment = {
  id: 'attire-golden-cloud',
  name: 'Golden Cloud Festival Robe',
  slot: 'attire',
  tier: 'gold',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 4, eloquence: 2 },
  requires: { tags: ['female'], minStats: { beauty: 5 } },
  description: 'Gold thread on black silk, clouds and cranes. Only the most favored wear this.',
}

// ---------------------------------------------------------------------------
// ACCESSORIES
// ---------------------------------------------------------------------------

export const ACC_WOODEN_COMB: Equipment = {
  id: 'acc-wooden-comb',
  name: 'Sandalwood Comb',
  slot: 'accessory',
  tier: 'clay',
  itemTags: [],
  statBonus: { beauty: 1 },
  requires: { tags: ['female'] },
  description: 'Fragrant sandalwood. A small comfort in a cold palace.',
}

export const ACC_JADE_BUTTERFLY_PIN: Equipment = {
  id: 'acc-jade-butterfly',
  name: 'Jade Butterfly Hairpin',
  slot: 'accessory',
  tier: 'bronze',
  itemTags: ['court'],
  statBonus: { beauty: 1, discretion: 1 },
  requires: { tags: ['female'] },
  description: 'A delicate butterfly in pale jade. It catches the light when you bow.',
}

export const ACC_PEARL_DROP_EARRINGS: Equipment = {
  id: 'acc-pearl-drops',
  name: 'Pearl Drop Earrings',
  slot: 'accessory',
  tier: 'silver',
  itemTags: ['court'],
  statBonus: { beauty: 2, eloquence: 1 },
  requires: { tags: ['female'], minStats: { beauty: 3 } },
  description: 'South Sea pearls. They sway when you speak, drawing eyes to your lips.',
}

export const ACC_PRAYER_BEAD_BRACELET: Equipment = {
  id: 'acc-prayer-beads',
  name: 'Bodhi Prayer Beads',
  slot: 'accessory',
  tier: 'clay',
  itemTags: ['spiritual'],
  statBonus: { spiritualArts: 1, resolve: 1 },
  requires: {},
  description: '108 beads, worn smooth by devotion. Calms the mind before difficult moments.',
}

export const ACC_GOLD_PHOENIX_CROWN: Equipment = {
  id: 'acc-gold-phoenix',
  name: 'Gold Phoenix Hair Crown',
  slot: 'accessory',
  tier: 'gold',
  itemTags: ['court', 'ceremonial'],
  statBonus: { beauty: 3, eloquence: 2 },
  requires: { tags: ['female'], anyTag: ['noble', 'concubine', 'imperial'], minStats: { beauty: 5 } },
  description: 'A miniature phoenix in hammered gold. The court notices who wears this.',
}

export const ACC_SCHOLARS_INK_PENDANT: Equipment = {
  id: 'acc-ink-pendant',
  name: 'Ink Stone Pendant',
  slot: 'accessory',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 1 },
  requires: {},
  description: 'A polished ink stone on a silk cord. Marks you as lettered.',
}

export const ACC_SILVER_MIRROR: Equipment = {
  id: 'acc-silver-mirror',
  name: 'Polished Silver Mirror',
  slot: 'accessory',
  tier: 'bronze',
  itemTags: [],
  statBonus: { cunning: 1 },
  requires: { tags: ['female'] },
  description: 'See yourself as others see you. Also useful for seeing who stands behind you.',
}

// ---------------------------------------------------------------------------
// TOOLS
// ---------------------------------------------------------------------------

export const TOOL_LOTUS_BRUSH: Equipment = {
  id: 'tool-lotus-brush',
  name: 'Lotus Petal Brush',
  slot: 'tool',
  tier: 'clay',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 1 },
  requires: {},
  description: 'A fine-tipped brush with a lotus-carved handle. Good for calligraphy and poetry.',
}

export const TOOL_FOUR_TREASURES: Equipment = {
  id: 'tool-four-treasures',
  name: 'Four Treasures of the Study',
  slot: 'tool',
  tier: 'silver',
  itemTags: ['scholarly'],
  statBonus: { scholarship: 2, eloquence: 1 },
  requires: { minStats: { scholarship: 3 } },
  description: 'Brush, ink, paper, ink stone — the finest quality. A scholar\'s full kit.',
}

export const TOOL_LACQUER_FAN: Equipment = {
  id: 'tool-lacquer-fan',
  name: 'Red Lacquer Fan',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['court'],
  statBonus: { beauty: 1, discretion: 1 },
  requires: { tags: ['female'] },
  description: 'Hide your expression. Whisper behind it. Point with it. A fan is a language.',
}

export const TOOL_MEDICINE_POUCH: Equipment = {
  id: 'tool-medicine-pouch',
  name: 'Herbalist\'s Pouch',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['medicinal'],
  statBonus: { vitality: 1, resourcefulness: 1 },
  requires: {},
  description: 'Dried herbs, powders, a small mortar. Heals — or harms, depending on the hand.',
}

export const TOOL_BRONZE_INCENSE: Equipment = {
  id: 'tool-bronze-incense',
  name: 'Bronze Incense Burner',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['spiritual', 'ceremonial'],
  statBonus: { spiritualArts: 2 },
  requires: { anyTag: ['priest'], minStats: { spiritualArts: 2 } },
}

export const TOOL_ACCOUNT_LEDGER: Equipment = {
  id: 'tool-account-ledger',
  name: 'Household Account Ledger',
  slot: 'tool',
  tier: 'bronze',
  itemTags: ['scholarly'],
  statBonus: { resourcefulness: 2 },
  requires: { minStats: { cunning: 2 } },
  description: 'Numbers don\'t lie. But the person keeping the ledger might.',
}

export const TOOL_SILK_HANDKERCHIEF: Equipment = {
  id: 'tool-silk-handkerchief',
  name: 'Embroidered Silk Handkerchief',
  slot: 'tool',
  tier: 'clay',
  itemTags: [],
  statBonus: { beauty: 1 },
  requires: { tags: ['female'] },
  description: 'Drop it near the right person. Ancient technique, still works.',
}

export const TOOL_SURVEILLANCE_NOTES: Equipment = {
  id: 'tool-surveillance-notes',
  name: 'Surveillance Notes',
  slot: 'tool',
  tier: 'silver',
  itemTags: ['covert'],
  statBonus: { cunning: 1, discretion: 2 },
  requires: { minStats: { cunning: 3, discretion: 2 } },
  description: 'Who went where, when. Names, dates, patterns. Knowledge is leverage.',
}

// ---------------------------------------------------------------------------
// WEAPONS (guards only)
// ---------------------------------------------------------------------------

export const WEAP_PALACE_DAGGER: Equipment = {
  id: 'weap-palace-dagger',
  name: 'Palace Short Dagger',
  slot: 'weapon',
  tier: 'clay',
  itemTags: [],
  statBonus: { martial: 1 },
  requires: { tags: ['guard'] },
}

export const WEAP_OFFICERS_SWORD: Equipment = {
  id: 'weap-officers-sword',
  name: "Officer's Straight Sword",
  slot: 'weapon',
  tier: 'bronze',
  itemTags: ['court'],
  statBonus: { martial: 2 },
  requires: { tags: ['guard'], minMartial: 2 },
}

export const WEAP_COMMANDERS_HALBERD: Equipment = {
  id: 'weap-commanders-halberd',
  name: "Commander's Crescent Halberd",
  slot: 'weapon',
  tier: 'silver',
  itemTags: [],
  statBonus: { martial: 3 },
  requires: { tags: ['guard'], minMartial: 3, minTier: 'silver' },
}

// ---------------------------------------------------------------------------
// ALL items flat list
// ---------------------------------------------------------------------------

export const ALL_EQUIPMENT: Equipment[] = [
  ATTIRE_PLAIN_HEMP, ATTIRE_BLUE_PHOENIX_ROBE, ATTIRE_PEONY_BROCADE,
  ATTIRE_CRIMSON_COURT_DRESS, ATTIRE_MOURNING_WHITE, ATTIRE_SCHOLARS_INDIGO,
  ATTIRE_GUARD_LEATHER, ATTIRE_GOLDEN_CLOUD_ROBE,
  ACC_WOODEN_COMB, ACC_JADE_BUTTERFLY_PIN, ACC_PEARL_DROP_EARRINGS,
  ACC_PRAYER_BEAD_BRACELET, ACC_GOLD_PHOENIX_CROWN, ACC_SCHOLARS_INK_PENDANT,
  ACC_SILVER_MIRROR,
  TOOL_LOTUS_BRUSH, TOOL_FOUR_TREASURES, TOOL_LACQUER_FAN,
  TOOL_MEDICINE_POUCH, TOOL_BRONZE_INCENSE, TOOL_ACCOUNT_LEDGER,
  TOOL_SILK_HANDKERCHIEF, TOOL_SURVEILLANCE_NOTES,
  WEAP_PALACE_DAGGER, WEAP_OFFICERS_SWORD, WEAP_COMMANDERS_HALBERD,
]

// Items available at game start (the rest must be earned)
export const STARTING_EQUIPMENT: Equipment[] = [
  ATTIRE_PLAIN_HEMP, ACC_WOODEN_COMB, TOOL_LOTUS_BRUSH,
]

// Items that can be earned from events/dilemmas
export const EARNABLE_EQUIPMENT: Equipment[] = [
  ACC_JADE_BUTTERFLY_PIN, TOOL_LACQUER_FAN, ATTIRE_BLUE_PHOENIX_ROBE,
  ACC_SILVER_MIRROR, TOOL_MEDICINE_POUCH, ACC_PRAYER_BEAD_BRACELET,
]
