# Event System Specification

> Canonical spec. Code must match this.

---

## 1. Event State Machine

Every event definition has a **state** that progresses through a state machine.
An event can only move forward — never backwards.

```
  unmet ──→ ready ──→ onMap ──→ resolved
                        │          ↑
                        │          │ (success / failure / criticalSuccess /
                        │          │  criticalFailure / expired)
                        │
                        └──→ skipped
```

| State | Meaning |
|-------|---------|
| `unmet` | Prerequisites not yet satisfied. Invisible to the pool. |
| `ready` | All prerequisites met. Eligible to be drawn from the pool. |
| `onMap` | Currently placed on the map. Player can interact with it. |
| `resolved` | Completed. Has a resolution type (see below). |
| `skipped` | Removed without resolution (e.g., storyline deactivated, superseded). |

### Resolution Types

When an event reaches `resolved`, it carries one of:

| Resolution | Meaning |
|------------|---------|
| `success` | Dice check passed (or standalone choice counted as success) |
| `failure` | Dice check failed |
| `criticalSuccess` | All dice showed dragon |
| `criticalFailure` | Zero successes on regular dice |
| `expired` | Timer ran out before player committed agents |

These resolution types are available as prerequisite conditions for other events.

---

## 2. Prerequisites

Prerequisites are the **sole mechanism** that gates when an event becomes `ready`.
Every event definition has a list of prerequisites. ALL must be true for the event to leave `unmet`.

```typescript
type EventPrerequisite =
  // Event state checks
  | { kind: 'eventResolved';  defId: string; resolution?: ResolutionType }
    // "event X was resolved" — if resolution specified, must match
    // e.g. { kind: 'eventResolved', defId: 'shadow-whispers', resolution: 'success' }
    // e.g. { kind: 'eventResolved', defId: 'shadow-whispers' }  // any resolution
  | { kind: 'eventNotResolved'; defId: string }
    // "event X has NOT been resolved yet"
  | { kind: 'eventOnMap'; defId: string }
    // "event X is currently on the map"
  | { kind: 'eventReady'; defId: string }
    // "event X is in ready state" (rarely needed)

  // Dilemma choice checks
  | { kind: 'choiceMade'; eventDefId: string; choiceId: string }
    // "player picked this choice in this event's dilemma"
  | { kind: 'choiceNotMade'; eventDefId: string; choiceId: string }

  // Day
  | { kind: 'dayMin'; day: number }
  | { kind: 'dayMax'; day: number }

  // Location
  | { kind: 'locationUnlocked'; locationId: LocationId }

  // Reputation
  | { kind: 'reputationMin'; metric: keyof ReputationState; value: number }
  | { kind: 'reputationMax'; metric: keyof ReputationState; value: number }

  // Resources
  | { kind: 'resourceMin'; resource: 'silver' | 'goldenDice'; value: number }

  // Agent state
  | { kind: 'agentHasCondition'; agentId: string; condition: AgentCondition }
  | { kind: 'agentAlive'; agentId: string }

  // Rank
  | { kind: 'haremRankMin'; rank: HaremRank }
```

**Key change from old system:** `eventCompleted` and `eventFailed` are replaced by the more
general `eventResolved` which can check for any resolution type.

### No `onSuccess` / `onFailure` triggers

Events do NOT directly spawn other events. There is no trigger mechanism.
The fields `onSuccess`, `onFailure`, `onExpiry` on EventDefinition are **removed from
the spawning logic**. They exist only as **graph metadata** — the StorylineEditor uses
them to draw edges showing the intended narrative flow.

The actual flow is: Event A resolves → its resolution is recorded → next day the pool
evaluates all events → Event B's prerequisite `eventResolved: A, success` is now met →
Event B enters `ready` state → pool may draw it onto the map.

---

## 3. Pool & Spawning

### Daily spawn cycle (start of each day)

```
1. PERSIST: Events already onMap stay. Decrement daysRemaining on timed events.
2. EXPIRE:  Events whose daysRemaining hit 0 → move to resolved(expired).
3. EVALUATE: For every event definition NOT in (onMap | resolved | skipped):
             check prerequisites → if all met, state = ready.
4. DRAW:    From all ready events:
            a. Forced events (isForced: true) → always placed onMap.
            b. Remaining slots filled by weighted random draw (poolWeight).
               - Cap on total new events per day (configurable, default ~3).
               - No location restriction — multiple events can share a location.
5. PLACE:   Drawn events → state = onMap, assigned to their locationId.
```

