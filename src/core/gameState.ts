// =============================================================================
// GameState — single source of truth for all runtime game data.
// Managed by useReducer. Fully serializable (no Maps, no functions).
// =============================================================================

import type {
  Agent, AgentCondition, AgentTier, Equipment, EquipmentSlot,
  EventType, GameEvent, HaremRank, IntelligenceItem, IntelligenceStore,
  IntelligenceType, LocationId, MapNodeData, ReputationState, StatName,
} from './types'
import { EMPTY_INTELLIGENCE } from './types'
import type { EventRuntimeState, ResolutionType } from '@modules/events'
import type { NarrativeEntry } from '@modules/narrative'

// ---------------------------------------------------------------------------
// State shape — everything needed to describe a running game
// ---------------------------------------------------------------------------

export interface GameState {
  runId: string
  saveSlot: 1 | 2 | 3 | null

  currentDay: number
  phase: 'creation' | 'tutorial' | 'playing' | 'ending'
  endingCondition: string | null

  protagonistId: string
  haremRank: HaremRank

  silver: number
  goldenDice: number
  intelligence: IntelligenceStore
  reputation: ReputationState

  agents: Record<string, Agent>
  equipmentPool: string[] // IDs of unequipped items available to the player

  mapNodes: MapNodeData[]
  eventStates: Record<string, EventRuntimeState>

  narrativeLog: NarrativeEntry[]

  // Taizong health — hidden clock
  taizongHealth: number // 100 → 0, death triggers ending
  taizongDecayRate: number // base per day

  // Resolution queue (transient, not saved — rebuilt on day-end)
  resolutionQueue: string[] // event IDs to resolve this day-end
  resolutionIndex: number
}

// ---------------------------------------------------------------------------
// Actions — every possible state mutation
// ---------------------------------------------------------------------------

