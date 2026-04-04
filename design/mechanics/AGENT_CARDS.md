# Agent Cards — Design Specification

> Sultan's Game parallel: [Character System](../sultans-game-reference/COMPLETE_MECHANICS.md#agent--character-system) and [Card Visual Design](../sultans-game-reference/COMPLETE_MECHANICS.md#card-visual-design-reference-for-inner-officials)

This document defines the visual design, tag taxonomy, equipment system, and named-character roster for Inner Officials agent cards. It is the authoritative reference for implementation.

---

## Sultan's Game → Inner Officials: What We Take, What We Change

| Element | Sultan's Game | Inner Officials |
|---|---|---|
| Card frame | Colour-coded ornamental border; tier = frame style | Same — tier-coloured ornamental border in Chinese court motifs |
| Portrait | Live2D animated; upgrades with tier | Static illustration; upgrades with tier promotion |
| Stats on card | Icon + number, only non-zero shown | Abbreviated text label + number, only non-zero shown |
| Equipment slots | 3 slots: Weapon · Attire · Accessory | 3–4 slots: Attire · Accessory · Tool · (Weapon for guards only) |
| Tags | Noble / Slave / Free / Dancer / Troop / Female | See full taxonomy below — adapted for Tang dynasty palace |
| Conditions | Overlaid icons, reduce shown stats | Same pattern |
| Placeholder art | Not documented | **Silhouette in same tier frame** — shadowed figure, no face |
| Hand | Bottom scroll, drag to slots | Same interaction model |
| Stat labels | Small icons (no text) | Abbreviated English text (Bty / Cng / Elq etc.) |

### Key differences
- **No weapon slot for most agents** — violence is not the protagonist's primary tool. Only guards have a weapon slot.
- **Tool slot replaces Weapon** for non-guards — role-specific implements (brush, medicine chest, ledger, prayer beads).
- **Equipment has requirements** — tags AND stats must be met to equip an item. A concubine cannot equip a spear; a maid cannot wear imperial ceremonial robes.
- **Tags are mechanically layered** — a character has one tag from each category. Event eligibility checks against specific categories (e.g. "female servant who is not noble").

---

## Tag Taxonomy

Tags are fixed classification attributes. Each agent carries exactly **one tag from each applicable category**. Events filter on tags to determine eligibility.

### Category A — Gender
| Tag | Notes |
|---|---|
| `female` | All women, regardless of status |
| `male` | All men, eunuchs included |

### Category B — Legal/Social Status
| Tag | Who | Notes |
|---|---|---|
| `imperial` | Emperor, Empress, Dowager Empresses, Imperial Princes/Princesses | Highest authority; cannot be scapegoated or sacrificed |
| `noble` | Aristocratic families, high-ranking officials' daughters, consorts of noble birth | Can attend court events requiring breeding |
| `official` | Palace-appointed functionaries (not noble-born) — mid-rank eunuchs, court physicians, imperial tutors | Access to official palace spaces |
| `commoner` | Non-noble free persons — monks, nuns, outside merchants | Limited palace access by default |
| `servant` | Bonded palace staff — formally assigned, not slaves; contract-bound | Most maids, standard eunuchs, guards |
| `slave` | Purchased or captured persons; no legal rights | Lowest tier; fully scapegoat-eligible |

### Category C — Inner Court Role (women only)
These overlap with status but are specific to the inner palace hierarchy.

| Tag | Who | Notes |
|---|---|---|
| `empress` | The Empress specifically | Outranks all other inner court roles |
| `concubine` | Any rank in the 9-tier harem system (Cairen → Noble Consort) | The protagonist's category |
| `palace-lady` | Ladies-in-waiting, senior maids with court standing — not concubines | Access to inner palace without concubine rank |
| `matriarch` | Dowager empresses, senior noble women with household authority | Rare; extremely high influence |

### Category D — Service Role
Any agent (male or female) with an active professional role.

| Tag | Who | Key Stats | Notes |
|---|---|---|---|
| `eunuch` | Castrated male palace servants | Cunning, Discretion | Political fixers, spies, treasurers; bridge inner/outer court |
| `maid` | Female personal attendants | Variable | Assigned to concubines' households |
| `guard` | Palace military personnel, escort guards | Resolve, Vitality + Martial | Only agents with a Weapon slot |
| `scholar` | Scribes, tutors, imperial academicians | Scholarship, Eloquence | Literacy-gated events |
| `physician` | Medical doctors, apothecaries | Scholarship, Vitality | Healing events; poison/illness resolution |
| `entertainer` | Musicians, dancers, storytellers, poets | Beauty, Eloquence | Festival and performance events |
| `priest` | Buddhist monks/nuns, Taoist clergy with palace access | Spiritual Arts, Scholarship | Temple and ritual events; curse resolution |
| `merchant` | Traders with palace or family-network access | Resourcefulness, Cunning | Outside-contact events; supply procurement |
| `cook` | Palace kitchen staff | Vitality, Resourcefulness | Banquet and poisoning-related events |

