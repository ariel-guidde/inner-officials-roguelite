// =============================================================================
// Inventory module — equipment pool + agent loadout management
// =============================================================================

import { useState } from 'react'
import type {
  Agent, AgentTier, Equipment, EquipmentSlot, StatName,
} from '@core/types'
import {
  AGENT_TIER_COLORS, STAT_LABELS,
  STAT_ABBREVIATIONS, EQUIPMENT_SLOT_ICONS, EQUIPMENT_SLOT_LABELS,
  EQUIPMENT_ITEM_TAG_LABELS,
} from '@core/types'
import { meetsRequirements } from '@modules/characters'

const TIER_ORDER: AgentTier[] = ['clay', 'bronze', 'silver', 'gold', 'jade']

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InventoryProps {
  /** All equipment currently in the pool (not equipped by anyone). */
  poolItems: Equipment[]
  /** All agents — used to show their current loadouts. */
  agents: Agent[]
  /** If set, this agent's loadout is shown prominently. */
  selectedAgentId?: string | null
  onAgentSelect: (agentId: string) => void
  onEquip: (agentId: string, slot: EquipmentSlot, item: Equipment) => void
  onUnequip: (agentId: string, slot: EquipmentSlot) => void
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function Inventory({
  poolItems, agents, selectedAgentId, onAgentSelect, onEquip, onUnequip,
}: InventoryProps) {
  const [slotFilter, setSlotFilter] = useState<EquipmentSlot | 'all'>('all')
  const [hoveredItem, setHoveredItem] = useState<Equipment | null>(null)

  const selectedAgent = agents.find(a => a.id === selectedAgentId) ?? null

  const filteredPool = slotFilter === 'all'
    ? poolItems
    : poolItems.filter(i => i.slot === slotFilter)

  // Sort by slot then tier
  const sortedPool = [...filteredPool].sort((a, b) => {
    if (a.slot !== b.slot) return a.slot.localeCompare(b.slot)
    return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  })

  const isGuard = selectedAgent?.tags.includes('guard') ?? false
  const agentSlots: EquipmentSlot[] = isGuard
    ? ['attire', 'accessory', 'tool', 'weapon']
    : ['attire', 'accessory', 'tool']

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Agent strip — horizontal scroll */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-2">Agents</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {agents.map(a => (
            <AgentPip key={a.id} agent={a} isSelected={a.id === selectedAgentId} onClick={() => onAgentSelect(a.id)} />
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: item pool */}
        <div className="flex flex-col gap-3 w-[320px] flex-shrink-0">
          {/* Slot filter */}
          <div className="flex gap-1 flex-wrap">
            {(['all', 'attire', 'accessory', 'tool', 'weapon'] as const).map(s => (
              <button key={s} onClick={() => setSlotFilter(s)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-wide transition-colors ${
                  slotFilter === s
                    ? 'bg-silk/20 text-parchment'
                    : 'bg-silk/5 text-silk/40 hover:bg-silk/10'
                }`}>
                {s === 'all' ? 'All' : `${EQUIPMENT_SLOT_ICONS[s]} ${EQUIPMENT_SLOT_LABELS[s]}`}
              </button>
            ))}
          </div>

          {/* Item list */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {sortedPool.length === 0 && (
              <div className="text-xs text-silk/25 italic pt-2">No items in pool{slotFilter !== 'all' ? ` for ${EQUIPMENT_SLOT_LABELS[slotFilter]}` : ''}.</div>
            )}
            {sortedPool.map(item => {
              const eligible = selectedAgent != null
                && agentSlots.includes(item.slot)
                && meetsRequirements(selectedAgent, item)
              const slotMatch = selectedAgent != null && agentSlots.includes(item.slot)
              return (
                <ItemRow
                  key={item.id}
                  item={item}
                  isHovered={hoveredItem?.id === item.id}
                  onHover={setHoveredItem}
                  onEquip={eligible ? () => onEquip(selectedAgent!.id, item.slot, item) : undefined}
                  canEquip={eligible}
                  requirementsMet={!slotMatch ? null : eligible}
                />
              )
            })}
          </div>
        </div>

        {/* Right: selected agent loadout + tooltip */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {selectedAgent ? (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-silk/30 mb-2">
                  {selectedAgent.name}'s Loadout
                </div>
                <div className="space-y-2">
                  {agentSlots.map(slot => (
                    <LoadoutSlot
                      key={slot}
                      slot={slot}
                      item={selectedAgent.equipment?.[slot] ?? null}
                      onUnequip={() => onUnequip(selectedAgent.id, slot)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-silk/25 italic">Select an agent above to manage their equipment.</div>
          )}

          {/* Item tooltip / detail */}
          {hoveredItem && (
            <ItemDetail item={hoveredItem} />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent pip (small avatar button)
// ---------------------------------------------------------------------------

function AgentPip({ agent, isSelected, onClick }: {
  agent: Agent; isSelected: boolean; onClick: () => void
}) {
  const tierColor = AGENT_TIER_COLORS[agent.tier]
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-14 rounded-lg p-1.5 transition-colors focus:outline-none"
      style={{
        background: isSelected ? `${tierColor}22` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? tierColor + '66' : 'rgba(255,255,255,0.08)'}`,
      }}>
      <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.3)' }}>
        <span className="font-serif text-lg" style={{ color: `${tierColor}99` }}>{agent.name[0]}</span>
      </div>
      <span className="text-[8px] text-parchment/60 truncate w-full text-center leading-tight">{agent.name.split(' ')[0]}</span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor }} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Item row in pool list
// ---------------------------------------------------------------------------

