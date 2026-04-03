// =============================================================================
// src/core/events.ts
// Typed mitt event bus.
// Modules EMIT events here; other modules or the store LISTEN here.
// Never import a module from this file — only import from core/types.ts.
// =============================================================================

import mitt, { type Emitter } from 'mitt'
import type {
  AgentCondition,
  DiceRollConfig,
  DiceRollResult,
  GameEvent,
  HaremRank,
  LocationId,
} from './types'

// ---------------------------------------------------------------------------
// EVENT PAYLOAD MAP
// ---------------------------------------------------------------------------

export type GameEvents = {
  // --- Dice module ---
  'dice:rollRequested':  DiceRollConfig
  'dice:rollStarted':    { pool: number; goldenDice: number }
  'dice:rollSettled':    DiceRollResult
  'dice:rerollRequested': { scrollId: string }

  // --- Map module ---
  'map:nodeSelected':  { locationId: LocationId }
  'map:nodeHovered':   { locationId: LocationId | null }
  'map:eventOpened':   { eventId: string }
  'map:nodeUnlocked':  { locationId: LocationId }

  // --- Characters module ---
  'characters:agentSelected':  { agentId: string }
  'characters:agentDragStart': { agentId: string }
  'characters:agentAssigned':  { agentId: string; eventId: string; slotId: string }
  'characters:agentUnassigned':{ agentId: string; eventId: string; slotId: string }
  'characters:conditionChanged': {
    agentId: string
    added: AgentCondition[]
    removed: AgentCondition[]
  }

  // --- Day cycle ---
  'day:started':   { day: number }
  'day:phaseAdvanced': { phase: string }
  'day:resolved':  { day: number; successCount: number; failureCount: number }

  // --- Reputation / resources ---
  'reputation:imperialFavorChanged':    { delta: number; newValue: number }
  'reputation:slanderThreshold':        { count: number }
  'reputation:rankAdvancementAvailable':{ targetRank: HaremRank }
  'reputation:rankChanged':             { previousRank: HaremRank; newRank: HaremRank }
  'resource:silverChanged':             { delta: number; newValue: number }
  'resource:goldenDiceChanged':         { delta: number; newValue: number }

  // --- Edict cycle ---
  'edict:drawn':     { edictId: string; daysAllowed: number }
  'edict:fulfilled': { edictId: string }
  'edict:expired':   { edictId: string }

  // --- Playground-only (never emitted in production game path) ---
  'playground:diceDemo':    DiceRollConfig
  'playground:mapHighlight':{ locationId: LocationId | null }
  'playground:showAgent':   { agentId: string }

  // --- Debug ---
  'debug:log': { source: string; message: string; data?: unknown }
}

// ---------------------------------------------------------------------------
// SINGLETON BUS  — import `bus` directly, never construct new instances
// ---------------------------------------------------------------------------

export const bus: Emitter<GameEvents> = mitt<GameEvents>()

// ---------------------------------------------------------------------------
// TYPE HELPER
// Usage:  type Payload = EventPayload<'dice:rollSettled'>
// ---------------------------------------------------------------------------

export type EventPayload<K extends keyof GameEvents> = GameEvents[K]
