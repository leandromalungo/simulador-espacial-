import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { PlaneFlightPhysics } from '../lib/game-physics';
import { checkCollisions } from '../lib/collision';
import { GAME_CONFIG } from '../lib/game-config';
import { useGameStore } from '../store/useGameStore';
import { RingItem, CollectibleItem, ObstacleItem } from '../types/game';

describe('PlaneFlightPhysics', () => {
  let physics: PlaneFlightPhysics;

  beforeEach(() => {
    physics = new PlaneFlightPhysics();
    physics.reset();
  });

  it('initializes at origin with zero velocity', () => {
    const state = physics.getState();
    expect(state.position.x).toBe(0);
    expect(state.position.y).toBe(0);
    expect(state.position.z).toBe(0);
  });

  it('clamps target position within GAME_CONFIG bounds', () => {
    physics.setNormalizedInput(2.5, -3.0); // Outside normalized range
    const state = physics.update(0.1);
    expect(state.position.x).toBeLessThanOrEqual(GAME_CONFIG.bounds.maxX);
    expect(state.position.y).toBeGreaterThanOrEqual(GAME_CONFIG.bounds.minY);
  });

  it('applies bank roll when turning horizontally', () => {
    physics.setNormalizedInput(1.0, 0); // Bank right
    // Run several frames to allow smooth interpolation
    for (let i = 0; i < 5; i++) {
      physics.update(0.05);
    }
    const state = physics.getState();
    expect(state.velocity.x).toBeGreaterThan(0);
    expect(state.rotation.z).toBeLessThan(0); // Right roll is negative Z
  });
});

describe('Collision Detection', () => {
  it('detects ring passage when plane crosses within ring radius', () => {
    const rings: RingItem[] = [
      {
        id: 1,
        x: 0,
        y: 0,
        z: 0.2, // Near plane at z=0
        radius: 2.2,
        passed: false,
        active: true,
      },
    ];

    const planePos = new THREE.Vector3(0.5, 0.5, 0);
    const planePrevPos = new THREE.Vector3(0.5, 0.5, -0.2);

    const result = checkCollisions(planePos, planePrevPos, rings, [], []);
    expect(result.ringsPassed.length).toBe(1);
    expect(rings[0].passed).toBe(true);
  });

  it('does NOT trigger ring passage when plane is outside ring radius', () => {
    const rings: RingItem[] = [
      {
        id: 1,
        x: 0,
        y: 0,
        z: 0.2,
        radius: 2.2,
        passed: false,
        active: true,
      },
    ];

    const planePos = new THREE.Vector3(5.0, 5.0, 0); // Far away
    const planePrevPos = new THREE.Vector3(5.0, 5.0, -0.2);

    const result = checkCollisions(planePos, planePrevPos, rings, [], []);
    expect(result.ringsPassed.length).toBe(0);
    expect(rings[0].passed).toBe(false);
  });

  it('detects collectible pickups and flags them as collected', () => {
    const collectibles: CollectibleItem[] = [
      {
        id: 1,
        x: 1.0,
        y: 1.0,
        z: 0,
        collected: false,
        type: 'star',
        points: 50,
      },
    ];

    const planePos = new THREE.Vector3(1.2, 1.1, 0);
    const planePrevPos = new THREE.Vector3(1.2, 1.1, 0);

    const result = checkCollisions(planePos, planePrevPos, [], collectibles, []);
    expect(result.collectiblesHit.length).toBe(1);
    expect(collectibles[0].collected).toBe(true);
  });

  it('detects obstacle collision and marks hit to prevent duplicate collisions', () => {
    const obstacles: ObstacleItem[] = [
      {
        id: 1,
        x: 0,
        y: 0,
        z: 0,
        radius: 1.5,
        type: 'storm_cloud',
        hit: false,
        rotationSpeed: 1,
      },
    ];

    const planePos = new THREE.Vector3(0.2, 0.2, 0);
    const result1 = checkCollisions(planePos, planePos, [], [], obstacles);
    expect(result1.obstaclesHit.length).toBe(1);
    expect(obstacles[0].hit).toBe(true);

    // Second check: should not collide again
    const result2 = checkCollisions(planePos, planePos, [], [], obstacles);
    expect(result2.obstaclesHit.length).toBe(0);
  });
});

describe('Game Store & Rules', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('starts game and resets session statistics', () => {
    useGameStore.getState().startGame();
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.distance).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.gameStatus).toBe('countdown');
  });

  it('increases combo, multiplier, and score on ring passage', () => {
    const store = useGameStore.getState();
    store.onRingPassed();
    const s1 = useGameStore.getState();
    expect(s1.combo).toBe(1);
    expect(s1.score).toBeGreaterThan(0);

    store.onRingPassed();
    const s2 = useGameStore.getState();
    expect(s2.combo).toBe(2);
    expect(s2.multiplier).toBeGreaterThan(1.0);
  });

  it('resets combo streak and applies penalty on obstacle hit', () => {
    const store = useGameStore.getState();
    store.onRingPassed();
    store.onRingPassed();
    expect(useGameStore.getState().combo).toBe(2);

    store.onObstacleHit();
    const state = useGameStore.getState();
    expect(state.combo).toBe(0);
    expect(state.multiplier).toBe(1.0);
  });

  it('triggers boost with duration and cooldown', () => {
    const store = useGameStore.getState();
    // Set to playing state
    useGameStore.setState({ isPlaying: true, isPaused: false });

    const activated = store.triggerBoost();
    expect(activated).toBe(true);

    const s1 = useGameStore.getState();
    expect(s1.specialAbilityActive).toBe(true);
    expect(s1.specialAbilityReady).toBe(false);

    // Advance timers beyond duration
    store.updateBoostTimers(GAME_CONFIG.boost.duration + 0.1);
    const s2 = useGameStore.getState();
    expect(s2.specialAbilityActive).toBe(false);
    expect(s2.specialAbilityReady).toBe(false);

    // Advance cooldown
    store.updateBoostTimers(GAME_CONFIG.boost.cooldown + 0.1);
    const s3 = useGameStore.getState();
    expect(s3.specialAbilityReady).toBe(true);
  });
});
