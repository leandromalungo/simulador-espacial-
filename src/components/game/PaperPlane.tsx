import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { PlaneFlightPhysics } from '../../lib/game-physics';
import { inputCoordinator } from '../../lib/controls';

interface PaperPlaneProps {
  onPositionUpdate?: (pos: THREE.Vector3) => void;
}

export const PaperPlane: React.FC<PaperPlaneProps> = ({ onPositionUpdate }) => {
  const groupRef = useRef<THREE.Group>(null);
  const physicsRef = useRef<PlaneFlightPhysics>(new PlaneFlightPhysics());
  const trailLeftRef = useRef<THREE.Points>(null);
  const trailRightRef = useRef<THREE.Points>(null);

  // Materials with papercraft tactile look
  const paperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#fdfbf7', // Crisp origami paper cream
      roughness: 0.88,
      metalness: 0.04,
      flatShading: true,
      side: THREE.DoubleSide,
    });
  }, []);

  const paperAccentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e0f2fe', // Subtle blue paper fold tint
      roughness: 0.82,
      metalness: 0.08,
      flatShading: true,
      side: THREE.DoubleSide,
    });
  }, []);

  const paperCreaseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0284c7', // Sky blue crease strip
      roughness: 0.7,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);

  // Construct folded paper plane geometry
  // Classic dart / Concorde style origami plane with 3D depth and dihedral angle
  const { leftWingGeo, rightWingGeo, bodyKeelGeo, spineGeo, wingletsGeo } = useMemo(() => {
    // Left Wing
    const leftWing = new THREE.BufferGeometry();
    const lVerts = new Float32Array([
      // Triangle 1: Nose to left wingtip to mid fold
      0.0, 0.0, -1.8,     // Nose (apex)
      -1.7, 0.2, 1.2,     // Left wingtip
      0.0, -0.15, 1.1,    // Fuselage rear

      // Triangle 2: Inner wing underfold
      0.0, 0.0, -1.8,
      0.0, -0.15, 1.1,
      -0.6, 0.12, 1.15,
    ]);
    leftWing.setAttribute('position', new THREE.BufferAttribute(lVerts, 3));
    leftWing.computeVertexNormals();

    // Right Wing
    const rightWing = new THREE.BufferGeometry();
    const rVerts = new Float32Array([
      // Triangle 1: Nose to right wingtip to mid fold
      0.0, 0.0, -1.8,     // Nose
      0.0, -0.15, 1.1,    // Fuselage rear
      1.7, 0.2, 1.2,      // Right wingtip

      // Triangle 2: Inner wing underfold
      0.0, 0.0, -1.8,
      0.6, 0.12, 1.15,
      0.0, -0.15, 1.1,
    ]);
    rightWing.setAttribute('position', new THREE.BufferAttribute(rVerts, 3));
    rightWing.computeVertexNormals();

    // Underside Keel (Paper fold grip)
    const keel = new THREE.BufferGeometry();
    const kVerts = new Float32Array([
      0.0, 0.0, -1.8,
      0.0, -0.45, 0.8,
      0.0, -0.15, 1.1,

      0.0, 0.0, -1.8,
      0.0, -0.15, 1.1,
      0.0, -0.45, 0.8,
    ]);
    keel.setAttribute('position', new THREE.BufferAttribute(kVerts, 3));
    keel.computeVertexNormals();

    // Spine ridge strip
    const spine = new THREE.BoxGeometry(0.04, 0.04, 2.9);

    // Turned-up wingtips (winglets)
    const winglets = new THREE.BufferGeometry();
    const wVerts = new Float32Array([
      // Left winglet
      -1.7, 0.2, 1.2,
      -1.7, 0.55, 1.15,
      -1.4, 0.18, 0.4,

      // Right winglet
      1.7, 0.2, 1.2,
      1.4, 0.18, 0.4,
      1.7, 0.55, 1.15,
    ]);
    winglets.setAttribute('position', new THREE.BufferAttribute(wVerts, 3));
    winglets.computeVertexNormals();

    return {
      leftWingGeo: leftWing,
      rightWingGeo: rightWing,
      bodyKeelGeo: keel,
      spineGeo: spine,
      wingletsGeo: winglets,
    };
  }, []);

  // Wingtip vapor trails particle geometry
  const trailParticlesGeo = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = i * 0.18;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const trailMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#38bdf8',
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const store = useGameStore.getState();

    // Only update movement if playing and not paused, or in menu demo mode
    if (store.isPaused) return;

    let targetNormX = 0;
    let targetNormY = 0;

    if (store.controlMode === 'hands' && store.handPosition.detected) {
      targetNormX = store.handPosition.x;
      targetNormY = store.handPosition.y;
    } else if (store.controlMode === 'touch') {
      const touch = inputCoordinator.getTouchInput();
      targetNormX = touch.x;
      targetNormY = touch.y;
    } else {
      // Keyboard input
      const kb = inputCoordinator.getKeyboardInput();
      targetNormX = kb.x;
      targetNormY = kb.y;
    }

    // In menu/loading, do a gentle circular glide
    if (store.gameStatus === 'menu' || store.gameStatus === 'loading') {
      const t = performance.now() * 0.001;
      targetNormX = Math.sin(t * 0.8) * 0.45;
      targetNormY = Math.cos(t * 1.2) * 0.25;
    }

    physicsRef.current.setNormalizedInput(targetNormX, targetNormY);
    const flightState = physicsRef.current.update(delta, store.specialAbilityActive);

    // Apply to group
    groupRef.current.position.copy(flightState.position);
    groupRef.current.rotation.copy(flightState.rotation);

    if (onPositionUpdate) {
      onPositionUpdate(groupRef.current.position);
    }

    // Dynamic wingtip trail opacity based on speed / boost
    if (trailMaterial) {
      trailMaterial.opacity = store.specialAbilityActive ? 0.9 : 0.35;
      trailMaterial.color.set(store.specialAbilityActive ? '#f59e0b' : '#38bdf8');
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Left Wing */}
      <mesh geometry={leftWingGeo} material={paperMaterial} castShadow receiveShadow />

      {/* Right Wing */}
      <mesh geometry={rightWingGeo} material={paperMaterial} castShadow receiveShadow />

      {/* Folded Spine Trim */}
      <mesh geometry={spineGeo} material={paperCreaseMaterial} position={[0, 0.01, -0.3]} />

      {/* Underside Keel */}
      <mesh geometry={bodyKeelGeo} material={paperAccentMaterial} castShadow />

      {/* Winglets (Upturned tips) */}
      <mesh geometry={wingletsGeo} material={paperCreaseMaterial} />

      {/* Wingtip trailing streamers */}
      <points ref={trailLeftRef} geometry={trailParticlesGeo} material={trailMaterial} position={[-1.7, 0.22, 1.2]} />
      <points ref={trailRightRef} geometry={trailParticlesGeo} material={trailMaterial} position={[1.7, 0.22, 1.2]} />
    </group>
  );
};
