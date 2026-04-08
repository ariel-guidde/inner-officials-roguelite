# Event Graph, Dilemmas & Decision Trees

> How events, decisions, prerequisites, and consequences form a directed graph —
> with lessons from The Sultan's Game and a concrete proposal for Inner Officials.

---

## 1. Lessons from The Sultan's Game

Sultan's Game builds its event graph from three interlocking systems:

### 1.1 Sultan Cards (≈ our Edict Deck)
- A card is drawn with a **7-day deadline**. The player must find an event that "breaks" it.
- Cards come in 4 types × 4 tiers. **Not every event can break every card** — you need to find the right event that matches the card's type *and* tier.
- This creates a **search problem**: the player must scan their available events, agents, and items to find a viable path to break the card before the timer expires.
- **Key insight:** The deadline doesn't just create urgency — it forces the player into *dilemmas* because breaking a card often has side effects (spending gold, angering NPCs, consuming relationships).

### 1.2 Character Storylines (≈ our Storylines)
- Named NPCs have multi-beat arcs that unfold over time (Maggie: ~15 events, Nawfal: ~20 events).
- **Decisions** at each beat **fork the storyline** into different branches. Example:
  - Meeting Nawfal → use a Carnality card (he becomes a rival) / use a Bloodshed card (he dies) / use no card (revolution path opens)
- Storyline progress **unlocks new events, locations, and card-breaking opportunities**.
- Storylines **interact**: Maggie's death cancels 3 other NPC questlines. Nawfal becoming Vizier changes ending options.

### 1.3 Reputation Thresholds (≈ our Reputation Metrics)
- Reaching stat thresholds (Renown ≥ 20, Infamy ≥ 3, Notoriety ≥ 3) **unlocks new events**.
- Some events are only available if you've accumulated enough of a specific reputation.
- **Key insight:** Reputations act as **prerequisite gates** in the event graph, not just narrative flavor.

### 1.4 The Dilemma Pattern
Sultan's Game dilemmas follow a consistent structure:

```
PRESSURE (deadline/card/crisis)
  → CHOICE (2-4 options, each with tradeoffs)
    → CONSEQUENCE (immediate: stat change, agent loss, resource cost)
      → DOWNSTREAM (new events unlock, storylines fork, opportunities close)
```

**Example: Maggie's Resentment**
```
Pressure: You used a Carnality card with someone else
  → Resentment +1
    → If Resentment ≥ 2: "Dissonance" event fires (Charisma check)
      → Success: crisis averted
      → Failure: "Accumulated Grief" (stat penalties)
        → If Grief + another Dissonance failure: "Into the Dream" (DEATH ENDING)
```

The key pattern: **a consequence from one decision becomes the prerequisite for a future event**.

---

## 2. What Inner Officials Currently Has vs. What It Needs

### Currently Implemented
- Events have `prerequisites` (eventCompleted, eventFailed, dayMin, dayMax, locationUnlocked)
- Events chain via `onSuccess` / `onFailure` / `onExpiry` → spawn new event definitions
- Storylines group related events

### What's Missing: Dilemmas
The current system resolves events purely through **dice checks** — assign agents, roll dice, succeed or fail. There's no decision point *within* or *before* an event where the player makes a meaningful choice that changes what happens.

Sultan's Game offers several dilemma patterns we should adapt:

| Sultan's Game Pattern | Inner Officials Equivalent |
|---|---|
| Which card to use on an NPC | Which approach to take on an event (see below) |
| Methinks ritual choices | Dilemma events with 2-3 approach options |
| Scapegoat/sacrifice follower | Already designed (scapegoat mechanic) |
| Gift expensive items to resolve crises | Spend silver/scrolls to bypass or modify events |
| Choose who becomes Vizier | Choose which NPC to support in political events |

---

## 3. Proposed Dilemma Mechanic

### 3.1 The `Dilemma` Type

A dilemma is a **decision point** that appears either:
- **Before** an event resolves (choose your approach → different stats checked, different consequences)
- **Instead of** a dice check (pure narrative choice → different follow-up events)
- **After** a success/failure (choose how to use your advantage / mitigate your loss)

