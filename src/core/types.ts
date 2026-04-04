// =============================================================================
// src/core/types.ts
// Single source of truth for all shared domain types.
// No module may define its own version of anything declared here.
// =============================================================================

// ---------------------------------------------------------------------------
// AGENT TIER
// ---------------------------------------------------------------------------

export type AgentTier = 'clay' | 'bronze' | 'silver' | 'gold' | 'jade'

export const AGENT_TIER_LABELS: Record<AgentTier, string> = {
  clay:   '陶 Clay',
  bronze: '铜 Bronze',
  silver: '银 Silver',
  gold:   '金 Gold',
  jade:   '玉 Jade',
} as const

export const AGENT_TIER_COLORS: Record<AgentTier, string> = {
  clay:   '#c4956a',
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold:   '#ffd700',
  jade:   '#00a86b',
} as const

/** English-only tier names (no Chinese prefix). */
export const AGENT_TIER_NAMES: Record<AgentTier, string> = {
  clay: 'Clay', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', jade: 'Jade',
} as const

export const AGENT_TIER_ORDER: AgentTier[] = ['clay', 'bronze', 'silver', 'gold', 'jade']

export function tierAtLeast(a: AgentTier, b: AgentTier): boolean {
  return AGENT_TIER_ORDER.indexOf(a) >= AGENT_TIER_ORDER.indexOf(b)
}

// ---------------------------------------------------------------------------
// STAT NAMES
// ---------------------------------------------------------------------------

export type StatName =
  | 'beauty'
  | 'cunning'
  | 'eloquence'
  | 'discretion'
  | 'resolve'
  | 'vitality'
  | 'resourcefulness'
  | 'spiritualArts'
  | 'scholarship'

export const ALL_STATS: readonly StatName[] = [
  'beauty',
  'cunning',
  'eloquence',
  'discretion',
  'resolve',
  'vitality',
  'resourcefulness',
  'spiritualArts',
  'scholarship',
] as const

export const STAT_LABELS: Record<StatName, { en: string; zh: string }> = {
  beauty:          { en: 'Beauty',          zh: '容貌' },
  cunning:         { en: 'Cunning',         zh: '智谋' },
  eloquence:       { en: 'Eloquence',       zh: '口才' },
  discretion:      { en: 'Discretion',      zh: '机密' },
  resolve:         { en: 'Resolve',         zh: '意志' },
  vitality:        { en: 'Vitality',        zh: '体魄' },
  resourcefulness: { en: 'Resourcefulness', zh: '应变' },
  spiritualArts:   { en: 'Spiritual Arts',  zh: '玄术' },
  scholarship:     { en: 'Scholarship',     zh: '学识' },
} as const

/** 3-letter abbreviations for compact UI display. */
export const STAT_ABBREVIATIONS: Record<StatName, string> = {
  beauty: 'Bty', cunning: 'Cng', eloquence: 'Elq', discretion: 'Dsc',
  resolve: 'Rsv', vitality: 'Vtl', resourcefulness: 'Rsf', spiritualArts: 'Spr', scholarship: 'Sch',
} as const

/** All 9 core stats. Martial is a separate optional property on StatBlock. */
export type StatBlock = Record<StatName, number> & {
  /** Guards only — 0–5. Absent means 0. */
  martial?: number
}

// ---------------------------------------------------------------------------
// AGENT CONDITIONS
// ---------------------------------------------------------------------------

export type AgentCondition =
  | 'poisoned'
  | 'ill'
  | 'injured'
  | 'disgraced'
  | 'imprisoned'
  | 'mourning'
  | 'pregnant'
  | 'cursed'

