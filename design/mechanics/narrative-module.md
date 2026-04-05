# Narrative Module — Design Document

## What Problem This Solves

The current resolution system rolls dice, produces a success/failure boolean, and moves on.
That's a mechanical skeleton. The actual game experience is about *what happened* — the story
the player tells themselves about their character's actions inside the palace.

The narrative module owns everything between "Continue →" and the next day beginning:
- What text the player reads
- What choices they face before or after rolling
- What consequences get applied based on roll outcome and chosen approach
- How past events gate or trigger future events

---

## Two Layers: Script vs State

**`GameEvent`** (already in `@core/types`, lives on the map) — pure mechanical state.
Which node, which stats, which agents, timers. The map module reads and writes this.

**`EventScript`** (this module) — the content layer. What the event *says* and *does* narratively.
Keyed by `eventId` (or by `eventType` for generic/reusable events). The map never needs to import
this; only the resolution flow does.

These are deliberately separate so that:
- New narrative content can be added without touching game-state types
- The same event *type* (e.g. `ceremony`) can share fallback narrative if a specific script
  isn't written yet
- Automated events (no player slots, auto-resolve) can have minimal or no script

---

## Core Types

### `EventScript`

```typescript
interface EventScript {
  eventId: string   // matches GameEvent.id exactly, OR a GameEvent.type for fallback

  /**
   * Shown at the top of the resolution modal before anything happens.
   * Sets the scene. Should be 2-4 sentences.
   */
  intro: string

  /**
   * Optional pre-roll choices. If present, player picks one before dice are rolled.
   * The chosen approach modifies the pool and/or threshold, and determines which
   * outcome texts are shown after the roll.
   */
  choices?: EventChoice[]

  /**
   * Post-roll outcome entries. Matched top-to-bottom — first matching condition wins.
   * Always include at least 'success' and 'failure'.
   */
  outcomes: EventOutcome[]
}
```

### `EventChoice`

```typescript
interface EventChoice {
  id: string
  label: string          // "Speak boldly" / "Flatter discreetly" / "Stay silent"
  description: string    // 1-2 sentences: what this approach looks like in-world
  poolModifier?: number  // applied before the roll (+1 or -1 dice typically)
  thresholdModifier?: number
  // Choices can also have their own outcome overrides — if present, these replace
  // the script-level outcomes for this choice
  outcomes?: EventOutcome[]
}
```

### `EventOutcome`

```typescript
type OutcomeCondition =
  | 'criticalSuccess'   // margin >= 2
  | 'success'           // margin >= 0 (isSuccess true)
  | 'marginalSuccess'   // margin === 0 exactly
  | 'failure'           // isSuccess false
  | 'criticalFailure'   // isCriticalFailure true (rolled all 1s or equivalent)
  | 'expired'           // event ran out of time without being attempted

interface EventOutcome {
  condition: OutcomeCondition
  narrative: string       // what happened, 2-5 sentences, written in past tense
  rewards?: Consequence[]
  costs?: Consequence[]
}
```

### `Consequence`

```typescript
type Consequence =
  | { kind: 'scroll';           scroll: IntelligenceScroll }
  | { kind: 'goldenDice';       amount: number }
  | { kind: 'rerolls';          amount: number }
  | { kind: 'condition';        agentId: 'protagonist' | string; condition: AgentCondition }
  | { kind: 'removeCondition';  agentId: string; condition: AgentCondition }
  | { kind: 'relationship';     npcId: string; delta: number }   // future: favour/enmity tracking
  | { kind: 'unlockLocation';   locationId: LocationId }
  | { kind: 'triggerEvent';     eventId: string }                // queues a new event on a node
  | { kind: 'narrative';        text: string }                   // pure flavour, no mechanic
```

---

## Resolution Flow (with narrative)

```
[ Continue → ]
      │
      ▼
[ NarrativeResolutionModal ]
      │
      ├─ show intro text
      │
      ├─ if choices present:
      │     player picks one → poolModifier applied
      │
      ├─ dice roll (existing Dice component)
      │
      ├─ determine OutcomeCondition from result
      │
      ├─ look up matching EventOutcome (choice-level first, script-level fallback)
      │
      ├─ display outcome.narrative
      │
      ├─ list rewards (green) and costs (red) with descriptions
      │
      └─ "Next →" / "Begin Day N →"
            │
            ▼
      applyConsequences() → patches agents, scrolls, resources, queues triggered events
```

---

## Event Selection / Daily Pool

Currently events are hardcoded in `mapDefaults.ts`. Eventually:

- A **pool** of `GameEvent` templates exists, each linked to an `EventScript`
- Each day, the pool is filtered and drawn from: some events are fixed (always available at
  their node), some require prior outcomes to unlock, some are random draws
- An **event chain** is an `EventScript` whose outcomes include `{ kind: 'triggerEvent' }` —
  completing it spawns the next event in the chain on a specified node the following day
- Crisis/scandal events (from prior sessions' design: edict, crisis) are forced into the pool
  by game state (e.g. rival's power above threshold)

This lives in `narrative/eventPool.ts` — pure functions, no React.

---

## Module File Structure

```
src/modules/narrative/
  index.ts              — public exports
  types.ts              — EventScript, EventChoice, EventOutcome, Consequence
  scripts/
    index.ts            — EVENT_SCRIPTS: Record<string, EventScript>  (the content DB)
    ceremony.ts         — scripts for ceremony-type events
    social.ts
    estateManagement.ts
    personal.ts
    spiritual.ts
  logic/
    matchOutcome.ts     — getOutcome(script, choiceId, rollResult): EventOutcome
    applyConsequences.ts — pure: Consequence[] → state patch object
    eventPool.ts        — daily pool selection (stub for now)
  NarrativeResolutionModal.tsx  — replaces current ResolutionModal in Playground
```

---

## What the Map Needs (stubs only, no narrative logic)

The map module is **not** a consumer of narrative content — it only displays game-state.
The one touch point is the `ResolutionModal` in `Playground.tsx`, which will be replaced
by `NarrativeResolutionModal` from this module when it's ready.

Stubs needed now so nothing is hardcoded in the wrong place:
1. `Consequence` type exported from `@core/types` — so `applyDayEnd` in Playground can
   accept a `Consequence[]` patch without knowing how it was computed
2. `EventScript` type stub — so `GameEvent` can optionally carry `scriptId?: string` for
   future lookup without changing any current logic
3. `EVENT_SCRIPTS` as an empty record in the narrative module — so imports compile when
   `NarrativeResolutionModal` is wired in later

---

## What Is NOT in This Module

- Map rendering (stays in `@modules/map`)
- Agent/equipment state (stays in `@modules/characters`)  
- Dice rolling (stays in `@modules/dice`)
- Inventory (stays in `@modules/inventory`)

The narrative module is a **pure content + consequence layer**. It reads game state as inputs
and returns state patches as outputs. It never mutates anything directly.
