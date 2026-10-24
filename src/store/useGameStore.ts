import { create } from 'zustand';
import { GameStatus, ControlMode, HandPosition } from '../types/game';
import { GAME_CONFIG } from '../lib/game-config';
import { storage } from '../lib/storage';
import { sound } from '../lib/audio';

interface GameState {
  // Game lifecycle
  gameStatus: GameStatus;
  isPlaying: boolean;
  isPaused: boolean;

  // Flight & Scores
  score: number;
  highScore: number;
  speed: number;
  distance: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  ringsPassedCount: number;
  collectiblesCount: number;

  // Special Boost Ability
  specialAbilityReady: boolean;
  specialAbilityActive: boolean;
  boostTimeRemaining: number;
  boostCooldownRemaining: number;

  // Controls & Tracking
  controlMode: ControlMode;
  handPosition: HandPosition;
  cameraEnabled: boolean;
  cameraPreviewVisible: boolean;
  soundEnabled: boolean;

  // Actions
  setGameStatus: (status: GameStatus) => void;
  setControlMode: (mode: ControlMode) => void;
  setHandPosition: (pos: HandPosition) => void;
  setSpeed: (speed: number) => void;
  setDistance: (distance: number) => void;
  addScore: (amount: number) => void;
  triggerBoost: () => boolean;
  updateBoostTimers: (dt: number) => void;
  toggleSound: () => void;
  toggleCamera: () => void;
  toggleCameraPreview: () => void;

  // Game events
  onRingPassed: () => void;
  onCollectiblePicked: (points?: number) => void;
  onObstacleHit: () => void;