### Category E — Game-Mechanical Flags
These are set by narrative role, not by court rank.

| Tag | Meaning |
|---|---|
| `protagonist` | The player character; unique abilities and risk profile |
| `follower` | Autonomous character with own loyalty, storylines, desires; can refuse tasks |
| `scapegoat-eligible` | Can be sacrificed to resolve a scandal instantly (see EVENTS_AND_SCANDALS.md) |

### Tag Stacking Examples
A character carries one tag from each applicable category:
- Chunhua: `female` · `servant` · `maid` · `follower` · `scapegoat-eligible`
- Sergeant Luo: `male` · `servant` · `guard` · `scapegoat-eligible`
- Wu Concubine: `female` · `noble` · `concubine` · `protagonist`
- Eunuch Zhao: `male` · `official` · `eunuch` · `follower`
- The Empress: `female` · `imperial` · `empress` · `matriarch`

---

## Named Characters Roster

These are the named agents who appear across runs. Not all will be available in every run; availability is determined by story events and Wu Ledger boons.

### Starting Cast

| Name | Chinese | Tags | Tier | Martial | Notes |
|---|---|---|---|---|---|
| **Wu Cairen** | 吴才人 | female · noble · concubine · protagonist | Silver | — | Player character; stats vary by background |
| **Chunhua** | 春花 | female · servant · maid · follower · scapegoat-eligible | Bronze | — | Loyal maid from Wu household; resentment mechanic |
| **Sergeant Luo** | 罗侍卫 | male · servant · guard · scapegoat-eligible | Bronze | 2 | Assigned palace guard; bribeable |

### Inner Palace (Women)

| Name | Chinese | Tags | Tier | Notes |
|---|---|---|---|---|
| **The Empress** | 皇后 | female · imperial · empress · matriarch | Jade | Antagonist/authority; never controllable |
| **Dowager Consort Gao** | 高太妃 | female · imperial · concubine · matriarch | Gold | Senior concubine from previous reign; political arbiter |
| **Noble Consort Xiao** | 萧贵妃 | female · noble · concubine | Gold | Primary rival; intelligent and calculating |
| **Consort Wei** | 韦嫔 | female · noble · concubine | Silver | Mid-tier rival; pragmatic, can be an ally |
| **Lady Rong** | 荣姑姑 | female · official · palace-lady · matriarch | Gold | Empress's head of household; enforcer; potential informant if approached correctly |
| **Maid Shuang** | 霜儿 | female · servant · maid · scapegoat-eligible | Clay | Available for recruitment; eager but naive |
| **Entertainer Lin** | 林伶 | female · commoner · entertainer · scapegoat-eligible | Bronze | Palace musician; knows many secrets |

### Inner Palace (Men — Eunuchs & Officials)

| Name | Chinese | Tags | Tier | Notes |
|---|---|---|---|---|
| **Chief Eunuch Director Pei** | 裴总管 | male · official · eunuch | Gold | Controls palace logistics and appointments; expensive to bribe |
| **Eunuch Zhao** | 赵公公 | male · servant · eunuch · follower | Silver | Political fixer; information broker; recruitable via story |
| **Eunuch Minor Li** | 李小公公 | male · servant · eunuch · scapegoat-eligible | Clay | Errand runner; can be recruited cheaply |

### Outer Palace / Guard Corps

| Name | Chinese | Tags | Tier | Martial | Notes |
|---|---|---|---|---|---|
| **Guard Captain Wei** | 卫统领 | male · official · guard | Silver | 4 | Commands the South Wing guards; corruptible |
| **Guard Chen** | 陈侍卫 | male · servant · guard · scapegoat-eligible | Clay | 1 | Chunhua's attachment; involved in opening plotline |

### Scholars & Specialists

| Name | Chinese | Tags | Tier | Notes |
|---|---|---|---|---|
| **Imperial Tutor Shen** | 沈太傅 | male · official · scholar | Gold | Court academician; access to imperial library; can authenticate documents |
| **Palace Physician Chen** | 陈御医 | male · official · physician · scapegoat-eligible | Bronze | Treats conditions; can prepare medicines and poisons; blackmailable |
| **Abbess Mingzhi** | 明智尼师 | female · commoner · priest | Bronze | Head of the Meditation Garden; spiritual counsel; curse resolution |

### Outside Contacts (via Wu Family Network)

