export const GAME_CONFIG = {
  // Movement bounds for the paper plane
  bounds: {
    minX: -8.5,
    maxX: 8.5,
    minY: -4.5,
    maxY: 5.5,
  },
  // Speeds (units per second)
  speed: {
    initial: 18,
    max: 45,
    boostMultiplier: 1.6,
    accelerationRate: 0.15, // Units per second progression
  },
  // Flight dynamics
  flight: {
    responsiveness: 5.5, // Lerp smoothing factor
    pitchAngleMax: 0.35, // Pitch up/down radians
    rollAngleMax: 0.55,  // Bank left/right radians
    yawAngleMax: 0.15,   // Subtle yaw
    wobbleFrequency: 3.2,
    wobbleAmplitude: 0.05,
  },
  // Special Boost Ability
  boost: {
    duration: 3.5, // seconds
    cooldown: 8.0, // seconds
  },
  // Scoring
  score: {
    ringBase: 150,
    collectibleBase: 50,
    distanceRate: 5, // Score per 10 meters
    comboMultiplierStep: 0.25,
    maxMultiplier: 3.5,
    collisionPenalty: 100,
  },
  // World generation & spacing
  world: {
    renderDistance: 160,
    recycleThresholdZ: 10, // Behind camera
    ringSpacing: 28,
    collectibleSpacing: 14,
    obstacleSpacing: 35,
    cloudsCount: 36,
    mountainsCount: 16,
    islandsCount: 8,
  },
  // Hand tracking calibration
  handTracking: {
    deadzone: 0.04,
    smoothing: 0.2, // Low-pass filter weight
    closedFistThreshold: 0.24, // Distance between finger tips and palm
  },
  // Local storage keys
  storageKeyHighScore: 'paper_world_high_score',
  storageKeySettings: 'paper_world_settings',
} as const;
