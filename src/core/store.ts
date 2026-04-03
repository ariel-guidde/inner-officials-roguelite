// =============================================================================
// src/core/store.ts
// Zustand store.  All game state mutations go through actions here.
// Modules subscribe via the selector hooks at the bottom — never mutate directly.
// =============================================================================

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { bus } from './events'
import {
  BLOCKING_CONDITIONS,
  DAY_PHASE_ORDER,
  type Agent,
  type AgentCondition,
  type DiceRollConfig,
  type DiceRollResult,
  type DiceDifficulty,
  type GameEvent,
  type GameOutcome,
  type GameState,
  type HaremRank,
  type LocationId,
  type ResourceState,
  type ReputationState,
  type StatName,
} from './types'

// ---------------------------------------------------------------------------
// ACTIONS INTERFACE
// ---------------------------------------------------------------------------

export interface GameActions {
  // Day cycle
  advanceDayPhase: () => void
  endDay: () => void

  // Agent management
  addAgent:           (agent: Agent) => void
  removeAgent:        (agentId: string) => void
  addConditions:      (agentId: string, conditions: AgentCondition[]) => void
  removeConditions:   (agentId: string, conditions: AgentCondition[]) => void
  lockAgent:          (agentId: string, untilDay: number) => void
  upgradeAgentTier:   (agentId: string, newTier: Agent['tier']) => void
  modifyAgentStat:    (agentId: string, stat: StatName, delta: number) => void
  incrementResentment:(agentId: string) => void
  decrementResentment:(agentId: string) => void

  // Event / assignment management
  assignAgent:    (agentId: string, eventId: string, slotId: string) => void
  unassignAgent:  (agentId: string, eventId: string, slotId: string) => void
  completeEvent:  (eventId: string) => void
  expireEvent:    (eventId: string) => void
  addEvents:      (events: GameEvent[]) => void

  // Map
  unlockNode: (locationId: LocationId) => void
  revealNode:  (locationId: LocationId) => void

  // Dice
  setPendingRoll: (config: DiceRollConfig | null) => void
  settleRoll:     (result: DiceRollResult) => void
  setIsRolling:   (value: boolean) => void

  // Resources
  changeSilver:      (delta: number) => void
  spendScroll:       (scrollId: string) => boolean
  changeGoldenDice:  (delta: number) => void

  // Reputation
  changeImperialFavor: (delta: number) => void
  changeVirtue:        (delta: number) => void
  changeRuthlessness:  (delta: number) => void
  changeShadowReach:   (delta: number) => void
  changeHeavenlySight: (delta: number) => void
  addSlander:          () => void
  clearSlander:        () => void

  // Rank
  setRank: (rank: HaremRank) => void

  // Edict
  startEdict:   (edictId: string, daysAllowed: number) => void
  tickEdict:    () => void
  fulfillEdict: () => void

  // Game phase
  startRun: (difficulty: DiceDifficulty) => void
  endRun:   (outcome: GameOutcome) => void
}

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

const initialResources: ResourceState = {
  silver: 5,
  intelligenceScrolls: [],
  goldenDice: 0,
}

const initialReputation: ReputationState = {
  virtue: 0,
  ruthlessness: 0,
  imperialFavor: 0,
  shadowReach: 0,
  heavenlySight: 0,
  slander: 0,
}

const initialState: GameState = {
  phase: 'setup',
  outcome: 'ongoing',
  currentDay: 1,
  dayPhase: 'dawn',
  edictDaysRemaining: 7,
  edictsCompleted: 0,
  protagonistId: '',
  haremRank: 9,
  resources: initialResources,
  reputation: initialReputation,
  agents: [],
  mapNodes: [],
  activeEvents: [],
  pendingRoll: null,
  lastRollResult: null,
  difficulty: 'standard',
  isRolling: false,
}

// ---------------------------------------------------------------------------
// STORE
// ---------------------------------------------------------------------------

type StoreShape = GameState & GameActions

