import * as THREE from 'three';
import { GAME_CONFIG } from './game-config';

export interface PlaneFlightState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  targetPosition: THREE.Vector3;
  wobbleTime: number;
}

export class PlaneFlightPhysics {
  private state: PlaneFlightState = {
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    targetPosition: new THREE.Vector3(0, 0, 0),
    wobbleTime: 0,
  };

  public reset(initialPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    this.state.position.copy(initialPos);
    this.state.velocity.set(0, 0, 0);
    this.state.rotation.set(0, 0, 0);
    this.state.targetPosition.copy(initialPos);
    this.state.wobbleTime = 0;
  }

  public setNormalizedInput(normX: number, normY: number) {
    const b = GAME_CONFIG.bounds;
    // Map -1..1 to bounds
    const targetX = THREE.MathUtils.clamp(
      normX * b.maxX,
      b.minX,
      b.maxX
    );
    const targetY = THREE.MathUtils.clamp(
      normY * b.maxY,
      b.minY,
      b.maxY
    );
    this.state.targetPosition.x = targetX;
    this.state.targetPosition.y = targetY;
  }

  public update(dt: number, isBoosting: boolean = false): PlaneFlightState {
    const clampedDt = Math.min(dt, 0.05);
    const cfg = GAME_CONFIG.flight;

    this.state.wobbleTime += clampedDt * cfg.wobbleFrequency * (isBoosting ? 1.8 : 1.0);

    // Exponential damping towards target position
    const lerpRate = cfg.responsiveness * (isBoosting ? 1.25 : 1.0);
    const t = 1 - Math.exp(-lerpRate * clampedDt);

    const prevX = this.state.position.x;
    const prevY = this.state.position.y;

    this.state.position.x = THREE.MathUtils.lerp(this.state.position.x, this.state.targetPosition.x, t);
    this.state.position.y = THREE.MathUtils.lerp(this.state.position.y, this.state.targetPosition.y, t);

    // Compute instantaneous velocity
    const vx = (this.state.position.x - prevX) / Math.max(clampedDt, 0.001);
    const vy = (this.state.position.y - prevY) / Math.max(clampedDt, 0.001);
    this.state.velocity.set(vx, vy, 0);

    // Paper plane aerodynamic wobble
    const wobbleZ = Math.sin(this.state.wobbleTime) * cfg.wobbleAmplitude;
    const wobbleY = Math.cos(this.state.wobbleTime * 0.7) * (cfg.wobbleAmplitude * 0.5);

    // Target rotation based on velocity:
    // Roll (bank) during lateral movement: vx > 0 banks right (-Z rotation in Three.js or negative roll)
    const targetRoll = THREE.MathUtils.clamp(
      -vx * 0.08,
      -cfg.rollAngleMax,
      cfg.rollAngleMax
    );
    // Pitch up when moving up (vy > 0 pitch nose up: negative X in standard coords)
    const targetPitch = THREE.MathUtils.clamp(
      -vy * 0.06,
      -cfg.pitchAngleMax,
      cfg.pitchAngleMax
    );
    // Yaw follows roll slightly
    const targetYaw = THREE.MathUtils.clamp(
      vx * 0.02,
      -cfg.yawAngleMax,
      cfg.yawAngleMax
    );

    // Smooth rotations with damping
    const rotLerp = 1 - Math.exp(-8.0 * clampedDt);
    this.state.rotation.z = THREE.MathUtils.lerp(this.state.rotation.z, targetRoll + wobbleZ, rotLerp);
    this.state.rotation.x = THREE.MathUtils.lerp(this.state.rotation.x, targetPitch + wobbleY, rotLerp);
    this.state.rotation.y = THREE.MathUtils.lerp(this.state.rotation.y, targetYaw, rotLerp);

    return this.state;
  }

  public getState(): PlaneFlightState {
    return this.state;
  }
}
