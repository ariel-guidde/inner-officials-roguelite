# Equipment & Items

> Sultan's Game parallel: Equipment Cards (Weapon · Attire · Accessory slots)
> Full design spec: [Agent Cards — Equipment System](../mechanics/AGENT_CARDS.md#equipment-system)

Equipment items attach to agent card slots and modify their effective stat block. Items have their own type tags and equip requirements. This document is the world-flavour companion to the mechanical spec.

---

## Slot Overview

| Slot | Agents | Flavour |
|---|---|---|
| **Attire** (服饰) | All | The robes worn at court determine first impressions. A court robe from the imperial silk workshop signals rank; a moth-eaten hem signals disgrace. |
| **Accessory** (饰品) | All | A jade hairpin, a gold phoenix ornament, a bracelet of carved prayer beads — accessories communicate wealth, faith, and allegiance without words. |
| **Tool** (器具) | Non-guards | The object an agent carries to work: a physician's medicine chest, a scholar's brush roll, a maid's tea service. Defines what events they can undertake. |
| **Weapon** (兵器) | Guards only | Guards carry palace-approved blades; senior officers carry swords that mark their command rank. A concubine with a spear in her chambers would be arrested. |

---

## Attire (服饰)

| Item | Tier | Effect | Requirements | Tags |
|---|---|---|---|---|
| Simple Cotton Robe | Clay | — | None | `court` |
| Maid's Grey Uniform | Clay | — (identifies as maid) | `maid` | `court` |
| Guard Uniform | Clay | +1 Resolve (intimidation events) | `guard` | `court` · `combat` |
| Scholar's Formal Robe | Bronze | +1 Scholarship (official meetings) | `scholar` or `official` | `court` · `scholarly` |
| Court Ceremonial Dress | Bronze | +2 Beauty (court events) | `concubine` or `palace-lady`; Beauty ≥ 2 | `court` · `ceremonial` |
| Festival Performance Gown | Silver | +3 Beauty (performance), +1 Eloquence | `female`; Beauty ≥ 4; `concubine` or `entertainer` | `court` · `ceremonial` |
| Imperial-Pattern Silk | Gold | +2 Beauty; unlocks Imperial Wing events | `imperial` or tier ≥ Gold | `court` · `ceremonial` |
| Mourning White | Bronze | Satisfies Mourning dress code; +1 Resolve | Mourning condition active | `ceremonial` |
| Travelling Merchant's Coat | Bronze | +1 Resourcefulness; enables outside-district events | `merchant` or `commoner` | — |

---

## Accessories (饰品)

| Item | Tier | Effect | Requirements | Tags |
|---|---|---|---|---|
| Plain Hairpin | Clay | — | `female` | — |
| Jade Hairpin | Bronze | +1 Spiritual Arts | `female` | `spiritual` |
| Gold Phoenix Ornament | Silver | +2 Beauty (court), +1 Eloquence | `noble` or `concubine`; Beauty ≥ 3 | `court` · `ceremonial` |
| Empress's Gift Pendant | Gold | +1 Beauty, +2 Discretion; marks Empress favour | Given by Empress (event-only) | `court` |
| Prayer Bead Bracelet | Clay | +1 Spiritual Arts, +1 Resolve | None | `spiritual` |
| Scholar's Ink Pendant | Bronze | +1 Scholarship | `scholar` or Scholarship ≥ 2 | `scholarly` |
| Merchant's Luck Coin | Bronze | +1 Resourcefulness | None | — |
| Jade Thumb Ring (guard) | Bronze | +1 Martial (ranged events) | `guard`; Martial ≥ 1 | `combat` |
| Hidden Blade Bracelet | Silver | +1 Martial (covert events); possession is suspicious | `guard` or Martial ≥ 1; `scapegoat-eligible` cannot equip | `combat` · `covert` |

---

## Tools (器具)

| Item | Tier | Effect | Requirements | Tags |
|---|---|---|---|---|
| Tea Service Set | Bronze | +1 Eloquence (social events); enables Tea Ceremony events | `maid` or `palace-lady`; Eloquence ≥ 2 | `court` |
| Scholar's Brush Set | Bronze | +1 Scholarship; enables Forgery and Scribal events | `scholar` or Scholarship ≥ 2 | `scholarly` |
| Medicine Chest | Bronze | +1 Vitality (healing events); can treat Ill/Poisoned | `physician` or Scholarship ≥ 3 | `medicinal` |
| Incense Burner | Bronze | +2 Spiritual Arts (ritual events) | `priest` or Spiritual Arts ≥ 2 | `spiritual` · `ceremonial` |
| Account Ledger | Bronze | +2 Resourcefulness (estate/trade events) | `merchant` or `eunuch`; Cunning ≥ 2 | `scholarly` |
| Imperial Archive Key | Gold | Enables Imperial Library events; +1 Scholarship (research) | `official` or `scholar`; tier ≥ Silver | `scholarly` |
| Surveillance Dossier | Silver | +1 Discretion; enables Eavesdropping and Informant events | Cunning ≥ 3; Discretion ≥ 2 | `covert` |
| Apothecary Compendium | Silver | +2 Scholarship (poison/medicine); enables advanced poisoning options | `physician`; Scholarship ≥ 4 | `medicinal` · `covert` |
| Poison Vial | Silver | Enables Poisoning events (covert; criminal if discovered) | Discretion ≥ 3; `scapegoat-eligible` cannot carry | `covert` |
| Divination Sticks | Bronze | +1 Spiritual Arts; enables Fortune Reading events | `priest` or Spiritual Arts ≥ 1 | `spiritual` |

---

## Weapons (兵器) — Guards Only

| Item | Tier | Effect | Requirements | Tags |
|---|---|---|---|---|
| Palace Short Blade | Clay | +1 Martial | `guard` | `combat` |
| Officer's Sword | Bronze | +2 Martial; +1 intimidation bonus on Eloquence checks with physical threat | `guard`; Martial ≥ 2 | `combat` · `court` |
| Bow and Quiver | Bronze | +1 Martial; enables Ranged Combat and Assassination-Intercept events | `guard`; Martial ≥ 2 | `combat` |
| Commander's Halberd | Silver | +3 Martial; enables Multi-Opponent events | `guard`; Martial ≥ 3; tier ≥ Silver | `combat` |
| Noble's Ceremonial Spear | Silver | +1 Martial; usable in Ceremonial Guard events | `guard` or (`noble` and Martial ≥ 1) | `combat` · `ceremonial` |
| Crossbow (contraband) | Silver | +2 Martial; deadly but illegal within inner palace | `guard`; Martial ≥ 3; Discretion ≥ 2 to carry safely | `combat` · `covert` |

---

## Item Discovery & Acquisition

| Source | Items Available | Cost / Condition |
|---|---|---|
| **Palace Bazaar** (court trade) | Common attire, accessories | Silver coins |
| **Imperial Workshop** | Court ceremonial dress, gold ornaments | High silver + Favour requirement |
| **Temple/Meditation Garden** | Spiritual accessories, incense, divination tools | Virtue 2+ or donation |
| **Wu Family Network** | Outside-contact tools, merchant items, scholarly materials | Shadow Reach 2+; silver coins |
| **Event Rewards** | Unique named items (Empress's Gift, archive keys) | Story event completion |
| **Apothecary** (unlockable) | Medicine chest, poison vial, compendium | Silver + Scholarship 2+ to unlock |
| **Wu Ledger Boons** | Specific items added to starting inventory | Meta-progression spend |

---

## Item Loss

- **Confiscation**: Empress or Imperial Censor can confiscate items found during inspection events
- **Destruction**: Some events damage or destroy equipped items
- **Scapegoat resolution**: When an agent is used as a scapegoat, their equipped items may be lost with them
- **Death or imprisonment**: An agent who dies or is imprisoned removes their items from circulation (they may be recoverable via a difficult Rescue event)
