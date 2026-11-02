'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// 7 ENHYPEN Member Signature Colors
const MEMBER_COLORS = [
  { name: 'Heeseung', color: '#F59E0B', emissive: '#D97706' },
  { name: 'Jay', color: '#F97316', emissive: '#EA580C' },
  { name: 'Jake', color: '#10B981', emissive: '#059669' },
  { name: 'Sunghoon', color: '#3B82F6', emissive: '#2563EB' },
  { name: 'Sunoo', color: '#EC4899', emissive: '#DB2777' },
  { name: 'Jungwon', color: '#8B5CF6', emissive: '#7C3AED' },
  { name: 'Ni-ki', color: '#06B6D4', emissive: '#0891B2' },
];

interface BurstParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  vRotX: number;
  vRotY: number;
  scale: number;
  life: number;
  decay: number;
}

const BURST_COUNT = 24;

// 3D Instanced Hearts Fountain that erupts when user sends hearts
function HeartFountain3D({ trigger }: { trigger: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const burstParticles = useRef<BurstParticle[]>([]);
  const lastTrigger = useRef(trigger);

  // Beveled Mini Heart Geometry for bursts
  const heartGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.2);
    shape.bezierCurveTo(0, 0.2, -0.05, 0.5, -0.3, 0.5);
    shape.bezierCurveTo(-0.6, 0.5, -0.6, 0.15, -0.6, 0.15);
    shape.bezierCurveTo(-0.6, -0.1, -0.35, -0.35, 0, -0.6);
    shape.bezierCurveTo(0.35, -0.35, 0.6, -0.1, 0.6, 0.15);
    shape.bezierCurveTo(0.6, 0.15, 0.6, 0.5, 0.3, 0.5);
    shape.bezierCurveTo(0.05, 0.5, 0, 0.2, 0, 0.2);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    geom.center();
    return geom;
  }, []);

  const heartMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FF1475'),
        emissive: new THREE.Color('#FF0066'),
        emissiveIntensity: 2.2,
        roughness: 0.2,
        metalness: 0.1,
      }),
    []
  );

  useEffect(() => {
    if (trigger === 0 || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    const newParticles: BurstParticle[] = [];
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = (i / BURST_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 2.2;
      newParticles.push({
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.3,
        vx: Math.cos(angle) * (speed * 0.6),
        vy: 1.6 + Math.random() * 2.2, // Upward fountain propulsion
        vz: Math.sin(angle) * (speed * 0.5),
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 9,
        vRotY: (Math.random() - 0.5) * 9,
        scale: 0.12 + Math.random() * 0.12,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.45,
      });
    }
    burstParticles.current = newParticles;
  }, [trigger]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const list = burstParticles.current;

    for (let i = 0; i < BURST_COUNT; i++) {
      const p = list[i];
      if (!p || p.life <= 0) {
        dummy.position.set(0, -999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      p.life = Math.max(0, p.life - p.decay * delta);
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 1.8 * delta; // gravity
      p.rotX += p.vRotX * delta;
      p.rotY += p.vRotY * delta;

      const s = p.scale * Math.sin(p.life * Math.PI);
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[heartGeom, heartMat, BURST_COUNT]}
      frustumCulled={false}
    />
  );
}

// 7 Orbiting Member Signature Stars / Spheres
function OrbitingMemberStars() {
  const groupRef = useRef<THREE.Group>(null);
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.12, 18, 18), []);

  const materials = useMemo(
    () =>
      MEMBER_COLORS.map(
        (m) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(m.color),
            emissive: new THREE.Color(m.emissive),
            emissiveIntensity: 2.8,
            roughness: 0.15,
            metalness: 0.1,
          })
      ),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.45;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {MEMBER_COLORS.map((m, idx) => {
        const angle = (idx / 7) * Math.PI * 2;
        const radius = 2.15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * 2) * 0.35;

        return (
          <mesh
            key={m.name}
            geometry={sphereGeom}
            material={materials[idx]}
            position={[x, y, z]}
          >
            <pointLight
              color={m.color}
              intensity={0.8}
              distance={1.6}
              decay={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Interactive Central Live Heart Beacon
function MainLiveHeart({
  mousePos,
  burstTrigger,
  isDragging,
  dragRotation,
}: {
  mousePos: { normalizedX: number; normalizedY: number };
  burstTrigger: number;
  isDragging: boolean;
  dragRotation: { x: number; y: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const idleRotY = useRef(0);
  const burstPulse = useRef(0);

  useEffect(() => {
    if (burstTrigger > 0) {
      burstPulse.current = 1.0;
    }
  }, [burstTrigger]);

  // High-fidelity beveled curved 3D Heart Geometry
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
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.2,
      bevelThickness: 0.2,
      curveSegments: 18,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Candy glossy pink material with intense neon luster
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FF1475'),
      emissive: new THREE.Color('#FF0055'),
      emissiveIntensity: 1.25,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 0.65,
      clearcoatRoughness: 0.06,
      sheen: 1.0,
      sheenColor: new THREE.Color('#FFA6D5'),
      ior: 1.52,
      specularIntensity: 0.8,
    });
  }, []);

  // Holographic Broadcast Rings
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(1.7, 0.024, 16, 72), []);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FB7185'),
        emissive: new THREE.Color('#F43F5E'),
        emissiveIntensity: 2.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.75,
      }),
    []
  );

  const ring2Geometry = useMemo(() => new THREE.TorusGeometry(1.4, 0.018, 16, 72), []);
  const ring2Material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FDA4AF'),
        emissive: new THREE.Color('#FB7185'),
        emissiveIntensity: 2.0,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    idleRotY.current += delta * 0.55;
    const t = state.clock.getElapsedTime();

    if (burstPulse.current > 0) {
      burstPulse.current = Math.max(0, burstPulse.current - delta * 2.5);
    }

    // Blend mouse parallax & user drag
    const targetTiltX = isDragging
      ? dragRotation.x
      : -mousePos.normalizedY * 0.35 + dragRotation.x * 0.4;
    const targetTiltY = isDragging
      ? dragRotation.y
      : idleRotY.current + mousePos.normalizedX * 0.45 + dragRotation.y * 0.4;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetTiltX,
      delta * 5
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetTiltY,
      delta * 5
    );

    // Heartbeat pulse rhythm
    const cycle = (t * 1.4) % 1;
    let pulse = 0;
    if (cycle < 0.15) {
      pulse = Math.sin((cycle / 0.15) * Math.PI) * 0.09;
    } else if (cycle >= 0.19 && cycle < 0.34) {
      pulse = Math.sin(((cycle - 0.19) * Math.PI) / 0.15) * 0.05;
    }

    const extraScale = burstPulse.current * 0.35;
    const currentScale = 0.92 * (1 + pulse + extraScale);
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Rotating broadcast rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.9) * 0.14;
      ring1Ref.current.rotation.y = t * 0.75;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI * 0.58 + Math.cos(t * 0.8) * 0.14;
      ring2Ref.current.rotation.y = -t * 0.6;
    }

    if (coreLightRef.current) {
      coreLightRef.current.intensity = 4.0 + pulse * 14 + burstPulse.current * 22;
    }
  });

  return (
    <Float
      speed={2.2}
      rotationIntensity={0.25}
      floatIntensity={0.35}
      floatingRange={[-0.08, 0.08]}
    >
      <pointLight ref={coreLightRef} color="#FF0066" intensity={4.0} distance={7} decay={2} />
      <pointLight position={[0, -1.0, 1.0]} color="#FFB6C1" intensity={3.5} distance={6} decay={1.8} />
      <pointLight position={[2.0, 1.5, -1.2]} color="#F472B6" intensity={2.5} distance={5} decay={2} />

      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />

      <mesh ref={ring1Ref} geometry={ringGeometry} material={ringMaterial} />
      <mesh ref={ring2Ref} geometry={ring2Geometry} material={ring2Material} />
    </Float>
  );
}

