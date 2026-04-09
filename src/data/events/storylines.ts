// =============================================================================
// Act 1 — Storyline metadata
// Maps to the Storyline type from modules/events/types.ts
// =============================================================================

import type { Storyline } from '@modules/events'

export const STORYLINE_YANG_COURT: Storyline = {
  id: 'yang-court',
  title: "Consort Yang's Court",
  description:
    'The inner court gatekeeper evaluates your worth. Please her and doors open; displease her and they close forever.',
  tags: ['political', 'social', 'gatekeeper'],
  entryEventIds: ['yang-tea'],
  eventIds: ['yang-tea', 'yang-assignment', 'yang-warning', 'yang-favor-returned'],
}

export const STORYLINE_CHUNHUA_HEART: Storyline = {
  id: 'chunhua-heart',
  title: "Chunhua's Heart",
  description:
    'Your handmaid is loyal — but loyalty has limits. Treat her well or lose the only person who sees you as human.',
  tags: ['personal', 'relationship', 'emotional'],
  entryEventIds: ['chunhua-guard'],
  eventIds: ['chunhua-guard', 'chunhua-fear', 'chunhua-request', 'chunhua-breaking'],
}

export const STORYLINE_ELIXIR_QUESTION: Storyline = {
  id: 'elixir-question',
  title: 'The Elixir Question',
  description:
    "The Emperor's longevity elixirs are killing him. Discover the truth, then decide: save the dragon, or let him fall?",
  tags: ['investigation', 'moral', 'imperial'],
  entryEventIds: ['elixir-coughing'],
  eventIds: ['elixir-coughing', 'elixir-sulfur', 'elixir-investigate', 'elixir-garden-walk'],
}

export const ALL_ACT1_STORYLINES: Storyline[] = [
  STORYLINE_YANG_COURT,
  STORYLINE_CHUNHUA_HEART,
  STORYLINE_ELIXIR_QUESTION,
]
