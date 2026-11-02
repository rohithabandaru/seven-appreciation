'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HeartBurstProps {
  trigger: number;
}

interface BurstHeart {
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
  life: number; // 1 to 0
  decay: number;
}

const BURST_COUNT = 18;

export default function HeartBurst3D({ trigger }: HeartBurstProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const burstHearts = useRef<BurstHeart[]>([]);
  const lastTrigger = useRef(trigger);

  // Simple clean mini heart geometry
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.2);
    shape.bezierCurveTo(0, 0.2, -0.05, 0.5, -0.3, 0.5);
    shape.bezierCurveTo(-0.6, 0.5, -0.6, 0.15, -0.6, 0.15);
    shape.bezierCurveTo(-0.6, -0.1, -0.35, -0.35, 0, -0.6);
    shape.bezierCurveTo(0.35, -0.35, 0.6, -0.1, 0.6, 0.15);
    shape.bezierCurveTo(0.6, 0.15, 0.6, 0.5, 0.3, 0.5);
    shape.bezierCurveTo(0.05, 0.5, 0, 0.2, 0, 0.2);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    geom.center();
    return geom;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF2E93'),
      emissive: new THREE.Color('#F43F5E'),
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.1,
    });
  }, []);

  // Spawn new burst when trigger updates
  useEffect(() => {
    if (trigger === 0 || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    const newHearts: BurstHeart[] = [];
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.2;
      newHearts.push({
        x: (Math.random() - 0.5) * 0.4,
        y: -0.2 + (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.4,
        vx: Math.cos(angle) * (speed * 0.6),
        vy: 1.8 + Math.random() * 2.0, // Upward propulsion
        vz: Math.sin(angle) * (speed * 0.5),
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 8,
        vRotY: (Math.random() - 0.5) * 8,
        scale: 0.12 + Math.random() * 0.14,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.4, // decays over ~1.5 - 2s
      });
    }

    burstHearts.current = newHearts;
  }, [trigger]);

  useFrame((_, delta) => {
    if (!meshRef.current || burstHearts.current.length === 0) return;

    burstHearts.current.forEach((heart, i) => {
      heart.life = Math.max(0, heart.life - heart.decay * delta);

      // Physics update
      heart.x += heart.vx * delta;
      heart.y += heart.vy * delta;
      heart.z += heart.vz * delta;

      // Air drag & subtle gravity
      heart.vy -= 0.8 * delta;
      heart.vx *= 0.98;
      heart.vz *= 0.98;

      heart.rotX += heart.vRotX * delta;
      heart.rotY += heart.vRotY * delta;

      const currentScale = heart.scale * heart.life;

      dummy.position.set(heart.x, heart.y, heart.z);
      dummy.rotation.set(heart.rotX, heart.rotY, 0);
      dummy.scale.set(currentScale, currentScale, currentScale);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, BURST_COUNT]}
      frustumCulled={false}
    />
  );
}
