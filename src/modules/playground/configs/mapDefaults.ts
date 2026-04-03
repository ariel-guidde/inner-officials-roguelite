import type { MapNodeData } from '@core/types'
import { LOCATION_LAYOUT } from '@modules/map'

/** Minimal default map state for Playground testing. */
export const MAP_DEFAULTS: MapNodeData[] = (
  Object.entries(LOCATION_LAYOUT) as [import('@core/types').LocationId, { x: number; y: number }][]
).map(([id, position]) => ({
  id,
  position,
  events: [],
  isUnlocked: ['chambers', 'innerCourt', 'householdOffice', 'imperialLibrary'].includes(id),
  isVisible: true,
}))
