import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CollectibleItem } from '../../types/game';

interface CollectiblesProps {
  items: CollectibleItem[];
}

export const Collectibles: React.FC<CollectiblesProps> = ({ items }) => {
  const groupRef = React.useRef<THREE.Group>(null);

  // Folded paper origami diamond / star geometry
  const starGeo = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(0.7, 0);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const starCoreGeo = useMemo(() => {
    return new THREE.DodecahedronGeometry(0.35, 0);
  }, []);

  const starMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#fbbf24', // Amber gold
      emissive: '#d97706',
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.3,
      flatShading: true,
    });
  }, []);

  const coreMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#fffbeb',
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.rotation.y += delta * 2.2;
      child.rotation.x += delta * 1.1;
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((item) => {
        if (item.collected) return null;
        return (
          <group key={item.id} position={[item.x, item.y, item.z]}>
            <mesh geometry={starGeo} material={starMat} castShadow />
            <mesh geometry={starCoreGeo} material={coreMat} />
          </group>
        );
      })}
    </group>
  );
};
