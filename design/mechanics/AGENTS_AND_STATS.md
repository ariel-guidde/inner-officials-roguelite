# Agents & Stats

> Sultan's Game equivalent: [Character System](../sultans-game-reference/COMPLETE_MECHANICS.md#agent--character-system)

## Overview

Agents are the core unit of the game. They are cards you assign to events, tasks, and schemes. Your protagonist (the Wu concubine) is also an agent card — she can be assigned to events personally, but doing so carries risk.

---

## The 9 Stats

| Stat | Chinese | What It Governs |
|---|---|---|
| **Beauty** | 容貌 | Attracting the Emperor's gaze, ceremonies, first impressions, being chosen for bedchamber visits |
| **Cunning** | 智谋 | Seeing through schemes, long-term planning, household management income, counter-intelligence |
| **Eloquence** | 口才 | Persuasion, deflecting accusations, composing poetry, social navigation, court debates |
| **Discretion** | 机密 | Hiding schemes, secret meetings, avoiding surveillance, planting evidence, eavesdropping |
| **Resolve** | 意志 | Withstanding interrogation, resisting poison, enduring punishment, surviving political disgrace |
| **Vitality** | 体魄 | Health, pregnancy survival, enduring labor, stamina during long festivals, resisting illness |
| **Resourcefulness** | 应变 | Improvisation under pressure, finding supplies, navigating crises, escape plans |
| **Spiritual Arts** | 玄术 | Buddhist/Taoist rituals, fortune telling, invoking blessings, reading omens, curse detection |
| **Scholarship** | 学识 | Calligraphy, history, medicine, law, recognizing forgeries, tutoring imperial children |

### Stat Use Patterns

Most events check 1-2 primary stats. Some examples:
- **Managing your estate income**: Cunning + Eloquence
- **Surviving a poisoning accusation**: Resolve + Eloquence
- **Preparing a festival performance**: Beauty + Scholarship
- **Investigating a rival's scheme**: Cunning + Discretion
- **Securing a bedchamber visit**: Beauty + Vitality
- **Forging a letter**: Scholarship + Discretion

---

## Agent Tiers

| Tier | Name | Examples | Color |
|---|---|---|---|
| **Clay** (陶) | Common | New palace maids, errand runners, kitchen staff | Dusty tan/terracotta |
| **Bronze** (铜) | Skilled | Experienced maids, minor officials' daughters, trained eunuchs | Copper |
| **Silver** (银) | Remarkable | Senior maids, eunuch leaders, lower consorts, scholars | Silver |
| **Gold** (金) | Exceptional | The Empress, Imperial Consorts, Chief Eunuch, Princes | Gold |
| **Jade** (玉) | Transcendent | The Emperor himself, legendary figures, supernatural beings | Green/white jade |

The protagonist starts at **Bronze** tier and can advance through story events and rank promotion.

### Tier Rules
- Scandals/tasks require agents of matching or higher tier to resolve
- Higher tier agents are harder to recruit and maintain (loyalty costs)
- Tier can be upgraded through personal storylines and special events
- Some events are tier-locked (only Gold+ agents can attend Imperial Council)

---

## Agent Types & Tag System

Tags are fixed classification attributes. Each agent carries one tag from each applicable category. Events filter on tags to determine eligibility (e.g. "requires female servant" or "noble or imperial only").

**Full taxonomy and all named characters are defined in [AGENT_CARDS.md](./AGENT_CARDS.md).**

### Tag Categories at a Glance

| Category | Tags |
|---|---|
| **Gender** | `female` · `male` |
| **Legal/Social Status** | `imperial` · `noble` · `official` · `commoner` · `servant` · `slave` |
| **Inner Court Role** (women) | `empress` · `concubine` · `palace-lady` · `matriarch` |
| **Service Role** | `eunuch` · `maid` · `guard` · `scholar` · `physician` · `entertainer` · `priest` · `merchant` · `cook` |
| **Game-Mechanical** | `protagonist` · `follower` · `scapegoat-eligible` |

### Ownership Types
- **Followers**: Autonomous characters with their own loyalty, storylines, and desires. Can refuse tasks, betray you, or leave. Tagged `follower`.
- **Servants**: Bonded palace staff. More reliable but lower tier. Can be reassigned by higher-ranking consorts or the Empress. Tagged `servant` or `slave`.

### Service Roles Summary
| Role Tag | Who | Key Stats |
|---|---|---|
| `maid` | Female personal attendants | Variable |
| `eunuch` | Male palace servants; political fixers, spies, treasurers | Cunning, Discretion |
| `scholar` | Scribes, tutors, academicians | Scholarship, Eloquence |
| `physician` | Medical doctors, apothecaries | Scholarship, Vitality |
| `guard` | Palace military; only agents with Martial and a Weapon slot | Resolve, Vitality + Martial |
| `entertainer` | Musicians, dancers, poets | Beauty, Eloquence |
| `priest` | Buddhist/Taoist clergy with palace access | Spiritual Arts, Scholarship |
| `merchant` | Outside-contact traders via Wu family network | Resourcefulness, Cunning |
| `cook` | Palace kitchen staff; banquet and poisoning events | Vitality, Resourcefulness |

---

## Martial Ability (武力)

Martial is a **bonus property** carried by Guard-type agents (and a few trained eunuchs) — it is separate from the 9 main stats.

