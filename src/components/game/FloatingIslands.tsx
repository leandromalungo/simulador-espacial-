import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../lib/game-config';

interface IslandData {
  pos: THREE.Vector3;
  scale: number;
  bobOffset: number;
  rotY: number;
}

export const FloatingIslands: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const islandCount = GAME_CONFIG.world.islandsCount;

  const islands = useMemo(() => {
    const list: IslandData[] = [];
    for (let i = 0; i < islandCount; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? -15 - Math.random() * 8 : 15 + Math.random() * 8;
      const y = -6 + (Math.random() - 0.5) * 8;
      const z = -(i / islandCount) * GAME_CONFIG.world.renderDistance;

      list.push({
        pos: new THREE.Vector3(x, y, z),
        scale: 1.5 + Math.random() * 1.2,
        bobOffset: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI,
      });
    }
    return list;
  }, [islandCount]);

  // Procedural geometries for island parts (3-12 parts composite model)
  const baseRockGeo = useMemo(() => new THREE.ConeGeometry(3, 4, 6, 1), []);
  const grassTopGeo = useMemo(() => new THREE.CylinderGeometry(3.2, 2.9, 0.6, 6), []);
  const treeTrunkGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.25, 1.4, 4), []);
  const treeFoliageGeo = useMemo(() => new THREE.DodecahedronGeometry(0.9, 0), []);

  const rockMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  }), []);

  const grassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#10b981', // Crisp paper emerald green
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  }), []);

  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  }), []);

  const foliageMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#34d399',
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  }), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const store = useGameStore.getState();
    if (store.isPaused) return;

    const baseSpeed = store.isPlaying
      ? store.speed * (store.specialAbilityActive ? GAME_CONFIG.speed.boostMultiplier : 1.0)
      : 8.0;

    const children = groupRef.current.children;
    const time = performance.now() * 0.001;

    for (let i = 0; i < islandCount; i++) {
      const isl = islands[i];
      const child = children[i];
      if (!child) continue;

      isl.pos.z += baseSpeed * 0.75 * delta;

      if (isl.pos.z > GAME_CONFIG.world.recycleThresholdZ + 15) {
        isl.pos.z = -GAME_CONFIG.world.renderDistance - Math.random() * 20;
      }

      // Gentle floating bob
      const bobY = Math.sin(time + isl.bobOffset) * 0.4;
      child.position.set(isl.pos.x, isl.pos.y + bobY, isl.pos.z);
    }
  });

  return (
    <group ref={groupRef}>
      {islands.map((isl, idx) => (
        <group
          key={idx}
          position={[isl.pos.x, isl.pos.y, isl.pos.z]}
          scale={[isl.scale, isl.scale, isl.scale]}
          rotation={[0, isl.rotY, 0]}
        >
          {/* Inverted rock crystal base */}
          <mesh
            geometry={baseRockGeo}
            material={rockMat}
            position={[0, -2, 0]}
            rotation={[Math.PI, 0, 0]}
            castShadow
            receiveShadow
          />
          {/* Grass plateau */}
          <mesh
            geometry={grassTopGeo}
            material={grassMat}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
          />
          {/* Stylized tree 1 */}
          <group position={[0.8, 0.7, 0.4]}>
            <mesh geometry={treeTrunkGeo} material={trunkMat} position={[0, 0.7, 0]} castShadow />
            <mesh geometry={treeFoliageGeo} material={foliageMat} position={[0, 1.8, 0]} castShadow />
          </group>
          {/* Stylized tree 2 */}
          <group position={[-1.1, 0.7, -0.6]} scale={[0.8, 0.8, 0.8]}>
            <mesh geometry={treeTrunkGeo} material={trunkMat} position={[0, 0.7, 0]} castShadow />
            <mesh geometry={treeFoliageGeo} material={foliageMat} position={[0, 1.7, 0]} castShadow />
          </group>
        </group>
      ))}
    </group>
  );
};
