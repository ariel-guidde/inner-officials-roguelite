import type { Storyline } from '../types'

export const ALL_STORYLINES: Storyline[] = [
  {
    id:          'shadow-consort',
    title:       'Shadow of the Consort',
    description: 'Consort Li plants rumors of disloyalty.  Navigate the fallout before it reaches the Emperor.',
    tags:        ['rivalry', 'political', 'social'],
    entryEventIds: ['shadow-whispers'],
    eventIds:    ['shadow-whispers', 'shadow-counter', 'shadow-scrutiny', 'shadow-peace', 'shadow-imperial-suspicion'],
  },
  {
    id:          'physician-dilemma',
    title:       "The Physician's Dilemma",
    description: 'A routine examination reveals secrets — your own, and perhaps a rival\'s.',
    tags:        ['investigation', 'personal', 'leverage'],
    entryEventIds: ['physician-exam'],
    eventIds:    ['physician-exam', 'physician-leverage', 'physician-illness'],
  },
  {
    id:          'poisoned-hairpin',
    title:       'The Poisoned Hairpin',
    description: 'A jade hairpin laced with poison appears at your door. Investigate, report, or gamble — each path forks into danger.',
    tags:        ['investigation', 'poison', 'dilemma', 'rivalry'],
    entryEventIds: ['hairpin-find'],
    eventIds:    [
      'hairpin-find', 'hairpin-trace', 'hairpin-official', 'hairpin-accused',
      'hairpin-bluff-success', 'hairpin-sick', 'hairpin-cornered',
      'hairpin-rival-exposed', 'hairpin-resolve',
    ],
  },
]

export const STORYLINES_BY_ID: Record<string, Storyline> =
  Object.fromEntries(ALL_STORYLINES.map(s => [s.id, s]))