```typescript
interface DilemmaChoice {
  id: string
  label: string                          // "Confront her publicly"
  description: string                    // Longer flavor text
  /** If present, this choice changes the event's resolution stats/threshold */
  overrideStats?: [StatName] | [StatName, StatName]
  overrideThreshold?: number
  /** Prerequisites to even see this choice */
  prerequisites?: EventPrerequisite[]
  /** Reputation requirements to unlock this choice */
  reputationGates?: Partial<ReputationState>
  /** Resource cost to pick this choice */
  cost?: { silver?: number; goldenDice?: number; scrollType?: IntelligenceType }
  /** Consequences applied immediately on choosing (before dice roll) */
  immediateConsequences?: Consequence[]
  /** Events spawned on success if this choice was picked */
  onSuccess?: string[]
  /** Events spawned on failure if this choice was picked */
  onFailure?: string[]
  /** If true, skip dice roll entirely — choice IS the resolution */
  skipDiceRoll?: boolean
  /** Tags that hint at moral alignment for reputation tracking */
  moralWeight?: { virtue?: number; ruthlessness?: number }
}

interface Dilemma {
  id: string
  /** When this dilemma is presented */
  timing: 'before-roll' | 'after-success' | 'after-failure' | 'standalone'
  prompt: string                         // "How do you respond to the accusation?"
  choices: DilemmaChoice[]               // 2-4 options
}
```

### 3.2 Extending EventDefinition

```typescript
interface EventDefinition {
  // ... existing fields ...

  /** Dilemma presented to the player during this event */
  dilemma?: Dilemma

  /** NEW: Reputation prerequisites (in addition to existing event prerequisites) */
  reputationPrerequisites?: Partial<ReputationState>

  /** NEW: Agent relationship prerequisites */
  relationshipPrerequisites?: { npcId: string; minRelationship: number }[]
}
```

---

## 4. Event Graph as a Directed Graph

The event system forms a **directed acyclic graph** (with optional cycles for repeatable events). Here's the formal model:

### 4.1 Node Types

```
(Event)        — a resolvable game event on the map
(Dilemma)      — a decision point within an event
(Choice)       — one option within a dilemma
(Gate)         — a prerequisite condition (reputation, day, relationship, etc.)
(Consequence)  — a state mutation (reputation change, condition, resource, etc.)
(Ending)       — a terminal game state
```

### 4.2 Edge Types

```
TRIGGERS       — completing/failing an event spawns another
CONTAINS       — an event contains a dilemma
OFFERS         — a dilemma offers choices
REQUIRES       — an event or choice requires a gate to be satisfied
CAUSES         — a choice or outcome causes consequences
UNLOCKS        — a consequence unlocks a gate for future events
LEADS_TO       — a storyline arc progresses to the next beat
```

### 4.3 Neo4j Schema

