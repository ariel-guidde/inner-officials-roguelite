// =============================================================================
// narrative/index.ts — public API (stub)
// Nothing is fully implemented yet. Types and empty records compile cleanly.
// See design/mechanics/narrative-module.md for the full design.
// =============================================================================

export type { EventScript, EventChoice, EventOutcome } from './types'
export { EVENT_SCRIPTS } from './scripts'
export { matchOutcome, classifyRoll } from './logic/matchOutcome'
export { applyConsequences } from './logic/applyConsequences'
export type { ConsequencePatch } from './logic/applyConsequences'
