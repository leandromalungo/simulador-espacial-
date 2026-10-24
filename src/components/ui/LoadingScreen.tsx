import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { sound } from '../../lib/audio';

export const LoadingScreen: React.FC = () => {
  const [count, setCount] = useState<number>(3);
  const setGameStatus = useGameStore((s) => s.setGameStatus);

  useEffect(() => {
    sound.playCountdownTick(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      sound.playCountdownTick(false);
    }, 1000);

    const timer2 = setTimeout(() => {
      setCount(1);
      sound.playCountdownTick(false);
    }, 2000);

    const timer3 = setTimeout(() => {
      setCount(0); // "VAI!"
      sound.playCountdownTick(true);
    }, 3000);

    const timer4 = setTimeout(() => {
      useGameStore.setState({ isPlaying: true, gameStatus: 'playing' });
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [setGameStatus]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none select-none">
      <div className="text-center">
        <div className="text-8xl sm:text-9xl font-black text-amber-400 drop-shadow-[0_10px_35px_rgba(251,191,36,0.4)] animate-pulse">
          {count > 0 ? count : 'VAI!'}
        </div>
        <p className="mt-4 text-slate-200 text-sm sm:text-base font-semibold tracking-wider uppercase">
          Prepare o seu voo
        </p>
      </div>
    </div>
  );
};
