import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloorProps {
  mixRef: { current: number }
}

export function Floor({ mixRef }: FloorProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Soft gradient background (Pinkish purple glow)
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, 'rgba(255, 182, 193, 0.25)') // Center soft pink
    gradient.addColorStop(0.4, 'rgba(160, 210, 235, 0.1)') // Mid soft blue
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)') // Edge transparent
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      // Scale slightly with the mix for a dynamic feel
      meshRef.current.scale.setScalar(1 + mixRef.current * 0.1)
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <circleGeometry args={[12, 64]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </mesh>
  )
}