  // Lifecycle transitions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

const initialHighScore = storage.getHighScore();
const initialSettings = storage.getSettings();

export const useGameStore = create<GameState>((set, get) => ({
  gameStatus: 'menu',
  isPlaying: false,
  isPaused: false,

  score: 0,
  highScore: initialHighScore,
  speed: GAME_CONFIG.speed.initial,
  distance: 0,
  combo: 0,
  maxCombo: 0,
  multiplier: 1.0,
  ringsPassedCount: 0,
  collectiblesCount: 0,

  specialAbilityReady: true,
  specialAbilityActive: false,
  boostTimeRemaining: 0,
  boostCooldownRemaining: 0,

  controlMode: 'hands',
  handPosition: {
    x: 0,
    y: 0,
    isClosed: false,
    detected: false,
  },
  cameraEnabled: true,
  cameraPreviewVisible: initialSettings.cameraPreviewEnabled,
  soundEnabled: initialSettings.soundEnabled,

  setGameStatus: (status) => set({ gameStatus: status }),

  setControlMode: (controlMode) => set({ controlMode }),

  // High-frequency hand updates: shallow-compare to avoid unneeded renders
  setHandPosition: (newPos) => {
    const cur = get().handPosition;
    if (
      Math.abs(cur.x - newPos.x) > 0.005 ||
      Math.abs(cur.y - newPos.y) > 0.005 ||
      cur.isClosed !== newPos.isClosed ||
      cur.detected !== newPos.detected
    ) {
      set({ handPosition: newPos });
      // If closed hand detected and boost ready, auto-trigger boost!
      if (newPos.isClosed && get().specialAbilityReady && get().isPlaying && !get().isPaused) {
        get().triggerBoost();
      }
    }
  },

  setSpeed: (speed) => set({ speed }),

  setDistance: (distance) => set({ distance }),

  addScore: (amount) => {
    const mult = get().multiplier;
    const finalAddition = Math.round(amount * mult);
    set((state) => {
      const nextScore = state.score + finalAddition;
      const nextHigh = Math.max(state.highScore, nextScore);
      if (nextHigh > state.highScore) {
        storage.setHighScore(nextHigh);
      }
      return { score: nextScore, highScore: nextHigh };
    });
  },

  triggerBoost: () => {
    const state = get();
    if (!state.specialAbilityReady || state.specialAbilityActive || !state.isPlaying || state.isPaused) {
      return false;
    }
    sound.playBoost();
    set({
      specialAbilityActive: true,
      specialAbilityReady: false,
      boostTimeRemaining: GAME_CONFIG.boost.duration,
      multiplier: Math.min(state.multiplier + 0.5, GAME_CONFIG.score.maxMultiplier),
    });
    return true;
  },

  updateBoostTimers: (dt) => {
    const state = get();
    if (state.specialAbilityActive) {
      const remaining = state.boostTimeRemaining - dt;
      if (remaining <= 0) {
        set({
          specialAbilityActive: false,
          boostTimeRemaining: 0,
          boostCooldownRemaining: GAME_CONFIG.boost.cooldown,
        });
      } else {
        set({ boostTimeRemaining: remaining });
      }
    } else if (!state.specialAbilityReady) {
      const cd = state.boostCooldownRemaining - dt;
      if (cd <= 0) {
        set({
          specialAbilityReady: true,
          boostCooldownRemaining: 0,
        });
      } else {
        set({ boostCooldownRemaining: cd });
      }
    }
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    sound.setMuted(!next);
    storage.setSettings({ soundEnabled: next });
    set({ soundEnabled: next });
  },

  toggleCamera: () => {
    set((state) => ({ cameraEnabled: !state.cameraEnabled }));
  },

  toggleCameraPreview: () => {
    set((state) => {
      const next = !state.cameraPreviewVisible;
      storage.setSettings({ cameraPreviewEnabled: next });
      return { cameraPreviewVisible: next };
    });
  },

  onRingPassed: () => {
    const state = get();
    const nextCombo = state.combo + 1;
    const nextMaxCombo = Math.max(state.maxCombo, nextCombo);
    const nextMult = Math.min(
      1.0 + nextCombo * GAME_CONFIG.score.comboMultiplierStep,
      GAME_CONFIG.score.maxMultiplier
    );

    sound.playRingChime(nextCombo);

    const basePoints = GAME_CONFIG.score.ringBase;
    const addedScore = Math.round(basePoints * nextMult);
    const nextScore = state.score + addedScore;
    const nextHigh = Math.max(state.highScore, nextScore);

    if (nextHigh > state.highScore) {
      storage.setHighScore(nextHigh);
    }

    set({
      combo: nextCombo,
      maxCombo: nextMaxCombo,
      multiplier: Number(nextMult.toFixed(2)),
      score: nextScore,
      highScore: nextHigh,
      ringsPassedCount: state.ringsPassedCount + 1,
    });
  },

  onCollectiblePicked: (points = GAME_CONFIG.score.collectibleBase) => {
    sound.playCollectible();
    get().addScore(points);
    set((state) => ({
      collectiblesCount: state.collectiblesCount + 1,
    }));
  },

  onObstacleHit: () => {
    sound.playCollision();
    set((state) => {
      // Reset combo streak, apply small penalty, drop multiplier back to 1.0
      const nextScore = Math.max(0, state.score - GAME_CONFIG.score.collisionPenalty);
      return {
        score: nextScore,
        combo: 0,
        multiplier: 1.0,
      };
    });
  },

  startGame: () => {
    sound.startWind();
    set({
      gameStatus: 'countdown',
      isPlaying: false,
      isPaused: false,
      score: 0,
      distance: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1.0,
      speed: GAME_CONFIG.speed.initial,
      ringsPassedCount: 0,
      collectiblesCount: 0,
      specialAbilityReady: true,
      specialAbilityActive: false,
      boostTimeRemaining: 0,
      boostCooldownRemaining: 0,
    });
  },

  pauseGame: () => {
    if (get().isPlaying) {
      set({ isPaused: true, gameStatus: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().isPaused) {
      set({ isPaused: false, gameStatus: 'playing' });
    }
  },

  endGame: () => {
    sound.stopWind();
    sound.playGameOver();
    const finalScore = get().score;
    const high = Math.max(get().highScore, finalScore);
    storage.setHighScore(high);

    set({
      isPlaying: false,
      isPaused: false,
      gameStatus: 'gameover',
      highScore: high,
    });
  },

  resetGame: () => {
    sound.stopWind();
    set({
      gameStatus: 'menu',
      isPlaying: false,
      isPaused: false,
      score: 0,
      distance: 0,
      combo: 0,
      multiplier: 1.0,
      speed: GAME_CONFIG.speed.initial,
      ringsPassedCount: 0,
      collectiblesCount: 0,
      specialAbilityReady: true,
      specialAbilityActive: false,
      boostTimeRemaining: 0,
      boostCooldownRemaining: 0,
    });
  },
}));
