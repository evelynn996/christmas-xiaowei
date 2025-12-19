import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Scene() {
  const movingLightRef = useRef<THREE.SpotLight>(null)

  useFrame(({ clock }) => {
    if (movingLightRef.current) {
      const t = clock.elapsedTime
      movingLightRef.current.position.x = Math.sin(t * 0.3) * 12
      movingLightRef.current.position.z = Math.cos(t * 0.3) * 12
    }
  })

  return (
    <>
      {/* Global Ambient Fill - Prevents pitch black shadows */}
      <ambientLight intensity={0.6} color="#804080" />

      {/* Hemisphere Light - Simulates Sky (Pink) vs Ground (Purple) reflection */}
      {/* This replaces the missing Environment map for the baubles */}
      <hemisphereLight args={['#ff69b4', '#4b0082', 2]} position={[0, 50, 0]} />

      {/* Main Spotlight - Soft pink from top-right */}
      <spotLight
        position={[10, 20, 10]}
        angle={0.4}
        penumbra={1}
        intensity={12}
        color="#ffb6c1"
      />

      {/* Moving Rim Light - Adds magical edge */}
      <spotLight
        ref={movingLightRef}
        position={[-10, 10, -10]}
        angle={0.5}
        penumbra={1}
        intensity={8}
        color="#a0d2eb"
      />

      {/* Fill light - orchid purple from side */}
      <pointLight position={[-8, 5, -8]} intensity={3} color="#da70d6" />

      {/* Warm golden accent from front */}
      <pointLight position={[5, 8, 12]} intensity={4} color="#ffd700" />

      {/* Soft center glow - toned down to prevent whiteout */}
      <pointLight position={[0, 6, 0]} intensity={3} color="#ffb6c1" distance={12} decay={2} />
    </>
  )
}
