// =============================================================================
// Narrative types — every kind of thing that can happen in a run.
// The log is append-only. The index enables fast queries.
// =============================================================================

import type { AgentCondition, AgentTier, HaremRank, IntelligenceType } from '@core/types'
import type { ResolutionType } from '@modules/events'

export type NarrativeEntry =
  | { day: number; kind: 'event_resolved'; eventId: string; resolution: ResolutionType }
  | { day: number; kind: 'choice_made'; eventId: string; dilemmaId: string; choiceId: string }
  | { day: number; kind: 'agent_recruited'; agentId: string; source: string }
  | { day: number; kind: 'agent_lost'; agentId: string; reason: string }
  | { day: number; kind: 'equipment_acquired'; equipmentId: string; source: string }
  | { day: number; kind: 'equipment_lost'; equipmentId: string; reason: string }
  | { day: number; kind: 'reputation_change'; metric: string; oldValue: number; newValue: number }
  | { day: number; kind: 'reputation_milestone'; metric: string; value: number }
  | { day: number; kind: 'rank_change'; oldRank: HaremRank; newRank: HaremRank }
  | { day: number; kind: 'prince_interaction'; princeId: string; nature: string }
  | { day: number; kind: 'condition_gained'; agentId: string; condition: AgentCondition }
  | { day: number; kind: 'condition_removed'; agentId: string; condition: AgentCondition }
  | { day: number; kind: 'intelligence_acquired'; intelType: IntelligenceType; tier: AgentTier; source: string }
  | { day: number; kind: 'silver_change'; amount: number; source: string }
  | { day: number; kind: 'taizong_health'; oldValue: number; newValue: number; cause: string }
  | { day: number; kind: 'day_note'; text: string }

export type NarrativeKind = NarrativeEntry['kind']

export interface NarrativeIndex {
  byEvent: Record<string, NarrativeEntry[]>
  byAgent: Record<string, NarrativeEntry[]>
  byDay: Record<number, NarrativeEntry[]>
  byKind: Record<NarrativeKind, NarrativeEntry[]>
  choices: Record<string, string>                    // `${eventId}:${dilemmaId}` → choiceId
  resolvedEvents: Record<string, ResolutionType>     // eventId → resolution
}