### Pool weights and balancing

- `poolWeight: number` — higher = more likely to be drawn. Default 1.
- `isForced: boolean` — bypasses random draw, always placed when ready.
- `isRepeatable: boolean` — if true, can re-enter `ready` after being resolved.
  (State resets to `unmet`, prerequisites re-evaluated next cycle.)

These values are what the playground is for — tweaking them to see how the event
mix feels across multiple days.

---

## 4. Dilemmas

A dilemma is a decision point **inside** an event's resolution phase. Not a separate event.

### When shown

| `timing` | When | What happens next |
|-----------|------|-------------------|
| `before-roll` | After agents committed, before dice | Player picks approach → may change stats/threshold → dice roll |
| `standalone` | Instead of dice | Player picks → no dice, choice IS the resolution |
| `after-success` | After successful roll | Player picks how to use advantage |
| `after-failure` | After failed roll | Player picks how to mitigate |

### What a choice does

```typescript
interface DilemmaChoice {
  id: string
  label: string
  description: string

  // Modify the dice check
  overrideStats?: [StatName] | [StatName, StatName]
  overrideThreshold?: number
  skipDiceRoll?: boolean          // true = standalone, no dice

  // Gate visibility of this choice
  prerequisites?: EventPrerequisite[]

  // Costs
  cost?: { silver?: number; goldenDice?: number }

  // Immediate effects (applied when chosen, before dice)
  immediateConsequences?: Consequence[]
  moralWeight?: Partial<ReputationState>
}
```

### How choices affect future events