```cypher
// --- Node types ---
CREATE CONSTRAINT FOR (e:Event)      REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT FOR (d:Dilemma)    REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT FOR (c:Choice)     REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT FOR (g:Gate)       REQUIRE g.id IS UNIQUE;
CREATE CONSTRAINT FOR (s:Storyline)  REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT FOR (loc:Location) REQUIRE loc.id IS UNIQUE;
CREATE CONSTRAINT FOR (end:Ending)   REQUIRE end.id IS UNIQUE;

// --- Example: "Shadow of the Consort" storyline ---

// Storyline
CREATE (sl:Storyline {id: 'shadow-consort', title: 'Shadow of the Consort'})

// Events
CREATE (e1:Event {id: 'shadow-whispers', title: 'Whispers in the Quarter',
                  type: 'investigation', urgency: 'opportunity',
                  stats: ['cunning','discretion'], threshold: 2})
CREATE (e2:Event {id: 'shadow-counter', title: 'Counter the Slander',
                  type: 'social', urgency: 'timed',
                  stats: ['eloquence','cunning'], threshold: 3})
CREATE (e3:Event {id: 'shadow-scrutiny', title: 'Household Under Scrutiny',
                  type: 'estateManagement', urgency: 'crisis',
                  stats: ['resourcefulness','discretion'], threshold: 4})
CREATE (e4:Event {id: 'shadow-peace', title: 'A Gathering of Allies',
                  type: 'social', urgency: 'opportunity',
                  stats: ['beauty','eloquence'], threshold: 2})
CREATE (e5:Event {id: 'shadow-imperial-suspicion', title: "The Emperor's Ear",
                  type: 'ceremony', urgency: 'crisis',
                  stats: ['eloquence','resolve'], threshold: 4})

// Locations
CREATE (loc1:Location {id: 'eunuchQuarter'})
CREATE (loc2:Location {id: 'innerCourt'})
CREATE (loc3:Location {id: 'householdOffice'})
CREATE (loc4:Location {id: 'imperialGardens'})

// Wiring
CREATE (sl)-[:CONTAINS]->(e1)
CREATE (sl)-[:CONTAINS]->(e2)
CREATE (sl)-[:CONTAINS]->(e3)
CREATE (sl)-[:CONTAINS]->(e4)
CREATE (sl)-[:CONTAINS]->(e5)

CREATE (e1)-[:AT]->(loc1)
CREATE (e2)-[:AT]->(loc2)
CREATE (e3)-[:AT]->(loc3)
CREATE (e4)-[:AT]->(loc4)
CREATE (e5)-[:AT]->(loc2)

CREATE (e1)-[:ON_SUCCESS]->(e2)
CREATE (e1)-[:ON_FAILURE]->(e3)
CREATE (e2)-[:ON_SUCCESS]->(e4)
CREATE (e2)-[:ON_FAILURE]->(e5)
CREATE (e3)-[:ON_SUCCESS]->(e4)
CREATE (e5)-[:ON_SUCCESS]->(e4)
```

---

## 5. Full Example: A Dilemma-Rich Storyline

### "The Poisoned Hairpin" — 7-event arc with dilemmas

This storyline demonstrates how dilemmas create branching paths that interconnect with reputation, resources, and other storylines.

```
                          ┌─────────────────────────┐
                          │   poisoned-hairpin-find  │
                          │  "A Gift Left Behind"    │
                          │   Location: chambers     │
                          │   Urgency: opportunity   │
                          └────────┬────────────────┘
                                   │
                              ┌────┴────┐
                          DILEMMA (before-roll)
                     "What do you do with the hairpin?"
                              │         │
                    ┌─────────┘         └──────────┐
                    ▼                              ▼
            Choice A:                       Choice B:
         "Investigate quietly"         "Report to Household Office"
         stats: cunning+discretion      stats: eloquence+resourcefulness
         +1 shadowReach                 +1 virtue
                    │                              │
              ┌─────┴─────┐                 ┌──────┴──────┐
           success     failure           success       failure
              │           │                 │              │
              ▼           ▼                 ▼              ▼
     hairpin-trace  hairpin-sick    hairpin-official  hairpin-accused
     "Follow the    "Symptoms      "Official         "Turned Against
      Trail"         Appear"        Inquiry"           You"
                                                        │
                                                   DILEMMA (standalone)
                                              "You stand accused. How do you respond?"
                                                   │          │          │
                                                   ▼          ▼          ▼
                                             Choice A:   Choice B:   Choice C:
                                            "Endure     "Name the   "Scapegoat
                                             silently"   true        a servant"
                                                         culprit"
                                            +2 virtue   requires:   +1 ruthless
                                            -1 favor    shadowReach -1 chunhua
                                                        ≥ 3           resentment
                                                        +2 favor
                                                        triggers:
                                                        rival-exposed
```

### Neo4j for "The Poisoned Hairpin"