export const CONDITION_LABELS: Record<AgentCondition, { en: string; zh: string }> = {
  poisoned:   { en: 'Poisoned',    zh: '中毒' },
  ill:        { en: 'Ill',         zh: '染病' },
  injured:    { en: 'Injured',     zh: '受伤' },
  disgraced:  { en: 'Disgraced',   zh: '失宠' },
  imprisoned: { en: 'Imprisoned',  zh: '下狱' },
  mourning:   { en: 'Mourning',    zh: '服丧' },
  pregnant:   { en: 'Pregnant',    zh: '有孕' },
  cursed:     { en: 'Cursed',      zh: '受咒' },
} as const

/** Conditions that prevent an agent from being assigned to any event. */
export const BLOCKING_CONDITIONS: ReadonlySet<AgentCondition> = new Set([
  'injured',
  'imprisoned',
])

export const CONDITION_ICONS: Record<AgentCondition, string> = {
  poisoned: '☠', ill: '🤒', injured: '🩸', disgraced: '👁',
  imprisoned: '⛓', mourning: '🕯', pregnant: '🌸', cursed: '🌀',
} as const

/** Semantic background + foreground colors for condition chips. */
export const CONDITION_COLORS: Record<AgentCondition, { bg: string; text: string }> = {
  poisoned:   { bg: 'rgba(80,120,30,0.25)',   text: '#90c050' },
  ill:        { bg: 'rgba(180,120,30,0.2)',   text: '#d09040' },
  injured:    { bg: 'rgba(204,43,0,0.2)',     text: '#e06040' },
  disgraced:  { bg: 'rgba(100,20,20,0.25)',   text: '#c06060' },
  imprisoned: { bg: 'rgba(80,0,0,0.3)',       text: '#c04040' },
  mourning:   { bg: 'rgba(60,60,80,0.25)',    text: '#a0a0c0' },
  pregnant:   { bg: 'rgba(180,140,160,0.2)',  text: '#d0a8c0' },
  cursed:     { bg: 'rgba(80,30,120,0.25)',   text: '#b070d0' },
} as const

// ---------------------------------------------------------------------------
// AGENT TAGS
// ---------------------------------------------------------------------------

/** Gender */
export type GenderTag = 'female' | 'male'

/** Legal/social standing */
export type StatusTag = 'imperial' | 'noble' | 'official' | 'commoner' | 'servant' | 'slave'

/** Inner court role (women in the harem hierarchy) */
export type CourtRoleTag = 'empress' | 'concubine' | 'palace-lady' | 'matriarch'

/** Professional service role */
export type ServiceRoleTag =
  | 'eunuch' | 'maid' | 'guard' | 'scholar'
  | 'physician' | 'entertainer' | 'priest' | 'merchant' | 'cook'

/** Game-mechanical classification */
export type MechanicalTag = 'protagonist' | 'follower' | 'scapegoat-eligible'

export type AgentTag = GenderTag | StatusTag | CourtRoleTag | ServiceRoleTag | MechanicalTag

export type TagCategory = 'gender' | 'status' | 'court-role' | 'service-role' | 'mechanical'

export const TAG_CATEGORY: Record<AgentTag, TagCategory> = {
  // gender
  female: 'gender',    male: 'gender',
  // status
  imperial: 'status',  noble: 'status',  official: 'status',
  commoner: 'status',  servant: 'status', slave: 'status',
  // court-role
  empress: 'court-role',  concubine: 'court-role',
  'palace-lady': 'court-role',  matriarch: 'court-role',
  // service-role
  eunuch: 'service-role',  maid: 'service-role',  guard: 'service-role',
  scholar: 'service-role', physician: 'service-role', entertainer: 'service-role',
  priest: 'service-role',  merchant: 'service-role', cook: 'service-role',
  // mechanical
  protagonist: 'mechanical',  follower: 'mechanical',  'scapegoat-eligible': 'mechanical',
}

