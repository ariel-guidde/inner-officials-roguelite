# Module Status

> Updated after major refactor. This is the canonical reference for what works and what doesn't.

---

## Module Table

| Module | Files | Lines | Status | Connected to Game | Description |
|--------|-------|-------|--------|-------------------|-------------|
| **core** | 7 | 1,333 | Working | YES (is the context) | Types, GameState reducer, context, event bus, consequences, save/load |
| **lib** | 3 | 76 | Working | — | Utilities: equipment helpers, useLatest hook, clamp/lerp |
| **data** | 16 | 1,897 | Working | — | Content: 22 agents, 26 equipment, 20 events, 3 storylines, factories |
| **dice** | 13 | 1,039 | Working | via props | 3D physics dice rolling (Three.js + Rapier) |
| **map** | 15 | 1,946 | Working | YES (dispatch) | Palace map, event sidebar, agent hand, game loop utilities |
| **characters** | 6 | 843 | Working | via props | Agent roster UI, stat display, portrait registry |
| **inventory** | 2 | 341 | Working | via props | Equipment pool display, equip/unequip |
| **events** | 8 | 1,769 | Working | via spawn context | Event definitions, prerequisites, eligibility, state machine, storyline editor |
| **narrative** | 4 | 258 | Working | reads state | Narrative log indexing, queries, ending calculation |
| **dilemma** | 2 | 154 | Working | via props | Sultan's Game style choice modal |
| **game** | 7 | 1,714 | Working | YES (provides context) | Phase router, character creation, tutorial, main gameplay loop |
| **debug** | 6 | 775 | Working | YES (dispatch) | Dev overlay: state/resources/agents/events panels |
| **playground** | 7 | 1,645 | Working | NO (isolated) | Standalone dev sandbox, own state, not connected to GameState |

**Total: 96 files, ~13,800 lines**

---

## Module Capabilities

### core
- GameState with 30+ action types in pure reducer
- Fully serializable state (no Maps, no functions)
- 3 save slots in localStorage
- Consequence processor (equipment, silver, reputation, conditions, intelligence, narrative)
- Reputation milestone tracking

### dice
- 3D physics-based rolling (Rapier engine)
- Dragon/cloud face detection
- Tier-specific die materials (clay → jade)
- Difficulty rates (gentle 60%, standard 50%, ruthless 40%)
- Golden dice (auto-success)
- Pass chance + "feeling" probability display

### map
- 12 palace locations with coordinates
- Event circles per location node
- Event sidebar with slot assignment
- Intelligence picker (type → tier, 2-step)
- Commit/cancel event mechanics
- End Day button with pulse animation
- Shared game loop: spawn, resolve, advance day
- Parchment-textured background

### characters
- Agent card grid with full stat display
- Equipment loadout per agent
- Condition badges and blocking logic
- Portrait registry (5 SVGs loaded, 22 IDs registered for Act 1)
- Tier-themed card borders

### inventory
- Equipment pool grouped by slot
- Equip/unequip with requirement validation
- Tier-based sorting

### events
- EventDefinition with 15+ prerequisite types including `anyOf`
- State machine: unmet → ready → onMap → resolved / skipped
- Pool-based spawning (forced + weighted random)
- Dilemma integration (before-roll, standalone, after-success, after-failure)
- StorylineEditor for graph visualization
- Consequence declarations on events and dilemma choices

### narrative
- 16 entry types (event_resolved, choice_made, agent_recruited, equipment_acquired, reputation_change, rank_change, condition_gained, etc.)
- Indexed by event, agent, day, kind
- Fast lookups: wasEventResolved, wasChoiceMade, countPrinceInteractions
- Ending calculator (analyzes log → determines ending)

### dilemma
- Full-screen split view (scene left, narrative + choices right)
- Short choice labels (Sultan's Game style)
- No consequence preview (mystery first)
- Locked choices with reason display
- 800ms resolve animation

### game
- Phase router: title → creation → tutorial → playing → ending
- Character creation: 8 backgrounds, 12 educations, 7 dispositions, 5 maid archetypes
- Tutorial: 4 stages teaching dilemma/dice/agents/map+equipment
- GamePlay: full day cycle (spawn → assign → commit → resolve → consequences → advance)
- Resolution modal with dice + dilemma integration
- Taizong health hidden clock (100 → 0)

### debug
- Collapsible side panel (backtick to toggle)
- State panel: day, phase, Taizong health, harem rank
- Resources panel: silver, golden dice, reputation, intelligence grid
- Agents panel: list, stats, conditions, add/remove
- Events panel: definitions with runtime state, force-spawn, narrative log viewer

---

## What's Stubbed / Not Implemented

| Feature | Location | Status |
|---------|----------|--------|
| Location unlock consequences | core/consequences.ts | TODO comment |
| Reroll resource | core/consequences.ts | TODO comment |
| Edict cycle / imperial demands | — | Designed in docs, not in code |
| Seasonal festivals | map layout data | Locations exist, no events trigger them |
| Meta-progression (Wu Family Standing) | — | Designed in docs, not in code |
| Prince storyline events | — | Agents exist, events not yet written |
| Taizong romance events | — | Designed in ACT1_STORYLINES.md, not in code |
| Consort Xu storyline | — | Designed, not in code |

---

## Data Content Summary

| Category | Count | Source |
|----------|-------|--------|
| Agents (Act 1) | 22 | src/data/agents/ |
| Equipment items | 26 | src/data/equipment.ts |
| Events (storyline) | 12 | src/data/events/act1-yang-court, chunhua, elixir |
| Events (pool/random) | 8 | src/data/events/act1-pool |
| Storylines | 3 | src/data/events/storylines.ts |
| Dilemmas | 5 | Embedded in event definitions |
| Portrait SVGs | 5 loaded, 22 IDs ready | src/assets/portraits/ |
| Save slots | 3 | localStorage |

---

## Architecture Diagram

```
App.tsx
  ├── Game (provides GameStateProvider)
  │   ├── TitleScreen / CharacterCreation
  │   ├── Tutorial
  │   └── GamePlay (reads context, dispatches actions)
  │       ├── Map module (nodes, sidebar, hand)
  │       │   ├── MapCanvas + MapNode
  │       │   ├── EventSidebar + EventEntry
  │       │   ├── IntelligencePicker
  │       │   └── AgentHand + AgentCard
  │       ├── Dice module (3D rolling)
  │       ├── Dilemma module (choice UI)
  │       └── ResolutionModal
  │
  ├── DebugOverlay (reads/writes context)
  │   ├── DebugStatePanel
  │   ├── DebugResourcePanel
  │   ├── DebugAgentPanel
  │   └── DebugEventPanel
  │
  └── (Playground — isolated, own state, dev-only)

Data flow:
  GameState (reducer) ← dispatch(actions) ← GamePlay/Debug
  GameState (reducer) → useGameState() → GamePlay/Debug → props → Map/Dice/Dilemma
  
  Events: data/events → eligibility check → spawn → map → commit → resolve → consequences → narrative log
  Agents: data/agents → creation → state → hand → assign to events
  Equipment: data/equipment → pool → equip/unequip → agent stat bonuses
```
