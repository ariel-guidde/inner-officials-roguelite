# Major Refactor Plan

> This is the plan. Nothing gets built until it's reviewed.

---

## Goals

1. Kill all duplication between Game and Playground
2. Proper data architecture — factories, registries, no hardcoding
3. Narrative module tracks everything, gates everything
4. Single GameState managed in one place, serializable for save/load
5. Split monolith files into proper components
6. Rebuild data for Act 1 (Taizong's court, 3 princes, 50-day run)
7. Playground becomes debug overlay on the Game, not a parallel app

---

## Phase 1: Architecture Foundation

### 1.1 — GameState Context

**Create `src/core/GameStateContext.tsx`**

Single state object managed by `useReducer`. All game modules read from context, dispatch actions to it. No more scattered `useState` hooks in GamePlay.

```typescript
interface GameState {
  // Run identity
  runId: string
  saveSlot: 1 | 2 | 3

  // Time
  currentDay: number  // 1-50ish
  
  // Player
  protagonistId: string
  haremRank: HaremRank
  
  // Resources
  silver: number
  goldenDice: number
  intelligence: IntelligenceStore
  reputation: ReputationState
  
  // Agents (mutable — equipment changes, conditions change)
  agents: Record<string, Agent>
  
  // Equipment pool (unequipped items available)
  equipmentPool: string[]  // equipment IDs
  
  // Map
  mapNodes: MapNodeData[]
  
  // Event state machine
  eventStates: Record<string, EventRuntimeState>  // plain object, not Map (serializable)
  
  // Narrative log
  narrativeLog: NarrativeEntry[]
  
  // Game phase
  phase: 'creation' | 'tutorial' | 'playing' | 'ending'
  endingCondition: string | null
}
```

**Actions (dispatch):**
```
advanceDay
spawnEvents(defs[])
assignAgent(eventId, slotId, agentId)
unassignAgent(eventId, slotId)
assignIntelligence(eventId, item)
commitEvent(eventId)
cancelCommit(eventId)
resolveEvent(eventId, resolution, choiceId?)
applyConsequences(consequences[])
recruitAgent(agent)
equipItem(agentId, slot, equipmentId)
unequipItem(agentId, slot)
changeReputation(deltas)
changeSilver(delta)
addEquipment(equipmentId)
addIntelligence(type, tier, amount)
setHaremRank(rank)
recordNarrative(entry)
```

All state mutations go through the reducer. Components dispatch, never `setState` directly.

### 1.2 — Narrative Module (rewrite)

**`src/modules/narrative/`**

The narrative module has two jobs:
1. **Record** — log everything that happens in the run
2. **Query** — answer questions about run history efficiently

```typescript
// Entry types — one per kind of thing that can happen
type NarrativeEntry =
  | { day: number; kind: 'event_resolved'; eventId: string; resolution: ResolutionType }
  | { day: number; kind: 'choice_made'; eventId: string; dilemmaId: string; choiceId: string }
  | { day: number; kind: 'agent_recruited'; agentId: string }
  | { day: number; kind: 'agent_lost'; agentId: string; reason: string }
  | { day: number; kind: 'equipment_acquired'; equipmentId: string; source: string }
  | { day: number; kind: 'equipment_lost'; equipmentId: string; reason: string }
  | { day: number; kind: 'reputation_change'; metric: string; oldValue: number; newValue: number }
  | { day: number; kind: 'reputation_milestone'; metric: string; value: number }
  | { day: number; kind: 'rank_change'; oldRank: HaremRank; newRank: HaremRank }
  | { day: number; kind: 'prince_interaction'; princeId: string; nature: string }
  | { day: number; kind: 'condition_gained'; agentId: string; condition: AgentCondition }
  | { day: number; kind: 'condition_removed'; agentId: string; condition: AgentCondition }
  | { day: number; kind: 'day_summary'; text: string }

// Indexed for fast queries
interface NarrativeIndex {
  byEvent: Record<string, NarrativeEntry[]>    // eventId → entries
  byAgent: Record<string, NarrativeEntry[]>    // agentId → entries  
  byDay: Record<number, NarrativeEntry[]>      // day → entries
  byKind: Record<string, NarrativeEntry[]>     // kind → entries
  choices: Record<string, string>              // dilemmaId → choiceId (fast lookup)
  resolvedEvents: Record<string, ResolutionType> // eventId → resolution
}

// Functions
record(state, entry) → updated state + index
query.wasEventResolved(index, eventId, resolution?) → boolean
query.wasChoiceMade(index, dilemmaId, choiceId) → boolean  
query.getAgentHistory(index, agentId) → NarrativeEntry[]
query.getReputationAt(log, metric, day) → number
query.generateEnding(state) → EndingResult
```

The index is rebuilt on load (from the log). During play, it's incrementally updated.

### 1.3 — Consequence Processor

**`src/core/consequences.ts`**

Single function that takes consequences and produces state changes:

```typescript
function processConsequences(
  consequences: Consequence[],
  state: GameState,
): { actions: GameAction[]; narrativeEntries: NarrativeEntry[] }
```

Called by the game loop after event resolution or dilemma choice. Returns actions to dispatch + narrative entries to record. Nothing else applies consequences — this is the one place.

### 1.4 — Save/Load

**`src/core/saveLoad.ts`**

```typescript
interface SaveSlot {
  id: 1 | 2 | 3
  state: GameState | null
  savedAt: string | null  // ISO date
  summary: string | null  // "Day 14 — Cairen Wu — Virtue 3"
}

function saveGame(slot: 1|2|3, state: GameState): void  // localStorage
function loadGame(slot: 1|2|3): GameState | null
function deleteSave(slot: 1|2|3): void
function listSaves(): SaveSlot[]
```

GameState is fully serializable (no Maps, no functions, no circular refs).

---

## Phase 2: Split Monoliths

### 2.1 — Split Map.tsx (1353 lines → ~6 files)

```
src/modules/map/
  Map.tsx              (~200) — root component, layout
  MapCanvas.tsx        (~200) — background, nodes, paths, End Day button
  MapNode.tsx          (~150) — individual location node
  EventSidebar.tsx     (~250) — event list for selected location
  EventEntry.tsx       (~200) — single event card with slots, intel, commit
  IntelligencePicker.tsx (~150) — type → tier picker
  AgentHand.tsx        (~150) — bottom card hand
  AgentCard.tsx        (~100) — individual agent card in hand
```

### 2.2 — Playground becomes Debug Overlay

**Delete `src/modules/playground/Playground.tsx` (1314 lines)**

Replace with:

```
src/modules/debug/
  DebugOverlay.tsx     (~300) — collapsible panel over the Game
  DebugStatePanel.tsx  (~150) — view/edit GameState fields
  DebugEventPanel.tsx  (~150) — force events, view prerequisites
  DebugAgentPanel.tsx  (~100) — modify agents, add/remove
  DebugResourcePanel.tsx (~100) — modify silver, intel, golden dice
```

The debug overlay reads and writes to the same GameState context as the Game. No parallel state. Toggle with a keyboard shortcut or the existing bottom-right button.

### 2.3 — Split GamePlay.tsx (572 lines → smaller)

The game loop logic moves into the reducer/context. GamePlay becomes a pure rendering component:

```
src/modules/game/
  Game.tsx             — phase router (unchanged)
  phases/
    CharacterCreation.tsx — unchanged
    Tutorial.tsx        — unchanged (blackbox test case)
    GamePlay.tsx       (~200) — renders map + overlays, dispatches actions
  hooks/
    useGameLoop.ts     (~150) — day advancement, event spawning, resolution queue
    useDilemmaFlow.ts  (~100) — dilemma detection + resolution
```

---

## Phase 3: Data Architecture

### 3.1 — Event Factory

**`src/data/events/eventFactory.ts`**

```typescript
interface EventConfig {
  id: string
  title: string
  description: string
  type: EventType
  location: LocationId
  urgency?: EventUrgency          // default: 'routine'
  stats: [StatName] | [StatName, StatName]
  threshold: number
  opposition?: number             // default: 0
  duration?: number               // default: 1
  expiry?: number | null          // default: null
  slots?: EventSlotConfig[]       // default: []
  prerequisites?: EventPrerequisite[]  // default: []
  weight?: number                 // default: 1
  forced?: boolean                // default: false
  repeatable?: boolean            // default: false
  dilemma?: DilemmaConfig
  graphEdges?: GraphEdges
  storylineId?: string
}

function defineEvent(config: EventConfig): EventDefinition
```

Fills defaults, validates prerequisite references at registration time.

### 3.2 — Equipment Factory

**`src/data/equipment/equipmentFactory.ts`**

```typescript
interface EquipmentConfig {
  id: string
  name: string
  slot: EquipmentSlot
  tier?: AgentTier               // default: 'clay'
  tags?: EquipmentItemTag[]      // default: []
  stats?: Partial<StatBlock>     // default: {}
  requires?: EquipmentRequirements  // default: {}
  description?: string
}

function defineEquipment(config: EquipmentConfig): Equipment
```

### 3.3 — Agent Data (plain objects, typed)

Agents are plain `Agent` objects defined in data files. No factory needed — TypeScript validates the shape.

```
src/data/
  agents/
    act1-imperials.ts    — Taizong, princes
    act1-consorts.ts     — Yang, Xu, Jiang, Zheng, Song, Pei
    act1-officials.ts    — Zhangsun Wuji, Chu Suiliang, Li Ji, etc.
    act1-household.ts    — Chunhua templates per archetype, background agents
    act1-staff.ts        — eunuchs, physician, merchants, religious
    index.ts             — ALL_ACT1_AGENTS registry
  events/
    eventFactory.ts
    act1-yang-court.ts   — Consort Yang storyline events
    act1-new-girls.ts    — Harem social events
    act1-elixir.ts       — Taizong's health arc
    act1-chengqian.ts    — Crown Prince storyline
    act1-tai.ts          — Scholar Prince storyline
    act1-zhi.ts          — Gentle Prince storyline (hard path)
    act1-taizong.ts      — Emperor romance path
    act1-xu.ts           — Scholar Consort Xu storyline
    act1-chunhua.ts      — Maid loyalty arc
    act1-pool.ts         — Standalone random events
    index.ts             — ALL_EVENTS, ALL_STORYLINES registries
  equipment/
    equipmentFactory.ts
    attire.ts
    accessories.ts
    tools.ts
    weapons.ts
    index.ts             — ALL_EQUIPMENT, STARTING_EQUIPMENT registries
```

### 3.4 — Portrait Registry

```
src/assets/portraits/
  wu.svg               — protagonist
  chunhua.svg          — maid
  taizong.svg          — emperor
  chengqian.svg        — crown prince
  tai.svg              — scholar prince
  zhi.svg              — gentle prince
  yang.svg             — senior consort
  xu.svg               — scholar consort
  jiang.svg            — consort
  zheng.svg            — schemer consort
  song.svg             — young consort
  pei.svg              — resigned consort
  xinnu.svg            — musician (Chengqian's lover)
  zhangsun.svg         — chancellor
  chu-suiliang.svg     — chancellor
  li-ji.svg            — general
  eunuch-chen.svg      — chief eunuch
  eunuch-gao.svg       — junior eunuch
  xuanzang.svg         — buddhist monk
  sun-taoist.svg       — taoist master
  mingzhu.svg          — nun
  sun-physician.svg    — palace doctor
```

All registered in `portraitRegistry.ts`. Missing files show colored initials (existing fallback).

---

## Phase 4: Act 1 Content

### 4.1 — Taizong's Health (the clock)

Taizong's health is a hidden counter that decreases semi-randomly. Events can accelerate or slow it. When it hits 0, he dies → end-game.

```typescript
interface TaizongHealth {
  current: number      // starts at 100
  decayRate: number    // base: 2 per day, modified by events
  elixirEffect: number // negative: elixirs make it worse
}
```

Random events fire based on health thresholds:
- 80: "The Emperor coughs at morning audience"
- 60: "The Emperor cancels the hunt"  
- 40: "The Emperor is confined to quarters"
- 20: "The physicians work through the night"
- 0: Death → ending calculation

### 4.2 — Prince Narrative Tracks

Not a simple favor meter — tracked through narrative entries. The ending calculator counts:
- How many events involved each prince
- What choices were made in prince-specific dilemmas
- Whether key story beats were hit (Xinnu discovery, Tai's proposition, Zhi temple visit)

### 4.3 — Endings (stub)

```typescript
interface EndingResult {
  id: string
  title: string
  summary: string
  // Generated from narrative log analysis
}

function calculateEnding(state: GameState): EndingResult
```

Endings mapped later. The function analyzes the narrative log and returns the best-matching ending. For now, a simple scoring system:
- Count prince interactions → which prince is dominant
- Check if player has a son
- Check reputation milestones
- Generate a text summary

---

## Phase 5: Wiring

### 5.1 — Game Loop (in reducer)

```
Each day:
  1. Evaluate event prerequisites → update states (unmet → ready)
  2. Spawn from pool (ready → onMap) 
  3. Player phase: assign agents, equip, assign intel, commit events
  4. End Day pressed:
     a. Process committed events → resolution queue
     b. For each: dilemma? → show dilemma → choice recorded
     c. Dice roll (if applicable)
     d. processConsequences() → actions dispatched
     e. recordNarrative() entries logged
     f. Decrement Taizong health
     g. Check for Taizong death
     h. Advance day
     i. Clean map (remove resolved, decrement timers, expire)
     j. Spawn new events
```

### 5.2 — Save Points

Auto-save at the start of each day (before player actions). Manual save available from a menu.

---

## Execution Order

| Step | What | Touches |
|------|------|---------|
| 1 | GameState context + reducer | New files |
| 2 | Narrative module rewrite | modules/narrative/ |
| 3 | Consequence processor | core/consequences.ts |
| 4 | Save/load system | core/saveLoad.ts |
| 5 | Split Map.tsx | modules/map/ |
| 6 | Data factories + registries | data/ |
| 7 | Act 1 agent data | data/agents/ |
| 8 | Act 1 event data (storylines) | data/events/ |
| 9 | Rewrite GamePlay to use context | modules/game/ |
| 10 | Debug overlay (replace Playground) | modules/debug/ |
| 11 | Ending calculation | modules/narrative/ |
| 12 | Taizong health system | data/events/, reducer |
| 13 | Portrait registry for 22 characters | assets/, characters/ |

Steps 1-4 are foundation (nothing works without them).
Steps 5-6 are cleanup (reduce complexity).
Steps 7-8 are content (the actual game).
Steps 9-10 are wiring (make it playable).
Steps 11-13 are completion (end-game, polish).

---

## What Gets Deleted

- `src/core/store.ts` — already deleted
- `src/modules/playground/Playground.tsx` — replaced by debug overlay
- `src/modules/playground/configs/` — data moves to `src/data/`
- All hardcoded event definitions in current `eventDefinitions.ts` — rebuilt with factory
- All hardcoded character data in `charactersDefaults.ts` — rebuilt in `data/agents/`
- Dead narrative stubs (matchOutcome, applyConsequences, eventPool, empty scripts)

## What Gets Kept

- Dice module — works, don't touch
- Characters UI — works (just needs context wiring)
- Inventory UI — works (just needs context wiring)  
- Dilemma module — works
- Map module — split into files but logic stays
- Character creation — stays
- Tutorial — blackbox test case, stays
- Core types — stays (minor additions for narrative entries)
- Equipment data in `@data/` — stays (already refactored)
