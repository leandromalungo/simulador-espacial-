import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../lib/game-config';

interface CloudInstance {
  pos: THREE.Vector3;
  scale: THREE.Vector3;
  speedMultiplier: number;
}

export const Clouds: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cloudCount = GAME_CONFIG.world.cloudsCount;

  // Generate randomized cloud data
  const cloudData = useMemo(() => {
    const data: CloudInstance[] = [];
    for (let i = 0; i < cloudCount; i++) {
      const z = -Math.random() * GAME_CONFIG.world.renderDistance;
      const x = (Math.random() - 0.5) * 45;
      const y = (Math.random() - 0.3) * 22;
      const s = 1.2 + Math.random() * 2.8;

      data.push({
        pos: new THREE.Vector3(x, y, z),
        scale: new THREE.Vector3(s * 1.6, s * 0.9, s * 1.2),
        speedMultiplier: 0.7 + Math.random() * 0.5,
      });
    }
    return data;
  }, [cloudCount]);

  // Origami faceted cloud geometry
  const cloudGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.6, 0); // Flat faceted low-poly look
    geo.computeVertexNormals();
    return geo;
  }, []);

  const cloudMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.95,
      metalness: 0.02,
      flatShading: true,
      transparent: true,
      opacity: 0.88,
    });
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const store = useGameStore.getState();
    if (store.isPaused) return;

    // Movement speed
    const baseSpeed = store.isPlaying
      ? store.speed * (store.specialAbilityActive ? GAME_CONFIG.speed.boostMultiplier : 1.0)
      : 8.0;

    for (let i = 0; i < cloudCount; i++) {
      const c = cloudData[i];
      c.pos.z += baseSpeed * delta * c.speedMultiplier;

      // Recycle cloud when behind camera
      if (c.pos.z > GAME_CONFIG.world.recycleThresholdZ) {
        c.pos.z = -GAME_CONFIG.world.renderDistance - Math.random() * 20;
        c.pos.x = (Math.random() - 0.5) * 50;
        c.pos.y = (Math.random() - 0.3) * 24;
      }

      tempDummy.position.copy(c.pos);
      tempDummy.scale.copy(c.scale);
      tempDummy.rotation.y = i * 0.4;
      tempDummy.updateMatrix();

      meshRef.current.setMatrixAt(i, tempDummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[cloudGeo, cloudMat, cloudCount]}
      castShadow
      receiveShadow
    />
  );
};
