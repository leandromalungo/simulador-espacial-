import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { inputCoordinator } from '../lib/controls';

export function useKeyboard() {
  const heldKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      heldKeys.current.add(e.code);

      const store = useGameStore.getState();

      // Pause toggle: Escape or KeyP
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (store.isPlaying && !store.isPaused) {
          store.pauseGame();
        } else if (store.isPaused) {
          store.resumeGame();
        }
      }

      // Boost: Space
      if (e.code === 'Space') {
        if (store.isPlaying && !store.isPaused) {
          store.triggerBoost();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.code);
    };

    const onBlur = () => {
      heldKeys.current.clear();
      inputCoordinator.updateKeyboard(0, 0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Continuous poll for smooth keyboard movement
    let animId: number;
    const pollKeyboard = () => {
      let x = 0;
      let y = 0;

      if (heldKeys.current.has('KeyA') || heldKeys.current.has('ArrowLeft')) x -= 1;
      if (heldKeys.current.has('KeyD') || heldKeys.current.has('ArrowRight')) x += 1;
      if (heldKeys.current.has('KeyW') || heldKeys.current.has('ArrowUp')) y += 1;
      if (heldKeys.current.has('KeyS') || heldKeys.current.has('ArrowDown')) y -= 1;

      inputCoordinator.updateKeyboard(x, y);
      animId = requestAnimationFrame(pollKeyboard);
    };
    animId = requestAnimationFrame(pollKeyboard);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      cancelAnimationFrame(animId);
    };
  }, []);
}
