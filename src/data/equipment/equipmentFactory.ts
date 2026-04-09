// =============================================================================
// Equipment factory — create Equipment items with sensible defaults.
// =============================================================================

import type { AgentTier, Equipment, EquipmentItemTag, EquipmentRequirements, EquipmentSlot, StatBlock } from '@core/types'

export interface EquipmentConfig {
  id: string
  name: string
  slot: EquipmentSlot
  tier?: AgentTier
  tags?: EquipmentItemTag[]
  stats?: Partial<StatBlock>
  requires?: EquipmentRequirements
  description?: string
}

export function defineEquipment(config: EquipmentConfig): Equipment {
  return {
    id: config.id,
    name: config.name,
    slot: config.slot,
    tier: config.tier ?? 'clay',
    itemTags: config.tags ?? [],
    statBonus: config.stats ?? {},
    requires: config.requires ?? {},
    description: config.description,
  }
}