| Name | Chinese | Tags | Tier | Notes |
|---|---|---|---|---|
| **Merchant Uncle Wu** | 吴掌柜 | male · commoner · merchant · follower | Bronze | Family trade contact; resource procurement; Shadow Reach 3 to unlock |
| **Scribe Fang** | 方书生 | male · commoner · scholar | Clay | Freelance scribe; forgery and document events |

---

## Equipment System

Equipment items are typed objects that attach to agent card slots and modify their effective stat block. Each item has its own tags and equip requirements.

### Slot Types

| Slot | Who Has It | What Goes In It | Primary Effect |
|---|---|---|---|
| **Attire** (服饰) | All agents | Robes, court dress, uniforms | Beauty and court-standing checks |
| **Accessory** (饰品) | All agents | Hairpins, jade pendants, fans, bracelets | Variable stat bonuses |
| **Tool** (器具) | Non-guard agents | Scholar's brush, medicine chest, prayer beads, account ledger | Unlocks or enhances specific event types |
| **Weapon** (兵器) | Guards only | Blades, bows, staffs | Martial rating enhancement; intimidation events |

Guards have 4 slots (Attire + Accessory + Tool + Weapon). All others have 3 (Attire + Accessory + Tool).

### Equipment Requirements

Every item specifies requirements that an agent must meet to equip it. Requirements are AND conditions unless marked as OR.

```
Item requirements can check:
  tags:      agent must have ALL listed tags
  anyTag:    agent must have AT LEAST ONE listed tag
  minStats:  agent's stat must meet or exceed the value
  minTier:   agent's tier must meet or exceed the tier
  minMartial: agent's martial rating must meet or exceed the value
```

### Example Items

#### Attire (服饰)
| Item | Effect | Requirements |
|---|---|---|
| **Simple Cotton Robe** | — (baseline) | None |
| **Court Ceremonial Dress** | +2 Beauty (court events) | `concubine` or `palace-lady`; Beauty ≥ 2 |
| **Festival Performance Gown** | +3 Beauty (performance), +1 Eloquence | `female`; Beauty ≥ 4; `concubine` or `entertainer` |
| **Guard Uniform** | +1 Resolve (intimidation) | `guard` |
| **Scholar's Formal Robe** | +1 Scholarship (official events) | `scholar` or `official` |
| **Imperial-Pattern Silk** | +2 Beauty, unlocks imperial-space events | `imperial` or tier ≥ Gold |
| **Mourning White** | Satisfies Mourning condition events | `female`; Mourning condition active |

#### Accessories (饰品)
| Item | Effect | Requirements |
|---|---|---|
| **Jade Hairpin** | +1 Spiritual Arts | `female` |
| **Gold Phoenix Ornament** | +2 Beauty (court), +1 Eloquence | `noble` or `concubine`; Beauty ≥ 3 |
| **Prayer Bead Bracelet** | +1 Spiritual Arts, +1 Resolve | None |
| **Scholar's Ink Pendant** | +1 Scholarship | `scholar` or Scholarship ≥ 2 |
| **Merchant's Luck Coin** | +1 Resourcefulness | None |
| **Hidden Blade Bracelet** | +1 Martial (covert); equipping reveals intent | `guard` or Martial ≥ 1; `scapegoat-eligible` cannot equip |

#### Tools (器具)
| Item | Effect | Requirements |
|---|---|---|
| **Scholar's Brush Set** | +1 Scholarship; enables forgery/scribal events | `scholar` or Scholarship ≥ 2 |
| **Medicine Chest** | +1 Vitality (healing events); can treat Ill/Poisoned conditions | `physician` or Scholarship ≥ 3 |
| **Incense Burner** | +2 Spiritual Arts (ritual events) | `priest` or Spiritual Arts ≥ 2 |
| **Account Ledger** | +2 Resourcefulness (estate/trade events) | `merchant` or `eunuch`; Cunning ≥ 2 |
| **Tea Service Set** | +1 Eloquence (social events); enables tea ceremony events | `maid` or `palace-lady`; Eloquence ≥ 2 |
| **Surveillance Report** | +1 Discretion; enables eavesdropping events | Cunning ≥ 3; Discretion ≥ 2 |
| **Poison Vial** | Enables poisoning events (covert) | Discretion ≥ 3; `scapegoat-eligible` cannot carry |

