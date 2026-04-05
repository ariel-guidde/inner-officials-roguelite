// =============================================================================
// narrative/logic/eventPool.ts — stub
// Manages the pool of available events and selects which appear each day.
// =============================================================================

// TODO: implement daily pool selection
// Inputs: current day, prior outcome history, unlocked locations, difficulty curve
// Output: GameEvent[] to populate each MapNodeData.events for the new day

// Design notes (from design/mechanics/narrative-module.md):
// - Fixed events: always appear at their node until completed or expired
// - Triggered events: queued by Consequence { kind: 'triggerEvent' } from prior outcomes
// - Random pool: drawn from a difficulty-tiered set, filtered by unlocked locations
// - Crisis/scandal events: forced in when rival power or scandal level exceeds threshold
