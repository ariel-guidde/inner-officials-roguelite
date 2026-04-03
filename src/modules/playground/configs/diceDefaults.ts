import type { DiceRollConfig } from '@core/types'

export const DICE_DEFAULTS: DiceRollConfig = {
  pool:         6,
  threshold:    3,
  tier:         'clay',
  difficulty:   'standard',
  goldenDice:   0,   // always 0 at roll time — spent post-result
  eventLabel:   'Test Roll',
}
