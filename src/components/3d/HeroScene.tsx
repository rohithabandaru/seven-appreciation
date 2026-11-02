'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import FloatingHeart from './FloatingHeart';
import OrbitingStars from './OrbitingStars';
import Particles from './Particles';
import HeartBurst3D from './HeartBurst3D';
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
          dpr={[1, 1.5]}
          gl={{
            antialias: !isLowEnd,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          className="w-full h-full"
        >
          {/* Pure Three.js lighting — 100% offline, zero network requests, zero CSP issues */}
          <ambientLight intensity={0.9} color="#FFE4E6" />

          {/* 1. Warm pink-tinted key light */}
          <directionalLight
            position={[4, 6, 5]}
            intensity={3.2}
            color="#FFD6E0"
          />

          {/* 2. Pink-white specular highlight aimed at upper-left lobe */}
          <directionalLight
            position={[0.0, 3.8, 3.2]}
            intensity={4.2}
            color="#FFE0EB"
          />
          <pointLight
            position={[0.6, 1.25, 0.95]}
            intensity={3.5}
            color="#FFC0CB"
            distance={3.2}
            decay={2}
          />

          {/* 3. Strong magenta/purple rim lights from behind for outer silhouette edge pop */}
          <directionalLight
            position={[-4.5, 3.0, -3.5]}
            intensity={8.5}
            color="#FF007F"
          />
          <directionalLight
            position={[4.8, 2.5, -2.8]}
            intensity={7.5}
            color="#D946EF"
          />
          {/* Additional magenta rim from below-behind for the lower tip */}
          <directionalLight
            position={[0, -3.5, -2.5]}
            intensity={4.5}
            color="#FF69B4"
          />

          {/* 4. Soft pink fill light */}
          <directionalLight
            position={[-3.0, -2.0, 2.8]}
            intensity={1.6}
            color="#FDA4AF"
          />

          {/* 5. Lower half fill light: hot pink to keep bottom tip visible */}
          <pointLight
            position={[0.92, -0.65, 0.6]}
            intensity={5.5}
            color="#FF1493"
            distance={4.5}
            decay={1.8}
          />

          {/* 6. Soft wide pink outer glow behind the heart */}
          <pointLight
            position={[0.92, 0.3, -1.5]}
            intensity={8.5}
            color="#FF6EB4"
            distance={10}
            decay={1.2}
          />
          <pointLight
            position={[0.92, -0.2, -2.5]}
            intensity={4.5}
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

          {/* Scaled and positioned for zero headline overlap */}
          <FloatingHeart
            mousePos={mousePos}
            burstTrigger={burstTrigger}
            position={[0.92, 0.46, 0]}
            scale={0.9}
          />

          {/* Seven Constellation Member Orbs: pushed strictly to the far left and right edges */}
          <OrbitingStars />

          {/* Glossy Instanced Particles */}
          <Particles count={isLowEnd || isMobile ? 18 : Math.min(particleCount, 44)} />

          {/* 3D Particle Burst upon clicking Send Love */}
          <HeartBurst3D trigger={burstTrigger} />
        </Canvas>
      </Suspense>
    </div>
  );
}
