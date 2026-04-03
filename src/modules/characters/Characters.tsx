// =============================================================================
// Characters module — public component
// Renders the agent roster as cards or a compact list.
// Props contract is the authoritative interface for this module.
// =============================================================================

import type { Agent, StatName } from '@core/types'

// ---------------------------------------------------------------------------
// Props contract
// ---------------------------------------------------------------------------

export interface CharactersProps {
  /** Agent roster to render. Module treats this as read-only. */
  agents: Agent[]
  /** Currently selected agent. */
  selectedAgentId?: string | null
  onAgentSelect: (agentId: string) => void
  /** Called when a drag begins on a card (for assignment flow). */
  onAgentDragStart?: (agentId: string) => void
  /** Render only these agent IDs (Playground isolation). */
  filterAgentIds?: string[]
  /**
   * Highlight these stats on all cards — used when the active event
   * checks specific stats so the player can see relevant numbers at a glance.
   */
  highlightStats?: StatName[]
  /** Layout mode. Default 'grid'. */
  layout?: 'grid' | 'list'
  /**
   * Show the combined pool summary bar at the bottom.
   * Displays total of each stat across all visible agents.
   */
  showPoolSummary?: boolean
}

// ---------------------------------------------------------------------------
// Component (implementation — TODO)
// ---------------------------------------------------------------------------

export function Characters(_props: CharactersProps) {
  // TODO: implement
  // Render flow:
  //   1. Filter agents by filterAgentIds if provided
  //   2. Render in a responsive grid (layout='grid') or vertical list (layout='list')
  //   3. Each agent → <AgentCard>:
  //        - Portrait image (from portraitId)
  //        - <TierBadge> in top-right corner
  //        - 9 <StatBar> rows (highlighted if stat is in highlightStats)
  //        - <MartialIndicator> if agent.stats.martial is set
  //        - <ConditionBadge> row for each active condition
  //        - Resentment flame if agent.resentment > 0
  //   4. Click → onAgentSelect; drag start → onAgentDragStart
  //   5. If showPoolSummary, render statSummary(agents) bar at bottom

  const visible = _props.filterAgentIds
    ? _props.agents.filter((a) => _props.filterAgentIds!.includes(a.id))
    : _props.agents

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-silk/40 text-xs text-center py-8">
        🃏 Characters module — implementation pending
        <br />
        <span className="text-silk/25">({visible.length} agents loaded)</span>
      </div>
    </div>
  )
}

export default Characters