```cypher
// Storyline
CREATE (sl:Storyline {id: 'poisoned-hairpin', title: 'The Poisoned Hairpin'})

// Entry event
CREATE (e1:Event {id: 'hairpin-find', title: 'A Gift Left Behind',
                  type: 'personal', location: 'chambers', urgency: 'opportunity'})

// Dilemma on entry event
CREATE (d1:Dilemma {id: 'hairpin-find-dilemma', timing: 'before-roll',
                    prompt: 'A beautiful jade hairpin was left at your door with no note. It smells faintly of bitter almonds. What do you do?'})

CREATE (c1a:Choice {id: 'hairpin-investigate', label: 'Investigate quietly',
                    overrideStats: ['cunning','discretion'], overrideThreshold: 3,
                    moralWeight_shadowReach: 1})
CREATE (c1b:Choice {id: 'hairpin-report', label: 'Report to the Household Office',
                    overrideStats: ['eloquence','resourcefulness'], overrideThreshold: 2,
                    moralWeight_virtue: 1})

CREATE (e1)-[:CONTAINS]->(d1)
CREATE (d1)-[:OFFERS]->(c1a)
CREATE (d1)-[:OFFERS]->(c1b)

// Branch A events
CREATE (e2a:Event {id: 'hairpin-trace', title: 'Follow the Trail',
                   type: 'investigation', location: 'eunuchQuarter', urgency: 'timed'})
CREATE (e2b:Event {id: 'hairpin-sick', title: 'Symptoms Appear',
                   type: 'personal', location: 'palacePhysician', urgency: 'crisis'})

CREATE (c1a)-[:ON_SUCCESS]->(e2a)
CREATE (c1a)-[:ON_FAILURE]->(e2b)

// Branch B events
CREATE (e3a:Event {id: 'hairpin-official', title: 'Official Inquiry',
                   type: 'justiceAndPunishment', location: 'householdOffice', urgency: 'timed'})
CREATE (e3b:Event {id: 'hairpin-accused', title: 'Turned Against You',
                   type: 'justiceAndPunishment', location: 'innerCourt', urgency: 'crisis'})

CREATE (c1b)-[:ON_SUCCESS]->(e3a)
CREATE (c1b)-[:ON_FAILURE]->(e3b)

// Second dilemma on the "accused" crisis branch
CREATE (d2:Dilemma {id: 'hairpin-accused-dilemma', timing: 'standalone',
                    prompt: 'The official has twisted your report. You now stand accused of possessing poison. The court watches.'})

CREATE (c2a:Choice {id: 'accused-endure', label: 'Endure silently',
                    skipDiceRoll: true,
                    moralWeight_virtue: 2,
                    consequence_imperialFavor: -1})
CREATE (c2b:Choice {id: 'accused-name', label: 'Name the true culprit',
                    skipDiceRoll: false,
                    overrideStats: ['eloquence','cunning'], overrideThreshold: 4})
CREATE (c2c:Choice {id: 'accused-scapegoat', label: 'Blame your maidservant',
                    skipDiceRoll: true,
                    moralWeight_ruthlessness: 1,
                    consequence_chunhuaResentment: 1})

// Gate: naming the culprit requires Shadow Reach ≥ 3
CREATE (g1:Gate {id: 'gate-shadow-3', kind: 'reputationMin', metric: 'shadowReach', value: 3})
CREATE (c2b)-[:REQUIRES]->(g1)

CREATE (e3b)-[:CONTAINS]->(d2)
CREATE (d2)-[:OFFERS]->(c2a)
CREATE (d2)-[:OFFERS]->(c2b)
CREATE (d2)-[:OFFERS]->(c2c)

// Downstream: naming the culprit triggers a new storyline
CREATE (e_exposed:Event {id: 'rival-exposed', title: 'A Rival Exposed',
                         type: 'social', location: 'innerCourt', urgency: 'opportunity'})
CREATE (c2b)-[:ON_SUCCESS]->(e_exposed)

// Convergence: multiple paths lead to resolution
CREATE (e_resolve:Event {id: 'hairpin-resolve', title: 'The Truth Surfaces',
                         type: 'investigation', location: 'innerCourt', urgency: 'routine'})
CREATE (e2a)-[:ON_SUCCESS]->(e_resolve)
CREATE (e3a)-[:ON_SUCCESS]->(e_resolve)
CREATE (e_exposed)-[:ON_SUCCESS]->(e_resolve)

// Storyline membership
CREATE (sl)-[:CONTAINS]->(e1)
CREATE (sl)-[:CONTAINS]->(e2a)
CREATE (sl)-[:CONTAINS]->(e2b)
CREATE (sl)-[:CONTAINS]->(e3a)
CREATE (sl)-[:CONTAINS]->(e3b)
CREATE (sl)-[:CONTAINS]->(e_resolve)
```