export const TAG_LABELS: Record<AgentTag, string> = {
  female: 'Female',          male: 'Male',
  imperial: 'Imperial',      noble: 'Noble',        official: 'Official',
  commoner: 'Commoner',      servant: 'Servant',    slave: 'Slave',
  empress: 'Empress',        concubine: 'Concubine', 'palace-lady': 'Palace Lady',
  matriarch: 'Matriarch',
  eunuch: 'Eunuch',          maid: 'Maid',          guard: 'Guard',
  scholar: 'Scholar',        physician: 'Physician', entertainer: 'Entertainer',
  priest: 'Priest',          merchant: 'Merchant',  cook: 'Cook',
  protagonist: 'Protagonist', follower: 'Follower',  'scapegoat-eligible': 'Expendable',
}

// ---------------------------------------------------------------------------
// EQUIPMENT
// ---------------------------------------------------------------------------

export type EquipmentSlot = 'attire' | 'accessory' | 'tool' | 'weapon'

export const EQUIPMENT_SLOT_ICONS: Record<EquipmentSlot, string> = {
  attire: '👘', accessory: '💎', tool: '📜', weapon: '⚔',
} as const

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  attire: 'Attire', accessory: 'Accessory', tool: 'Tool', weapon: 'Weapon',
} as const

export type EquipmentItemTag = 'court' | 'scholarly' | 'spiritual' | 'medicinal' | 'covert' | 'ceremonial'

export const EQUIPMENT_ITEM_TAG_LABELS: Record<EquipmentItemTag, string> = {
  court: 'Court', scholarly: 'Scholarly', spiritual: 'Spiritual',
  medicinal: 'Medicinal', covert: 'Covert', ceremonial: 'Ceremonial',
} as const

export const EQUIPMENT_ITEM_TAG_COLORS: Record<EquipmentItemTag, string> = {
  court: '#b09050', scholarly: '#4080c0', spiritual: '#8050c0',
  medicinal: '#408050', covert: '#604060', ceremonial: '#c08040',
} as const

export interface EquipmentRequirements {
  /** Agent must have ALL of these tags */
  tags?: AgentTag[]
  /** Agent must have AT LEAST ONE of these tags */
  anyTag?: AgentTag[]
  minStats?: Partial<Record<StatName, number>>
  minTier?: AgentTier
  minMartial?: number
}

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  tier: AgentTier
  itemTags: EquipmentItemTag[]
  /** Additive stat bonuses while equipped */
  statBonus: Partial<StatBlock>
  requires: EquipmentRequirements
  description?: string
}

export type EquipmentLoadout = Partial<Record<EquipmentSlot, Equipment | null>>

// ---------------------------------------------------------------------------
// AGENT
// ---------------------------------------------------------------------------

export interface Agent {
  id: string
  name: string
  chineseName?: string
  /** File stem under src/assets/portraits/, without extension. */
  portraitId: string
  tier: AgentTier
  stats: StatBlock
  conditions: AgentCondition[]
  tags: AgentTag[]
  equipment?: EquipmentLoadout
  isProtagonist?: boolean
  /**
   * Resentment level (0–5). Relevant only to Chunhua; 0 for all others.
   * Stored on Agent so the Characters module can display it without
   * knowing Chunhua's ID by hard-code.
   */
  resentment?: number
  /** Day on which the agent becomes available again (multi-day lock). */
  lockedUntilDay?: number
  /** Harem rank (1–9). Shown on concubine cards. */
  haremRank?: HaremRank
  /** Override display title (e.g. "Emperor", "Chief Eunuch"). Shown in place of rank. */
  title?: string
}

// ---------------------------------------------------------------------------
// DICE
// ---------------------------------------------------------------------------

export type DieFace = 'dragon' | 'cloud'

export type DiceDifficulty = 'gentle' | 'standard' | 'ruthless'

export const DIFFICULTY_SUCCESS_RATE: Record<DiceDifficulty, number> = {
  gentle:   0.6,
  standard: 0.5,
  ruthless: 0.4,
} as const

export interface DieResult {
  id: string
  face: DieFace
  isGolden: boolean
}