export const useGameStore = create<StoreShape>()(
  immer((set, get) => ({
    ...initialState,

    // -----------------------------------------------------------------------
    // Day cycle
    // -----------------------------------------------------------------------

    advanceDayPhase: () => {
      set((s) => {
        const idx = DAY_PHASE_ORDER.indexOf(s.dayPhase)
        s.dayPhase = DAY_PHASE_ORDER[(idx + 1) % DAY_PHASE_ORDER.length]
      })
      bus.emit('day:phaseAdvanced', { phase: get().dayPhase })
    },

    endDay: () => {
      set((s) => {
        s.currentDay += 1
        s.dayPhase = 'dawn'
        s.activeEvents.forEach((e) => {
          if (e.daysRemaining !== null) {
            e.daysRemaining -= 1
            if (e.daysRemaining <= 0) e.isExpired = true
          }
        })
        s.activeEvents = s.activeEvents.filter((e) => !e.isCompleted && !e.isExpired)
        s.edictDaysRemaining = Math.max(0, s.edictDaysRemaining - 1)
      })
      bus.emit('day:started', { day: get().currentDay })
      if (get().edictDaysRemaining === 0) {
        bus.emit('edict:expired', { edictId: 'current' })
      }
    },

    // -----------------------------------------------------------------------
    // Agent management
    // -----------------------------------------------------------------------

    addAgent: (agent) => set((s) => { s.agents.push(agent) }),

    removeAgent: (agentId) =>
      set((s) => { s.agents = s.agents.filter((a) => a.id !== agentId) }),

    addConditions: (agentId, conditions) => {
      const added: AgentCondition[] = []
      set((s) => {
        const agent = s.agents.find((a) => a.id === agentId)
        if (!agent) return
        conditions.forEach((c) => {
          if (!agent.conditions.includes(c)) {
            agent.conditions.push(c)
            added.push(c)
          }
        })
      })
      if (added.length > 0) {
        bus.emit('characters:conditionChanged', { agentId, added, removed: [] })
      }
    },

    removeConditions: (agentId, conditions) => {
      const removed: AgentCondition[] = []
      set((s) => {
        const agent = s.agents.find((a) => a.id === agentId)
        if (!agent) return
        conditions.forEach((c) => {
          const idx = agent.conditions.indexOf(c)
          if (idx !== -1) {
            agent.conditions.splice(idx, 1)
            removed.push(c)
          }
        })
      })
      if (removed.length > 0) {
        bus.emit('characters:conditionChanged', { agentId, added: [], removed })
      }
    },

    lockAgent: (agentId, untilDay) =>
      set((s) => {
        const a = s.agents.find((a) => a.id === agentId)
        if (a) a.lockedUntilDay = untilDay
      }),

    upgradeAgentTier: (agentId, newTier) =>
      set((s) => {
        const a = s.agents.find((a) => a.id === agentId)
        if (a) a.tier = newTier
      }),

    modifyAgentStat: (agentId, stat, delta) =>
      set((s) => {
        const a = s.agents.find((a) => a.id === agentId)
        if (a) a.stats[stat] = Math.max(0, (a.stats[stat] ?? 0) + delta)
      }),

    incrementResentment: (agentId) =>
      set((s) => {
        const a = s.agents.find((a) => a.id === agentId)
        if (a && a.resentment !== undefined) a.resentment = Math.min(5, a.resentment + 1)
      }),

    decrementResentment: (agentId) =>
      set((s) => {
        const a = s.agents.find((a) => a.id === agentId)
        if (a && a.resentment !== undefined) a.resentment = Math.max(0, a.resentment - 1)
      }),

    // -----------------------------------------------------------------------
    // Event / assignment management
    // -----------------------------------------------------------------------

    assignAgent: (agentId, eventId, slotId) => {
      set((s) => {
        const event = s.activeEvents.find((e) => e.id === eventId)
        const agent = s.agents.find((a) => a.id === agentId)
        if (!event || !agent) return
        const isBlocked = agent.conditions.some((c) => BLOCKING_CONDITIONS.has(c))
        if (isBlocked) return
        const slot = event.slots.find((sl) => sl.id === slotId)
        if (slot) slot.assignedAgentId = agentId
      })
      bus.emit('characters:agentAssigned', { agentId, eventId, slotId })
    },

    unassignAgent: (agentId, eventId, slotId) => {
      set((s) => {
        const event = s.activeEvents.find((e) => e.id === eventId)
        const slot = event?.slots.find((sl) => sl.id === slotId)
        if (slot) slot.assignedAgentId = null
      })
      bus.emit('characters:agentUnassigned', { agentId, eventId, slotId })
    },

    completeEvent: (eventId) =>
      set((s) => {
        const e = s.activeEvents.find((e) => e.id === eventId)
        if (e) e.isCompleted = true
      }),

    expireEvent: (eventId) =>
      set((s) => {
        const e = s.activeEvents.find((e) => e.id === eventId)
        if (e) e.isExpired = true
      }),

    addEvents: (events) => set((s) => { s.activeEvents.push(...events) }),

    // -----------------------------------------------------------------------
    // Map
    // -----------------------------------------------------------------------

    unlockNode: (locationId) => {
      set((s) => {
        const n = s.mapNodes.find((n) => n.id === locationId)
        if (n) { n.isUnlocked = true; n.isVisible = true }
      })
      bus.emit('map:nodeUnlocked', { locationId })
    },

    revealNode: (locationId) =>
      set((s) => {
        const n = s.mapNodes.find((n) => n.id === locationId)
        if (n) n.isVisible = true
      }),

    // -----------------------------------------------------------------------
    // Dice
    // -----------------------------------------------------------------------

    setPendingRoll: (config) => set((s) => { s.pendingRoll = config }),

    settleRoll: (result) => {
      set((s) => {
        s.lastRollResult = result
        s.pendingRoll = null
        s.isRolling = false
      })
      bus.emit('dice:rollSettled', result)
    },

    setIsRolling: (value) => set((s) => { s.isRolling = value }),

    // -----------------------------------------------------------------------
    // Resources
    // -----------------------------------------------------------------------

    changeSilver: (delta) => {
      set((s) => { s.resources.silver = Math.max(0, s.resources.silver + delta) })
      bus.emit('resource:silverChanged', { delta, newValue: get().resources.silver })
    },

    spendScroll: (scrollId) => {
      const exists = get().resources.intelligenceScrolls.some((sc) => sc.id === scrollId)
      if (!exists) return false
      set((s) => {
        s.resources.intelligenceScrolls = s.resources.intelligenceScrolls.filter(
          (sc) => sc.id !== scrollId
        )
      })
      return true
    },

    changeGoldenDice: (delta) => {
      set((s) => { s.resources.goldenDice = Math.max(0, s.resources.goldenDice + delta) })
      bus.emit('resource:goldenDiceChanged', { delta, newValue: get().resources.goldenDice })
    },

    // -----------------------------------------------------------------------
    // Reputation
    // -----------------------------------------------------------------------

    changeImperialFavor: (delta) => {
      set((s) => {
        s.reputation.imperialFavor = Math.max(0, Math.min(50, s.reputation.imperialFavor + delta))
      })
      bus.emit('reputation:imperialFavorChanged', { delta, newValue: get().reputation.imperialFavor })
    },

    changeVirtue: (delta) =>
      set((s) => { s.reputation.virtue = Math.max(0, s.reputation.virtue + delta) }),

    changeRuthlessness: (delta) =>
      set((s) => { s.reputation.ruthlessness = Math.max(0, s.reputation.ruthlessness + delta) }),

    changeShadowReach: (delta) =>
      set((s) => { s.reputation.shadowReach = Math.max(0, s.reputation.shadowReach + delta) }),

    changeHeavenlySight: (delta) =>
      set((s) => { s.reputation.heavenlySight = Math.max(0, s.reputation.heavenlySight + delta) }),

    addSlander: () => {
      set((s) => { s.reputation.slander += 1 })
      const { slander } = get().reputation
      if (slander >= 3) bus.emit('reputation:slanderThreshold', { count: slander })
    },

    clearSlander: () => set((s) => { s.reputation.slander = 0 }),

    setRank: (rank) => {
      const previous = get().haremRank
      set((s) => { s.haremRank = rank })
      bus.emit('reputation:rankChanged', { previousRank: previous, newRank: rank })
    },

    // -----------------------------------------------------------------------
    // Edict
    // -----------------------------------------------------------------------

    startEdict: (edictId, daysAllowed) => {
      set((s) => { s.edictDaysRemaining = daysAllowed })
      bus.emit('edict:drawn', { edictId, daysAllowed })
    },

    tickEdict: () => {
      set((s) => { s.edictDaysRemaining = Math.max(0, s.edictDaysRemaining - 1) })
      if (get().edictDaysRemaining === 0) {
        bus.emit('edict:expired', { edictId: 'current' })
      }
    },

    fulfillEdict: () => {
      set((s) => { s.edictsCompleted += 1 })
      bus.emit('edict:fulfilled', { edictId: 'current' })
    },

    // -----------------------------------------------------------------------
    // Game phase
    // -----------------------------------------------------------------------

    startRun: (difficulty) =>
      set(() => ({
        ...initialState,
        phase: 'run' as const,
        difficulty,
        resources: {
          ...initialResources,
          goldenDice: difficulty === 'gentle' ? 3 : difficulty === 'standard' ? 1 : 0,
        },
      })),

    endRun: (outcome) =>
      set((s) => { s.phase = 'gameOver'; s.outcome = outcome }),
  }))
)

// ---------------------------------------------------------------------------
// SELECTOR HOOKS — use these in modules for minimal re-renders
// ---------------------------------------------------------------------------

export const useAgents       = () => useGameStore((s) => s.agents)
export const useMapNodes     = () => useGameStore((s) => s.mapNodes)
export const useActiveEvents = () => useGameStore((s) => s.activeEvents)
export const useResources    = () => useGameStore((s) => s.resources)
export const useReputation   = () => useGameStore((s) => s.reputation)
export const useRank         = () => useGameStore((s) => s.haremRank)
export const useDifficulty   = () => useGameStore((s) => s.difficulty)
export const useDiceState    = () =>
  useGameStore((s) => ({
    pendingRoll:    s.pendingRoll,
    lastRollResult: s.lastRollResult,
    isRolling:      s.isRolling,
  }))