---

## 6. Cross-Storyline Interactions

The real depth comes from storylines that **interact**. Here's the graph of how storylines can reference each other:

```
┌──────────────────┐     reputation gate      ┌────────────────────┐
│  Shadow of the   │    (shadowReach ≥ 3)     │  The Poisoned      │
│  Consort         ├─────────────────────────►│  Hairpin           │
│                  │  (success in shadow-      │                    │
│                  │   whispers grants         │                    │
│                  │   shadowReach +1)         │                    │
└──────┬───────────┘                          └────────┬───────────┘
       │                                               │
       │ on-success: shadow-peace                      │ choice: "name culprit"
       │ grants: imperialFavor +1                      │ triggers: rival-exposed
       ▼                                               ▼
┌──────────────────┐                          ┌────────────────────┐
│  Imperial Favor  │    favor gate (≥ 10)     │  Rival's Downfall  │
│  Opportunities   │◄────────────────────────┤  (new storyline)   │
│  (emperor events)│                          │                    │
└──────────────────┘                          └────────────────────┘
       │                                               │
       │ dilemma: "The Emperor's Gift"                 │ consequence: Consort Li
       │ choice: support Wu family                     │ loses influence
       ▼                                               ▼
┌──────────────────┐                          ┌────────────────────┐
│  Wu Family       │                          │  Power Vacuum      │
│  Ascendance      │◄─────────────────────────┤  (who fills the    │
│  (meta arc)      │    both paths converge    │   gap?)            │
└──────────────────┘                          └────────────────────┘
```

### Neo4j Cross-Storyline Relationships

```cypher
// Cross-storyline gates
CREATE (sl1:Storyline {id: 'shadow-consort'})
CREATE (sl2:Storyline {id: 'poisoned-hairpin'})
CREATE (sl3:Storyline {id: 'rival-downfall'})
CREATE (sl4:Storyline {id: 'wu-family-ascendance'})

// Shadow Consort success raises shadowReach, which gates Poisoned Hairpin choices
CREATE (sl1)-[:UNLOCKS {via: 'shadowReach', threshold: 3}]->(sl2)

// Poisoned Hairpin "name culprit" choice spawns Rival Downfall storyline
CREATE (sl2)-[:TRIGGERS {via: 'choice:accused-name'}]->(sl3)

// Both storyline outcomes feed into Wu Family Ascendance
CREATE (sl1)-[:FEEDS_INTO {via: 'imperialFavor'}]->(sl4)
CREATE (sl3)-[:FEEDS_INTO {via: 'power-vacuum'}]->(sl4)
```

---

## 7. Dilemma Design Principles

Drawing from Sultan's Game, dilemmas work best when they follow these patterns:

### 7.1 No Free Choices
Every option should cost something. If one choice is strictly better, it's not a dilemma.

| Bad | Good |
|-----|------|
| "Help the maid" (+virtue) vs "Ignore" (nothing) | "Help the maid" (+virtue, costs 2 silver, agent locked 1 day) vs "Ignore" (slander +1 in 3 days) |

### 7.2 Information Asymmetry
Some choices should have **hidden consequences** the player can only learn through:
- Intelligence scrolls revealing the true situation
- Previous storyline experience (meta-knowledge across runs)
- Reputation gates revealing hidden options

### 7.3 Temporal Pressure
Dilemmas hit harder under time pressure. Pair them with:
- Active edict deadlines
- Agent lock-out from multi-day events
- Timed events about to expire

