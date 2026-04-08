# Storyline Catalog

> Storylines organized by game phase and theme.
> Each entry: title, premise, key events, dilemmas, prerequisites, historical basis.
> This is the menu we build event definitions from.

---

## Game Phases

A run spans roughly 30 days. Storylines are gated by day ranges and reputation.

| Phase | Days | Theme | What's happening |
|---|---|---|---|
| **Arrival** | 1–7 | Survival, orientation | Learn the palace, meet key NPCs, first edict |
| **Establishment** | 8–14 | Building position | Recruit agents, pick allies, first scandals |
| **Ascent** | 15–21 | Power plays | Confront rivals, gain Emperor's attention, faction choices |
| **Crisis** | 22–28 | High stakes | Depositions, purges, betrayals, decisive moments |
| **Culmination** | 28–30 | Ending paths | Final moves determine ending |

---

## Tier 1: Core Storylines (Always Active)

These run every game. They're the spine.

---

### 1.1 — The Empress's Test (皇后的试探)

**Phase:** Arrival (Day 2–6)
**Historical basis:** Empress Wang initially welcomed Wu back to court to distract Gaozong from Consort Xiao — then realized her mistake.

**Premise:** Empress Wang invites you to tea. She's friendly. Too friendly. She wants to use you against Consort Xiao. But being her tool has a shelf life.

**Events:**
1. **"Tea with the Empress"** — Entry (pool, Day 2+). Location: Imperial Gardens.
   - Social event. Beauty + Eloquence ≥ 2.
   - Dilemma (before-roll): Accept her patronage warmly / Accept cautiously / Decline politely.
   - Warm: +2 Imperial Favor, Empress becomes temporary ally, but you owe her.
   - Cautious: +1 Favor, no strings.
   - Decline: +1 Virtue, Empress notes your independence (future storyline gate).

2. **"The Empress's Errand"** — Prereq: chose "warmly" + event resolved success.
   - She asks you to deliver a humiliating message to Consort Xiao. Dominion event.
   - Dilemma (standalone): Deliver as-is / Soften the message / Warn Xiao.
   - Deliver: +1 Ruthlessness, Xiao becomes enemy, Empress pleased.
   - Soften: No reputation change. Empress suspicious.
   - Warn Xiao: +1 Shadow Reach, Xiao owes you a favor (future gate), Empress furious.

3. **"Falling from Grace"** — Prereq: Empress furious OR Day 10+, Empress ally.
   - The Empress realizes you're competition, not a pawn. She turns cold.
   - Crisis event. Eloquence + Cunning ≥ 3.
   - Success: You navigate the break cleanly. She ignores you (neutral).
   - Failure: Slander +1. She starts working against you.

**Graph:**
```
Tea with Empress
  ├─ warm → Empress's Errand
  │           ├─ deliver → [Empress ally state]
  │           ├─ soften → [Empress suspicious state]
  │           └─ warn Xiao → Falling from Grace (early)
  ├─ cautious → [neutral path]
  └─ decline → [independent path, gates later storyline]
```

---

### 1.2 — The Emperor's Gaze (龙目)

**Phase:** Arrival → Establishment (Day 3–14)
**Historical basis:** Gaozong was smitten with Wu from their first meeting. She had served his father.

**Premise:** The Emperor notices you at Morning Court. A slow-burn favor arc. The central challenge: getting his attention without triggering rivals.

**Events:**
1. **"A Glance at Court"** — Entry (pool, Day 3+). Inner Court.
   - Beauty + Eloquence ≥ 2. Just be noticed.
   - Success: Imperial Favor +1. Unlocks next beat.
   - Failure: Nothing happens. Repeatable.

2. **"The Poetry Request"** — Prereq: Favor ≥ 3.
   - The Emperor asks you to compose a verse. Scholarship + Eloquence ≥ 3.
   - Success: Favor +2. The court talks.
   - Failure: Favor +0. Embarrassing but survivable.

3. **"An Invitation to the Gardens"** — Prereq: Favor ≥ 5.
   - Private walk with the Emperor. Beauty + Cunning ≥ 3.
   - Dilemma (before-roll): Flirt boldly / Speak of state affairs / Show devotion.
   - Flirt: Higher Beauty bonus but risk. Favor +3 on success, Slander +1 regardless.
   - State affairs: Scholarship check. Favor +2, Emperor respects you differently.
   - Devotion: Virtue check. Favor +1, but he remembers.

