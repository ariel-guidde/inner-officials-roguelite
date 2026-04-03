// Maps AgentTier to Three.js material configuration for dice meshes.
// Imported by DieMesh.tsx — no React here.

import type { AgentTier } from '@core/types'

export interface DieMaterialConfig {
  color: string
  roughness: number
  metalness: number
  /** Emissive glow (used for gold/jade tiers). */
  emissive?: string
  emissiveIntensity?: number
}

export const TIER_MATERIAL: Record<AgentTier, DieMaterialConfig> = {
  clay: {
    color: '#c4956a',
    roughness: 0.9,
    metalness: 0.0,
  },
  bronze: {
    color: '#cd7f32',
    roughness: 0.6,
    metalness: 0.4,
  },
  silver: {
    color: '#c8c8d0',
    roughness: 0.3,
    metalness: 0.7,
  },
  gold: {
    color: '#ffd700',
    roughness: 0.2,
    metalness: 0.9,
    emissive: '#ffaa00',
    emissiveIntensity: 0.15,
  },
  jade: {
    color: '#00a86b',
    roughness: 0.15,
    metalness: 0.1,
    emissive: '#00ff99',
    emissiveIntensity: 0.25,
  },
}

export function getMaterialConfig(tier: AgentTier): DieMaterialConfig {
  return TIER_MATERIAL[tier]
}
