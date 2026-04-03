import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const DIE_SIZE = 0.85
const HALF     = DIE_SIZE / 2

interface GoldenDieProps {
  index: number
}

/**
 * A golden die that drops physically into the scene when spent.
 * Always counts as a success — face detection not needed.
 * Pulses gently after landing.
 */
export function GoldenDie({ index }: GoldenDieProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const matRef       = useRef<THREE.MeshStandardMaterial>(null)

  // Randomise launch once per mount
  const { position, linvel, angvel } = useMemo(() => {
    const position: [number, number, number] = [
      3.2 + index * 0.4 + (Math.random() - 0.5) * 0.5,
      5.5 + Math.random() * 1.5,
      (Math.random() - 0.5) * 1.2,
    ]
    const linvel = {
      x: -1.5 - Math.random() * 1.5,
      y: -4 - Math.random() * 2,
      z: (Math.random() - 0.5) * 1.5,
    }
    const angvel = {
      x: (Math.random() - 0.5) * 18,
      y: (Math.random() - 0.5) * 18,
      z: (Math.random() - 0.5) * 18,
    }
    return { position, linvel, angvel }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const body = rigidBodyRef.current
    if (!body) return
    body.setLinvel(linvel, true)
    body.setAngvel(angvel, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state) => {
    if (!matRef.current) return
    const t = state.clock.elapsedTime * 1.8 + index * 1.1
    matRef.current.emissiveIntensity = 0.45 + Math.sin(t) * 0.2
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      restitution={0.4}
      friction={0.6}
      linearDamping={0.2}
      angularDamping={0.2}
    >
      <CuboidCollider args={[HALF, HALF, HALF]} />
      <RoundedBox args={[DIE_SIZE, DIE_SIZE, DIE_SIZE]} radius={0.1} smoothness={3} castShadow>
        <meshStandardMaterial
          ref={matRef}
          color="#ffd700"
          roughness={0.1}
          metalness={0.85}
          emissive="#ff9900"
          emissiveIntensity={0.5}
        />
      </RoundedBox>
      <pointLight color="#ffcc00" intensity={0.6} distance={2.5} decay={2} />
    </RigidBody>
  )
}
