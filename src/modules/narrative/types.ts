// =============================================================================
// narrative/types.ts — Content-layer types for events (NOT game-state types)
// See design/mechanics/narrative-module.md for full design rationale.
// =============================================================================

import type { Consequence, OutcomeCondition } from '@core/types'

// ---------------------------------------------------------------------------
// EventChoice — a pre-roll approach the player selects
// ---------------------------------------------------------------------------

export interface EventChoice {
  id: string
  label: string
  description: string
  poolModifier?: number
  thresholdModifier?: number
  /** If present, these outcomes override the script-level outcomes for this choice. */
  outcomes?: EventOutcome[]
}

// ---------------------------------------------------------------------------
// EventOutcome — narrative + consequences for one result band
// ---------------------------------------------------------------------------

export interface EventOutcome {
  condition: OutcomeCondition
  narrative: string
  rewards?: Consequence[]
  costs?: Consequence[]
}

// ---------------------------------------------------------------------------
// EventScript — the full content definition for one event
// ---------------------------------------------------------------------------

export interface EventScript {
  /** Matches GameEvent.id exactly, or a GameEvent.type string for fallback. */
  eventId: string
  /** Shown at the top of the resolution modal — sets the scene. */
  intro: string
  /** Optional pre-roll choices. Player picks one before dice are rolled. */
  choices?: EventChoice[]
  /** Post-roll outcome entries. Matched top-to-bottom; first match wins. */
  outcomes: EventOutcome[]
}