export type GameAction =
  // Day
  | { type: 'ADVANCE_DAY' }
  | { type: 'SET_DAY'; day: number }

  // Phase
  | { type: 'SET_PHASE'; phase: GameState['phase'] }
  | { type: 'SET_ENDING'; condition: string }

  // Map & events
  | { type: 'SET_MAP_NODES'; nodes: MapNodeData[] }
  | { type: 'UPDATE_EVENT_IN_NODE'; eventId: string; updater: (ev: GameEvent) => GameEvent }
  | { type: 'SET_EVENT_STATE'; eventId: string; state: EventRuntimeState }
  | { type: 'SET_EVENT_STATES'; states: Record<string, EventRuntimeState> }
  | { type: 'SPAWN_EVENT'; node: LocationId; event: GameEvent; runtimeState: EventRuntimeState }
  | { type: 'REMOVE_EVENTS'; eventIds: string[] }

  // Agent assignment
  | { type: 'ASSIGN_AGENT'; eventId: string; slotId: string; agentId: string | null }
  | { type: 'ASSIGN_INTELLIGENCE'; eventId: string; item: IntelligenceItem | null }
  | { type: 'COMMIT_EVENT'; eventId: string }
  | { type: 'CANCEL_COMMIT'; eventId: string }

  // Resolution
  | { type: 'SET_RESOLUTION_QUEUE'; eventIds: string[] }
  | { type: 'ADVANCE_RESOLUTION' }
  | { type: 'RESOLVE_EVENT'; eventId: string; resolution: ResolutionType; choiceId?: string }

  // Resources
  | { type: 'CHANGE_SILVER'; delta: number }
  | { type: 'CHANGE_GOLDEN_DICE'; delta: number }
  | { type: 'ADD_INTELLIGENCE'; intelType: IntelligenceType; tier: AgentTier; amount: number }
  | { type: 'SPEND_INTELLIGENCE'; intelType: IntelligenceType; tier: AgentTier }
  | { type: 'CHANGE_REPUTATION'; deltas: Partial<ReputationState> }
  | { type: 'SET_HAREM_RANK'; rank: HaremRank }

  // Agents
  | { type: 'ADD_AGENT'; agent: Agent }
  | { type: 'UPDATE_AGENT'; agentId: string; patch: Partial<Agent> }
  | { type: 'REMOVE_AGENT'; agentId: string }
  | { type: 'EQUIP_ITEM'; agentId: string; slot: EquipmentSlot; equipmentId: string }
  | { type: 'UNEQUIP_ITEM'; agentId: string; slot: EquipmentSlot }

  // Equipment pool
  | { type: 'ADD_EQUIPMENT'; equipmentId: string }
  | { type: 'REMOVE_EQUIPMENT'; equipmentId: string }

  // Narrative
  | { type: 'RECORD_NARRATIVE'; entry: NarrativeEntry }
  | { type: 'RECORD_NARRATIVES'; entries: NarrativeEntry[] }

  // Taizong
  | { type: 'DAMAGE_TAIZONG'; amount: number }
  | { type: 'HEAL_TAIZONG'; amount: number }
  | { type: 'SET_TAIZONG_DECAY'; rate: number }

  // Save/load
  | { type: 'LOAD_STATE'; state: GameState }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // Day
    case 'ADVANCE_DAY':
      return { ...state, currentDay: state.currentDay + 1 }
    case 'SET_DAY':
      return { ...state, currentDay: action.day }

    // Phase
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'SET_ENDING':
      return { ...state, phase: 'ending', endingCondition: action.condition }

    // Map & events
    case 'SET_MAP_NODES':
      return { ...state, mapNodes: action.nodes }
    case 'UPDATE_EVENT_IN_NODE': {
      const nodes = state.mapNodes.map(node => {
        const idx = node.events.findIndex(ev => ev.id === action.eventId)
        if (idx === -1) return node
        const events = [...node.events]
        events[idx] = action.updater(events[idx])
        return { ...node, events }
      })
      return { ...state, mapNodes: nodes }
    }
    case 'SET_EVENT_STATE':
      return { ...state, eventStates: { ...state.eventStates, [action.eventId]: action.state } }
    case 'SET_EVENT_STATES':
      return { ...state, eventStates: { ...state.eventStates, ...action.states } }
    case 'SPAWN_EVENT': {
      const nodes = state.mapNodes.map(n => {
        if (n.id !== action.node) return n
        if (n.events.some(e => e.id === action.event.id)) return n
        return { ...n, events: [...n.events, action.event] }
      })
      return {
        ...state,
        mapNodes: nodes,
        eventStates: { ...state.eventStates, [action.event.id]: action.runtimeState },
      }
    }
    case 'REMOVE_EVENTS': {
      const removeSet = new Set(action.eventIds)
      const nodes = state.mapNodes.map(n => ({
        ...n,
        events: n.events.filter(ev => !removeSet.has(ev.id)),
      }))
      return { ...state, mapNodes: nodes }
    }

    // Agent assignment
    case 'ASSIGN_AGENT':
      return {
        ...state,
        mapNodes: state.mapNodes.map(node => ({
          ...node,
          events: node.events.map(ev => ev.id !== action.eventId ? ev : {
            ...ev,
            slots: ev.slots.map(s => s.id !== action.slotId ? s : { ...s, assignedAgentId: action.agentId }),
          }),
        })),
      }
    case 'ASSIGN_INTELLIGENCE':
      return {
        ...state,
        mapNodes: state.mapNodes.map(node => ({
          ...node,
          events: node.events.map(ev => ev.id !== action.eventId ? ev : {
            ...ev,
            assignedIntelligence: action.item,
          }),
        })),
      }
    case 'COMMIT_EVENT':
      return {
        ...state,
        mapNodes: state.mapNodes.map(node => ({
          ...node,
          events: node.events.map(ev => ev.id !== action.eventId ? ev : {
            ...ev,
            committed: true,
            committedOnDay: state.currentDay,
          }),
        })),
      }
    case 'CANCEL_COMMIT':
      return {
        ...state,
        mapNodes: state.mapNodes.map(node => ({
          ...node,
          events: node.events.map(ev => ev.id !== action.eventId ? ev : {
            ...ev,
            committed: false,
            committedOnDay: null,
          }),
        })),
      }

    // Resolution
    case 'SET_RESOLUTION_QUEUE':
      return { ...state, resolutionQueue: action.eventIds, resolutionIndex: 0 }
    case 'ADVANCE_RESOLUTION':
      return { ...state, resolutionIndex: state.resolutionIndex + 1 }
    case 'RESOLVE_EVENT':
      return {
        ...state,
        eventStates: {
          ...state.eventStates,
          [action.eventId]: {
            ...state.eventStates[action.eventId],
            defId: action.eventId,
            state: 'resolved',
            resolution: action.resolution,
            choiceId: action.choiceId,
            dayResolved: state.currentDay,
          },
        },
      }

    // Resources
    case 'CHANGE_SILVER':
      return { ...state, silver: Math.max(0, state.silver + action.delta) }
    case 'CHANGE_GOLDEN_DICE':
      return { ...state, goldenDice: Math.max(0, state.goldenDice + action.delta) }
    case 'ADD_INTELLIGENCE': {
      const intel = { ...state.intelligence }
      intel[action.intelType] = { ...intel[action.intelType] }
      intel[action.intelType][action.tier] += action.amount
      return { ...state, intelligence: intel }
    }
    case 'SPEND_INTELLIGENCE': {
      const intel = { ...state.intelligence }
      intel[action.intelType] = { ...intel[action.intelType] }
      if (intel[action.intelType][action.tier] <= 0) return state
      intel[action.intelType][action.tier] -= 1
      return { ...state, intelligence: intel }
    }
    case 'CHANGE_REPUTATION': {
      const rep = { ...state.reputation }
      for (const [k, v] of Object.entries(action.deltas)) {
        rep[k as keyof ReputationState] += v as number
      }
      return { ...state, reputation: rep }
    }
    case 'SET_HAREM_RANK':
      return { ...state, haremRank: action.rank }

    // Agents
    case 'ADD_AGENT':
      return { ...state, agents: { ...state.agents, [action.agent.id]: action.agent } }
    case 'UPDATE_AGENT': {
      const agent = state.agents[action.agentId]
      if (!agent) return state
      return { ...state, agents: { ...state.agents, [action.agentId]: { ...agent, ...action.patch } } }
    }
    case 'REMOVE_AGENT': {
      const agents = { ...state.agents }
      delete agents[action.agentId]
      return { ...state, agents }
    }
    case 'EQUIP_ITEM': {
      const agent = state.agents[action.agentId]
      if (!agent) return state
      const equipment = { ...agent.equipment, [action.slot]: action.equipmentId }
      const pool = state.equipmentPool.filter(id => id !== action.equipmentId)
      return {
        ...state,
        agents: { ...state.agents, [action.agentId]: { ...agent, equipment } },
        equipmentPool: pool,
      }
    }
    case 'UNEQUIP_ITEM': {
      const agent = state.agents[action.agentId]
      if (!agent) return state
      const currentItem = agent.equipment?.[action.slot]
      const equipment = { ...agent.equipment, [action.slot]: null }
      const returnedId = currentItem && typeof currentItem === 'object' ? currentItem.id : currentItem as string | undefined
      const pool = returnedId ? [...state.equipmentPool, returnedId] : state.equipmentPool
      return {
        ...state,
        agents: { ...state.agents, [action.agentId]: { ...agent, equipment } },
        equipmentPool: pool,
      }
    }

    // Equipment pool
    case 'ADD_EQUIPMENT':
      return { ...state, equipmentPool: [...state.equipmentPool, action.equipmentId] }
    case 'REMOVE_EQUIPMENT':
      return { ...state, equipmentPool: state.equipmentPool.filter(id => id !== action.equipmentId) }

    // Narrative
    case 'RECORD_NARRATIVE':
      return { ...state, narrativeLog: [...state.narrativeLog, action.entry] }
    case 'RECORD_NARRATIVES':
      return { ...state, narrativeLog: [...state.narrativeLog, ...action.entries] }

    // Taizong
    case 'DAMAGE_TAIZONG':
      return { ...state, taizongHealth: Math.max(0, state.taizongHealth - action.amount) }
    case 'HEAL_TAIZONG':
      return { ...state, taizongHealth: Math.min(100, state.taizongHealth + action.amount) }
    case 'SET_TAIZONG_DECAY':
      return { ...state, taizongDecayRate: action.rate }

    // Save/load
    case 'LOAD_STATE':
      return action.state

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

export function createInitialGameState(overrides?: Partial<GameState>): GameState {
  return {
    runId: crypto.randomUUID(),
    saveSlot: null,
    currentDay: 1,
    phase: 'creation',
    endingCondition: null,
    protagonistId: 'protagonist-wu',
    haremRank: 9,
    silver: 3,
    goldenDice: 0,
    intelligence: { ...EMPTY_INTELLIGENCE },
    reputation: { virtue: 0, ruthlessness: 0, imperialFavor: 0, shadowReach: 0, heavenlySight: 0, slander: 0 },
    agents: {},
    equipmentPool: [],
    mapNodes: [],
    eventStates: {},
    narrativeLog: [],
    taizongHealth: 100,
    taizongDecayRate: 2,
    resolutionQueue: [],
    resolutionIndex: 0,
    ...overrides,
  }
}
