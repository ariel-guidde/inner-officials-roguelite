import type { IntelligenceScroll } from '@core/types'

/**
 * Starting intelligence scrolls for Lady Wu.
 * She begins with 2 Court Whispers (bronze) — political rumour cards
 * suited to eloquence/cunning checks at court.
 */
export const INTELLIGENCE_DEFAULTS: IntelligenceScroll[] = [
  { id: 'intel-cw-1', type: 'courtWhispers',    tier: 'bronze' },
  { id: 'intel-cw-2', type: 'courtWhispers',    tier: 'bronze' },
  { id: 'intel-ps-1', type: 'palaceSecrets',    tier: 'clay'   },
]
