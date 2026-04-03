import { CuboidCollider, RigidBody } from '@react-three/rapier'

/**
 * Fixed floor + four invisible containment walls.
 * The floor is a warm lacquered surface; the walls are physics-only.
 */
export function DiceSurface() {
  return (
    <>
      {/* Floor: physics collider + visual plane */}
      <RigidBody type="fixed" colliders={false} friction={0.85} restitution={0.25}>
        <CuboidCollider args={[6, 0.15, 6]} position={[0, -0.15, 0]} />
        {/* Main surface */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#1e0e06" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Border ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <ringGeometry args={[4.8, 5.5, 4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.4} metalness={0.5} />
        </mesh>
      </RigidBody>

      {/* Containment walls (physics only, invisible) */}
      <RigidBody type="fixed" colliders={false} restitution={0.45}>
        <CuboidCollider args={[6.5, 3, 0.25]} position={[0, 3, -6.5]} />
        <CuboidCollider args={[6.5, 3, 0.25]} position={[0, 3, 6.5]} />
        <CuboidCollider args={[0.25, 3, 6.5]} position={[-6.5, 3, 0]} />
        <CuboidCollider args={[0.25, 3, 6.5]} position={[6.5, 3, 0]} />
      </RigidBody>
    </>
  )
}
