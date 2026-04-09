// =============================================================================
// Event factory — create EventDefinitions with sensible defaults.
// =============================================================================

import type { EventType, EventUrgency, LocationId, StatName } from '@core/types'
import type { EventDefinition, EventPrerequisite, EventSlotTemplate, Dilemma } from '@modules/events'

export interface EventConfig {
  id: string
  title: string
  description: string
  type: EventType
  location: LocationId
  stats: [StatName] | [StatName, StatName]
  threshold: number

  urgency?: EventUrgency
  opposition?: number
  duration?: number
  expiry?: number | null
  slots?: EventSlotTemplate[]
  prerequisites?: EventPrerequisite[]
  weight?: number
  forced?: boolean
  repeatable?: boolean
  dilemma?: Dilemma
  storylineId?: string
  graphEdges?: EventDefinition['graphEdges']
}

export function defineEvent(config: EventConfig): EventDefinition {
  return {
    id: config.id,
    storylineId: config.storylineId,
    type: config.type,
    locationId: config.location,
    title: config.title,
    description: config.description,
    urgency: config.urgency ?? 'routine',
    statsChecked: config.stats,
    threshold: config.threshold,
    oppositionValue: config.opposition ?? 0,
    durationDays: config.duration ?? 1,
    daysUntilExpiry: config.expiry === undefined ? null : config.expiry,
    slots: config.slots ?? [],
    prerequisites: config.prerequisites ?? [],
    poolWeight: config.weight ?? 1,
    isForced: config.forced,
    isRepeatable: config.repeatable,
    dilemma: config.dilemma,
    graphEdges: config.graphEdges,
  }
}
