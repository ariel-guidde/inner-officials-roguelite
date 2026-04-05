import type { GameEvent, LocationId, MapNodeData, StatName } from '@core/types'
import { LOCATION_LAYOUT } from '@modules/map'

const BASE = {
  isCompleted: false, isExpired: false,
  assignedScroll: null, inProgress: false, resolveOnDay: null,
} as const

const SAMPLE_EVENTS: GameEvent[] = [
  // ── Inner Court ────────────────────────────────────────────────────────
  // 1-day event: ceremony is swift
  {
    ...BASE,
    id: 'event-seasonal-edict',
    locationId: 'innerCourt',
    title: 'Ceremony of Seasonal Edicts',
    description: 'The Emperor reads the autumn edicts. Concubines of standing must attend and perform proper protocol — a chance to be noticed.',
    type: 'ceremony',
    urgency: 'timed',
    statsChecked: ['eloquence', 'beauty'] as [StatName, StatName],
    threshold: 3,
    daysRemaining: 3,
    durationDays: 1,
    oppositionValue: 0,
    slots: [
      { id: 'slot-edict-1', assignedAgentId: null, isMandatory: true, requiredTags: ['concubine'], requiredTier: 'bronze' },
      { id: 'slot-edict-npc', assignedAgentId: null, isMandatory: false, requiredTags: [], npcAgentId: 'eunuch-wei' },
    ],
  },

  // ── Household Office ───────────────────────────────────────────────────
  // 2-day event: reconciling accounts takes time
  {
    ...BASE,
    id: 'event-budget-discrepancy',
    locationId: 'householdOffice',
    title: 'Quarterly Budget Discrepancy',
    description: 'Household accounts show irregularities. Rivals may be skimming silver. Reconcile before the morning inspection or face scrutiny.',
    type: 'estateManagement',
    urgency: 'crisis',
    statsChecked: ['resourcefulness', 'cunning'] as [StatName, StatName],
    threshold: 4,
    daysRemaining: 4,
    durationDays: 2,
    oppositionValue: 2,
    slots: [
      { id: 'slot-budget-1', assignedAgentId: null, isMandatory: true, requiredTags: [] },
    ],
  },

  // ── Imperial Gardens ───────────────────────────────────────────────────
  // 1-day event: a social gathering
  {
    ...BASE,
    id: 'event-garden-party',
    locationId: 'imperialGardens',
    title: "Empress's Autumn Garden Party",
    description: "An invitation to the Empress's private garden. Alliances can be forged — or intelligence gathered on rivals who lower their guard.",
    type: 'social',
    urgency: 'opportunity',
    statsChecked: ['beauty', 'cunning'] as [StatName, StatName],
    threshold: 2,
    daysRemaining: null,
    durationDays: 1,
    oppositionValue: 0,
    slots: [
      { id: 'slot-garden-1', assignedAgentId: null, isMandatory: false, requiredTags: [], anyRequiredTag: ['female'] },
    ],
  },

  // ── Palace Physician ───────────────────────────────────────────────────
  // 1-day event
  {
    ...BASE,
    id: 'event-health-examination',
    locationId: 'palacePhysician',
    title: 'Seasonal Health Examination',
    description: "The palace physician conducts routine health checks. His examination can reveal hidden conditions — or conceal them.",
    type: 'personal',
    urgency: 'routine',
    statsChecked: ['vitality'] as [StatName],
    threshold: 2,
    daysRemaining: null,
    durationDays: 1,
    oppositionValue: 0,
    slots: [
      { id: 'slot-health-npc', assignedAgentId: null, isMandatory: false, requiredTags: [], npcAgentId: 'physician-han' },
      { id: 'slot-health-1', assignedAgentId: null, isMandatory: false, requiredTags: [] },
    ],
  },

  // ── Buddhist Temple ────────────────────────────────────────────────────
  // 3-day event: purification rites require sustained devotion
  {
    ...BASE,
    id: 'event-temple-offering',
    locationId: 'buddhistTemple',
    title: 'Mid-Autumn Temple Offering',
    description: 'The temple holds a mid-autumn ceremony requiring three days of purification rites. Sustained piety earns imperial favour.',
    type: 'spiritual',
    urgency: 'timed',
    statsChecked: ['spiritualArts'] as [StatName],
    threshold: 3,
    daysRemaining: 6,
    durationDays: 3,
    oppositionValue: 0,
    slots: [
      { id: 'slot-temple-1', assignedAgentId: null, isMandatory: true, requiredTags: [], anyRequiredTag: ['female'] },
    ],
  },

  // ── Chambers ───────────────────────────────────────────────────────────
  // 1-day event, no slots
  {
    ...BASE,
    id: 'event-personal-cultivation',
    locationId: 'chambers',
    title: 'Personal Cultivation',
    description: 'Spend the day in private study and meditation. Strengthen your resolve for the trials that lie ahead.',
    type: 'personal',
    urgency: 'routine',
    statsChecked: ['resolve'] as [StatName],
    threshold: 1,
    daysRemaining: null,
    durationDays: 1,
    oppositionValue: 0,
    slots: [],
  },
]

// ---------------------------------------------------------------------------
// Build map nodes
// ---------------------------------------------------------------------------

const UNLOCKED_BY_DEFAULT: LocationId[] = [
  'chambers', 'innerCourt', 'householdOffice', 'imperialLibrary',
  'imperialGardens', 'palacePhysician', 'buddhistTemple',
]

export const MAP_DEFAULTS: MapNodeData[] = (
  Object.entries(LOCATION_LAYOUT) as [LocationId, { x: number; y: number }][]
).map(([id, position]) => ({
  id,
  position,
  events: SAMPLE_EVENTS.filter(e => e.locationId === id),
  isUnlocked: UNLOCKED_BY_DEFAULT.includes(id),
  isVisible: true,
}))
