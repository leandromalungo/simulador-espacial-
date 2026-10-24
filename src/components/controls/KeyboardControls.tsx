import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const KeyboardControls: React.FC = () => {
  const isPlaying = useGameStore((s) => s.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const controlMode = useGameStore((s) => s.controlMode);

  if (!isPlaying || isPaused || controlMode !== 'keyboard') return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 font-medium shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-sky-300">
          WASD / Setas
        </span>
        <span>Mover</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-amber-300">
          Espaço
        </span>
        <span>Impulso</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-slate-300">
          P / Esc
        </span>
        <span>Pausa</span>
      </div>
    </div>
  );
};
