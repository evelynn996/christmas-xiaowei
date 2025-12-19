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

    // Gradient background
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, 'rgba(255, 182, 193, 0.3)')
    gradient.addColorStop(0.5, 'rgba(160, 210, 235, 0.15)')
    gradient.addColorStop(1, 'rgba(75, 0, 130, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Snowflake pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = 2 + Math.random() * 4
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.opacity = mixRef.current * 0.6
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <circleGeometry args={[14, 64]} />
      <meshBasicMaterial map={texture} transparent opacity={0} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}