4. **"The Bedchamber Summons"** — Prereq: Favor ≥ 8.
   - You are summoned to the Emperor's quarters. Location: Emperor's Quarters.
   - Beauty + Vitality ≥ 3.
   - Success: Favor +3, possible pregnancy event chain, rivals escalate.
   - Failure: Favor +0. The Emperor is disappointed.

5. **"The Morning After"** — Prereq: Bedchamber success.
   - Every rival concubine now knows. The game has changed.
   - Social event. Resolve + Eloquence ≥ 3.
   - Dilemma: Be humble about it / Flaunt it / Deny it happened.

---

### 1.3 — Consort Xiao's Shadow (萧妃暗手)

**Phase:** Establishment → Ascent (Day 7–21)
**Historical basis:** Consort Xiao (Pure Concubine) was Wu's primary rival for Gaozong's affection.

**Premise:** Consort Xiao is beautiful, cunning, and already has sons. She sees you as a threat and acts first.

**Events:**
1. **"Whispered Warnings"** — Entry (pool, Day 7+, Favor ≥ 2). Eunuch Quarter.
   - Your eunuch reports Xiao's servants asking about your schedule. Investigation.
   - Cunning + Discretion ≥ 2. 

2. **"The Tainted Gift"** — Prereq: Whispered Warnings resolved.
   - A box of sweets arrives from Xiao. Your physician suspects something.
   - Dilemma (standalone): Eat them publicly (call her bluff) / Have them tested / Return them with a poem.
   - Eat: Resolve + Vitality ≥ 4. Success: Xiao humiliated. Failure: Poisoned condition.
   - Test: Cunning + Scholarship ≥ 3. Success: evidence of tampering (+1 Shadow Reach).
   - Return with poem: Eloquence + Beauty ≥ 3. Success: Court sees your grace (+1 Virtue).

3. **"The Slander Campaign"** — Prereq: Favor ≥ 5 + Xiao not humiliated.
   - Xiao tells other concubines you practiced witchcraft at your hometown temple.
   - Crisis. Eloquence + Resolve ≥ 4.
   - Dilemma (after-failure): Endure / Counter-accuse / Appeal to Emperor.

4. **"Xiao's Downfall"** — Prereq: Xiao humiliated OR Slander Campaign success + Favor ≥ 10.
   - You have the upper hand. What do you do with it?
   - Dilemma (standalone): Show mercy (Virtue +3) / Exile her (Ruthlessness +1) / The wine jar (Ruthlessness +3, unlocks dark path).

---

### 1.4 — Chunhua's Heart (春花心事)

**Phase:** Arrival → throughout
**Historical basis:** Original fiction. The loyal maid who may turn against you.

**Premise:** Chunhua is your anchor. But she has her own life, desires, and limits. Neglect or abuse her at your peril.

**Events:**
1. **"The Guard at the Gate"** — Entry (pool, Day 2+). Chambers.
   - Chunhua is distracted by a guard. Personal event.
   - Dilemma: Encourage her / Forbid it / Ignore it.
   - Encourage: Resentment -0, Guard becomes recruitable later.
   - Forbid: Resentment +1. Guard becomes hostile.
   - Ignore: Resentment +1.

