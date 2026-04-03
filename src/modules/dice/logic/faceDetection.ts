// =============================================================================
// Face detection — reads a die's settled quaternion and determines which
// material group (face) is pointing most toward world +Y (up).
//
// Three.js BoxGeometry material group order:
//   0 = +X right   1 = -X left
//   2 = +Y top     3 = -Y bottom
//   4 = +Z front   5 = -Z back
// =============================================================================

import * as THREE from 'three'
import type { DiceDifficulty } from '@core/types'

const FACE_NORMALS: [number, number, number][] = [
  [1, 0, 0],   // 0 — right  (+X)
  [-1, 0, 0],  // 1 — left   (-X)
  [0, 1, 0],   // 2 — top    (+Y)
  [0, -1, 0],  // 3 — bottom (-Y)
  [0, 0, 1],   // 4 — front  (+Z)
  [0, 0, -1],  // 5 — back   (-Z)
]

/**
 * Which face indices are "dragon" (success) for each difficulty level.
 * The count controls the visual probability before rolling:
 *   gentle   → 4/6 ≈ 67%  (physically shows more dragon faces while spinning)
 *   standard → 3/6 = 50%
 *   ruthless → 2/6 ≈ 33%  (mostly cloud faces visible while spinning)
 */
export const DRAGON_FACE_INDICES: Record<DiceDifficulty, ReadonlySet<number>> = {
  gentle:   new Set([0, 1, 2, 4]),   // 4 faces
  standard: new Set([0, 2, 4]),      // 3 faces (opposite pairs all differ)
  ruthless: new Set([2, 4]),         // 2 faces
} as const

/**
 * Returns the material group index of the face pointing most upward
 * given the die's settled world quaternion.
 */
export function getTopFaceIndex(q: { x: number; y: number; z: number; w: number }): number {
  const quat = new THREE.Quaternion(q.x, q.y, q.z, q.w)
  const up   = new THREE.Vector3(0, 1, 0)

  let maxDot = -Infinity
  let topIndex = 0

  for (let i = 0; i < FACE_NORMALS.length; i++) {
    const dot = new THREE.Vector3(...FACE_NORMALS[i]).applyQuaternion(quat).dot(up)
    if (dot > maxDot) { maxDot = dot; topIndex = i }
  }

  return topIndex
}

export function isFaceDragon(faceIndex: number, difficulty: DiceDifficulty): boolean {
  return DRAGON_FACE_INDICES[difficulty].has(faceIndex)
}