export interface DiceRollConfig {
  /** Number of regular dice to roll (opposition already subtracted). */
  pool: number
  /** Successes required to pass. */
  threshold: number
  /** Highest tier among assigned agents — drives the die material. */
  tier: AgentTier
  difficulty: DiceDifficulty
  /** Auto-successes from the Golden Dice resource, added before rolling. */
  goldenDice: number
  /** Human-readable label for the event being resolved. */
  eventLabel?: string
}

export interface DiceRollResult {
  /** One entry per die actually rolled (excludes golden dice). */
  dice: DieResult[]
  /** Regular successes + golden dice. */
  successes: number
  isSuccess: boolean
  /** Every regular die showed dragon. */
  isCriticalSuccess: boolean
  /** Zero successes on regular dice (golden dice still count). */
  isCriticalFailure: boolean
  /** successes − threshold; negative means shortfall. */
  margin: number
}

// ---------------------------------------------------------------------------
// INTELLIGENCE SCROLLS
// ---------------------------------------------------------------------------

export type IntelligenceType =
  | 'courtWhispers'
  | 'palaceSecrets'
  | 'medicalNotes'
  | 'spiritualOmens'
  | 'beautyTechniques'

export const INTELLIGENCE_LABELS: Record<IntelligenceType, { en: string; zh: string }> = {
  courtWhispers:    { en: 'Court Whispers',     zh: '宫闱密语' },
  palaceSecrets:    { en: 'Palace Secrets',     zh: '宫中秘辛' },
  medicalNotes:     { en: 'Medical Notes',      zh: '医案' },
  spiritualOmens:   { en: 'Spiritual Omens',    zh: '天兆' },
  beautyTechniques: { en: 'Beauty Techniques',  zh: '容术' },
} as const

export interface IntelligenceScroll {
  id: string
  type: IntelligenceType
}

// ---------------------------------------------------------------------------
// MAP & LOCATIONS
// ---------------------------------------------------------------------------

export type LocationId =
  | 'chambers'
  | 'innerCourt'
  | 'householdOffice'
  | 'imperialLibrary'
  | 'imperialGardens'
  | 'emperorQuarters'
  | 'wuFamilyNetwork'
  | 'palacePhysician'
  | 'eunuchQuarter'
  | 'buddhistTemple'
  | 'tradeQuarter'
  | 'festivalGrounds'

export const LOCATION_LABELS: Record<LocationId, { en: string; zh: string }> = {
  chambers:         { en: 'Your Chambers',       zh: '寝殿' },
  innerCourt:       { en: 'Inner Court',          zh: '内廷' },
  householdOffice:  { en: 'Household Office',     zh: '管家' },
  imperialLibrary:  { en: 'Imperial Library',     zh: '藏书阁' },
  imperialGardens:  { en: 'Imperial Gardens',     zh: '御花园' },
  emperorQuarters:  { en: "Emperor's Quarters",   zh: '龙寝' },
  wuFamilyNetwork:  { en: 'Wu Family Network',    zh: '外戚' },
  palacePhysician:  { en: 'Palace Physician',     zh: '太医院' },
  eunuchQuarter:    { en: 'Eunuch Quarter',       zh: '内侍省' },
  buddhistTemple:   { en: 'Buddhist Temple',      zh: '佛寺' },
  tradeQuarter:     { en: 'Trade Quarter',        zh: '市坊' },
  festivalGrounds:  { en: 'Festival Grounds',     zh: '庆典场' },
} as const

export type EventUrgency = 'routine' | 'timed' | 'crisis' | 'opportunity'

export type EventType =
  | 'ceremony'
  | 'imperialFavor'
  | 'dominion'
  | 'justiceAndPunishment'
  | 'estateManagement'
  | 'social'
  | 'spiritual'
  | 'investigation'
  | 'personal'

export interface EventSlot {
  id: string
  assignedAgentId: string | null
  isMandatory: boolean
  requiredTags: AgentTag[]
  requiredTier?: AgentTier
}

