import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function ResponsiveCamera() {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as any
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    if (!controls) return

    const TREE_V_EXTENT = 8.5
    const TREE_H_EXTENT = 5.0
    const fov = 50 * (Math.PI / 180)
    const aspect = size.width / size.height

    const distV = TREE_V_EXTENT / Math.tan(fov / 2)
    const distH = TREE_H_EXTENT / (Math.tan(fov / 2) * aspect)
    const finalDist = Math.max(distV, distH) * 1.2

    camera.position.z = finalDist
    camera.updateProjectionMatrix()

    controls.minDistance = finalDist * 0.4
    controls.maxDistance = finalDist * 2.5
    controls.update()
  }, [camera, controls, size])

  return null
}
