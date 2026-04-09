export { defineEvent, type EventConfig } from './eventFactory'

// Act 1 — storyline events
export { YANG_COURT_EVENTS } from './act1-yang-court'
export { CHUNHUA_EVENTS } from './act1-chunhua'
export { ELIXIR_EVENTS } from './act1-elixir'

// Act 1 — standalone pool events
export { POOL_EVENTS } from './act1-pool'

// Act 1 — storyline metadata
export { ALL_ACT1_STORYLINES } from './storylines'

// ---------------------------------------------------------------------------
// Aggregate exports
// ---------------------------------------------------------------------------

import type { EventDefinition } from '@modules/events'
import { YANG_COURT_EVENTS } from './act1-yang-court'
import { CHUNHUA_EVENTS } from './act1-chunhua'
import { ELIXIR_EVENTS } from './act1-elixir'
import { POOL_EVENTS } from './act1-pool'

export const ALL_ACT1_EVENTS: EventDefinition[] = [
  ...YANG_COURT_EVENTS,
  ...CHUNHUA_EVENTS,
  ...ELIXIR_EVENTS,
  ...POOL_EVENTS,
]
