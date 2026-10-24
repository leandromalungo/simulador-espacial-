import React, { useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { inputCoordinator } from '../../lib/controls';
import { Zap } from 'lucide-react';

export const TouchControls: React.FC = () => {
  const isPlaying = useGameStore((s) => s.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const specialAbilityReady = useGameStore((s) => s.specialAbilityReady);
  const specialAbilityActive = useGameStore((s) => s.specialAbilityActive);
  const triggerBoost = useGameStore((s) => s.triggerBoost);

  const padRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  if (!isPlaying || isPaused) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!padRef.current) return;
    const touch = e.touches[0];
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;

    const normX = Math.max(-1, Math.min(1, dx / radius));
    const normY = Math.max(-1, Math.min(1, -dy / radius)); // Up is positive

    setKnobPos({ x: normX * 36, y: -normY * 36 });
    inputCoordinator.updateTouch(normX, normY, true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    inputCoordinator.updateTouch(0, 0, false);
  };

  return (
    <div className="fixed inset-x-0 bottom-6 px-6 flex items-end justify-between pointer-events-none z-30 select-none">
      {/* Virtual Touch Joystick */}
      <div
        ref={padRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 rounded-full border-2 border-slate-600/70 bg-slate-900/60 pointer-events-auto flex items-center justify-center relative touch-none shadow-lg active:border-sky-400"
      >
        <div
          className={`w-12 h-12 rounded-full border border-sky-400/80 transition-transform duration-75 flex items-center justify-center shadow-md ${
            isDragging ? 'bg-sky-500/80 scale-105' : 'bg-sky-600/50'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Boost Action Button */}
      <button
        onClick={() => triggerBoost()}
        disabled={!specialAbilityReady || specialAbilityActive}
        className={`w-20 h-20 rounded-full pointer-events-auto flex flex-col items-center justify-center shadow-2xl border-2 transition-all active:scale-95 touch-none ${
          specialAbilityActive
            ? 'bg-amber-500 border-amber-300 text-slate-950 animate-pulse'
            : specialAbilityReady
            ? 'bg-amber-400/90 hover:bg-amber-400 border-amber-300 text-slate-950 cursor-pointer shadow-amber-500/30'
            : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        <Zap className="w-7 h-7" />
        <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
          {specialAbilityActive ? 'TURBO' : 'IMPULSO'}
        </span>
      </button>
    </div>
  );
};
