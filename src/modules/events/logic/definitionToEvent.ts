// =============================================================================
// events/logic/definitionToEvent.ts
// Converts an EventDefinition blueprint into a live GameEvent instance.
// =============================================================================

import type { EventSlot, GameEvent } from '@core/types'
import type { EventDefinition } from '../types'

export function definitionToEvent(def: EventDefinition): GameEvent {
  const slots: EventSlot[] = def.slots.map(t => ({
    id:              t.id,
    assignedAgentId: null,
    isMandatory:     t.isMandatory,
    requiredTags:    t.requiredTags,
    anyRequiredTag:  t.anyRequiredTag,
    requiredTier:    t.requiredTier,
    npcAgentId:      t.npcAgentId,
  }))

  return {
    id:              def.id,
    locationId:      def.locationId,
    title:           def.title,
    description:     def.description,
    type:            def.type,
    urgency:         def.urgency,
    statsChecked:    def.statsChecked,
    threshold:       def.threshold,
    daysRemaining:   def.daysUntilExpiry,
    durationDays:    def.durationDays,
    oppositionValue: def.oppositionValue,
    slots,
    assignedIntelligence: null,
    committed:       false,
    committedOnDay:  null,
    inProgress:      false,
    resolveOnDay:    null,
    isCompleted:     false,
    isExpired:       false,
  }
}