### 7.4 Moral Spectrum
Map choices to the 5 reputation tracks:

| Approach | Primary Track | Secondary |
|----------|--------------|-----------|
| Honorable/transparent | Virtue ↑ | Imperial Favor ↑ (sometimes) |
| Ruthless/manipulative | Ruthlessness ↑ | Shadow Reach ↑ |
| Devout/mystical | Heavenly Sight ↑ | Virtue ↑ |
| Political/calculating | Imperial Favor ↑ | Shadow Reach ↑ |
| Self-sacrificing | Virtue ↑ | Ruthlessness ↓ |

### 7.5 Cascading Consequences
The best dilemmas create **future dilemmas**. Pattern:

```
Day 3: Choose to investigate quietly (shadowReach +1)
Day 7: Because shadowReach ≥ 3, you can now see a hidden choice in a new event
Day 12: That choice's consequence triggers a crisis event
Day 14: The crisis event has a dilemma whose best option requires virtue ≥ 5
         (which you don't have because you chose the shadow path on Day 3)
```

---

## 8. New EventPrerequisite Kinds Needed

To support the full dilemma graph, extend the prerequisite union:

```typescript
export type EventPrerequisite =
  // existing
  | { kind: 'eventCompleted';    defId: string }
  | { kind: 'eventFailed';       defId: string }
  | { kind: 'eventNotAttempted'; defId: string }
  | { kind: 'dayMin';            day: number }
  | { kind: 'dayMax';            day: number }
  | { kind: 'locationUnlocked';  locationId: LocationId }
  // new: reputation gates
  | { kind: 'reputationMin';     metric: keyof ReputationState; value: number }
  | { kind: 'reputationMax';     metric: keyof ReputationState; value: number }
  // new: dilemma tracking
  | { kind: 'choiceMade';        dilemmaId: string; choiceId: string }
  | { kind: 'choiceNotMade';     dilemmaId: string; choiceId: string }
  // new: agent state
  | { kind: 'agentHasCondition'; agentId: string; condition: AgentCondition }
  | { kind: 'agentAlive';        agentId: string }
  // new: resource gates
  | { kind: 'resourceMin';       resource: 'silver' | 'goldenDice'; value: number }
  // new: relationship
  | { kind: 'relationshipMin';   npcId: string; value: number }
  | { kind: 'haremRankMin';      rank: HaremRank }
```

---

## 9. Summary: The Event Graph Model

```
┌─────────────────────────────────────────────────────────┐
│                    GAME STATE                           │
│  reputation, resources, agent conditions, day, rank     │
└───────────────────────┬─────────────────────────────────┘
                        │ gates what's eligible
                        ▼
┌─────────────────────────────────────────────────────────┐
│              EVENT POOL (eligible definitions)          │
│  filtered by prerequisites + reputation + day + RNG     │
└───────────────────────┬─────────────────────────────────┘
                        │ spawns on map
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    MAP EVENT                            │
│  assign agents → (optional DILEMMA: pick approach)     │
│  → dice roll (modified by choice) → outcome            │
└────────┬──────────────────┬──────────────────┬──────────┘
         │                  │                  │
      success            failure            expiry
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ CONSEQUENCES │  │ CONSEQUENCES │  │  CONSEQUENCES    │
│ +reputation  │  │ -reputation  │  │  slander/crisis  │
│ +resources   │  │ conditions   │  │  missed chance   │
│ unlock loc.  │  │ agent loss   │  │                  │
└──────┬───────┘  └──────┬───────┘  └───────┬──────────┘
       │                 │                  │
       └────────┬────────┴──────────────────┘
                │ state changes feed back
                ▼
        GAME STATE (updated)
                │ new prerequisites met
                ▼
        NEW EVENTS BECOME ELIGIBLE
                │
                ▼
              (cycle continues)
```

This is the core loop. Every event resolution mutates game state, which changes what's eligible next. Dilemmas multiply the branching factor at each node, creating the feeling of agency and consequence that drives replayability.
