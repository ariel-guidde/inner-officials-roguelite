import type { IntelligenceStore } from '@core/types'
import { EMPTY_INTELLIGENCE } from '@core/types'

/**
 * Starting intelligence for Lady Wu.
 * She begins with 1 gossip and 1 secrets.
 */
export const INTELLIGENCE_DEFAULTS: IntelligenceStore = {
  ...EMPTY_INTELLIGENCE,
  gossip: { ...EMPTY_INTELLIGENCE.gossip, clay: 2 },
  secrets: { ...EMPTY_INTELLIGENCE.secrets, clay: 1 },
}
