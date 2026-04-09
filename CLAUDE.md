# Inner Officials Roguelite

A browser-based political intrigue roguelite set in the Tang Dynasty imperial court. Built with React, Three.js, and useReducer/Context. Inspired by "The Sultan's Game" by Double Cross.

## Commands

- `npm run dev` - Start Vite dev server
- `npm run build` - Typecheck (`tsc`) + Vite production build
- `npm run typecheck` - TypeScript type checking only (no emit)
- `npm run preview` - Preview production build

## Architecture

### Stack

React 18 + TypeScript 5 + Vite 5. Three.js with @react-three/fiber and @react-three/rapier for 3D physics-based dice rolling. useReducer + Context for state management (GameStateContext). Mitt for event bus. Tailwind CSS for styling.

### Path Aliases

- `@core/*` -> `src/core/*`
- `@modules/*` -> `src/modules/*`
- `@assets/*` -> `src/assets/*`
- `@lib/*` -> `src/lib/*`

### Project Structure

```
src/
  core/           # Domain types (types.ts), GameState reducer + context, event bus (events.ts), save/load, consequences
  modules/
    dice/         # 3D physics-based dice rolling (Three.js + Rapier)
    events/       # Event definitions, storylines, event pool
    narrative/    # Consequence resolution (in progress)
    characters/   # Agent roster UI, character cards
    map/          # Palace map, locations, event spawning
    inventory/    # Equipment + resources UI
    playground/   # Dev testing harness with sample configs
  lib/            # Utilities (math, formatting)
  assets/         # Portrait images
design/
  mechanics/      # Core system design docs (~150KB)
  world/          # Worldbuilding (equipment, NPCs)
  meta-progression/  # (planned)
  sultans-game-reference/  # Reference material from inspiration game
```

### Key Patterns

- **Single source of truth:** All domain types in `src/core/types.ts`. Modules never redefine core types.
- **useReducer + Context:** Central GameState in `src/core/gameState.ts` with pure reducer. Components use `useGameState()` hook. Fully serializable for save/load.
- **Event bus (mitt):** Cross-module communication without direct module dependencies.
- **Module independence:** Each module under `src/modules/` is self-contained. Modules communicate only through the core store and event bus.
- **Strict TypeScript:** `strict: true`, union types for extensibility (e.g., `Consequence` variants).

## Game Systems Overview

Understanding the game design is essential for working on this codebase. Full design docs live in `/design/mechanics/`.

- **Agents:** Characters with 9 stats, 5 tiers (Clay-Jade), tags, conditions, and equipment slots. You assign agents to events.
- **Dice:** Pool-based checks. Dragon (success) vs Cloud (failure) faces. 3D physics-animated rolling. Difficulty affects per-die success rate (40-60%).
- **Events:** Daily challenges on the palace map. Mandatory + optional agent slots. Tag/tier requirements. Multi-day resolution. Events chain into storylines.
- **Edict Deck:** Run-driving timer. Imperial demands with 7-day deadlines + scandals, rival schemes, and obligations.
- **Economy:** Silver taels (scarce), intelligence scrolls (rerolls), golden dice (auto-successes, 0-3 per run).
- **Reputation:** 5 independent tracks (Virtue, Ruthlessness, Imperial Favor, Shadow Reach, Heavenly Sight) that gate events and locations.
- **Map:** 12 palace locations, some rank/favor-gated, some unlockable. 4 seasonal festivals.
- **Equipment:** 4 slots (Attire, Accessory, Tool, Weapon) with tiered items that grant stat bonuses.
- **Meta-progression:** Wu Family Standing carries across runs (not yet implemented).

## Style

Ink-wash painting (water ink) aesthetic with gold leaf accents. Bilingual UI: English + Simplified Chinese. Fonts: Noto Serif SC + Noto Sans SC.
