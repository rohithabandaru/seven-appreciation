'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface MemberOrbData {
  id: string;
  name: string;
  color: string;
  side: 'left' | 'right';
  baseX: number;
  baseY: number;
  zDepth: number;
  radiusY: number;
  radiusZ: number;
  speed: number;
  offset: number;
  size: number;
}

// All 7 member constellation orbs pushed strictly to the far left and right edges
// Pink/magenta/purple palette only — no teal, green, or blue
const MEMBERS_ORBS: MemberOrbData[] = [
  // Far Left Edge Orbs
  { id: 'heeseung', name: 'Heeseung', color: '#F472B6', side: 'left',  baseX: -3.85, baseY: 0.5,  zDepth: -0.4, radiusY: 0.9, radiusZ: 1.1, speed: 0.55,  offset: 0,   size: 0.12 },
  { id: 'jay',      name: 'Jay',      color: '#E879F9', side: 'left',  baseX: -4.3,  baseY: -0.6, zDepth: 0.3,  radiusY: 0.8, radiusZ: 0.9, speed: -0.45, offset: 1.5, size: 0.11 },
  { id: 'jake',     name: 'Jake',     color: '#FB7185', side: 'left',  baseX: -3.6,  baseY: 1.2,  zDepth: 0.8,  radiusY: 0.7, radiusZ: 0.8, speed: 0.65,  offset: 3.0, size: 0.11 },
  { id: 'niki',     name: 'Ni-ki',    color: '#F59E0B', side: 'left',  baseX: -4.6,  baseY: 0.2,  zDepth: -1.0, radiusY: 1.0, radiusZ: 1.0, speed: 0.5,   offset: 4.8, size: 0.11 },

  // Far Right Edge Orbs
  { id: 'sunghoon', name: 'Sunghoon', color: '#C084FC', side: 'right', baseX: 4.1,   baseY: 0.8,  zDepth: -0.5, radiusY: 0.85, radiusZ: 1.0, speed: -0.55, offset: 0.8, size: 0.12 },
  { id: 'sunoo',    name: 'Sunoo',    color: '#EC4899', side: 'right', baseX: 3.7,   baseY: -0.7, zDepth: 0.5,  radiusY: 0.9,  radiusZ: 0.8, speed: 0.6,   offset: 2.3, size: 0.12 },
  { id: 'jungwon',  name: 'Jungwon',  color: '#A855F7', side: 'right', baseX: 4.4,   baseY: -0.1, zDepth: -0.2, radiusY: 1.1,  radiusZ: 1.2, speed: -0.45, offset: 4.0, size: 0.12 },
];

export default function OrbitingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const orbMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // 16x16 optimized sphere geometry
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);

  const materials = useMemo(() => {
    return MEMBERS_ORBS.map((orb) => {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(orb.color),
        emissive: new THREE.Color(orb.color),
        emissiveIntensity: 3.2,
        roughness: 0.12,
        metalness: 0.1,
      });
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    MEMBERS_ORBS.forEach((orb, i) => {
      const mesh = orbMeshes.current[i];
      if (!mesh) return;

      const angle = t * orb.speed + orb.offset;
      // Orbit vertically in gentle loops along their dedicated flank columns
      const y = orb.baseY + Math.sin(angle) * orb.radiusY;
      const z = orb.zDepth + Math.cos(angle) * orb.radiusZ;
      const x = orb.baseX + Math.sin(angle * 0.7) * 0.25;

      mesh.position.set(x, y, z);

      // Pulse glow scale slightly
      const pulse = 1 + Math.sin(t * 3 + orb.offset) * 0.14;
      mesh.scale.set(orb.size * pulse, orb.size * pulse, orb.size * pulse);
    });

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {MEMBERS_ORBS.map((orb, i) => (
        <group key={orb.id}>
          <mesh
            ref={(el) => {
              orbMeshes.current[i] = el;
            }}
            geometry={sphereGeometry}
            material={materials[i]}
          >
            <pointLight
              color={orb.color}
              intensity={0.7}
              distance={1.6}
              decay={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
