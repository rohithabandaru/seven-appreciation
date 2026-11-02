'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

interface FloatingHeartProps {
  mousePos: { normalizedX: number; normalizedY: number };
  scale?: number;
  burstTrigger?: number;
  position?: [number, number, number];
}

export default function FloatingHeart({
  mousePos,
  scale = 0.9,
  burstTrigger = 0,
  position = [0.92, 0.46, 0], // Shifted higher & further right for zero headline lobe overlap
}: FloatingHeartProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const lowerFillRef = useRef<THREE.PointLight>(null);
  const idleRotY = useRef(0);

  // High-precision smooth heart geometry with beveled curved edges to catch lighting
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
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.2,
      bevelThickness: 0.2,
      curveSegments: 20,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Premium High-Gloss Candy-Glass MeshPhysicalMaterial — bright pink/magenta in both light & dark modes
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FF1A6C'), // Deep hot pink base
      emissive: new THREE.Color('#FF0066'), // Vivid magenta emissive — drives the pink glow
      emissiveIntensity: 1.2, // Very strong self-illumination to force pink in dark mode
      roughness: 0.18, // Slightly rougher = less mirror reflection = more diffuse pink
      metalness: 0.0, // Zero metalness: metalness tints reflections grey
      clearcoat: 0.5, // Reduced clearcoat: less white mirror sheen
      clearcoatRoughness: 0.1,
      sheen: 1.0,
      sheenColor: new THREE.Color('#FF69B4'), // Hot pink sheen
      transmission: 0.0, // Zero transmission: fully opaque candy
      thickness: 0.0,
      ior: 1.5,
      specularIntensity: 0.5, // Low specular: less white highlight competing with pink
      attenuationColor: new THREE.Color('#FF1493'),
      attenuationDistance: 2.0,
    });
    mat.envMapIntensity = 0.8; // Low env reflection so pink color dominates over white reflections
    return mat;
  }, []);

  // Burst bounce reaction ref
  const burstScale = useRef(1);
  const lastTrigger = useRef(burstTrigger);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Detect user click to trigger immediate heart burst bounce
    if (burstTrigger !== lastTrigger.current) {
      lastTrigger.current = burstTrigger;
      burstScale.current = 1.35;
    }

    // Decay burst bounce smoothly back to 1.0
    burstScale.current = THREE.MathUtils.lerp(burstScale.current, 1, delta * 7);

    const t = state.clock.getElapsedTime();

    // 1. Slow, continuous Y-axis rotation
    idleRotY.current += delta * 0.32;

    // 2. Subtle mouse parallax: heart gently tilts toward the cursor
    const targetTiltX = -mousePos.normalizedY * 0.26;
    const targetTiltY = idleRotY.current + mousePos.normalizedX * 0.36;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetTiltX, delta * 4);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetTiltY, delta * 4);

    // 3. Heartbeat pulse: double-pulse (lub-dub) scale 1 -> 1.06 -> 1 with easing
    const cycle = (t * 1.15) % 1; // ~70 bpm
    let pulse = 0;
    if (cycle < 0.14) {
      pulse = Math.sin((cycle / 0.14) * Math.PI) * 0.06;
    } else if (cycle >= 0.18 && cycle < 0.32) {
      pulse = Math.sin(((cycle - 0.18) / 0.14) * Math.PI) * 0.038;
    }

    const finalScale = scale * (1 + pulse) * burstScale.current;
    meshRef.current.scale.set(finalScale, finalScale, finalScale);

    // Pulse core point light along with heartbeat
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 4.5 + pulse * 18 + (burstScale.current - 1) * 10;
    }
  });

  return (
    <group position={position}>
      {/* Gentle Floating (bob and tilt) from @react-three/drei */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.32}
        floatingRange={[-0.05, 0.05]}
      >
        {/* Core Internal Luminescence — hot magenta glow */}
        <pointLight
          ref={coreLightRef}
          color="#FF1493"
          intensity={4.5}
          distance={6}
          decay={2}
        />

        {/* Lower taper fill light: brightens the bottom tip so it stays visible & soft */}
        <pointLight
          ref={lowerFillRef}
          position={[0, -0.65, 0.7]}
          color="#FF69B4"
          intensity={4.0}
          distance={3.8}
          decay={1.6}
        />

        {/* Soft pink outer glow halo behind the heart */}
        <pointLight
          position={[0, 0, -0.6]}
          color="#FF6EB4"
          intensity={5.0}
          distance={5.5}
          decay={1.5}
        />

        <mesh
          ref={meshRef}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
      </Float>
    </group>
  );
}
