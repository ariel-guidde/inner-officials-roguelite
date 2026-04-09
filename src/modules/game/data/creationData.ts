import type { ReputationState, StatName } from '@core/types'

// ---------------------------------------------------------------------------
// Layer 1: Family Background (pick 1 of 3)
// ---------------------------------------------------------------------------

export interface FamilyBackground {
  id: string
  name: string
  description: string
  silver: number
  statBonus: Partial<Record<StatName, number>>
  connection: string
  chunhuaLean: Partial<Record<StatName, number>>
}

export const FAMILY_BACKGROUNDS: FamilyBackground[] = [
  {
    id: 'letters',
    name: 'Daughter of Letters',
    description: 'Your father was a scholar-official. Your household valued ink, poetry, and protocol. Chunhua grew up organizing his library.',
    silver: 3,
    statBonus: { scholarship: 1 },
    connection: 'Consort Xu knows your father\'s writings',
    chunhuaLean: { cunning: 1 },
  },
  {
    id: 'wealth',
    name: 'Daughter of Wealth',
    description: 'Your family trades in silk and salt. You learned accounts before poetry. Chunhua grew up managing servants.',
    silver: 5,
    statBonus: { resourcefulness: 1 },
    connection: 'Trade Quarter contacts from day 1',
    chunhuaLean: { resourcefulness: 1 },
  },
  {
    id: 'soldiers',
    name: 'Daughter of Soldiers',
    description: 'Your father commanded men. Discipline, endurance, reading intentions. Chunhua is tough and practical.',
    silver: 3,
    statBonus: { resolve: 1 },
    connection: 'General Li Ji served with your father',
    chunhuaLean: { resolve: 1 },
  },
]

// ---------------------------------------------------------------------------
// Layer 2: Education (pick 1 of 5)
// ---------------------------------------------------------------------------

export interface Education {
  id: string
  name: string
  stat: StatName
  perk: string
  flavor: string
}

export const EDUCATIONS: Education[] = [
  { id: 'calligraphy', name: 'Calligraphy', stat: 'eloquence', perk: 'Starting equipment: Lotus Petal Brush', flavor: 'Your hand is beautiful.' },
  { id: 'medicine', name: 'Medicine', stat: 'vitality', perk: 'Can identify poisons', flavor: 'Your mother taught you herbs.' },
  { id: 'music', name: 'Music', stat: 'beauty', perk: 'Can join performances', flavor: 'The pipa speaks for you.' },
  { id: 'protocol', name: 'Court Protocol', stat: 'discretion', perk: 'Fewer mistakes at audience', flavor: 'You know every bow.' },
  { id: 'scripture', name: 'Buddhist Scripture', stat: 'spiritualArts', perk: 'Temple access easier', flavor: 'You read the sutras.' },
]

// ---------------------------------------------------------------------------
// Layer 3: Passion (pick 1 of 4)
// ---------------------------------------------------------------------------

export interface Passion {
  id: string
  name: string
  stat: StatName
  description: string
}

export const PASSIONS: Passion[] = [
  { id: 'poetry', name: 'Poetry', stat: 'eloquence', description: 'Extra literary events and prince interactions through verse.' },
  { id: 'beauty-passion', name: 'Beauty', stat: 'beauty', description: 'Extra ceremony events and the Emperor notices you sooner.' },
  { id: 'intrigue', name: 'Intrigue', stat: 'cunning', description: 'Extra investigation events and eunuch network access.' },
  { id: 'devotion', name: 'Devotion', stat: 'spiritualArts', description: 'Extra temple events and spiritual counsel sought by others.' },
]

// ---------------------------------------------------------------------------
// Base stats + derived
// ---------------------------------------------------------------------------

export const BASE_STATS: Record<StatName, number> = {
  beauty: 2, cunning: 2, eloquence: 2, discretion: 1,
  resolve: 2, vitality: 2, resourcefulness: 1, spiritualArts: 1, scholarship: 1,
}

export interface CreationChoices {
  background: FamilyBackground
  education: Education
  passion: Passion
}
