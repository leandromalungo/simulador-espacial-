import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../lib/game-config';

interface MountainInstance {
  pos: THREE.Vector3;
  scale: THREE.Vector3;
  rotY: number;
}

export const Mountains: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mountainCount = GAME_CONFIG.world.mountainsCount;

  const mountainData = useMemo(() => {
    const data: MountainInstance[] = [];
    for (let i = 0; i < mountainCount; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? -26 - Math.random() * 15 : 26 + Math.random() * 15;
      const z = -(i / mountainCount) * GAME_CONFIG.world.renderDistance;
      const h = 18 + Math.random() * 16;
      const r = 12 + Math.random() * 8;

      data.push({
        pos: new THREE.Vector3(x, -8, z),
        scale: new THREE.Vector3(r, h, r),
        rotY: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, [mountainCount]);

  // Folded paper cone/pyramid mountain geometry
  const mountainGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 1, 5, 2); // 5-sided pyramid with paper creases
    geo.computeVertexNormals();
    return geo;
  }, []);

  const mountainMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#334155', // Slate folded paper tones
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
  }, []);

  const tempDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const store = useGameStore.getState();
    if (store.isPaused) return;

    const baseSpeed = store.isPlaying
      ? store.speed * (store.specialAbilityActive ? GAME_CONFIG.speed.boostMultiplier : 1.0)
      : 8.0;

    // Parallax background mountain scroll (slower than foreground)
    const parallaxSpeed = baseSpeed * 0.45;

    for (let i = 0; i < mountainCount; i++) {
      const m = mountainData[i];
      m.pos.z += parallaxSpeed * delta;

      if (m.pos.z > GAME_CONFIG.world.recycleThresholdZ + 20) {
        m.pos.z = -GAME_CONFIG.world.renderDistance - Math.random() * 30;
      }

      tempDummy.position.copy(m.pos);
      tempDummy.scale.copy(m.scale);
      tempDummy.rotation.y = m.rotY;
      tempDummy.updateMatrix();

      meshRef.current.setMatrixAt(i, tempDummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[mountainGeo, mountainMat, mountainCount]}
      receiveShadow
    />
  );
};
