// Static positions for all palace locations on a 1200×800 canvas.
// Coordinates are percentages (0–100) so the map scales cleanly.
// Adjust these once the background artwork is in place.

import type { LocationId } from '@core/types'

export interface NodeLayout {
  x: number // 0–100 percentage of canvas width
  y: number // 0–100 percentage of canvas height
}

export const LOCATION_LAYOUT: Record<LocationId, NodeLayout> = {
  // Center — the protagonist's base
  chambers:        { x: 50, y: 60 },

  // The political heart
  innerCourt:      { x: 50, y: 25 },
  householdOffice: { x: 38, y: 55 },

  // Knowledge & culture corridor (left)
  imperialLibrary: { x: 20, y: 40 },
  imperialGardens: { x: 22, y: 60 },

  // Imperial axis (top center)
  emperorQuarters: { x: 50, y: 10 },

  // External contacts (far left)
  wuFamilyNetwork: { x: 8, y: 50 },

  // Service locations (right cluster)
  palacePhysician: { x: 72, y: 65 },
  eunuchQuarter:   { x: 80, y: 45 },

  // Spiritual & trade (outer ring)
  buddhistTemple:  { x: 28, y: 80 },
  tradeQuarter:    { x: 72, y: 80 },

  // Seasonal — appears only during festivals
  festivalGrounds: { x: 50, y: 90 },
}
