// =============================================================================
// Portrait registry — maps agent portraitId to resolved asset URLs.
// Missing portraits fall back to colored initials in the card UI.
// =============================================================================

// Existing SVGs
import portraitConcubine1 from '@assets/portraits/Concubine1.svg'
import portraitConsort1   from '@assets/portraits/Consort 1.svg'
import portraitServant1   from '@assets/portraits/Servant 1.svg'
import portraitServant2   from '@assets/portraits/Servant 2.svg'
import portraitGaRau      from '@assets/portraits/gaRau-R0.webp'

const _registry = new Map<string, string>([
  // Existing assets (legacy names)
  ['Concubine1',    portraitConcubine1],
  ['Consort 1',     portraitConsort1],
  ['Servant 1',     portraitServant1],
  ['Servant 2',     portraitServant2],
  ['gaRau-R0',      portraitGaRau],

  // Act 1 portrait IDs — will resolve once SVG files are added
  // Until then, the card UI shows colored initials as fallback
])

export function getPortrait(portraitId: string): string | undefined {
  return _registry.get(portraitId)
}

export function registerPortrait(portraitId: string, url: string): void {
  _registry.set(portraitId, url)
}

export function listPortraits(): ReadonlyMap<string, string> {
  return _registry
}
