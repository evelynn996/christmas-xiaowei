import { useRef } from 'react'
import { useFrame, extend, type ThreeElement } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, shaderMaterial } from '@react-three/drei'

interface TreeGlowProps {
  mixRef: { current: number }
}

// Cinematic Glow Shader - Volumetric rays + Anamorphic lens flare
const CinematicGlowMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0,
    uColorCore: new THREE.Color('#ffaaee'),
    uColorMid: new THREE.Color('#cc66ff'),
    uColorOuter: new THREE.Color('#4422ff'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorOuter;

    varying vec2 vUv;

    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float angle = atan(center.y, center.x);

      // 1. Volumetric God Rays - Angular noise creating light beams
      float rays = fbm(vec2(angle * 8.0 + uTime * 0.1, dist * 2.0));
      rays = smoothstep(0.3, 0.8, rays);
      float rayMask = 1.0 - smoothstep(0.0, 0.45, dist);
      rays *= rayMask;

      // 2. Anamorphic horizontal streak (cinema lens flare)
      float streak = exp(-abs(center.y) * 25.0);
      streak *= exp(-abs(center.x) * 3.0);
      streak *= 0.6;

      // 3. Multi-layer soft core glow
      float coreInner = 1.0 - smoothstep(0.0, 0.15, dist);
      float coreMid = 1.0 - smoothstep(0.0, 0.3, dist);
      float coreOuter = 1.0 - smoothstep(0.0, 0.5, dist);

      // 4. Pulsing animation
      float pulse = 0.9 + 0.1 * sin(uTime * 2.0);

      // Color gradient: core -> mid -> outer
      vec3 color = uColorCore * coreInner * 1.5;
      color += uColorMid * (coreMid - coreInner) * 1.2;
      color += uColorOuter * (coreOuter - coreMid) * 0.8;

      // Add rays with subtle color tint
      color += mix(uColorCore, uColorMid, 0.5) * rays * 0.4;

      // Add anamorphic streak (white-ish for lens flare feel)
      color += vec3(1.0, 0.9, 0.95) * streak;

      // Chromatic aberration on edges
      float chromaOffset = dist * 0.1;
      color.r += coreOuter * chromaOffset * 0.3;
      color.b += coreOuter * chromaOffset * 0.2;

      // Final alpha with pulse
      float alpha = (coreOuter + rays * 0.3 + streak * 0.5) * pulse;
      alpha *= uOpacity * 0.5;

      gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ CinematicGlowMaterial })

type CinematicGlowMaterialElement = typeof CinematicGlowMaterial

declare module '@react-three/fiber' {
  interface ThreeElements {
    cinematicGlowMaterial: ThreeElement<CinematicGlowMaterialElement>
  }
}

export function TreeGlow({ mixRef }: TreeGlowProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uOpacity.value = mixRef.current
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <Billboard position={[0, 6, -2]}>
      <mesh>
        <planeGeometry args={[24, 24]} />
        <cinematicGlowMaterial
          ref={shaderRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  )
}
