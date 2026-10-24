import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ObstacleItem } from '../../types/game';

interface ObstaclesProps {
  obstacles: ObstacleItem[];
}

export const Obstacles: React.FC<ObstaclesProps> = ({ obstacles }) => {
  const groupRef = React.useRef<THREE.Group>(null);

  // Storm origami cloud geometry
  const cloudGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.7, 0);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Geometric paper spike / crag geometry
  const spireGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(1.2, 4.0, 5, 1);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const stormMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#475569', // Dark storm paper
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);

  const spireMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#dc2626', // Warning crimson paper accent
      emissive: '#991b1b',
      emissiveIntensity: 0.25,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.rotation.z += delta * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {obstacles.map((obs) => {
        if (obs.hit) return null;
        return (
          <group key={obs.id} position={[obs.x, obs.y, obs.z]}>
            {obs.type === 'storm_cloud' ? (
              <mesh geometry={cloudGeo} material={stormMat} castShadow />
            ) : (
              <mesh geometry={spireGeo} material={spireMat} castShadow />
            )}
          </group>
        );
      })}
    </group>
  );
};
