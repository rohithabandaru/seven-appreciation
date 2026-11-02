'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MiniHeart({ mousePos }: { mousePos: { normalizedX: number; normalizedY: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const idleRotY = useRef(0);

  // Beveled curved heart geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.4);
    shape.bezierCurveTo(0, 0.4, -0.06, 0.9, -0.52, 0.9);
    shape.bezierCurveTo(-1.02, 0.9, -1.02, 0.22, -1.02, 0.22);
    shape.bezierCurveTo(-1.02, -0.22, -0.62, -0.62, 0, -1.15);
    shape.bezierCurveTo(0.62, -0.62, 1.02, -0.22, 1.02, 0.22);
    shape.bezierCurveTo(1.02, 0.22, 1.02, 0.9, 0.52, 0.9);
    shape.bezierCurveTo(0.06, 0.9, 0, 0.4, 0, 0.4);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 18,
      steps: 1,
      bevelSize: 0.2,
      bevelThickness: 0.2,
      curveSegments: 36,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Hot glossy candy-pink material that stays vivid in both light & dark modes
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FF1A6C'),
      emissive: new THREE.Color('#FF0066'),
      emissiveIntensity: 1.05,
      roughness: 0.14,
      metalness: 0.0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.06,
      sheen: 1.0,
      sheenColor: new THREE.Color('#FF69B4'),
      ior: 1.5,
      specularIntensity: 0.6,
    });
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    idleRotY.current += delta * 0.45;
    const t = state.clock.getElapsedTime();

    // Gentle cursor parallax
    const targetTiltX = -mousePos.normalizedY * 0.25;
    const targetTiltY = idleRotY.current + mousePos.normalizedX * 0.35;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetTiltX, delta * 4);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetTiltY, delta * 4);

    // Heartbeat pulse (lub-dub)
    const cycle = (t * 1.2) % 1;
    let pulse = 0;
    if (cycle < 0.15) {
      pulse = Math.sin((cycle / 0.15) * Math.PI) * 0.07;
    } else if (cycle >= 0.18 && cycle < 0.32) {
      pulse = Math.sin(((cycle - 0.18) * Math.PI) / 0.14) * 0.04;
    }

    const currentScale = 0.95 * (1 + pulse);
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    if (coreLightRef.current) {
      coreLightRef.current.intensity = 3.5 + pulse * 12;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.35} floatingRange={[-0.05, 0.05]}>
      <pointLight ref={coreLightRef} color="#FF1493" intensity={3.5} distance={5} decay={2} />
      <pointLight position={[0, -0.6, 0.6]} color="#FFAEC9" intensity={3.0} distance={4} decay={1.8} />
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
    </Float>
  );
}

export default function DailyLove3DScene() {
  const mousePos = useMousePosition();
  const { isLowEnd } = useDeviceTier();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="w-24 h-24 mx-auto flex items-center justify-center text-5xl select-none" aria-hidden="true">
        💌
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto select-none pointer-events-none mb-1">
      {/* Background pink glow */}
      <div className="absolute inset-0 rounded-full bg-rose-500/25 dark:bg-rose-500/35 blur-2xl -z-10" />

      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: !isLowEnd, alpha: true }}
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.65} color="#FFE4E6" />
        <directionalLight position={[3, 5, 4]} intensity={2.8} color="#FFD6E0" />
        <directionalLight position={[-3, 2, -2]} intensity={4.5} color="#FF007F" />
        <directionalLight position={[0, -3, 2]} intensity={2.5} color="#FFAEC9" />
        <Environment preset="dawn" environmentIntensity={1.2} />
        <MiniHeart mousePos={mousePos} />
      </Canvas>
    </div>
  );
}

