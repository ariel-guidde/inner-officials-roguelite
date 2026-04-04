// =============================================================================
// characters/theme.ts
// Tier-based card theming and tag category styling.
// Shared by Characters, and available to any module that renders agent cards.
// =============================================================================

import type { CSSProperties } from 'react'
import type { AgentTier, TagCategory } from '@core/types'

// ---------------------------------------------------------------------------
// Tier theme
// ---------------------------------------------------------------------------

export interface TierTheme {
  /** CSS gradient string for the ornamental card border. */
  borderGradient: string
  /** Border width in px. Higher tiers get wider borders. */
  borderWidth: number
  /** Primary card interior background (top). */
  cardBg: string
  /** Secondary card interior background (bottom / portrait column). */
  cardBg2: string
  /** Accent color — stats, dots, highlights. */
  accent: string
  /** Accent with alpha — glow effects. */
  glow: string
}

export const TIER_THEME: Record<AgentTier, TierTheme> = {
  clay: {
    borderGradient: 'linear-gradient(135deg, #7a4820 0%, #c4956a 25%, #a07040 50%, #c4956a 75%, #7a4820 100%)',
    borderWidth: 2, cardBg: '#2e1e0a', cardBg2: '#1c1206', accent: '#c4956a', glow: '#c4956a44',
  },
  bronze: {
    borderGradient: 'linear-gradient(135deg, #5a2e08 0%, #cd7f32 20%, #e8a050 40%, #cd7f32 60%, #8a5020 80%, #cd7f32 100%)',
    borderWidth: 3, cardBg: '#271808', cardBg2: '#170f04', accent: '#cd7f32', glow: '#cd7f3244',
  },
  silver: {
    borderGradient: 'linear-gradient(135deg, #505870 0%, #c0c0c0 30%, #e8eef8 50%, #c0c0c0 70%, #505870 100%)',
    borderWidth: 3, cardBg: '#131c26', cardBg2: '#0a1018', accent: '#c0c0c0', glow: '#c0c0c044',
  },
  gold: {
    borderGradient: 'linear-gradient(135deg, #7a5800 0%, #ffd700 15%, #fff0a0 30%, #c09000 45%, #ffd700 60%, #fff0a0 75%, #ffd700 88%, #7a5800 100%)',
    borderWidth: 4, cardBg: '#241d00', cardBg2: '#150f00', accent: '#ffd700', glow: '#ffd70044',
  },
  jade: {
    borderGradient: 'linear-gradient(135deg, #003820 0%, #00a86b 25%, #80d4a8 50%, #00a86b 75%, #003820 100%)',
    borderWidth: 3, cardBg: '#02200f', cardBg2: '#011408', accent: '#00a86b', glow: '#00a86b44',
  },
}

/**
 * Generates the CSS padding-box/border-box trick style for a tier-framed card.
 * @param selected  Adds accent glow ring when true.
 * @param widthOverride  Optional override for border width (e.g. modals use +1).
 */
export function cardBorderStyle(
  theme: TierTheme,
  selected = false,
  widthOverride?: number,
): CSSProperties {
  const w = widthOverride ?? theme.borderWidth
  return {
    background: `linear-gradient(170deg, ${theme.cardBg} 0%, ${theme.cardBg2} 100%) padding-box, ${theme.borderGradient} border-box`,
    border: `${w}px solid transparent`,
    boxShadow: selected
      ? `0 0 0 1px ${theme.accent}66, 0 8px 32px ${theme.glow}, inset 0 1px 0 ${theme.accent}22`
      : `0 6px 24px rgba(0,0,0,0.6), inset 0 1px 0 ${theme.accent}11`,
  }
}

// ---------------------------------------------------------------------------
// Tag category chip styles
// ---------------------------------------------------------------------------

export const TAG_CAT_STYLE: Record<TagCategory, { bg: string; text: string }> = {
  gender:         { bg: 'rgba(120,120,140,0.2)',  text: '#9898b0' },
  status:         { bg: 'rgba(140,80,180,0.22)',  text: '#b890d0' },
  'court-role':   { bg: 'rgba(200,100,60,0.22)',  text: '#d09070' },
  'service-role': { bg: 'rgba(60,130,180,0.22)',  text: '#80b0d0' },
  mechanical:     { bg: 'rgba(192,160,0,0.22)',   text: '#c8a820' },
}
