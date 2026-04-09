// =============================================================================
// Save/Load — 3 save slots in localStorage.
// GameState is fully serializable (no Maps, no functions).
// =============================================================================

import type { GameState } from './gameState'
import type { HaremRank } from './types'
import { RANK_TITLES } from './types'

const STORAGE_KEY = 'inner-officials-saves'

export type SaveSlotId = 1 | 2 | 3

export interface SaveSlotMeta {
  slot: SaveSlotId
  savedAt: string       // ISO date
  summary: string       // "Day 14 — Cairen Wu — Virtue 3"
  runId: string
}

interface SaveData {
  meta: SaveSlotMeta
  state: GameState
}

type AllSaves = Partial<Record<SaveSlotId, SaveData>>

function readAllSaves(): AllSaves {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAllSaves(saves: AllSaves): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves))
}

function buildSummary(state: GameState): string {
  const rankTitle = RANK_TITLES[state.haremRank as HaremRank]?.en.split(' — ')[0] ?? 'Unknown'
  const maxRep = Object.entries(state.reputation)
    .filter(([k]) => k !== 'slander')
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]
  const repStr = maxRep && (maxRep[1] as number) > 0 ? ` — ${maxRep[0]} ${maxRep[1]}` : ''
  return `Day ${state.currentDay} — ${rankTitle} Wu${repStr}`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function saveGame(slot: SaveSlotId, state: GameState): void {
  const saves = readAllSaves()
  saves[slot] = {
    meta: {
      slot,
      savedAt: new Date().toISOString(),
      summary: buildSummary(state),
      runId: state.runId,
    },
    state: { ...state, saveSlot: slot },
  }
  writeAllSaves(saves)
}

export function loadGame(slot: SaveSlotId): GameState | null {
  const saves = readAllSaves()
  return saves[slot]?.state ?? null
}

export function deleteSave(slot: SaveSlotId): void {
  const saves = readAllSaves()
  delete saves[slot]
  writeAllSaves(saves)
}

export function listSaves(): (SaveSlotMeta | null)[] {
  const saves = readAllSaves()
  return [1, 2, 3].map(slot => saves[slot as SaveSlotId]?.meta ?? null) as (SaveSlotMeta | null)[]
}

export function hasSaves(): boolean {
  const saves = readAllSaves()
  return Object.keys(saves).length > 0
}
