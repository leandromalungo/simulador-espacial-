export type HandPosition = {
  x: number; // Normalized -1 to 1 (0 is center)
  y: number; // Normalized -1 to 1 (0 is center)
  isClosed: boolean;
  detected: boolean;
  rawX?: number; // 0 to 1
  rawY?: number; // 0 to 1
};

export type GameStatus =
  | 'menu'
  | 'loading'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'gameover';

export type ControlMode = 'hands' | 'keyboard' | 'touch';

export interface RingItem {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  passed: boolean;
  active: boolean;
  scaleAnim?: number;
}

export interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  type: 'star' | 'feather' | 'sparkle';
  points: number;
}

export interface ObstacleItem {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  type: 'storm_cloud' | 'paper_crag' | 'floating_spire';
  hit: boolean;
  rotationSpeed: number;
}

export interface FloatingIslandItem {
  id: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  type: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  cameraPreviewEnabled: boolean;
  sensitivity: number;
  graphicsQuality: 'high' | 'medium' | 'low';
}

export interface SessionStats {
  score: number;
  ringsPassed: number;
  collectiblesCount: number;
  distance: number;
  maxCombo: number;
  durationSeconds: number;
}
