import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RingItem } from '../../types/game';

interface RingsProps {
  rings: RingItem[];
}

export const Rings: React.FC<RingsProps> = ({ rings }) => {
  // Hexagonal origami paper ring
  const ringGeo = useMemo(() => {
    // Torus with 6 radial segments gives a clean folded hexagonal paper ring
    const geo = new THREE.TorusGeometry(2.2, 0.22, 6, 24);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const ringGlowGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(2.35, 0.06, 6, 24);
    return geo;
  }, []);

  const ringMatActive = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#facc15', // Vibrant origami gold
      emissive: '#eab308',
      emissiveIntensity: 0.35,
      roughness: 0.6,
      metalness: 0.2,
      flatShading: true,
    });
  }, []);

  const ringGlowMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#fef08a',
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  const ringMatPassed = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#38bdf8', // Success cyan burst
      emissive: '#0284c7',
      emissiveIntensity: 0.8,
      roughness: 0.4,
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  return (
    <group>
      {rings.map((ring) => {
        const scale = ring.passed ? (ring.scaleAnim || 1.3) : 1.0;
        return (
          <group
            key={ring.id}
            position={[ring.x, ring.y, ring.z]}
            scale={[scale, scale, scale]}
          >
            {/* Hexagonal Origami Ring Body */}
            <mesh
              geometry={ringGeo}
              material={ring.passed ? ringMatPassed : ringMatActive}
              castShadow
            />
            {/* Edge glow trim */}
            {!ring.passed && (
              <mesh geometry={ringGlowGeo} material={ringGlowMat} />
            )}
          </group>
        );
      })}
    </group>
  );
};