// 3D Stadium Concert Spotlights
function StadiumSpotlights() {
  const light1 = useRef<THREE.SpotLight>(null);
  const light2 = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.8) * 4;
      light1.current.position.y = 4 + Math.cos(t * 0.6) * 0.8;
    }
    if (light2.current) {
      light2.current.position.x = -Math.sin(t * 0.7) * 4;
      light2.current.position.y = 4 + Math.sin(t * 0.5) * 0.8;
    }
  });

  return (
    <>
      <spotLight
        ref={light1}
        position={[3, 4, 3]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.8}
        color="#FDA4AF"
        distance={12}
      />
      <spotLight
        ref={light2}
        position={[-3, 4, 3]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.4}
        color="#F472B6"
        distance={12}
      />
    </>
  );
}

// Floating 3D Sparkle Dust Field
function SparkleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 42;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color('#FF4D8D'),
      new THREE.Color('#F472B6'),
      new THREE.Color('#FBBF24'),
      new THREE.Color('#A855F7'),
      new THREE.Color('#38BDF8'),
      new THREE.Color('#34D399'),
    ];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.09;
    pointsRef.current.rotation.x += delta * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface LiveLounge3DSceneProps {
  burstTrigger?: number;
}

export default function LiveLounge3DScene({ burstTrigger = 0 }: LiveLounge3DSceneProps) {
  const mousePos = useMousePosition();
  const { isLowEnd } = useDeviceTier();
  const prefersReducedMotion = useReducedMotion();

  // Mouse drag state for interactive 360 rotation
  const [isDragging, setIsDragging] = useState(false);
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - startPos.current.x) * 0.008;
    const dy = (e.clientY - startPos.current.y) * 0.008;
    setDragRotation((prev) => ({ x: prev.x + dy, y: prev.y + dx }));
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full h-full min-h-[220px] sm:min-h-[260px] select-none cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      title="Drag to rotate 3D Live Beacon in 360°"
    >
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 44 }}
        dpr={isLowEnd ? [1, 1] : [1, 1.25]}
        gl={{
          antialias: !isLowEnd,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.7} color="#FFE4E6" />
        <directionalLight position={[3, 5, 3]} intensity={1.8} color="#FFF0F5" />
        <directionalLight position={[-3, -2, -2]} intensity={0.9} color="#FF69B4" />

        <StadiumSpotlights />

        <MainLiveHeart
          mousePos={prefersReducedMotion ? { normalizedX: 0, normalizedY: 0 } : mousePos}
          burstTrigger={burstTrigger}
          isDragging={isDragging}
          dragRotation={dragRotation}
        />

        <OrbitingMemberStars />

        <HeartFountain3D trigger={burstTrigger} />

        {!isLowEnd && <SparkleField />}
      </Canvas>

      {/* Subtle Hint */}
      <div className="absolute bottom-1 right-2 text-[10px] font-bold text-rose-500/70 dark:text-rose-400/60 pointer-events-none select-none tracking-wider uppercase">
        3D Interactive • Drag to Rotate
      </div>
    </div>
  );
}
