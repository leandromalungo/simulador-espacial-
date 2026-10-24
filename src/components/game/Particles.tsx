import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../lib/game-config';

export const Particles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = -Math.random() * GAME_CONFIG.world.renderDistance;
      spd[i] = 0.8 + Math.random() * 0.8;
    }

    return { positions: pos, speeds: spd };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#e0f2fe',
      size: 0.16,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const store = useGameStore.getState();
    if (store.isPaused) return;

    const baseSpeed = store.isPlaying
      ? store.speed * (store.specialAbilityActive ? GAME_CONFIG.speed.boostMultiplier * 1.5 : 1.0)
      : 8.0;

    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 2] += baseSpeed * delta * speeds[i];

      // Recycle to horizon when behind player
      if (array[i * 3 + 2] > GAME_CONFIG.world.recycleThresholdZ) {
        array[i * 3 + 2] = -GAME_CONFIG.world.renderDistance;
        array[i * 3] = (Math.random() - 0.5) * 35;
        array[i * 3 + 1] = (Math.random() - 0.5) * 20;
      }
    }

    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};
