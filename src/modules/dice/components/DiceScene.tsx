import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import type { DiceRollConfig, DiceRollResult } from '@core/types'
import { DicePhysicsWorld } from './DicePhysicsWorld'
import type { RollPhase } from '../hooks/useDiceRoll'

interface DiceSceneProps {
  config: DiceRollConfig | null
  phase: RollPhase
  onPhysicsSettled: (result: DiceRollResult) => void
  /** Key so the physics world fully remounts on each roll. */
  rollId: number
  /** Golden dice spent post-result — added live without remounting the world. */
  goldenDiceSpent: number
}

/**
 * Three.js canvas for the dice rolling scene.
 * Lights + camera live here; physics world is nested inside.
 */
export function DiceScene({ config, phase, onPhysicsSettled, rollId, goldenDiceSpent }: DiceSceneProps) {
  const isActive = phase !== 'idle' && config !== null

  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 9], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      {/* Scene background color */}
      <color attach="background" args={['#120901']} />

      {/* Lighting */}
      <ambientLight intensity={0.45} color="#fff5e0" />

      {/* Main key light — upper right, casts shadows */}
      <directionalLight
        position={[6, 10, 5]}
        intensity={1.4}
        color="#fff8e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Fill light — upper left, no shadow */}
      <directionalLight position={[-4, 6, -2]} intensity={0.4} color="#c8d4ff" />

      {/* Dramatic rim light from behind */}
      <pointLight position={[0, 8, -6]} intensity={0.5} color="#ff9922" distance={20} decay={2} />

      {/* Physics world — keyed per rollId so it fully remounts each roll */}
      <Suspense fallback={null}>
        {isActive && (
          <DicePhysicsWorld
            key={rollId}
            config={config!}
            isRevealed={phase === 'revealed'}
            onSettled={onPhysicsSettled}
            goldenDiceSpent={goldenDiceSpent}
          />
        )}
      </Suspense>

      {/* Environment for reflections */}
      <Environment preset="night" />
    </Canvas>
  )
}
