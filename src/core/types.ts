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

// ---------------------------------------------------------------------------
// AGENT TAGS
// ---------------------------------------------------------------------------

export type AgentTag =
  | 'maid'
  | 'eunuch'
  | 'scholar'
  | 'guard'
  | 'consort'
  | 'monk'
  | 'merchant'
  | 'noble'
  | 'protagonist'

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
  isProtagonist?: boolean
  /**
   * Resentment level (0–5). Relevant only to Chunhua; 0 for all others.
   * Stored on Agent so the Characters module can display it without
   * knowing Chunhua's ID by hard-code.
   */
  resentment?: number
  /** Day on which the agent becomes available again (multi-day lock). */
  lockedUntilDay?: number
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
