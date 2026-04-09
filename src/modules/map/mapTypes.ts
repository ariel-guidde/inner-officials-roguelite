import type { Agent, EventSlot, LocationId } from '@core/types'

export interface PendingSlot {
  eventId: string
  slotId: string
  slot: EventSlot
}

export type InspectedCard =
  | { kind: 'agent'; agent: Agent }

export const LOCATION_ICONS: Record<LocationId, string> = {
  chambers:        '🏮',
  innerCourt:      '⚖',
  householdOffice: '📋',
  imperialLibrary: '📚',
  imperialGardens: '🌸',
  emperorQuarters: '🐉',
  wuFamilyNetwork: '🔗',
  palacePhysician: '⚕',
  eunuchQuarter:   '🗝',
  buddhistTemple:  '🪷',
  tradeQuarter:    '💰',
  festivalGrounds: '🎋',
}

export const CORNERS = [
  { pos: 'top-0 left-0', borderV: 'borderTop', borderH: 'borderLeft', shadowX: 3, shadowY: 3 },
  { pos: 'top-0 right-0', borderV: 'borderTop', borderH: 'borderRight', shadowX: -3, shadowY: 3 },
  { pos: 'bottom-0 left-0', borderV: 'borderBottom', borderH: 'borderLeft', shadowX: 3, shadowY: -3 },
  { pos: 'bottom-0 right-0', borderV: 'borderBottom', borderH: 'borderRight', shadowX: -3, shadowY: -3 },
] as const

export const EDGES: [LocationId, LocationId][] = [
  ['emperorQuarters', 'innerCourt'],
  ['innerCourt',      'chambers'],
  ['innerCourt',      'wuFamilyNetwork'],
  ['innerCourt',      'imperialLibrary'],
  ['imperialLibrary', 'imperialGardens'],
  ['imperialLibrary', 'buddhistTemple'],
  ['chambers',        'householdOffice'],
  ['chambers',        'imperialGardens'],
  ['chambers',        'palacePhysician'],
  ['householdOffice', 'eunuchQuarter'],
  ['eunuchQuarter',   'palacePhysician'],
  ['palacePhysician', 'tradeQuarter'],
  ['buddhistTemple',  'festivalGrounds'],
  ['tradeQuarter',    'festivalGrounds'],
]
