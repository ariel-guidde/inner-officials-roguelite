/** Merge Tailwind class names (simple concat — use `clsx` if needed later). */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Linearly interpolate between a and b by t (0–1). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Format a probability (0–1) as a percentage string. */
export function pct(p: number, decimals = 1): string {
  return `${(p * 100).toFixed(decimals)}%`
}
