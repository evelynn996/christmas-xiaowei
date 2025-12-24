import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { Foliage } from './Foliage'
import { Ornaments } from './Ornaments'
import { Floor } from './Floor'
import { FireflyRiver } from './FireflyRiver'

interface ChristmasTreeProps {
  isTreeShape: boolean
}

export function ChristmasTree({ isTreeShape }: ChristmasTreeProps) {
  const mixRef = useRef({ current: 0 })

  useFrame((_, delta) => {
    const target = isTreeShape ? 1 : 0
    // Scatter faster (0.5s) than assemble (1.0s)
    const smoothTime = isTreeShape ? 1.0 : 0.5
    easing.damp(mixRef.current, 'current', target, smoothTime, delta)
  })

  return (
    <group>
      <Foliage mixRef={mixRef.current} />
      <Ornaments mixRef={mixRef.current} />
      <Floor mixRef={mixRef.current} />
      <FireflyRiver mixRef={mixRef.current} />
    </group>
  )
}
