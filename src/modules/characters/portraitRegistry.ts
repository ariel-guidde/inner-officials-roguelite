// =============================================================================
// characters/portraitRegistry.ts
// Maps agent portraitId strings to resolved asset URLs.
//
// To add a new portrait:
//   import myPortrait from '@assets/portraits/MyPortrait.svg'
//   registerPortrait('my-portrait-id', myPortrait)
//
// Or bulk-register at startup from your asset manifest.
// =============================================================================

import portraitGaRau      from '@assets/portraits/gaRau-R0.webp'
import portraitConcubine1 from '@assets/portraits/Concubine1.svg'
import portraitConsort1   from '@assets/portraits/Consort 1.svg'
import portraitServant1   from '@assets/portraits/Servant 1.svg'
import portraitServant2   from '@assets/portraits/Servant 2.svg'

/** Internal registry — populated at module load then extensible at runtime. */
const _registry = new Map<string, string>([
  ['gaRau-R0',      portraitGaRau],
  ['Concubine1',    portraitConcubine1],
  ['Consort 1',     portraitConsort1],
  ['Servant 1',     portraitServant1],
  ['Servant 2',     portraitServant2],
])

/**
 * Looks up a portrait URL by the agent's `portraitId`.
 * Returns `undefined` if no portrait is registered for this id.
 */
export function getPortrait(portraitId: string): string | undefined {
  return _registry.get(portraitId)
}

/**
 * Registers a new portrait at runtime (e.g. from a lazy-loaded asset pack).
 * Overwrites any existing entry with the same id.
 */
export function registerPortrait(portraitId: string, url: string): void {
  _registry.set(portraitId, url)
}

/** Read-only snapshot of the current registry (useful for dev tools). */
export function listPortraits(): ReadonlyMap<string, string> {
  return _registry
}
