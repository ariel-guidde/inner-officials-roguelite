export type { NarrativeEntry, NarrativeKind, NarrativeIndex } from './types'
export {
  buildIndex, addToIndex,
  wasEventResolved, wasChoiceMade, getChoiceForDilemma,
  getAgentHistory, getEventHistory, getDayEntries, getEntriesByKind,
  countPrinceInteractions, getResolvedEventIds,
} from './narrativeIndex'
export { calculateEnding, type EndingResult } from './endings'