| Martial Rating | Description | Examples |
|---|---|---|
| 1 | Basic self-defense — can interpose themselves | New palace guards, untrained eunuchs |
| 2 | Trained fighter — reliable in physical confrontations | Standard palace guards, Sergeant Luo |
| 3 | Skilled combatant — a genuine threat to most opponents | Senior guards, veterans |
| 4 | Elite fighter — can handle multiple opponents | Commander-rank guards, specialized agents |
| 5 | Exceptional — rare; legendary martial skill | Named historical martial figures |

**Uses of Martial**:
- **Physical Protection**: Assign a guard to escort events — their Martial rating is added to Resolve for physical threat checks
- **Assassin Interception**: When an assassination or ambush event triggers, a guard with Martial 3+ can intercept (check vs. attacker's Martial)
- **Prison Break**: Rescuing an Imprisoned agent requires an agent with Martial 2+ assigned
- **Intimidation**: Guard presence during negotiation events adds Martial ÷ 2 (rounded down) to Resolve for checks involving physical threat

**Who can have Martial:**
- Guards: always have Martial 1–5
- Trained Eunuchs (from Eunuch Quarter, 5 silver upgrade): can gain Martial 1–2
- Some merchant agents from rough backgrounds: Martial 1
- Scholars, maids, consorts, monks: no Martial (they may have Resolve and Vitality, but not trained combat ability)

---

### Conditions
| Condition | Effect | Resolution |
|---|---|---|
| **Poisoned** (中毒) | Stat penalties, worsens daily | Palace Physician (silver cost) or antidote |
| **Ill** (染病) | Stat penalties, may spread to others | Palace Physician or time |
| **Injured** (受伤) | Cannot be assigned to events | Palace Physician (1 silver) |
| **Disgraced** (失宠) | Cannot attend court or Emperor events | Time + Influence recovery |
| **Imprisoned** (下狱) | Completely unavailable, may die | Rescue event (high difficulty) |
| **Mourning** (服丧) | Cannot attend celebrations, reduced stats | Time (fixed days) |
| **Pregnant** (有孕) | Cannot do physical tasks, must be protected | Time (progresses toward birth) |
| **Cursed** (受咒) | Random negative effects each day | Temple ritual or spiritual agent |

---

## The Protagonist

Your Wu concubine is a Silver-tier agent card. Full starting stats, background options, starting resources, and starting plotlines are defined in [PROTAGONIST_START.md](./PROTAGONIST_START.md).

**Summary**: Base 14 stat points distributed across 9 stats, with +6 points from your chosen background. Starts at Rank 9 (Cairen). Begins with Chunhua and one background-specific agent.

---

## Loyal Maidservant — Chunhua (春花)

> Sultan's Game equivalent: Wife (Maggie)

Your strongest starting agent. Accompanied you from the Wu household.

**Starting stats**: Well-rounded Bronze agent with above-average Cunning and Discretion
**Upgradeable**: Through meta-progression and in-run story events, can reach Silver then Gold tier

### Resentment Mechanic (怨气)
- Resentment accumulates when: you assign her to dangerous tasks without consideration, neglect her personal storyline, sacrifice her interests for political gain, romance someone she's attached to
- **Resolution**: Contemplation at the Bronze Mirror → spawns loyalty event
- **Failure state**: At max resentment, Chunhua betrays you to a rival consort — game over variant

### Personal Storyline
Chunhua has her own narrative arc involving her family outside the palace, a potential romance, and questions of loyalty vs. ambition. Advancing her story can upgrade her tier and unlock unique abilities.

---

## Stat Improvement

| Method | Cost | Effect |
|---|---|---|
| **Scrolls** (from Imperial Library) | 1 silver | +1 to a stat permanently |
| **Equipment** (attire, accessories, tools, weapons) | Variable | Stat bonuses while equipped; items have type tags and equip requirements (see [Equipment & Items](../world/EQUIPMENT_AND_ITEMS.md)) |
| **Training** (from Eunuch Quarter) | 5 silver per agent | Train eunuch agents with specific stat profiles |
| **Storyline progression** | Time + events | Tier upgrades, unique abilities |
| **Festival performances** | Event success | Temporary or permanent boosts from impressing the Emperor |

---

## Recruitment

| Source | Unlock | Agents Available | Refresh |
|---|---|---|---|
| **Story events** | Automatic | Scripted characters with unique storylines | One-time |
| **Wu Family Network** | Shadow Reach 3 + 10 silver | 3 outside agents (merchants, scholars, spies) | Every 7 days |
| **Palace encounters** | Various | Befriend maids, eunuchs, guards during events | Ongoing |
| **Eunuch Quarter** | Shadow Reach 3 | Train custom eunuch agents | 5 silver each |
| **Temple** | Virtue 3 | Monks/nuns with Spiritual Arts focus | Limited |
| **Wu Ledger boons** | Meta-progression | Specific named characters added to starting hand | Per run |

---

## Agent Assignment Rules

- Each agent can be assigned to **one event per day**
- Some events lock agents for **multiple days** ("Involved" status)
- Higher-rank locations require minimum agent tier
- The protagonist can be assigned personally — powerful but risky (conditions affect you directly)
- Some events have tag requirements (e.g., "Noble only", "Eunuch only", "Female only")