1. Player picks choice → recorded as `{ eventDefId, choiceId, day }` in run history
2. Next day, pool evaluates prerequisites
3. Events with `choiceMade: { eventDefId: 'hairpin-find', choiceId: 'hairpin-investigate' }` → now `ready`
4. Events with `choiceNotMade: ...` for other choices → also `ready` (if that's their prereq)

Choices don't "trigger" events. They set flags. The pool does the rest.

---

## 5. Event Definition (revised)

```typescript
interface EventDefinition {
  id: string
  storylineId?: string
  type: EventType
  locationId: LocationId
  title: string
  description: string
  urgency: EventUrgency

  // Resolution mechanics
  statsChecked: [StatName] | [StatName, StatName]
  threshold: number
  oppositionValue: number
  durationDays: number            // how many days agents are locked
  daysUntilExpiry: number | null  // null = no deadline

  // Agent slots
  slots: EventSlotTemplate[]

  // Gating — when does this become ready?
  prerequisites: EventPrerequisite[]

  // Pool behavior
  poolWeight: number
  isForced?: boolean
  isRepeatable?: boolean

  // Dilemma (optional)
  dilemma?: Dilemma

  // Graph metadata (used by StorylineEditor for edge drawing, NOT by spawn logic)
  graphEdges?: {
    success?: string[]    // defIds this leads to on success
    failure?: string[]    // defIds this leads to on failure
    expiry?: string[]     // defIds this leads to on expiry
    choiceEdges?: { choiceId: string; onSuccess?: string[]; onFailure?: string[] }[]
  }
}
```

**Removed:** `onSuccess`, `onFailure`, `onExpiry` as spawn triggers.
**Added:** `graphEdges` as pure metadata for the editor.

---

## 6. Runtime State

Each event definition has runtime state tracked per run:

```typescript
interface EventRuntimeState {
  defId: string
  state: 'unmet' | 'ready' | 'onMap' | 'resolved' | 'skipped'
  resolution?: ResolutionType        // set when state = resolved
  choiceId?: string                  // dilemma choice made (if any)
  dayPlaced?: number                 // when it went onMap
  dayResolved?: number               // when it was resolved
  daysRemainingOnMap?: number | null // countdown while onMap
}
```

The spawn system reads from this to evaluate prerequisites and determine what's eligible.

---

## 7. Map Display

### Location nodes

Each location on the map shows:
- The location icon/name
- **A circle for each active event** at that location (events in `onMap` state)
- Circle color/style indicates urgency
- Circle size or glow indicates if agents are assigned / ready to resolve

### Clicking a location

Opens the sidebar showing all events at that location as a scrollable list.
Each event entry shows title, urgency, stats, slots, timer, etc. (existing EventEntry UI).

### Resolution phase

When the player ends the day:
1. Switch from map view to resolution view
2. Go through events one by one:
   - If event has a before-roll/standalone dilemma → show choices first
   - Then dice roll (or skip if standalone)
   - Show result
   - Next event
3. After all resolved → return to map, new day starts, pool draws fresh events

---

## 8. Example: The Poisoned Hairpin

### Event definitions with prerequisites

```
"A Gift Left Behind" (ENTRY)
  prerequisites: []                          ← always eligible from pool
  poolWeight: 1
  dilemma (before-roll): 3 choices
    A: "Investigate quietly"    → stats: cunning+discretion ≥3
    B: "Report to officials"   → stats: eloquence+resourcefulness ≥2  
    C: "Wear it to court"      → stats: resolve+beauty ≥4

"Follow the Trail"
  prerequisites:
    - choiceMade: { eventDefId: 'hairpin-find', choiceId: 'hairpin-investigate' }
    - eventResolved: { defId: 'hairpin-find', resolution: 'success' }
  isForced: true

"Symptoms Appear"
  prerequisites:
    - eventResolved: { defId: 'hairpin-find', resolution: 'failure' }
    // appears on failure regardless of which choice was picked
  isForced: true

"Official Inquiry"
  prerequisites:
    - choiceMade: { eventDefId: 'hairpin-find', choiceId: 'hairpin-report' }
    - eventResolved: { defId: 'hairpin-find', resolution: 'success' }
  isForced: true

"Turned Against You"
  prerequisites:
    - choiceMade: { eventDefId: 'hairpin-find', choiceId: 'hairpin-report' }
    - eventResolved: { defId: 'hairpin-find', resolution: 'failure' }
  isForced: true
  dilemma (standalone): 3 choices
    A: "Endure silently"        → skipDiceRoll, +virtue, -favor
    B: "Name the true culprit"  → requires shadowReach≥3, eloquence+cunning ≥4
    C: "Scapegoat your maid"    → skipDiceRoll, +ruthlessness

"The Sender Revealed"
  prerequisites:
    - choiceMade: { eventDefId: 'hairpin-find', choiceId: 'hairpin-wear' }
    - eventResolved: { defId: 'hairpin-find', resolution: 'success' }
  isForced: true

"A Warning in the Night"
  prerequisites:
    - eventResolved: { defId: 'hairpin-trace', resolution: 'failure' }
  isForced: true

"A Rival Exposed"
  prerequisites:
    - choiceMade: { eventDefId: 'hairpin-accused', choiceId: 'accused-name-culprit' }
    - eventResolved: { defId: 'hairpin-accused', resolution: 'success' }
  OR:
    - eventResolved: { defId: 'hairpin-bluff-success', resolution: 'success' }
  isForced: true

"The Truth Surfaces" (CONVERGENCE)
  prerequisites (ANY of):
    - eventResolved: 'hairpin-trace' (success)
    - eventResolved: 'hairpin-official' (success)
    - eventResolved: 'hairpin-cornered' (success)
    - eventResolved: 'hairpin-sick' (success)
    - eventResolved: 'hairpin-rival-exposed' (success)
    - choiceMade: 'accused-endure'
    - choiceMade: 'accused-scapegoat'
  isForced: true
```

**Note:** "The Truth Surfaces" uses OR logic — it triggers from ANY of many paths.
This requires an `anyOf` prerequisite combinator (see section 9).

---

## 9. Open Design Questions

### OR prerequisites

The current model requires ALL prerequisites to be met. "The Truth Surfaces" needs
ANY of several events to be resolved. Options:

**Option A: `anyOf` wrapper**
```typescript
{ kind: 'anyOf', conditions: EventPrerequisite[] }
```

**Option B: Multiple definitions**
Create multiple definitions for the same event, one per path, and use `isRepeatable: false`
so only the first one that fires matters. Ugly.

**Option C: Resolution tags**
Mark events with tags on resolution. The convergence event checks for a tag rather
than specific event IDs. E.g., all hairpin branch events apply tag `hairpin-branch-complete`
on success. "The Truth Surfaces" prerequisites: `tagApplied: 'hairpin-branch-complete'`.

**Recommendation: Option A** — simplest, most explicit.

### Dilemma choice affects resolution type

When a `standalone` dilemma choice with `skipDiceRoll: true` is picked, what resolution
type is recorded? Currently it's always `success`. Should specific choices be able to
define their own resolution type? E.g., "Endure silently" could resolve as `success`
while "Scapegoat" resolves as `success` too but with different consequences.

**Recommendation:** Standalone choices always resolve as `success`. Consequences are
handled through the choice's `immediateConsequences` and `moralWeight`, not through
resolution types. Resolution types are for dice outcomes.
