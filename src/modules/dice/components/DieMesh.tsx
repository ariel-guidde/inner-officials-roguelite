import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { AGENT_TIER_COLORS, type AgentTier, type DiceDifficulty } from '@core/types'
import { DRAGON_FACE_INDICES, getTopFaceIndex, isFaceDragon } from '../logic/faceDetection'

const DIE_SIZE   = 0.9
const HALF       = DIE_SIZE / 2

// BoxGeometry material order matches faceDetection FACE_NORMALS
// 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z

interface DieMeshProps {
  /** Die index within the pool — used for spread positioning. */
  index: number
  total: number
  difficulty: DiceDifficulty
  tier: AgentTier
  isRevealed: boolean
  onBodyReady: (body: RapierRigidBody, index: number) => void
}

// ---------------------------------------------------------------------------
// Canvas texture factory
// ---------------------------------------------------------------------------

function createFaceTexture(isDragon: boolean, tier: AgentTier): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const borderColor = AGENT_TIER_COLORS[tier]

  // Background
  ctx.fillStyle = isDragon ? '#1a0d00' : '#0a0a18'
  ctx.fillRect(0, 0, size, size)

  // Rounded-rect border
  const pad = 10, r = 20
  ctx.beginPath()
  ctx.moveTo(pad + r, pad)
  ctx.lineTo(size - pad - r, pad)
  ctx.arcTo(size - pad, pad, size - pad, pad + r, r)
  ctx.lineTo(size - pad, size - pad - r)
  ctx.arcTo(size - pad, size - pad, size - pad - r, size - pad, r)
  ctx.lineTo(pad + r, size - pad)
  ctx.arcTo(pad, size - pad, pad, size - pad - r, r)
  ctx.lineTo(pad, pad + r)
  ctx.arcTo(pad, pad, pad + r, pad, r)
  ctx.closePath()
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 10
  ctx.stroke()
  ctx.globalAlpha = 0.3
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.globalAlpha = 1

  // Symbol
  if (isDragon) {
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 14
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 130px serif'
  } else {
    ctx.fillStyle = '#4a4d6e'
    ctx.font = 'bold 110px serif'
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(isDragon ? '龍' : '雲', size / 2, size / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  return tex
}

// ---------------------------------------------------------------------------
// Launch helpers
// ---------------------------------------------------------------------------

function getLaunchState(index: number, total: number) {
  const spread = Math.min(total - 1, 6) * 0.85
  const normalised = total > 1 ? index / (total - 1) : 0.5
  const x = (normalised - 0.5) * spread + (Math.random() - 0.5) * 0.4
  const y = 4.5 + Math.random() * 1.5
  const z = (Math.random() - 0.5) * 1.2

  const position: [number, number, number] = [x, y, z]
  const linvel = {
    x: (Math.random() - 0.5) * 3.5,
    y: -5 - Math.random() * 3,
    z: (Math.random() - 0.5) * 2.5,
  }
  const angvel = {
    x: (Math.random() - 0.5) * 22,
    y: (Math.random() - 0.5) * 22,
    z: (Math.random() - 0.5) * 22,
  }
  return { position, linvel, angvel }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DieMesh({ index, total, difficulty, tier, isRevealed, onBodyReady }: DieMeshProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const meshRef      = useRef<THREE.Mesh>(null)

  // Which face index (0-5) settled upward — null until physics reveal
  const revealedAsDragon = useRef<boolean | null>(null)

  const { position, linvel, angvel } = useMemo(
    () => getLaunchState(index, total),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Build 6 distinct face textures based on difficulty dragon-face set
  const textures = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const isDragon = DRAGON_FACE_INDICES[difficulty].has(i)
      return createFaceTexture(isDragon, tier)
    })
  }, [difficulty, tier])

  // Apply launch impulse and register with parent on mount
  useEffect(() => {
    const body = rigidBodyRef.current
    if (!body) return
    body.setLinvel(linvel, true)
    body.setAngvel(angvel, true)
    onBodyReady(body, index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dispose textures on unmount
  useEffect(() => {
    return () => { textures.forEach(t => t.dispose()) }
  }, [textures])

  // When physics settles and parent flips isRevealed, read this die's own rotation
  // to determine whether the top face is a dragon or cloud.
  useEffect(() => {
    if (!isRevealed) return
    const body = rigidBodyRef.current
    if (!body) return
    const rot = body.rotation()
    const topFace = getTopFaceIndex(rot)
    revealedAsDragon.current = isFaceDragon(topFace, difficulty)
  }, [isRevealed, difficulty])

  // Animate emissive glow on all 6 face materials after reveal
  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const target = isRevealed && revealedAsDragon.current === true ? 0.8 : 0
    mats.forEach((m) => {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, target, 0.06)
      }
    })
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      restitution={0.3}
      friction={0.75}
      linearDamping={0.2}
      angularDamping={0.15}
    >
      <CuboidCollider args={[HALF, HALF, HALF]} />

      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[DIE_SIZE, DIE_SIZE, DIE_SIZE]} />
        {textures.map((tex, i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={tex}
            roughness={0.5}
            metalness={0.2}
            emissive="#996600"
            emissiveIntensity={0}
          />
        ))}
      </mesh>
    </RigidBody>
  )
}
