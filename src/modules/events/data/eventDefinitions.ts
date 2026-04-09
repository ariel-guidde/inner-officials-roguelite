// =============================================================================
// events/data/eventDefinitions.ts
// All event definition blueprints.
//
// Spawning is pool-only. Prerequisites gate when events become ready.
// graphEdges is metadata for the StorylineEditor — NOT used by spawn logic.
// =============================================================================

import type { EventDefinition } from '../types'

// ---------------------------------------------------------------------------
// Storyline: "Shadow of the Consort" (shadow-consort)
// Lady Wu discovers that Consort Li is spreading treacherous rumors.
// Entry → branch on success/failure → convergence.
// ---------------------------------------------------------------------------

const SHADOW_CONSORT: EventDefinition[] = [
  // ENTRY — pool event
  {
    id:            'shadow-whispers',
    storylineId:   'shadow-consort',
    type:          'investigation',
    locationId:    'eunuchQuarter',
    title:         'Whispers in the Quarter',
    description:   'A loyal eunuch reports unsettling rumors circulating through the servants\' passages — rumors about your loyalty that could only have been planted deliberately.',
    urgency:       'opportunity',
    statsChecked:  ['cunning', 'discretion'],
    threshold:     2,
    daysUntilExpiry: 4,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [],
    slots: [
      { id: 'shadow-whispers-s1', isMandatory: true,  requiredTags: ['protagonist'] },
      { id: 'shadow-whispers-s2', isMandatory: false, requiredTags: ['follower'] },
    ],
    poolWeight: 1,
    graphEdges: {
      success: ['shadow-counter'],
      failure: ['shadow-scrutiny'],
    },
  },

  // SUCCESS PATH
  {
    id:            'shadow-counter',
    storylineId:   'shadow-consort',
    type:          'social',
    locationId:    'innerCourt',
    title:         'Counter the Slander',
    description:   'Move quickly through your connections at court to discredit the rumors before they reach the Emperor\'s ears. Time is of the essence.',
    urgency:       'timed',
    statsChecked:  ['eloquence', 'cunning'],
    threshold:     3,
    daysUntilExpiry: 3,
    durationDays:  1,
    oppositionValue: 1,
    prerequisites: [
      { kind: 'eventResolved', defId: 'shadow-whispers', resolution: 'success' },
    ],
    slots: [
      { id: 'shadow-counter-s1', isMandatory: true,  requiredTags: ['protagonist'] },
      { id: 'shadow-counter-s2', isMandatory: false, requiredTags: [], anyRequiredTag: ['female'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['shadow-peace'],
      failure: ['shadow-imperial-suspicion'],
    },
  },

  // FAILURE PATH
  {
    id:            'shadow-scrutiny',
    storylineId:   'shadow-consort',
    type:          'estateManagement',
    locationId:    'householdOffice',
    title:         'Household Under Scrutiny',
    description:   'The Household Office has opened an audit of your accounts following the rumor\'s spread. Someone tipped them off. The records must be clean before the inspector arrives.',
    urgency:       'crisis',
    statsChecked:  ['resourcefulness', 'discretion'],
    threshold:     4,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 2,
    prerequisites: [
      { kind: 'eventResolved', defId: 'shadow-whispers', resolution: 'failure' },
    ],
    slots: [
      { id: 'shadow-scrutiny-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['shadow-peace'],
    },
  },

  // CONVERGENCE — resolution of the arc
  {
    id:            'shadow-peace',
    storylineId:   'shadow-consort',
    type:          'social',
    locationId:    'imperialGardens',
    title:         'A Gathering of Allies',
    description:   'With the immediate threat neutralised, use the respite to forge alliances among the concubines who watched the crisis unfold. Your handling of the affair has earned quiet respect.',
    urgency:       'opportunity',
    statsChecked:  ['beauty', 'eloquence'],
    threshold:     2,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      {
        kind: 'anyOf',
        conditions: [
          { kind: 'eventResolved', defId: 'shadow-counter', resolution: 'success' },
          { kind: 'eventResolved', defId: 'shadow-scrutiny', resolution: 'success' },
          { kind: 'eventResolved', defId: 'shadow-imperial-suspicion', resolution: 'success' },
        ],
      },
    ],
    slots: [
      { id: 'shadow-peace-s1', isMandatory: false, requiredTags: [], anyRequiredTag: ['female'] },
    ],
    poolWeight: 1,
    isForced: true,
  },

  // ESCALATION — counter failed
  {
    id:            'shadow-imperial-suspicion',
    storylineId:   'shadow-consort',
    type:          'ceremony',
    locationId:    'innerCourt',
    title:         "The Emperor's Ear",
    description:   'Word has reached the Emperor. He has requested your attendance for a private audience. What you say — or do not say — will define his opinion of you for seasons to come.',
    urgency:       'crisis',
    statsChecked:  ['eloquence', 'resolve'],
    threshold:     4,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 2,
    prerequisites: [
      { kind: 'eventResolved', defId: 'shadow-counter', resolution: 'failure' },
    ],
    slots: [
      { id: 'shadow-suspicion-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['shadow-peace'],
    },
  },
]

// ---------------------------------------------------------------------------
// Storyline: "The Physician's Dilemma" (physician-dilemma)
// ---------------------------------------------------------------------------

const PHYSICIAN_DILEMMA: EventDefinition[] = [
  // ENTRY
  {
    id:            'physician-exam',
    storylineId:   'physician-dilemma',
    type:          'personal',
    locationId:    'palacePhysician',
    title:         'An Unusual Examination',
    description:   'During the seasonal health check the physician lingers longer than usual, his expression carefully neutral. Afterwards he whispers something strange before departing. What did he mean?',
    urgency:       'routine',
    statsChecked:  ['vitality', 'cunning'],
    threshold:     2,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [],
    slots: [
      { id: 'physician-exam-s1', isMandatory: false, requiredTags: [], npcAgentId: 'physician-han' },
      { id: 'physician-exam-s2', isMandatory: true,  requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    graphEdges: {
      success: ['physician-leverage'],
      failure: ['physician-illness'],
    },
  },

  {
    id:            'physician-leverage',
    storylineId:   'physician-dilemma',
    type:          'investigation',
    locationId:    'palacePhysician',
    title:         'A Rival\'s Hidden Ailment',
    description:   'The physician has, perhaps imprudently, revealed that a prominent rival suffers from a condition she has concealed from the court. This information is a blade — handle it with care.',
    urgency:       'opportunity',
    statsChecked:  ['discretion', 'cunning'],
    threshold:     3,
    daysUntilExpiry: 5,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      { kind: 'eventResolved', defId: 'physician-exam', resolution: 'success' },
    ],
    slots: [
      { id: 'physician-leverage-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
  },

  {
    id:            'physician-illness',
    storylineId:   'physician-dilemma',
    type:          'personal',
    locationId:    'chambers',
    title:         'Confined to Quarters',
    description:   'The examination revealed a minor ailment that the physician insists requires rest. Your chambers become your world for several days — but visitors still come, and information still flows.',
    urgency:       'crisis',
    statsChecked:  ['resolve', 'vitality'],
    threshold:     3,
    daysUntilExpiry: 3,
    durationDays:  2,
    oppositionValue: 0,
    prerequisites: [
      { kind: 'eventResolved', defId: 'physician-exam', resolution: 'failure' },
    ],
    slots: [],
    poolWeight: 1,
    isForced: true,
  },
]

// ---------------------------------------------------------------------------
// Storyline: "The Poisoned Hairpin" (poisoned-hairpin)
// Dilemma-rich: entry event has 3 choices, each leads to different branch.
// ---------------------------------------------------------------------------

const POISONED_HAIRPIN: EventDefinition[] = [
  // ENTRY — pool event with before-roll dilemma
  {
    id:            'hairpin-find',
    storylineId:   'poisoned-hairpin',
    type:          'personal',
    locationId:    'chambers',
    title:         'A Gift Left Behind',
    description:   'A beautiful jade hairpin was left at your door with no note. It smells faintly of bitter almonds. Someone wants you to wear it — or wants you to know they could reach you.',
    urgency:       'opportunity',
    statsChecked:  ['cunning', 'discretion'],
    threshold:     2,
    daysUntilExpiry: 3,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [],
    slots: [
      { id: 'hairpin-find-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    dilemma: {
      id: 'hairpin-find-dilemma',
      timing: 'before-roll',
      prompt: 'The hairpin gleams in the lamplight. The bitter scent is unmistakable — someone laced it with something. What do you do?',
      choices: [
        {
          id: 'hairpin-investigate',
          label: 'Investigate quietly',
          description: 'Use your own network to trace who sent this. Keep the palace officials out of it — for now.',
          overrideStats: ['cunning', 'discretion'],
          overrideThreshold: 3,
          moralWeight: { shadowReach: 1 },
        },
        {
          id: 'hairpin-report',
          label: 'Report to the Household Office',
          description: 'Turn it in through proper channels. The virtuous path — but it puts you in the spotlight.',
          overrideStats: ['eloquence', 'resourcefulness'],
          overrideThreshold: 2,
          moralWeight: { virtue: 1 },
        },
        {
          id: 'hairpin-wear',
          label: 'Wear it to court',
          description: 'A bold gamble. If the poison is slow-acting, wearing it publicly forces the sender to reveal themselves — or watch their plan unfold in the open.',
          overrideStats: ['resolve', 'beauty'],
          overrideThreshold: 4,
          moralWeight: { ruthlessness: 1 },
        },
      ],
    },
    graphEdges: {
      choiceEdges: [
        { choiceId: 'hairpin-investigate', success: ['hairpin-trace'],         failure: ['hairpin-sick'] },
        { choiceId: 'hairpin-report',      success: ['hairpin-official'],      failure: ['hairpin-accused'] },
        { choiceId: 'hairpin-wear',        success: ['hairpin-bluff-success'], failure: ['hairpin-sick'] },
      ],
    },
  },

  // ── Branch A: Investigate quietly ─────────────────────────────────────

  {
    id:            'hairpin-trace',
    storylineId:   'poisoned-hairpin',
    type:          'investigation',
    locationId:    'eunuchQuarter',
    title:         'Follow the Trail',
    description:   'The eunuch network whispers of a midnight visitor to the herbalist. Following the trail leads deeper into the palace underbelly.',
    urgency:       'timed',
    statsChecked:  ['cunning', 'discretion'],
    threshold:     3,
    daysUntilExpiry: 3,
    durationDays:  1,
    oppositionValue: 1,
    prerequisites: [
      { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-investigate' },
      { kind: 'eventResolved', defId: 'hairpin-find', resolution: 'success' },
    ],
    slots: [
      { id: 'hairpin-trace-s1', isMandatory: true, requiredTags: ['protagonist'] },
      { id: 'hairpin-trace-s2', isMandatory: false, requiredTags: ['follower'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-resolve'],
      failure: ['hairpin-cornered'],
    },
  },

  // ── Branch B: Report officially ───────────────────────────────────────

  {
    id:            'hairpin-official',
    storylineId:   'poisoned-hairpin',
    type:          'justiceAndPunishment',
    locationId:    'householdOffice',
    title:         'Official Inquiry',
    description:   'The Household Office takes the hairpin seriously. An investigation is launched — but bureaucracies have their own agendas.',
    urgency:       'timed',
    statsChecked:  ['eloquence', 'resourcefulness'],
    threshold:     3,
    daysUntilExpiry: 4,
    durationDays:  2,
    oppositionValue: 1,
    prerequisites: [
      { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-report' },
      { kind: 'eventResolved', defId: 'hairpin-find', resolution: 'success' },
    ],
    slots: [
      { id: 'hairpin-official-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-resolve'],
    },
  },

  {
    id:            'hairpin-accused',
    storylineId:   'poisoned-hairpin',
    type:          'justiceAndPunishment',
    locationId:    'innerCourt',
    title:         'Turned Against You',
    description:   'The official has twisted your report. Somehow, you now stand accused of possessing poison. The court watches with hungry eyes.',
    urgency:       'crisis',
    statsChecked:  ['eloquence', 'cunning'],
    threshold:     4,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 2,
    prerequisites: [
      { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-report' },
      { kind: 'eventResolved', defId: 'hairpin-find', resolution: 'failure' },
    ],
    slots: [
      { id: 'hairpin-accused-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
    dilemma: {
      id: 'hairpin-accused-dilemma',
      timing: 'standalone',
      prompt: 'You stand before the court accused of possessing poison. Every eye is upon you. How do you respond?',
      choices: [
        {
          id: 'accused-endure',
          label: 'Endure silently',
          description: 'Accept the humiliation with grace. History remembers the dignified.',
          skipDiceRoll: true,
          moralWeight: { virtue: 2, imperialFavor: -1 },
        },
        {
          id: 'accused-name-culprit',
          label: 'Name the true culprit',
          description: 'You have gathered enough whispers to point the finger. But you need proof — and nerve.',
          prerequisites: [{ kind: 'reputationMin', metric: 'shadowReach', value: 3 }],
          overrideStats: ['eloquence', 'cunning'],
          overrideThreshold: 4,
          moralWeight: { imperialFavor: 2 },
        },
        {
          id: 'accused-scapegoat',
          label: 'Blame your maidservant',
          description: 'Chunhua can take the fall. She will resent you, but you will be free.',
          skipDiceRoll: true,
          moralWeight: { ruthlessness: 1 },
          immediateConsequences: [
            { kind: 'narrative', text: 'Chunhua is dragged away. Her eyes burn with betrayal.' },
          ],
        },
      ],
    },
    graphEdges: {
      choiceEdges: [
        { choiceId: 'accused-endure',       success: ['hairpin-resolve'] },
        { choiceId: 'accused-name-culprit',  success: ['hairpin-rival-exposed'] },
        { choiceId: 'accused-scapegoat',     success: ['hairpin-resolve'] },
      ],
    },
  },

  // ── Branch C: Wear it to court ────────────────────────────────────────

  {
    id:            'hairpin-bluff-success',
    storylineId:   'poisoned-hairpin',
    type:          'social',
    locationId:    'innerCourt',
    title:         'The Sender Revealed',
    description:   'Your brazen display worked. At court, a rival\'s composure cracks — she expected you to be bedridden, not radiant. Her shock betrays her.',
    urgency:       'opportunity',
    statsChecked:  ['cunning', 'beauty'],
    threshold:     2,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-wear' },
      { kind: 'eventResolved', defId: 'hairpin-find', resolution: 'success' },
    ],
    slots: [
      { id: 'hairpin-bluff-s1', isMandatory: false, requiredTags: [], anyRequiredTag: ['female'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-rival-exposed'],
    },
  },

  // ── Shared failure: poison takes effect ───────────────────────────────

  {
    id:            'hairpin-sick',
    storylineId:   'poisoned-hairpin',
    type:          'personal',
    locationId:    'palacePhysician',
    title:         'Symptoms Appear',
    description:   'A dull headache blooms into nausea. The poison was slow-acting but undeniable. Dr. Han examines you with grave concern.',
    urgency:       'crisis',
    statsChecked:  ['vitality', 'resolve'],
    threshold:     3,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      { kind: 'eventResolved', defId: 'hairpin-find', resolution: 'failure' },
      // Appears on failure of investigate or wear choices (not report — that leads to accused)
      {
        kind: 'anyOf',
        conditions: [
          { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-investigate' },
          { kind: 'choiceMade', eventDefId: 'hairpin-find', choiceId: 'hairpin-wear' },
        ],
      },
    ],
    slots: [
      { id: 'hairpin-sick-s1', isMandatory: true, requiredTags: ['protagonist'] },
      { id: 'hairpin-sick-npc', isMandatory: false, requiredTags: [], npcAgentId: 'physician-han' },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-resolve'],
    },
  },

  // ── Investigation failed escalation ───────────────────────────────────

  {
    id:            'hairpin-cornered',
    storylineId:   'poisoned-hairpin',
    type:          'investigation',
    locationId:    'chambers',
    title:         'A Warning in the Night',
    description:   'Your investigation got too close. A note slipped under your door: "Stop looking, or the next gift won\'t smell." The trail has gone cold — but you know enough to be dangerous.',
    urgency:       'timed',
    statsChecked:  ['resolve', 'discretion'],
    threshold:     3,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 1,
    prerequisites: [
      { kind: 'eventResolved', defId: 'hairpin-trace', resolution: 'failure' },
    ],
    slots: [
      { id: 'hairpin-cornered-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-resolve'],
    },
  },

  // ── Rival exposed (from naming culprit or bluff) ──────────────────────

  {
    id:            'hairpin-rival-exposed',
    storylineId:   'poisoned-hairpin',
    type:          'social',
    locationId:    'innerCourt',
    title:         'A Rival Exposed',
    description:   'The truth is in the open. Consort Li\'s agent is identified — and the court\'s sympathy shifts decisively in your favour.',
    urgency:       'opportunity',
    statsChecked:  ['eloquence'],
    threshold:     1,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      {
        kind: 'anyOf',
        conditions: [
          { kind: 'eventResolved', defId: 'hairpin-bluff-success', resolution: 'success' },
          { kind: 'choiceMade', eventDefId: 'hairpin-accused', choiceId: 'accused-name-culprit' },
        ],
      },
    ],
    slots: [],
    poolWeight: 1,
    isForced: true,
    graphEdges: {
      success: ['hairpin-resolve'],
    },
  },

  // ── CONVERGENCE — final beat ──────────────────────────────────────────

  {
    id:            'hairpin-resolve',
    storylineId:   'poisoned-hairpin',
    type:          'investigation',
    locationId:    'innerCourt',
    title:         'The Truth Surfaces',
    description:   'However the crisis unfolded, the dust settles. The palace remembers — and judges. Your handling of the affair defines how others see you.',
    urgency:       'routine',
    statsChecked:  ['eloquence', 'cunning'],
    threshold:     2,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [
      {
        kind: 'anyOf',
        conditions: [
          { kind: 'eventResolved', defId: 'hairpin-trace', resolution: 'success' },
          { kind: 'eventResolved', defId: 'hairpin-official', resolution: 'success' },
          { kind: 'eventResolved', defId: 'hairpin-cornered', resolution: 'success' },
          { kind: 'eventResolved', defId: 'hairpin-sick', resolution: 'success' },
          { kind: 'eventResolved', defId: 'hairpin-rival-exposed', resolution: 'success' },
          { kind: 'choiceMade', eventDefId: 'hairpin-accused', choiceId: 'accused-endure' },
          { kind: 'choiceMade', eventDefId: 'hairpin-accused', choiceId: 'accused-scapegoat' },
        ],
      },
    ],
    slots: [],
    poolWeight: 1,
    isForced: true,
  },
]

// ---------------------------------------------------------------------------
// Standalone pool events — not part of any storyline
// ---------------------------------------------------------------------------

const POOL_EVENTS: EventDefinition[] = [
  // ── The working dilemma: Consort Yang's tea ────────────────────────────
  {
    id:            'yang-tea',
    type:          'social',
    locationId:    'imperialGardens',
    title:         'Tea with Consort Yang',
    description:   'Consort Yang — the highest-ranking woman since the Empress\'s death — has summoned the new concubines for tea beneath the flowering plum. Her eyes miss nothing.',
    urgency:       'opportunity',
    statsChecked:  ['eloquence', 'beauty'],
    threshold:     2,
    daysUntilExpiry: 3,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [],
    slots: [
      { id: 'yang-tea-s1', isMandatory: true, requiredTags: ['protagonist'] },
    ],
    poolWeight: 5,
    isForced: true,
    dilemma: {
      id: 'yang-tea-dilemma',
      timing: 'standalone',
      prompt: '"I hear the Wu family has connections in the trade quarters. Tell me — what is the most valuable thing your family taught you?"',
      choices: [
        {
          id: 'yang-honesty',
          label: '"My mother taught me to see people clearly."',
          skipDiceRoll: true,
          moralWeight: { virtue: 1 },
          immediateConsequences: [
            { kind: 'equipment', equipmentId: 'acc-silver-mirror' },
            { kind: 'narrative', text: 'Yang nods slowly. Later, a servant brings a polished silver mirror to your quarters. "From the Consort," she says. "For someone who sees clearly."' },
          ],
        },
        {
          id: 'yang-flattery',
          label: '"That true grace cannot be learned from books — only observed."',
          skipDiceRoll: true,
          moralWeight: { imperialFavor: 1 },
          immediateConsequences: [
            { kind: 'equipment', equipmentId: 'tool-lacquer-fan' },
            { kind: 'narrative', text: 'Yang\'s mouth curves. She produces a red lacquer fan from her sleeve and offers it across the table. "Then observe more carefully."' },
          ],
        },
        {
          id: 'yang-deflection',
          label: '"Patience. My father said the palace teaches it faster than any tutor."',
          skipDiceRoll: true,
          moralWeight: { shadowReach: 1 },
          immediateConsequences: [
            { kind: 'silver', amount: 2 },
            { kind: 'narrative', text: 'She says nothing. Moves to the next girl. But that evening, two silver taels appear on your writing desk with no note.' },
          ],
        },
        {
          id: 'yang-vulnerability',
          label: '"To be afraid and do it anyway."',
          skipDiceRoll: true,
          moralWeight: { virtue: 2 },
          immediateConsequences: [
            { kind: 'equipment', equipmentId: 'acc-jade-butterfly' },
            { kind: 'narrative', text: 'Her expression changes — barely, but you catch it. The next morning, a jade butterfly hairpin arrives. No message. She remembers what honesty looks like.' },
          ],
        },
      ],
    },
  },

  {
    id:            'pool-poetry-contest',
    type:          'social',
    locationId:    'imperialLibrary',
    title:         'Impromptu Poetry Contest',
    description:   'A senior concubine has challenged anyone nearby to a contest of verse. Winning earns esteem; losing gracefully still earns goodwill.',
    urgency:       'opportunity',
    statsChecked:  ['eloquence', 'scholarship'],
    threshold:     2,
    daysUntilExpiry: 2,
    durationDays:  1,
    oppositionValue: 1,
    prerequisites: [],
    slots: [
      { id: 'pool-poetry-s1', isMandatory: false, requiredTags: [], anyRequiredTag: ['female'] },
    ],
    poolWeight: 2,
    isRepeatable: true,
  },

  {
    id:            'pool-midnight-prayer',
    type:          'spiritual',
    locationId:    'buddhistTemple',
    title:         'Midnight Offering',
    description:   'The temple is open for private devotions before dawn. Attendance is noticed — especially by those who cannot sleep.',
    urgency:       'routine',
    statsChecked:  ['spiritualArts'],
    threshold:     1,
    daysUntilExpiry: null,
    durationDays:  1,
    oppositionValue: 0,
    prerequisites: [],
    slots: [],
    poolWeight: 3,
    isRepeatable: true,
  },
]

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const ALL_EVENT_DEFINITIONS: EventDefinition[] = [
  ...SHADOW_CONSORT,
  ...PHYSICIAN_DILEMMA,
  ...POISONED_HAIRPIN,
  ...POOL_EVENTS,
]

export const EVENT_DEFINITIONS_BY_ID: Record<string, EventDefinition> =
  Object.fromEntries(ALL_EVENT_DEFINITIONS.map(d => [d.id, d]))
