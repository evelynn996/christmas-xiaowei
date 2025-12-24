import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Preload, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { CineonToneMapping, Vector2 } from 'three'
import { Scene } from './components/Scene'
import { ChristmasTree } from './components/ChristmasTree'
import { Background } from './components/Background'
import { Overlay } from './components/Overlay'
import { GreetingOverlay } from './components/GreetingOverlay'
import { NameInputOverlay } from './components/NameInputOverlay'
import { Snow } from './components/Snow'
import { ResponsiveCamera } from './components/ResponsiveCamera'
import { LoadingScreen } from './components/LoadingScreen'
import { ThreeBoot } from './components/ThreeBoot'

export default function App() {
  const [isTreeShape, setIsTreeShape] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [threeReady, setThreeReady] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  const { progress } = useProgress()

  const [isFromUrl, setIsFromUrl] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 1. Check for Admin Mode
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    if (mode === 'admin') {
      setIsAdmin(true)
    }

    // 2. Try to get name from Path (e.g. domain.com/Base64Code)
    const path = window.location.pathname.slice(1) // remove leading '/'
    if (path && !path.includes('/') && !path.includes('.')) {
      try {
        // Double decode process: Base64 -> URI Component
        const decodedName = decodeURIComponent(escape(window.atob(path)))
        if (decodedName) {
            setRecipientName(decodedName)
            setIsFromUrl(true)
            return // Stop if found in path
        }
      } catch (e) {
        // Is not base64 or valid, ignore and try query params
        console.log('Path is not a valid base64 name')
      }
    }

    // 3. Fallback: Check 'to' parameter (Legacy support)
    const nameFromUrl = params.get('to')
    if (nameFromUrl) {
      // Try base64 first for 'to' param as well
      try {
          const decodedName = decodeURIComponent(escape(window.atob(nameFromUrl)))
          setRecipientName(decodedName)
      } catch {
          // Fallback to plain text
          setRecipientName(nameFromUrl)
      }
      setIsFromUrl(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => !cancelled && setFontsReady(true), 5000)

    Promise.all([
      document.fonts.load('300 16px "Noto Serif SC"'),
      document.fonts.load('700 16px "Dancing Script"'),
    ]).then(() => {
      if (!cancelled) setFontsReady(true)
    })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (fontsReady && threeReady) {
      const timer = setTimeout(() => setShowContent(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [fontsReady, threeReady])

  const isLoading = !showContent

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLoading) return
    pointerRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isLoading || !recipientName) return
    const dist = Math.hypot(
      e.clientX - pointerRef.current.x,
      e.clientY - pointerRef.current.y
    )
    if (dist < 5) setIsTreeShape((prev) => !prev)
  }

  const handleNameSubmit = useCallback((name: string) => {
    setRecipientName(name)
  }, [])

  const handleBack = useCallback(() => {
    setRecipientName(null)
    setIsTreeShape(false)
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 4, 18], [])
  const orbitTarget = useMemo<[number, number, number]>(() => [0, 4, 0], [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        gl={{
          toneMapping: CineonToneMapping,
          toneMappingExposure: 1.2,
          antialias: true,
        }}
        style={{ background: '#050a14' }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        <ResponsiveCamera />
        <OrbitControls
          makeDefault
          target={orbitTarget}
          minDistance={10}
          maxDistance={25}
          enablePan={true}
          screenSpacePanning={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />

        <Suspense fallback={null}>
          <Scene />
          <Background />
          <Snow />
          <ChristmasTree isTreeShape={isTreeShape} />

          <EffectComposer multisampling={8}>
            <Bloom
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
              intensity={1.5}
              radius={0.8}
              mipmapBlur
            />
            <Bloom
              luminanceThreshold={1.0}
              intensity={0.6}
              radius={1.2}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.0015, 0.0015)}
              radialModulation={true}
              modulationOffset={0.5}
            />
            <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
            <Vignette offset={0.15} darkness={0.85} />
          </EffectComposer>

          <ThreeBoot onReady={() => setThreeReady(true)} />
          <Preload all />
        </Suspense>
      </Canvas>

      <LoadingScreen visible={isLoading} progress={progress} />
      <NameInputOverlay show={!isLoading && !recipientName && isAdmin} onSubmit={handleNameSubmit} />
      {recipientName && (
        <>
          <GreetingOverlay show={!isTreeShape && !isLoading} name={recipientName} />
          {!isLoading && <Overlay isTreeShape={isTreeShape} />}
          {!isLoading && !isFromUrl && (
            <div
              style={{
                position: 'fixed',
                bottom: '40px',
                left: '20px',
                zIndex: 100,
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                }}
              >
                Back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
