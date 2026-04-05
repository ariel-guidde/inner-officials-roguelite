// =============================================================================
// narrative/scripts/index.ts — Event content database (stub)
// Add one EventScript per GameEvent.id as the narrative module is built out.
// =============================================================================

import type { EventScript } from '../types'

/**
 * Content database keyed by GameEvent.id.
 * Falls back to GameEvent.type if an exact id match is not found.
 * Currently empty — populate as narrative content is written.
 */
export const EVENT_SCRIPTS: Record<string, EventScript> = {
  // TODO: 'event-seasonal-edict': { ... }
  // TODO: 'event-budget-discrepancy': { ... }
  // TODO: 'event-garden-party': { ... }
  // TODO: 'event-health-examination': { ... }
  // TODO: 'event-temple-offering': { ... }
  // TODO: 'event-personal-cultivation': { ... }
}