2. **"Chunhua's Request"** — Prereq: Day 10+, Resentment ≤ 2.
   - She asks for a day off to visit a sick relative. You need her.
   - Dilemma: Grant it (she's unavailable 2 days, Resentment -1) / Deny (Resentment +1) / Send medicine (costs 1 silver, Resentment -1, she stays).

3. **"The Breaking Point"** — Prereq: Resentment ≥ 4.
   - Chunhua confronts you. Crisis.
   - Dilemma: Apologize sincerely (Resentment -2, Virtue +1) / Threaten her (Resentment +1, she might betray you) / Let her go (lose Chunhua permanently).

4. **"Chunhua's Betrayal"** — Prereq: Resentment = 5 + specific trigger.
   - She has told your secrets to a rival. Catastrophic crisis.
   - The secrets she reveals depend on what you've actually done in the run.

---

## Tier 2: Faction Storylines (Gated by Reputation)

---

### 2.1 — The Purge (清洗)

**Phase:** Ascent → Crisis (Day 15+)
**Historical basis:** Wu systematically eliminated Zhangsun Wuji and the old guard 657–659.

**Prereqs:** Shadow Reach ≥ 5 OR Ruthlessness ≥ 3
**Doctrine affinity:** Legalist

**Premise:** The old chancellors who oppose you can be removed. But each purge costs something — allies, virtue, stability.

**Events:**
1. **"The Dossier"** — Entry. Eunuch Quarter. Cunning + Discretion.
   - Your eunuch network has assembled dirt on Chancellor Zhangsun Wuji.
   - Dilemma: Use it now / Wait for more / Destroy it (Virtue path).

2. **"The Accusation"** — Prereq: Dossier used. Inner Court.
   - Present evidence at court. Eloquence + Cunning ≥ 4.
   - Success: Zhangsun exiled. Shadow Reach +2. Virtue -1.
   - Failure: He counter-attacks. Crisis chain.

3. **"The Cascade"** — Prereq: Zhangsun exiled.
   - His allies panic. Each can be picked off.
   - Series of events, each a smaller version of The Accusation.
   - Dilemma per target: Purge / Offer mercy in exchange for loyalty / Ignore.

4. **"The Empty Court"** — Prereq: 3+ officials purged.
   - You've won, but at what cost? The court is hollow.
   - Dilemma: Fill it with loyalists (Shadow Reach) / Open it to merit (Virtue, Scholarship) / Leave it empty (Ruthlessness — rule by fear).

---

### 2.2 — The Maitreya Prophecy (弥勒预言)

**Phase:** Ascent → Crisis (Day 15+)
**Historical basis:** Wu commissioned the Great Cloud Sutra (大云经) to claim divine right.

**Prereqs:** Heavenly Sight ≥ 5 AND Buddhist Doctrine ≥ Bronze
**Doctrine affinity:** Buddhist

**Premise:** A monk approaches you with a discovery: an ancient text that prophesies a female ruler. It could be your legitimacy — or your undoing if it's exposed as a forgery.

**Events:**
1. **"The Monk's Visit"** — Entry. Buddhist Temple. Spiritual Arts + Scholarship.
   - Monk Fazang presents the text. Is it real?
   - Dilemma: Accept it as divine truth / Commission scholars to verify / Reject it.

2. **"The Translation"** — Prereq: Accepted. Imperial Library.
   - Translate and prepare the text for distribution. Scholarship + Discretion ≥ 3.
   - Multi-day event (3 days). Agents locked.

3. **"The Public Reading"** — Prereq: Translation complete. Buddhist Temple.
   - Present the prophecy at a major ceremony.
   - Eloquence + Spiritual Arts ≥ 4.
   - Success: Heavenly Sight +3, massive legitimacy boost.
   - Failure: Exposed as manipulation. Virtue -3, Slander +2.

4. **"The Faithful and the Skeptics"** — Prereq: Public Reading success.
   - Confucian scholars push back. Buddhist monks rally to your defense.
   - The court is split. Series of events where you manage the fallout.

---

### 2.3 — The Secret Police (酷吏)

**Phase:** Crisis (Day 20+)
**Historical basis:** Lai Junchen and Zhou Xing terrorized the court 680s–690s.

**Prereqs:** Ruthlessness ≥ 5 AND Shadow Reach ≥ 5
**Doctrine affinity:** Legalist

**Premise:** You can create an apparatus of surveillance and terror. It solves problems efficiently — but it's a tiger you're riding.

**Events:**
1. **"The Bronze Box"** — Entry. Household Office.
   - Install anonymous denunciation boxes around the palace.
   - Dilemma: Do it / Don't.
   - If installed: Shadow Reach +2, new mechanic (can spend scrolls to anonymously accuse).

2. **"The Loyal Hound"** — Prereq: Bronze Box installed.
   - Lai Junchen offers his services. He's effective and terrifying.
   - Recruit him as Gold-tier agent (Cunning 5, Discretion 4, Ruthlessness embodied).
   - But: every event he's assigned to generates Ruthlessness +1.

3. **"Taste Your Own Medicine"** — Prereq: Lai recruited, Day 25+.
   - Lai has become uncontrollable. He's accusing your allies.
   - Crisis. Dilemma: Purge him (lose the tool) / Let him continue (lose allies) / Redirect him at your enemies (Ruthlessness +2).

---

## Tier 3: Seasonal & Standalone Storylines

---

### 3.1 — The Lantern Festival (元宵灯会)

**Phase:** Any (triggers on festival day)
**Historical basis:** Major Tang festival, 3 nights of celebration.

**Events:**
1. **"Festival Eve"** — Preparations. Resourcefulness + Beauty.
   - Dilemma: Grand display (costs 3 silver, +2 Favor if successful) / Modest (free, +1 Virtue) / Skip (miss the opportunity).

2. **"Among the Lanterns"** — Night event. Imperial Gardens.
   - Meet NPCs incognito. Intelligence gathering opportunity.
   - Can encounter: the Emperor in disguise, rival concubines, outside contacts.

3. **"The Lantern Riddle"** — Scholarship + Cunning puzzle event.
   - Solving it reveals a secret about a rival.

---

### 3.2 — The Dead Princess (死公主)

**Phase:** Ascent (Day 12+)
**Historical basis:** Wu's infant daughter died after Empress Wang visited. Wu may have killed her own child to frame Wang. The defining moral event of Wu's story.

**Prereqs:** Favor ≥ 5, Pregnant condition resolved (had a daughter).

**THIS IS THE DEFINING STORYLINE OF THE GAME.**

**Events:**
1. **"The Empress Visits"** — Entry. Chambers.
   - Empress Wang comes to see your newborn daughter. She holds the baby. She leaves.
   - Forced event. No dice.

2. **"What Happened Next"** — Immediately after. Standalone dilemma.
   - The defining choice of the game.
   - **Dilemma (standalone):**
     - **"My daughter is dead."** — You smother your own child and blame the Empress.
       - Ruthlessness +5. Imperial Favor +5. Empress Wang is arrested.
       - The single most consequential choice in any run.
       - Unlocks: The Deposition, The Wine Jar path, Zhou Dynasty ending.
       - Costs: Virtue permanently capped. Certain endings locked out.
       - Chunhua Resentment +2 (she knows).
     - **"I will protect her."** — You send the baby away secretly. She's safe but gone.
       - Virtue +3. Favor +0. You must find another path to power.
       - The baby's fate becomes a late-game storyline.
       - Harder path but more endings available.
     - **"I do nothing."** — The baby is fine. Empress Wang was just being polite.
       - No reputation change. The Empress remains in power.
       - You need much more time and subtlety to rise.
       - Unlocks: The Patient Path, Curtain Governance through merit.

---

### 3.3 — The Imperial Examinations (科举)

**Phase:** Establishment (Day 10+)
**Historical basis:** Wu dramatically expanded the exam system, opening it to lower classes and creating a new loyalty base.

**Prereqs:** Scholarship ≥ 3 OR Confucian Doctrine ≥ Bronze.

**Events:**
1. **"Reform Proposal"** — Inner Court. Scholarship + Eloquence.
   - Propose expanding the examinations.
   - Success: New agents become recruitable (Scholar types from common backgrounds).
   - Generates opposition from old aristocracy.

2. **"The Exam Season"** — Multi-day (3 days). Imperial Library.
   - Oversee the examinations. Scholarship + Cunning.
   - Meet candidates. Recruit one as agent.

3. **"The Grateful Officials"** — Prereq: Exam Season success.
   - Officials who passed under your patronage are loyal.
   - Passive benefit: +1 to all court event pool weights.

---

## Storyline Dependency Map

```
Phase 1 (Arrival)
  ├── The Empress's Test ──────────┐
  ├── The Emperor's Gaze ──────────┤
  ├── Chunhua's Heart ─────────────┤
  └── [Background plotline] ───────┤
                                   │
Phase 2 (Establishment)            │
  ├── Consort Xiao's Shadow ◄──────┘ (gates on Favor + day)
  ├── The Imperial Examinations     (gates on Scholarship)
  └── [Seasonal: Lantern, Qixi] 
                                   │
Phase 3 (Ascent)                   │
  ├── The Dead Princess ◄──────────┘ (gates on pregnancy + Favor)
  ├── The Purge ◄─────────────────── (gates on Shadow Reach)
  ├── The Maitreya Prophecy ◄─────── (gates on Heavenly Sight + Buddhist)
  └── [Seasonal: Mid-Autumn, Double Ninth]
                                   │
Phase 4 (Crisis)                   │
  ├── The Secret Police ◄──────────── (gates on Ruthlessness)
  ├── The Deposition ◄────────────── (gates on Dead Princess choice)
  └── The Regency ◄──────────────── (gates on Emperor's health)
                                   │
Phase 5 (Culmination)              │
  └── Ending paths ◄──────────────── (determined by cumulative choices)
```
