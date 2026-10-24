import * as THREE from 'three';
import { RingItem, CollectibleItem, ObstacleItem } from '../types/game';

const PLANE_COLLISION_RADIUS = 0.75;

export interface CollisionResults {
  ringsPassed: RingItem[];
  collectiblesHit: CollectibleItem[];
  obstaclesHit: ObstacleItem[];
}

export function checkCollisions(
  planePos: THREE.Vector3,
  planePrevPos: THREE.Vector3,
  rings: RingItem[],
  collectibles: CollectibleItem[],
  obstacles: ObstacleItem[]
): CollisionResults {
  const result: CollisionResults = {
    ringsPassed: [],
    collectiblesHit: [],
    obstaclesHit: [],
  };

  // 1. Check Ring crossing
  // A ring is passed if the plane crossed its Z plane (prevZ >= ringZ and currZ <= ringZ, or vice versa)
  // and the plane's (x, y) is within the ring inner radius.
  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    if (ring.passed || !ring.active) continue;

    // Plane is at z=0, world moves backward (+z), or plane travels -z.
    // In our world coordinates: plane sits at z=0, rings travel from -z to +z towards the plane.
    // When a ring crosses z=0 from negative z to positive z:
    const crossedZ = Math.abs(ring.z - planePos.z) < 1.4;
    if (crossedZ) {
      const dx = planePos.x - ring.x;
      const dy = planePos.y - ring.y;
      const dist2D = Math.hypot(dx, dy);

      // Only counts if inside the ring's opening
      if (dist2D <= ring.radius * 0.95) {
        ring.passed = true;
        result.ringsPassed.push(ring);
      }
    }
  }

  // 2. Check Collectibles
  for (let i = 0; i < collectibles.length; i++) {
    const item = collectibles[i];
    if (item.collected) continue;

    const dx = planePos.x - item.x;
    const dy = planePos.y - item.y;
    const dz = planePos.z - item.z;
    const dist = Math.hypot(dx, dy, dz);

    if (dist < PLANE_COLLISION_RADIUS + 0.85) {
      item.collected = true;
      result.collectiblesHit.push(item);
    }
  }

  // 3. Check Obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.hit) continue;

    const dx = planePos.x - obs.x;
    const dy = planePos.y - obs.y;
    const dz = planePos.z - obs.z;
    const dist = Math.hypot(dx, dy, dz);

    if (dist < PLANE_COLLISION_RADIUS + obs.radius) {
      obs.hit = true;
      result.obstaclesHit.push(obs);
    }
  }

  return result;
}
