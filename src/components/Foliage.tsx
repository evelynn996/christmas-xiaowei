import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateFoliagePositions } from '../utils/math'
import { foliageVertexShader, foliageFragmentShader } from '../shaders/foliage'

const PARTICLE_COUNT = 3000

interface FoliageProps {
  mixRef: { current: number }
}

export function Foliage({ mixRef }: FoliageProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  const { scatterPositions, treePositions, randoms, sizes } = useMemo(
    () => generateFoliagePositions(PARTICLE_COUNT),
    []
  )

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(treePositions, 3))
    geo.setAttribute('aScatterPos', new THREE.BufferAttribute(scatterPositions, 3))
    geo.setAttribute('aTreePos', new THREE.BufferAttribute(treePositions, 3))
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [scatterPositions, treePositions, randoms, sizes])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime
      shaderRef.current.uniforms.uMix.value = mixRef.current
    }
  })

  return (
    <points geometry={geometry} renderOrder={0}>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