function ItemRow({ item, isHovered, onHover, onEquip, canEquip, requirementsMet }: {
  item: Equipment
  isHovered: boolean
  onHover: (item: Equipment | null) => void
  onEquip?: () => void
  canEquip: boolean
  requirementsMet: boolean | null // null = no agent selected
}) {
  const tierColor = AGENT_TIER_COLORS[item.tier]
  const bonuses = Object.entries(item.statBonus).filter(([, v]) => (v ?? 0) !== 0)

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors"
      style={{
        background: isHovered ? 'rgba(232,213,176,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isHovered ? 'rgba(232,213,176,0.15)' : 'rgba(255,255,255,0.06)'}`,
      }}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="text-sm flex-shrink-0">{EQUIPMENT_SLOT_ICONS[item.slot]}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-parchment/80 font-sans truncate">{item.name}</div>
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {bonuses.map(([s, v]) => (
            <span key={s} className="text-[9px] font-bold" style={{ color: tierColor }}>
              +{v} {STAT_ABBREVIATIONS[s as StatName] ?? s}
            </span>
          ))}
          {bonuses.length === 0 && (
            <span className="text-[9px] text-silk/25">No stat bonus</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor }} title={item.tier} />
        {requirementsMet === false && (
          <span className="text-[9px] text-red-400/60" title="Requirements not met">✕</span>
        )}
        {onEquip && canEquip && (
          <button onClick={onEquip}
            className="text-[9px] px-2 py-0.5 rounded transition-colors hover:bg-silk/20 text-silk/50 hover:text-parchment">
            Equip →
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loadout slot
// ---------------------------------------------------------------------------

function LoadoutSlot({ slot, item, onUnequip }: {
  slot: EquipmentSlot
  item: Equipment | null | undefined
  onUnequip: () => void
}) {
  const tierColor = item ? AGENT_TIER_COLORS[item.tier] : 'rgba(255,255,255,0.12)'
  const bonuses = item ? Object.entries(item.statBonus).filter(([, v]) => (v ?? 0) !== 0) : []

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{
        background: item ? `${tierColor}14` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${item ? tierColor + '40' : 'rgba(255,255,255,0.07)'}`,
      }}>
      <span className="text-xl flex-shrink-0">{EQUIPMENT_SLOT_ICONS[slot]}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-silk/30">{EQUIPMENT_SLOT_LABELS[slot]}</div>
        {item ? (
          <>
            <div className="text-sm text-parchment/85 font-sans">{item.name}</div>
            <div className="flex gap-2 mt-0.5 flex-wrap">
              {bonuses.map(([s, v]) => (
                <span key={s} className="text-[10px] font-bold" style={{ color: tierColor }}>+{v} {STAT_LABELS[s as StatName]?.en ?? s}</span>
              ))}
              {bonuses.length === 0 && <span className="text-[10px] text-silk/30">No stat bonus</span>}
            </div>
          </>
        ) : (
          <div className="text-sm text-silk/20 italic">Empty</div>
        )}
      </div>
      {item && (
        <button onClick={onUnequip}
          className="text-[9px] px-2 py-1 rounded text-silk/40 hover:text-parchment hover:bg-silk/15 transition-colors flex-shrink-0">
          Remove
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Item detail tooltip
// ---------------------------------------------------------------------------

function ItemDetail({ item }: { item: Equipment }) {
  const tierColor = AGENT_TIER_COLORS[item.tier]
  const bonuses = Object.entries(item.statBonus).filter(([, v]) => (v ?? 0) !== 0)

  return (
    <div className="rounded-xl px-4 py-3 border"
      style={{
        background: 'rgba(20,14,4,0.95)',
        border: `1px solid ${tierColor}40`,
        boxShadow: `0 0 20px ${tierColor}18`,
      }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{EQUIPMENT_SLOT_ICONS[item.slot]}</span>
        <div>
          <div className="text-sm text-parchment font-sans font-semibold">{item.name}</div>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: tierColor }}>{item.tier} tier · {EQUIPMENT_SLOT_LABELS[item.slot]}</div>
        </div>
      </div>

      {bonuses.length > 0 && (
        <div className="flex gap-3 mb-2 flex-wrap">
          {bonuses.map(([s, v]) => (
            <span key={s} className="text-xs font-bold" style={{ color: tierColor }}>
              +{v} {STAT_LABELS[s as StatName]?.en ?? s}
            </span>
          ))}
        </div>
      )}

      {item.itemTags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {item.itemTags.map(t => (
            <span key={t} className="text-[9px] px-1.5 py-px rounded-full text-silk/50 bg-silk/10">
              {EQUIPMENT_ITEM_TAG_LABELS[t]}
            </span>
          ))}
        </div>
      )}

      {item.description && (
        <div className="text-[10px] text-silk/50 italic">{item.description}</div>
      )}

      {/* Requirements */}
      {(item.requires.tags?.length || item.requires.anyTag?.length || item.requires.minTier || item.requires.minMartial) ? (
        <div className="mt-2 pt-2 border-t border-silk/10">
          <div className="text-[9px] uppercase tracking-wider text-silk/30 mb-1">Requires</div>
          <div className="text-[9px] text-silk/45 space-y-0.5">
            {item.requires.tags?.map(t => <div key={t}>Must have tag: {t}</div>)}
            {item.requires.anyTag && <div>Any of: {item.requires.anyTag.join(', ')}</div>}
            {item.requires.minTier && <div>Min tier: {item.requires.minTier}</div>}
            {item.requires.minMartial && <div>Min Martial: {item.requires.minMartial}</div>}
            {item.requires.minStats && Object.entries(item.requires.minStats).map(([s, v]) => (
              <div key={s}>Min {STAT_LABELS[s as StatName]?.en ?? s}: {v}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Inventory
