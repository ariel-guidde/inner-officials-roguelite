// =============================================================================
// Narrative index — fast queries over the narrative log.
// Rebuilt from log on load, incrementally updated during play.
// =============================================================================

import type { NarrativeEntry, NarrativeIndex, NarrativeKind } from './types'
import type { ResolutionType } from '@modules/events'

// ---------------------------------------------------------------------------
// Build index from a full log (used on load)
// ---------------------------------------------------------------------------

export function buildIndex(log: NarrativeEntry[]): NarrativeIndex {
  const index: NarrativeIndex = {
    byEvent: {},
    byAgent: {},
    byDay: {},
    byKind: {} as Record<NarrativeKind, NarrativeEntry[]>,
    choices: {},
    resolvedEvents: {},
  }
  for (const entry of log) {
    addToIndex(index, entry)
  }
  return index
}

// ---------------------------------------------------------------------------
// Add a single entry to an existing index (used during play)
// ---------------------------------------------------------------------------

export function addToIndex(index: NarrativeIndex, entry: NarrativeEntry): void {
  // By day
  ;(index.byDay[entry.day] ??= []).push(entry)

  // By kind
  ;(index.byKind[entry.kind] ??= []).push(entry)

  // By event
  if ('eventId' in entry) {
    const eid = (entry as { eventId: string }).eventId
    ;(index.byEvent[eid] ??= []).push(entry)
  }

  // By agent
  if ('agentId' in entry) {
    const aid = (entry as { agentId: string }).agentId
    ;(index.byAgent[aid] ??= []).push(entry)
  }

  // Fast lookups
  if (entry.kind === 'choice_made') {
    index.choices[`${entry.eventId}:${entry.dilemmaId}`] = entry.choiceId
  }
  if (entry.kind === 'event_resolved') {
    index.resolvedEvents[entry.eventId] = entry.resolution
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function wasEventResolved(index: NarrativeIndex, eventId: string, resolution?: ResolutionType): boolean {
  const r = index.resolvedEvents[eventId]
  if (r === undefined) return false
  return resolution === undefined || r === resolution
}

export function wasChoiceMade(index: NarrativeIndex, eventId: string, dilemmaId: string, choiceId: string): boolean {
  return index.choices[`${eventId}:${dilemmaId}`] === choiceId
}

export function getChoiceForDilemma(index: NarrativeIndex, eventId: string, dilemmaId: string): string | undefined {
  return index.choices[`${eventId}:${dilemmaId}`]
}

export function getAgentHistory(index: NarrativeIndex, agentId: string): NarrativeEntry[] {
  return index.byAgent[agentId] ?? []
}

export function getEventHistory(index: NarrativeIndex, eventId: string): NarrativeEntry[] {
  return index.byEvent[eventId] ?? []
}

export function getDayEntries(index: NarrativeIndex, day: number): NarrativeEntry[] {
  return index.byDay[day] ?? []
}

export function getEntriesByKind(index: NarrativeIndex, kind: NarrativeKind): NarrativeEntry[] {
  return index.byKind[kind] ?? []
}

export function countPrinceInteractions(index: NarrativeIndex, princeId: string): number {
  return (index.byKind['prince_interaction'] ?? [])
    .filter(e => e.kind === 'prince_interaction' && e.princeId === princeId)
    .length
}

export function getResolvedEventIds(index: NarrativeIndex): string[] {
  return Object.keys(index.resolvedEvents)
}