export interface GameEvent {
  id: string
  locationId: LocationId
  title: string
  description: string
  type: EventType
  urgency: EventUrgency
  statsChecked: [StatName] | [StatName, StatName]
  threshold: number
  daysRemaining: number | null
  slots: EventSlot[]
  durationDays: number
  isCompleted: boolean
  isExpired: boolean
  /** Opposition stat total. 0 = uncontested. */
  oppositionValue: number
}

export interface MapNodeData {
  id: LocationId
  /** Percentage-based position on a 1200×800 canvas (0–100). */
  position: { x: number; y: number }
  events: GameEvent[]
  isUnlocked: boolean
  isVisible: boolean
}

// ---------------------------------------------------------------------------
// REPUTATION METRICS
// ---------------------------------------------------------------------------

export interface ReputationState {
  /** 贤德 Virtue */
  virtue: number
  /** 狠辣 Ruthlessness */
  ruthlessness: number
  /** 圣眷 Imperial Favor (0–50) */
  imperialFavor: number
  /** 暗网 Shadow Reach */
  shadowReach: number
  /** 天眼 Heavenly Sight */
  heavenlySight: number
  /** 谗言 Slander stacks (0–3 before rebuke) */
  slander: number
}

// ---------------------------------------------------------------------------
// RESOURCES
// ---------------------------------------------------------------------------

export interface ResourceState {
  silver: number
  intelligenceScrolls: IntelligenceScroll[]
  goldenDice: number
}

// ---------------------------------------------------------------------------
// HAREM RANK
// ---------------------------------------------------------------------------

export type HaremRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const RANK_TITLES: Record<HaremRank, { zh: string; en: string }> = {
  9: { zh: '才人', en: 'Cairen — Talented Lady' },
  8: { zh: '美人', en: 'Meiren — Beauty' },
  7: { zh: '婕妤', en: 'Jieyu — Handsome Fairness' },
  6: { zh: '昭仪', en: 'Zhaoyi — Lady of Bright Deportment' },
  5: { zh: '充媛', en: 'Chongyuan — Lady of Full Grace' },
  4: { zh: '贵嫔', en: 'Guipin — Noble Consort' },
  3: { zh: '淑妃', en: 'Shufei — Virtuous Consort' },
  2: { zh: '贵妃', en: 'Guifei — Imperial Consort' },
  1: { zh: '皇后', en: 'Huanghou — Empress' },
} as const

/** "9 · Cairen" — compact badge label. */
export function agentRankShort(rank: HaremRank): string {
  return `${rank} · ${RANK_TITLES[rank].en.split(' — ')[0]}`
}

/** "Rank 9 — Cairen — Talented Lady" — full detail label. */
export function agentRankFull(rank: HaremRank): string {
  return `Rank ${rank} — ${RANK_TITLES[rank].en}`
}

// ---------------------------------------------------------------------------
// DAY / GAME PHASE
// ---------------------------------------------------------------------------

export type DayPhase = 'dawn' | 'morning' | 'midday' | 'evening' | 'night'

export const DAY_PHASE_ORDER: DayPhase[] = ['dawn', 'morning', 'midday', 'evening', 'night']

export type GamePhase = 'setup' | 'run' | 'gameOver'

export type GameOutcome = 'victory' | 'death' | 'exile' | 'betrayal' | 'ongoing'

// ---------------------------------------------------------------------------
// FULL GAME STATE  (matches Zustand store shape)
// ---------------------------------------------------------------------------

export interface GameState {
  phase: GamePhase
  outcome: GameOutcome
  currentDay: number
  dayPhase: DayPhase
  edictDaysRemaining: number
  edictsCompleted: number

  protagonistId: string
  haremRank: HaremRank

  resources: ResourceState
  reputation: ReputationState

  agents: Agent[]
  mapNodes: MapNodeData[]
  activeEvents: GameEvent[]

  pendingRoll: DiceRollConfig | null
  lastRollResult: DiceRollResult | null

  difficulty: DiceDifficulty
  isRolling: boolean
}
