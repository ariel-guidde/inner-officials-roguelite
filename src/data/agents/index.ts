import type { Agent } from '@core/types'

// -- Imperial Family ----------------------------------------------------------
export {
  EMPEROR_TAIZONG,
  PRINCE_CHENGQIAN,
  PRINCE_TAI,
  PRINCE_ZHI,
  CHENG_XINNU,
  ACT1_IMPERIALS,
} from './act1-imperials'

// -- Consorts -----------------------------------------------------------------
export {
  CONSORT_YANG,
  CONSORT_XU,
  LADY_JIANG,
  LADY_ZHENG,
  LADY_SONG,
  LADY_PEI,
  ACT1_CONSORTS,
} from './act1-consorts'

// -- Outer Court Officials ----------------------------------------------------
export {
  ZHANGSUN_WUJI,
  CHU_SUILIANG,
  LI_JI,
  SECRETARY_LIU,
  CENSOR_LIANG,
  GENERAL_QIN,
  ACT1_OFFICIALS,
} from './act1-officials'

// -- Palace Staff (eunuchs, religious, merchants, physicians) -----------------
export {
  CHIEF_EUNUCH_CHEN,
  EUNUCH_GAO,
  XUANZANG,
  TAOIST_MASTER_SUN,
  NUN_MINGZHU,
  DR_SUN,
  COOK_MA,
  MADAME_QIAN,
  ACT1_STAFF,
} from './act1-staff'

// -- Household (Chunhua variants + background agents) -------------------------
export {
  CHUNHUA_EYES,
  CHUNHUA_VOICE,
  CHUNHUA_SHIELD,
  CHUNHUA_HANDS,
  CHUNHUA_HEART,
  CHUNHUA_VARIANTS,
  OLD_TUTOR_WANG,
  SERGEANT_LUO,
  COUSIN_BAO,
  LADY_FANG,
  BACKGROUND_AGENTS,
  ACT1_HOUSEHOLD,
} from './act1-household'

// -- Aggregate ----------------------------------------------------------------
import { ACT1_IMPERIALS } from './act1-imperials'
import { ACT1_CONSORTS } from './act1-consorts'
import { ACT1_OFFICIALS } from './act1-officials'
import { ACT1_STAFF } from './act1-staff'
import { ACT1_HOUSEHOLD } from './act1-household'

/** Every Act 1 agent (all categories). Household includes all Chunhua variants. */
export const ALL_ACT1_AGENTS: Agent[] = [
  ...ACT1_IMPERIALS,
  ...ACT1_CONSORTS,
  ...ACT1_OFFICIALS,
  ...ACT1_STAFF,
  ...ACT1_HOUSEHOLD,
]
