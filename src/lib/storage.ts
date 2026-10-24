import { GAME_CONFIG } from './game-config';
import { GameSettings } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  cameraPreviewEnabled: true,
  sensitivity: 1.0,
  graphicsQuality: 'high',
};

export const storage = {
  getHighScore(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const val = localStorage.getItem(GAME_CONFIG.storageKeyHighScore);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setHighScore(score: number): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(GAME_CONFIG.storageKeyHighScore, score.toString());
      }
    } catch (e) {
      console.warn('Could not save high score to localStorage:', e);
    }
  },

  getSettings(): GameSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const val = localStorage.getItem(GAME_CONFIG.storageKeySettings);
      if (!val) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  setSettings(settings: Partial<GameSettings>): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(GAME_CONFIG.storageKeySettings, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  },
};
