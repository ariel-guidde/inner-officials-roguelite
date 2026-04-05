# Sultan's Game — Map Mechanics Conclusions for Inner Officials

**Source:** Sultan's Game by Double Cross Studio (Steam, March 2025) + internal design docs.

---

## What Sultan's Game Is

A narrative roguelite with worker-placement on a map. Each run: draw a card (Carnality / Extravagance / Conquest / Bloodshed), fulfill its demand within 7 days or be executed. 50+ endings. The core loop is identical to what Inner Officials does — daily event management via agent assignment.

---

## Map Layout

- Presented as a **worn cloth/rug** laid flat — not a grid, not a menu. Locations are spatial nodes on this surface.
- Event nodes sit **directly on the map** showing all relevant info: title, description, slots, stat requirements, countdown timer.
- The map is browsable (scrollable/pannable in 2D).
- **Locations without active events are non-interactable** — only nodes with events can be clicked.

### Inner Officials adaptation
- Map surface: painted silk scroll / bird's-eye Forbidden City aesthetic.
- Click a location node → sidebar opens showing the event at that location.
- Sidebar pattern confirmed correct (not in-place panel expansion).
- **Non-event locations**: visible but dimmed and non-clickable.

---

## Event Node Structure

Each event shows:
- **Title**
- **Description**
- **Card slots** — red = mandatory (event won't fire without these), white = optional bonus
- **Stat requirements** listed on the right side of the node
- **Duration** (green): how many days the event takes once agents are assigned (agents are locked for this duration)
- **Deadline timer** (red countdown): days until the event expires if not engaged
- **Involved slots**: pre-placed NPC cards with metal bracket visuals, cannot be moved

### Inner Officials adaptation
- Red slots = mandatory (isMandatory: true)
- White slots = optional (isMandatory: false)
- NPC slots = npcAgentId set, informational only, shows character mini-card
- durationDays = how long agents are committed once assigned
- daysRemaining = deadline countdown before expiry

---

## Agent Cards & The Hand

- All card types live in **one scrollable hand at the bottom**: character cards, item cards, intelligence cards, edict cards — everything unified.
- Cards are assigned to event slots via **click-to-place** (drag-and-drop is the Sultan's Game original, but click is acceptable for Inner Officials).
- Once assigned, the agent's **mini-card appears IN the event slot** on the sidebar (not a bracket in the hand).
- Assigned agents **remain visible in the hand** but appear locked/condensed to show they're committed.
- Agents are **locked for the event's durationDays** — cannot be reassigned until the event resolves.
- You CAN unassign an agent before the day ends (before clicking Continue). Once Continue is pressed, all assignments lock.

### Inner Officials adaptation
- Hand shows only controllable agents (protagonist + followers); NPCs don't appear here
- Assigned agents: condensed card in hand with lock indicator, mini-card shown in event slot
- Intelligence cards (rerolls) and Golden Dice are resources displayed in the hand or header — not character cards, but resource counters

---

## Resources (Intelligence Cards & Golden Dice)

These are persistent resources used during dice resolution:

| Resource | Sultan's Game | Inner Officials |
|---|---|---|
| Intelligence Cards | Reroll all dice (spend 1) | Rerolls — same mechanic |
| Golden Dice | Add auto-success (spend 1) | Golden Dice — same mechanic |

- Both are shown as counts on the UI (header or resource strip near the hand)
- Spendable during the resolution window, not during planning
- Golden Dice are very rare; Intelligence Cards are more common

---

## Turn Structure

1. **Planning phase** — Events appear on map. Assign agent cards to slots freely.
2. **End Day (Continue →)** — All assignments lock. Events begin resolving.
3. **Resolution** — Events resolve **one by one** sequentially (not simultaneously). Each rolls dice, shows result, player proceeds to next.
4. **Day advance** — Agents from completed events are freed. New day begins. Timers decrement.

### Key timing rules
- Assign and unassign freely during planning.
- Once Continue is clicked, assignments are final.
- Agents are committed for the event's durationDays — unavailable during that period.
- Events with daysRemaining = 1 that have no mandatory slots filled → expire at day end.

---

## Crisis / Scandal / Edict System

Sultan's Game has a **Sultan Card**: a persistent pressure card drawn each run with a 7-day countdown. Fulfilling it avoids execution. It's the primary win condition per cycle.

Inner Officials equivalent: **Crisis / Scandal / Edict cards** — a persistent pressure mechanic separate from daily events. Not Imperial Edicts (which are a larger campaign system). These are ongoing crises that demand attention within a fixed window.

*Implementation: deferred — daily event loop first. This is the next major system after the map loop is solid.*

---

## What Was Wrong in the Current Implementation (Pre-Conclusions)

| Issue | Was | Should Be |
|---|---|---|
| Node badge | Event count | Deadline countdown (daysRemaining) |
| Agent hand cards | Initials circle | Portrait mini-card with tier border |
| Assigned agent state | Shrunk in hand | Locked in hand + mini-card in slot |
| Non-event locations | Clickable (opens empty sidebar) | Non-interactable, dimmed |
| Global resources | Only in dice module | Displayed on map, used in resolution |
| Resolution order | Sequential ✓ | Sequential ✓ (confirmed correct) |
| Sidebar pattern | Sidebar ✓ | Sidebar ✓ (confirmed correct) |
| NPC in slots | Text only | Mini portrait card in slot |
| Starting agents | All characters | Lady Wu + followers only |
