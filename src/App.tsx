import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { useKeyboard } from './hooks/useKeyboard';
import { useIsMobile } from './hooks/useIsMobile';

import { GameCanvas } from './components/game/GameCanvas';
import { HUD } from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { PauseMenu } from './components/ui/PauseMenu';
import { GameOver } from './components/ui/GameOver';
import { HandTracker } from './components/controls/HandTracker';
import { TouchControls } from './components/controls/TouchControls';
import { KeyboardControls } from './components/controls/KeyboardControls';

export default function App() {
  // Global keyboard shortcuts (WASD, Space, P, Esc)
  useKeyboard();
  const isMobile = useIsMobile();

  const gameStatus = useGameStore((s) => s.gameStatus);
  const controlMode = useGameStore((s) => s.controlMode);
  const cameraEnabled = useGameStore((s) => s.cameraEnabled);
  const startGame = useGameStore((s) => s.startGame);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const setControlMode = useGameStore((s) => s.setControlMode);

  // Synchronize client-side route with URL bar (/play vs /)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/play' && useGameStore.getState().gameStatus === 'menu') {
        startGame();
      } else if (path !== '/play' && useGameStore.getState().gameStatus !== 'menu') {
        useGameStore.getState().resetGame();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial check on mount
    if (window.location.pathname === '/play') {
      startGame();
    }

    // Auto-select touch controls on mobile if default was hands
    if (isMobile && useGameStore.getState().controlMode === 'hands') {
      // Keep hands as option, but make touch easily accessible
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, startGame]);

  const handlePlayNow = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/play');
      setCurrentPath('/play');
    }
    startGame();
  };

  const handleReturnToMenu = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
    useGameStore.getState().resetGame();
  };

  // Sync menu reset with URL
  useEffect(() => {
    if (gameStatus === 'menu' && currentPath === '/play') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  }, [gameStatus, currentPath]);

  const isPlayActive = gameStatus !== 'menu';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c1322] select-none">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* Camera / Hand Tracker (Mounted ONLY when playing and in hands mode to preserve privacy and performance) */}
      {isPlayActive && controlMode === 'hands' && cameraEnabled && (
        <HandTracker />
      )}

      {/* Main Menu / Landing Page */}
      {gameStatus === 'menu' && (
        <MainMenu onPlayClick={handlePlayNow} />
      )}

      {/* Loading & 3,2,1 Countdown */}
      {gameStatus === 'countdown' && <LoadingScreen />}

      {/* In-Game HUD */}
      {(gameStatus === 'playing' || gameStatus === 'paused') && <HUD />}

      {/* Mobile Touch Controls */}
      {isPlayActive && (isMobile || controlMode === 'touch') && <TouchControls />}

      {/* Keyboard Controls Hint */}
      {isPlayActive && controlMode === 'keyboard' && <KeyboardControls />}

      {/* Pause Menu */}
      {gameStatus === 'paused' && <PauseMenu />}

      {/* Game Over Screen */}
      {gameStatus === 'gameover' && <GameOver />}
    </div>
  );
}
