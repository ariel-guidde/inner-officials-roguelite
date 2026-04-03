# Dice System

> Sultan's Game equivalent: [Dice Resolution](../sultans-game-reference/COMPLETE_MECHANICS.md#dice-resolution)
>
> **This is the most important mechanical feel of the game.** The dice roll must be visceral, satisfying, and visually exciting. 3D dice are non-negotiable.

## Core Resolution

Every event check works the same way:

1. **Count stat pool**: Sum the relevant stat(s) across all assigned agents
2. **Apply modifiers**: Subtract enemy/opposition values, add bonuses
3. **Roll dice**: Roll that many dice (3D animated)
4. **Count successes**: Each die is pass/fail
5. **Compare to threshold**: Event specifies how many successes needed

### Example

> **Event**: "Deflect Lady Chen's accusation at morning court"
> **Check**: Eloquence + Resolve
> **Your agents**: Wu Concubine (Eloquence 4, Resolve 3) + Chunhua (Eloquence 2, Resolve 2)
> **Pool**: 4+3+2+2 = 11 dice
> **Opposition**: Lady Chen's Eloquence 5 → subtract 5
> **Final pool**: 6 dice
> **Threshold**: 3 successes needed
> **Roll**: 6 dice → 4 successes → **Pass**

---

## Dice Visuals (3D)

### The Roll
- Physical 3D dice that tumble across a lacquered wooden surface (or silk cloth)
- Dice are **six-sided** but binary: faces show either a **dragon** (success) or **clouds** (fail)
- Dice material/color matches the highest-tier agent involved:
  - Clay tier: rough earthenware dice
  - Bronze: burnished bronze dice
  - Silver: polished silver dice
  - Gold: gleaming gold dice
  - Jade: translucent jade dice with inner glow
- Camera follows the roll, slight slow-motion on the last die if the outcome is close
- Successes light up / glow. Failures dim.

### Tension Mechanics
- If the roll is **exactly at threshold** (e.g., need 3, got 3): dramatic close-up on the deciding die
- If the roll **barely fails** (off by 1): the last die teeters before settling — maximizes the "almost!" feeling
- **Critical success** (all dice succeed): special flourish animation + small bonus reward
- **Critical failure** (zero successes): ominous visual + worse-than-normal consequence

### Sound Design
- Each material has a distinct impact sound (clay = dull thud, jade = crystalline clink)
- A chime per dragon face revealed; a collective tone when the threshold is met

---

## Success Probability

Base success chance per die depends on difficulty setting:

| Difficulty | Success Rate | Feel |
|---|---|---|
| **Gentle** (温和) | 60% per die | Forgiving, story-focused |
| **Standard** (标准) | 50% per die | Fair, strategic |
| **Ruthless** (残酷) | 40% per die | Punishing, every stat point matters |

### Probability Table (Standard 50%)

| Dice Pool | P(≥1 success) | P(≥3 successes) | P(≥5 successes) |
|---|---|---|---|
| 2 | 75% | 25% | 0% |
| 4 | 94% | 69% | 6% |
| 6 | 98% | 89% | 34% |
| 8 | 100% | 96% | 64% |
| 10 | 100% | 99% | 83% |
| 12 | 100% | 100% | 94% |

This means:
- A pool of 6 vs threshold 3 is a comfortable ~89% chance — feels good but not guaranteed
- A pool of 4 vs threshold 3 is a gamble at ~69% — tense
- A pool of 2 vs threshold 2 is desperation at ~25% — Hail Mary

---

## Modifiers

### Intelligence Scrolls (情报) — Rerolls
- Consumable cards earned from court intrigue, garden conversations, spy network
- **Spend 1 scroll = reroll ALL dice** in the check (not individual dice)
- Can spend multiple scrolls on the same check (each reroll replaces the previous result)
- Visual: the dice sweep back, tumble again

### Golden Dice (金骰) — Auto-Successes
- Extremely rare resource
- Each Golden Die adds 1 automatic success **before** rolling
- Visual: a single glowing golden die is placed on the surface already showing the dragon face, then the regular dice roll around it
- Does NOT reduce the number of regular dice — it's purely additive

### Contested Checks
- Opposition stats **subtract from your pool** before rolling
- If opposition ≥ your pool → 0 dice → automatic failure (no roll animation, just a "blocked" visual)
- This makes enemy stat reduction (via schemes, poison, distraction) strategically valuable

### Equipment Bonuses
- Equipment adds to the relevant stat before the pool is calculated
- Some equipment provides conditional bonuses ("Lady's Fan: +2 Eloquence in court events only")

---

## Difficulty Modifiers

| Difficulty | Rewinds (undo a day) | Edict Exchanges | Starting Golden Dice |
|---|---|---|---|
| **Gentle** | Unlimited | 3 | 3 |
| **Standard** | 3 per run | 1 | 1 |
| **Ruthless** | 0 | 0 | 0 |