#### Weapons (兵器) — Guards Only
| Item | Effect | Requirements |
|---|---|---|
| **Palace Short Blade** | +1 Martial | `guard` |
| **Officer's Sword** | +2 Martial; +1 intimidation bonus to Eloquence checks with physical threat | `guard`; Martial ≥ 2 |
| **Bow and Quiver** | Enables ranged combat / assassination-intercept events | `guard`; Martial ≥ 2 |
| **Commander's Halberd** | +3 Martial; enables multi-opponent events | `guard`; Martial ≥ 3; tier ≥ Silver |
| **Noble's Ceremonial Spear** | +1 Martial; usable in ceremonial guard events | `guard` or (`noble` and Martial ≥ 1) |

### Item Tags
Items themselves carry tags that describe their nature:
- `court` — proper palace attire/furnishings
- `combat` — martial/weapon items
- `scholarly` — academic/scribal tools
- `spiritual` — religious or mystical items
- `medicinal` — health and healing related
- `covert` — hidden or contraband; possession is risky if discovered
- `ceremonial` — only usable during festivals, ceremonies, or rituals

---

## Card Visual Design Specification

### Frame Design — Tier Motifs

The ornamental border **is** the tier signal. Each tier has a distinct Chinese court motif:

| Tier | Frame Style | Colour Palette | Motif |
|---|---|---|---|
| **Clay** (陶) | Rough geometric bands, unpolished | Dusty terracotta, earth brown | Archaic rope/braid patterns; pottery stamp impressions |
| **Bronze** (铜) | Weathered filigree with archaic vessel details | Verdigris copper, dark bronze | Taotie (饕餮) mask fragments; archaic bronze vessel cloud patterns |
| **Silver** (银) | Clean lattice, refined lines | Bright silver, white highlight | Lotus geometric; moongate repeating border |
| **Gold** (金) | Elaborate flourishes, layered ornament | Warm gold, amber, ivory | Imperial dragon/phoenix intertwined; cloud scrollwork; jewel insets |
| **Jade** (玉) | Carved inlay aesthetic, deep relief | Jade green, white jade, gold accent | Mountain-cloud motif; flowing water carving; celestial imagery |

### Card Face Layout

```
┌──[TIER BORDER]────────────────┐
│                               │
│   ┌───────────────────────┐   │
│   │                       │   │
│   │     PORTRAIT          │   │ ← ~60% of card face
│   │     (or silhouette    │   │
│   │      placeholder)     │   │
│   │                       │   │
│   └───────────────────────┘   │
│  NAME                [Tier]   │ ← English name, tier label
│  Chinese Name                 │ ← Smaller, subdued
│  ─────────────────────────    │
│  Bty ██  Cng ███  Elq ████   │ ← Abbreviated stat + mini-bar
│  [Att: empty] [Acc: ✦] [Tool] │ ← Equipment slots
│  [female][noble][concubine]   │ ← Tag chips
└───────────────────────────────┘
```

### Placeholder Art (No Portrait Available)
- Same ornamental tier frame
- Interior: deep tier-coloured background
- Centred silhouette: a shadowed, stylised human figure in a contextually appropriate pose (maid with tray, guard with weapon, scholar with brush)
- No face rendered — full silhouette in 1-2 tones
- Not a generic "?" — the silhouette communicates the agent's role

### Stats on Card Face
- Only display stats with value > 0
- Abbreviated labels: **Bty** · **Cng** · **Elq** · **Dsc** · **Rsv** · **Vtl** · **Rsf** · **Spr** · **Sch**
- Martial shown separately as **Mrt** with ◆ pips (1–5) rather than a bar
- Stats reduced by conditions show in red/orange

### Detail View (on card press)
- Full-screen modal overlay with backdrop blur
- Left panel: large portrait in tier frame
- Right panel:
  - Name (English, large serif) + Chinese name
  - Tier badge (English)
  - All tags as coloured chips (colour-coded by category: status = purple, role = teal, mechanical = gold)
  - Full stat bars with English label + value
  - Equipment slots (visual representation of equipped/empty)
  - Active conditions
  - Resentment track (if applicable)
  - Lore / description blurb (future addition)

---

## Playground Testing Requirements

The Characters tab in the Playground needs a live control panel for testing all card states:

### Agent Edit Panel
- **Agent selector** — which agent to edit
- **Conditions** — checkbox per condition (Poisoned / Ill / Injured / Disgraced / Imprisoned / Mourning / Pregnant / Cursed)
- **Equipment** — dropdown per slot (Attire / Accessory / Tool / Weapon if guard)
- **Resentment** — slider 0–5 (only shown for agents with resentment mechanic)
- **Tier override** — dropdown (Clay → Jade)
- **Stat adjustments** — +/– stepper per stat (for testing highlight states)

### Visual Test States
- Apply a condition and verify card shows overlay
- Equip an item and verify slot fills + stat modifier shows
- Change tier and verify frame changes
- Set resentment > 0 and verify flame indicator
- Toggle blocked state and verify stamp overlay
