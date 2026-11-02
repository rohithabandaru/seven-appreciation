'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import FloatingHeart from './FloatingHeart';
import OrbitingStars from './OrbitingStars';
import Particles from './Particles';
import HeartBurst3D from './HeartBurst3D';
import HeroEffects from './HeroEffects';
import CanvasLoader from './CanvasLoader';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroSceneProps {
  burstTrigger?: number;
}

export default function HeroScene({ burstTrigger = 0 }: HeroSceneProps) {
  const mousePos = useMousePosition();
  const { particleCount, isLowEnd, isMobile } = useDeviceTier();
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, fallback cleanly to a static dreamy ambient background
  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-400/20 via-amber-300/15 to-purple-400/20 blur-3xl" />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          // Cap DPR at [1, 1.5] for high-DPI rendering without GPU throttling
          dpr={[1, 1.5]}
          gl={{
            antialias: !isLowEnd,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          className="w-full h-full"
        >
          {/* Dawn HDR — warm pinkish ambient without the grey of studio or brown of sunset */}
          <Environment preset="dawn" environmentIntensity={1.5} />

          {/* 1. Warm pink-tinted key light — NOT pure white */}
          <directionalLight
            position={[4, 6, 5]}
            intensity={3.0}
            color="#FFD6E0"
            castShadow
          />

          {/* 2. Pink-white specular highlight aimed at upper-left lobe */}
          <directionalLight
            position={[0.0, 3.8, 3.2]}
            intensity={4.0}
            color="#FFE0EB"
          />
          <pointLight
            position={[0.6, 1.25, 0.95]}
            intensity={3.0}
            color="#FFC0CB"
            distance={2.8}
            decay={2}
          />

          {/* 3. Strong magenta/purple rim lights from behind for outer silhouette edge pop */}
          <directionalLight
            position={[-4.5, 3.0, -3.5]}
            intensity={8.0}
            color="#FF007F"
          />
          <directionalLight
            position={[4.8, 2.5, -2.8]}
            intensity={7.0}
            color="#D946EF"
          />
          {/* Additional magenta rim from below-behind for the lower tip */}
          <directionalLight
            position={[0, -3.5, -2.5]}
            intensity={4.0}
            color="#FF69B4"
          />

          {/* 4. Soft pink fill light */}
          <directionalLight
            position={[-3.0, -2.0, 2.8]}
            intensity={1.4}
            color="#FDA4AF"
          />

          <ambientLight intensity={0.6} color="#FFB6C1" />

          {/* 5. Lower half fill light: hot pink to keep bottom tip visible */}
          <pointLight
            position={[0.92, -0.65, 0.6]}
            intensity={5.0}
            color="#FF1493"
            distance={4.0}
            decay={1.8}
          />

          {/* 6. Soft wide pink outer glow behind the heart — provides the pink halo */}
          <pointLight
            position={[0.92, 0.3, -1.5]}
            intensity={8.0}
            color="#FF6EB4"
            distance={10}
            decay={1.2}
          />
          {/* Secondary wider glow for a softer spread */}
          <pointLight
            position={[0.92, -0.2, -2.5]}
            intensity={4.0}
            color="#FF69B4"
            distance={12}
            decay={1.0}
          />

          {/* Soft grounding Contact Shadows under the heart */}
          <ContactShadows
            position={[0.92, -0.85, 0]}
            opacity={0.55}
            scale={4.2}
            blur={2.8}
            far={3}
            color="#BE123C"
          />

          {/* Scaled down and shifted up & right (0.92, 0.46) for zero headline overlap */}
          <FloatingHeart
            mousePos={mousePos}
            burstTrigger={burstTrigger}
            position={[0.92, 0.46, 0]}
            scale={0.9}
          />

          {/* Seven Constellation Member Orbs: pushed strictly to the far left and right edges */}
          <OrbitingStars />

          {/* 64x64 Instanced Glossy Particles (confined strictly to left edge, right edge, and top) */}
          <Particles count={isLowEnd || isMobile ? 18 : Math.min(particleCount, 44)} />

          {/* 3D Particle Burst upon clicking Send Love */}
          <HeartBurst3D trigger={burstTrigger} />

          {/* Post-Processing: Bloom, DepthOfField, Vignette (auto-disabled on mobile) */}
          <HeroEffects isMobile={isMobile || isLowEnd} />
        </Canvas>
      </Suspense>
    </div>
  );
}
