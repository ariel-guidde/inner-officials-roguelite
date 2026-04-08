// =============================================================================
// events/types.ts
// Content-layer types for event definitions, storylines, and spawn control.
//
// Architecture:
//   EventDefinition = static blueprint (data).
//   EventRuntimeState = per-run state machine instance.
//   GameEvent = live map instance (created when state transitions to onMap).
//
// Spawning is pool-only. No direct triggers. Prerequisites gate everything.
// =============================================================================

import type {
  AgentCondition, AgentTag, AgentTier, Consequence,
  EventType, EventUrgency, HaremRank, LocationId,
  ReputationState, StatName,
} from '@core/types'

// ---------------------------------------------------------------------------
// Resolution types — how an event ended
// ---------------------------------------------------------------------------

export type ResolutionType =
  | 'success'
  | 'failure'
  | 'criticalSuccess'
  | 'criticalFailure'
  | 'expired'

// ---------------------------------------------------------------------------
// Event state machine
// ---------------------------------------------------------------------------

export type EventState = 'unmet' | 'ready' | 'onMap' | 'resolved' | 'skipped'

export interface EventRuntimeState {
  defId: string
  state: EventState
  resolution?: ResolutionType
  /** Dilemma choice made during resolution, if any. */
  choiceId?: string
  /** Day the event was placed on the map. */
  dayPlaced?: number
  /** Day the event was resolved. */
  dayResolved?: number
}

// ---------------------------------------------------------------------------
// Prerequisites — conditions that must be true for an event to become ready
// ---------------------------------------------------------------------------

export type EventPrerequisite =
  // Event state checks
  | { kind: 'eventResolved'; defId: string; resolution?: ResolutionType }
  | { kind: 'eventNotResolved'; defId: string }
  | { kind: 'eventOnMap'; defId: string }

  // Dilemma choice checks
  | { kind: 'choiceMade'; eventDefId: string; choiceId: string }
  | { kind: 'choiceNotMade'; eventDefId: string; choiceId: string }

  // Day range
  | { kind: 'dayMin'; day: number }
  | { kind: 'dayMax'; day: number }

  // Location
  | { kind: 'locationUnlocked'; locationId: LocationId }

  // Reputation
  | { kind: 'reputationMin'; metric: keyof ReputationState; value: number }
  | { kind: 'reputationMax'; metric: keyof ReputationState; value: number }

  // Resources
  | { kind: 'resourceMin'; resource: 'silver' | 'goldenDice'; value: number }

  // Agent state
  | { kind: 'agentHasCondition'; agentId: string; condition: AgentCondition }
  | { kind: 'agentAlive'; agentId: string }

  // Rank
  | { kind: 'haremRankMin'; rank: HaremRank }

  // Combinators
  | { kind: 'anyOf'; conditions: EventPrerequisite[] }

// ---------------------------------------------------------------------------
// Slot template — EventSlot without runtime assignment state
// ---------------------------------------------------------------------------

export interface EventSlotTemplate {
  id: string
  isMandatory: boolean
  requiredTags: AgentTag[]
  anyRequiredTag?: AgentTag[]
  requiredTier?: AgentTier
  npcAgentId?: string
}

// ---------------------------------------------------------------------------
// Dilemma — a decision point inside an event's resolution
// ---------------------------------------------------------------------------

export interface DilemmaChoice {
  id: string
  label: string
  description: string
  /** Override the event's stats for the dice check. */
  overrideStats?: [StatName] | [StatName, StatName]
  overrideThreshold?: number
  /** If true, skip dice — choice IS the resolution (resolves as success). */
  skipDiceRoll?: boolean
  /** Prerequisites to see this choice (hidden if unmet). */
  prerequisites?: EventPrerequisite[]
  /** Resource cost to pick this choice. */
  cost?: { silver?: number; goldenDice?: number }
  /** Consequences applied immediately when chosen (before dice). */
  immediateConsequences?: Consequence[]
  /** Reputation shifts applied on choosing. */
  moralWeight?: Partial<ReputationState>
}

export interface Dilemma {
  id: string
  /** When this dilemma is presented relative to the dice roll. */
  timing: 'before-roll' | 'after-success' | 'after-failure' | 'standalone'
  prompt: string
  choices: DilemmaChoice[]
}

// ---------------------------------------------------------------------------
// EventDefinition — the static blueprint
// ---------------------------------------------------------------------------

export interface EventDefinition {
  id: string
  /** Storyline this event belongs to, if any. */
  storylineId?: string
  type: EventType
  locationId: LocationId
  title: string
  description: string
  urgency: EventUrgency

  // Resolution mechanics
  statsChecked: [StatName] | [StatName, StatName]
  threshold: number
  oppositionValue: number
  /** How many days agents are committed before resolving. */
  durationDays: number
  /** Days until the event expires if ignored once onMap. null = no deadline. */
  daysUntilExpiry: number | null

  // Agent slots
  slots: EventSlotTemplate[]

  // Gating — when does this become ready?
  prerequisites: EventPrerequisite[]

  // Pool behavior
  /** Weight for random draw. Higher = more likely. */
  poolWeight: number
  /** When ready, always placed onMap (bypasses pool cap). */
  isForced?: boolean
  /** Can re-enter ready after being resolved. */
  isRepeatable?: boolean

  // Dilemma (optional)
  dilemma?: Dilemma

  // Graph metadata — used by StorylineEditor for edge drawing only.
  // NOT used by spawn logic.
  graphEdges?: {
    success?: string[]
    failure?: string[]
    expiry?: string[]
    choiceEdges?: { choiceId: string; success?: string[]; failure?: string[] }[]
  }
}

// ---------------------------------------------------------------------------
// Storyline — a named arc grouping related EventDefinitions
// ---------------------------------------------------------------------------

export interface Storyline {
  id: string
  title: string
  description: string
  /** Thematic tags for filtering. */
  tags: string[]
  /** Ids of events that start the storyline (pool entry points). */
  entryEventIds: string[]
  /** All event definition ids in this arc. */
  eventIds: string[]
}
