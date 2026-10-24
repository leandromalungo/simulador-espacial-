import React, { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../lib/game-config';
import { checkCollisions } from '../../lib/collision';
import { RingItem, CollectibleItem, ObstacleItem } from '../../types/game';

import { Lighting } from './Lighting';
import { Mountains } from './Mountains';
import { Clouds } from './Clouds';
import { FloatingIslands } from './FloatingIslands';
import { Particles } from './Particles';
import { Rings } from './Rings';
import { Collectibles } from './Collectibles';
import { Obstacles } from './Obstacles';
import { PaperPlane } from './PaperPlane';

export const World: React.FC = () => {
  const store = useGameStore();

  // Track plane position
  const planePosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const planePrevPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Initialize Rings pool
  const [rings, setRings] = useState<RingItem[]>(() => {
    const list: RingItem[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: -25 - i * GAME_CONFIG.world.ringSpacing,
        radius: 2.2,
        passed: false,
        active: true,
        scaleAnim: 1.0,
      });
    }
    return list;
  });

  // Initialize Collectibles pool
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>(() => {
    const list: CollectibleItem[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 7,
        z: -15 - i * GAME_CONFIG.world.collectibleSpacing,
        collected: false,
        type: 'star',
        points: GAME_CONFIG.score.collectibleBase,
      });
    }
    return list;
  });

  // Initialize Obstacles pool
  const [obstacles, setObstacles] = useState<ObstacleItem[]>(() => {
    const list: ObstacleItem[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 6,
        z: -35 - i * GAME_CONFIG.world.obstacleSpacing,
        radius: 1.6,
        type: i % 2 === 0 ? 'storm_cloud' : 'floating_spire',
        hit: false,
        rotationSpeed: 0.5 + Math.random() * 0.5,
      });
    }
    return list;
  });

  const handlePlanePosUpdate = useCallback((pos: THREE.Vector3) => {
    planePrevPosRef.current.copy(planePosRef.current);
    planePosRef.current.copy(pos);
  }, []);

  // Frame simulation loop
  const distanceAccumulatorRef = useRef<number>(0);
  const uiThrottleRef = useRef<number>(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.isPaused) return;

    const clampedDt = Math.min(delta, 0.05);

    // Update boost ability timers
    state.updateBoostTimers(clampedDt);

    if (!state.isPlaying) return;

    // Progressive speed acceleration
    const currentSpeed = state.speed;
    const isBoosting = state.specialAbilityActive;
    const effectiveSpeed = currentSpeed * (isBoosting ? GAME_CONFIG.speed.boostMultiplier : 1.0);

    const nextSpeed = Math.min(
      currentSpeed + GAME_CONFIG.speed.accelerationRate * clampedDt,
      GAME_CONFIG.speed.max
    );

    // Distance update
    distanceAccumulatorRef.current += effectiveSpeed * clampedDt;

    // Throttle UI store updates to 10Hz to prevent React HUD re-render lag
    uiThrottleRef.current += clampedDt;
    if (uiThrottleRef.current > 0.1) {
      uiThrottleRef.current = 0;
      state.setSpeed(Number(nextSpeed.toFixed(1)));
      state.setDistance(Math.floor(distanceAccumulatorRef.current));
      // Distance score points
      state.addScore(Math.round((effectiveSpeed * 0.1 * GAME_CONFIG.score.distanceRate) / 10));
    }

    // Move rings forward towards camera (+Z)
    setRings((prev) => {
      let changed = false;
      const updated = prev.map((ring) => {
        let z = ring.z + effectiveSpeed * clampedDt;
        let passed = ring.passed;
        let scaleAnim = ring.scaleAnim || 1.0;

        if (passed) {
          scaleAnim += clampedDt * 3.5;
        }

        // Recycle ring when behind camera
        if (z > GAME_CONFIG.world.recycleThresholdZ) {
          changed = true;
          // Find furthest ring Z to maintain spacing
          let furthestZ = 0;
          for (let k = 0; k < prev.length; k++) {
            if (prev[k].z < furthestZ) furthestZ = prev[k].z;
          }
          z = furthestZ - GAME_CONFIG.world.ringSpacing;
          passed = false;
          scaleAnim = 1.0;
          return {
            ...ring,
            x: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxX * 1.4),
            y: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxY * 1.2),
            z,
            passed,
            scaleAnim,
          };
        }

        return { ...ring, z, scaleAnim };
      });
      return changed ? updated : updated;
    });

    // Move Collectibles forward
    setCollectibles((prev) => {
      return prev.map((item) => {
        let z = item.z + effectiveSpeed * clampedDt;
        let collected = item.collected;

        if (z > GAME_CONFIG.world.recycleThresholdZ) {
          let furthestZ = 0;
          for (let k = 0; k < prev.length; k++) {
            if (prev[k].z < furthestZ) furthestZ = prev[k].z;
          }
          z = furthestZ - GAME_CONFIG.world.collectibleSpacing;
          collected = false;
          return {
            ...item,
            x: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxX * 1.5),
            y: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxY * 1.3),
            z,
            collected,
          };
        }

        return { ...item, z };
      });
    });

    // Move Obstacles forward
    setObstacles((prev) => {
      return prev.map((obs) => {
        let z = obs.z + effectiveSpeed * clampedDt;
        let hit = obs.hit;

        if (z > GAME_CONFIG.world.recycleThresholdZ) {
          let furthestZ = 0;
          for (let k = 0; k < prev.length; k++) {
            if (prev[k].z < furthestZ) furthestZ = prev[k].z;
          }
          z = furthestZ - GAME_CONFIG.world.obstacleSpacing;
          hit = false;
          return {
            ...obs,
            x: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxX * 1.3),
            y: (Math.random() - 0.5) * (GAME_CONFIG.bounds.maxY * 1.2),
            z,
            hit,
          };
        }

        return { ...obs, z };
      });
    });

    // Run collision detection
    const colResults = checkCollisions(
      planePosRef.current,
      planePrevPosRef.current,
      rings,
      collectibles,
      obstacles
    );

    if (colResults.ringsPassed.length > 0) {
      colResults.ringsPassed.forEach(() => {
        state.onRingPassed();
      });
    }

    if (colResults.collectiblesHit.length > 0) {
      colResults.collectiblesHit.forEach((item) => {
        state.onCollectiblePicked(item.points);
      });
    }

    if (colResults.obstaclesHit.length > 0) {
      colResults.obstaclesHit.forEach(() => {
        state.onObstacleHit();
      });
    }
  });

  return (
    <>
      <Lighting />
      <Mountains />
      <Clouds />
      <FloatingIslands />
      <Particles />
      <Rings rings={rings} />
      <Collectibles items={collectibles} />
      <Obstacles obstacles={obstacles} />
      <PaperPlane onPositionUpdate={handlePlanePosUpdate} />
    </>
  );
};
