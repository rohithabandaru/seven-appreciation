'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticlesProps {
  count?: number;
}

interface ParticleData {
  zone: 'left' | 'right' | 'top';
  x: number;
  y: number;
  zDepth: number;
  baseX: number;
  baseY: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  baseScale: number;
}

export default function Particles({ count = 44 }: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 64x64 sphere geometry to completely remove any faceted polygon edges on large particles
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(0.12, 64, 64);
  }, []);

  // Bright, glossy MeshPhysicalMaterial matching the pink/magenta heart palette
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FF2D6F'),
      emissive: new THREE.Color('#FF1468'),
      emissiveIntensity: 0.5,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      sheen: 1.0,
      sheenColor: new THREE.Color('#FFB6C1'),
      transmission: 0.15,
      thickness: 0.4,
      ior: 1.5,
    });
    mat.envMapIntensity = 2.5;
    return mat;
  }, []);

  // Strict perimeter distribution: ONLY left edge, right edge, and top
  // Completely clear of central text / paragraph / button box (x: [-2.5, 2.5], y: [-2.2, 1.35])
  const particles = useMemo<ParticleData[]>(() => {
    const list: ParticleData[] = [];

    for (let i = 0; i < count; i++) {
      // 3 zones: 0 -> left edge, 1 -> right edge, 2 -> top band
      const zoneType = i % 3 === 0 ? 'left' : i % 3 === 1 ? 'right' : 'top';

      // Layer depth: 0: Far (z: -3.5 to -1.8), 1: Mid (z: -1.0 to 0.8), 2: Near foreground (z: 1.4 to 3.0)
      const layer = i % 3;
      let zDepth = 0;
      let scaleLimit = 0.65;

      if (layer === 0) {
        zDepth = -3.5 + Math.random() * 1.8;
        scaleLimit = 0.55;
      } else if (layer === 1) {
        zDepth = -1.0 + Math.random() * 1.8;
        scaleLimit = 0.68;
      } else {
        zDepth = 1.4 + Math.random() * 1.6;
        scaleLimit = 0.78; // Capped max particle size on blurred near spheres
      }

      let baseX = 0;
      let baseY = 0;

      if (zoneType === 'left') {
        // Left flank outside text zone: x in [-4.8, -2.65]
        // If near layer (large blurred sphere), push even further out (x < -3.4)
        baseX = layer === 2 ? -3.4 - Math.random() * 1.6 : -2.65 - Math.random() * 2.0;
        baseY = -1.2 + Math.random() * 3.6; // Raised floor: stays above button row
      } else if (zoneType === 'right') {
        // Right flank outside text zone: x in [2.65, 4.8]
        // If near layer, push even further out (x > 3.4)
        baseX = layer === 2 ? 3.4 + Math.random() * 1.6 : 2.65 + Math.random() * 2.0;
        baseY = -1.2 + Math.random() * 3.6; // Raised floor: stays above button row
      } else {
        // Top crown zone: strictly above the highest text element (y in [1.45, 2.4])
        baseX = -3.2 + Math.random() * 6.4;
        baseY = 1.45 + Math.random() * 0.95;
      }

      const baseScale = Math.min(scaleLimit, 0.35 + Math.random() * 0.4);
      const speedY = 0.15 + Math.random() * 0.25;
      const wobbleSpeed = 0.8 + Math.random() * 1.4;
      const wobbleAmp = 0.06 + Math.random() * 0.1;

      list.push({
        zone: zoneType,
        x: baseX,
        y: baseY,
        zDepth,
        baseX,
        baseY,
        speedY,
        wobbleSpeed,
        wobbleAmp,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX: (Math.random() - 0.5) * 1.2,
        rotSpeedY: (Math.random() - 0.5) * 1.2,
        baseScale,
      });
    }

    return list;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.zDepth);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.baseScale, p.baseScale, p.baseScale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = particles[i];

      // Gentle upward drift
      p.y += p.speedY * delta;

      // Wrap boundaries per zone so they strictly stay inside their perimeter zones
      if (p.zone === 'top') {
        if (p.y > 2.5) p.y = 1.45;
      } else {
        if (p.y > 2.4) p.y = -1.2; // Reset to raised floor, not below buttons
      }

      // Gentle horizontal wave oscillation, keeping safe distance from center
      const wobble = Math.sin(t * p.wobbleSpeed + i) * p.wobbleAmp;
      let currX = p.baseX + wobble;

      // Strict enforcement: ensure particles never penetrate central corridor [-2.5, 2.5]
      if (p.zone === 'left' && currX > -2.6) currX = -2.6;
      if (p.zone === 'right' && currX < 2.6) currX = 2.6;

      p.rotX += p.rotSpeedX * delta;
      p.rotY += p.rotSpeedY * delta;

      dummy.position.set(currX, p.y, p.zDepth);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.baseScale, p.baseScale, p.baseScale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}
