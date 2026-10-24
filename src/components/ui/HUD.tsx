import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber, formatDistance } from '../../lib/utils';
import { Pause, Volume2, VolumeX, Video, VideoOff, Zap, Trophy } from 'lucide-react';

export const HUD: React.FC = () => {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const speed = useGameStore((s) => s.speed);
  const distance = useGameStore((s) => s.distance);
  const combo = useGameStore((s) => s.combo);
  const multiplier = useGameStore((s) => s.multiplier);
  const specialAbilityReady = useGameStore((s) => s.specialAbilityReady);
  const specialAbilityActive = useGameStore((s) => s.specialAbilityActive);
  const boostTimeRemaining = useGameStore((s) => s.boostTimeRemaining);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const cameraEnabled = useGameStore((s) => s.cameraEnabled);
  const controlMode = useGameStore((s) => s.controlMode);

  const pauseGame = useGameStore((s) => s.pauseGame);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleCamera = useGameStore((s) => s.toggleCamera);
  const triggerBoost = useGameStore((s) => s.triggerBoost);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Score & Combo */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums drop-shadow-md">
              {formatNumber(score)}
            </span>
            <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
              PTS
            </span>
          </div>

          {/* High Score Tag */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-mono">RECORDE: {formatNumber(highScore)}</span>
          </div>

          {/* Combo badge */}
          {combo > 1 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold w-fit animate-bounce">
              <span>{combo}x ANÉIS</span>
              <span className="text-[10px] text-amber-200">({multiplier}x MULT)</span>
            </div>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Alternar som"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-md"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Camera Toggle */}
          {controlMode === 'hands' && (
            <button
              onClick={toggleCamera}
              aria-label="Alternar câmara"
              className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-md"
            >
              {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-slate-500" />}
            </button>
          )}

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            aria-label="Pausar jogo"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-md"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Cluster */}
      <div className="flex items-end justify-between w-full">
        {/* Speed & Distance Cluster */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/70 rounded-2xl px-4 py-2.5 shadow-lg">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Velocidade
            </div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              {Math.round(speed * 3.6)} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-700/80" />

          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Distância
            </div>
            <div className="text-lg font-bold text-sky-400 tabular-nums">
              {formatDistance(distance)}
            </div>
          </div>
        </div>

        {/* Boost Ability Indicator (Desktop / Keyboard / Hand) */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-700/70 rounded-2xl px-4 py-2.5 shadow-lg pointer-events-auto">
          <button
            onClick={() => triggerBoost()}
            disabled={!specialAbilityReady || specialAbilityActive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              specialAbilityActive
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40'
                : specialAbilityReady
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>
              {specialAbilityActive
                ? `TURBO ${boostTimeRemaining.toFixed(1)}s`
                : specialAbilityReady
                ? 'IMPULSO PRONTO'
                : 'RECARREGAR...'}
            </span>
          </button>
          <span className="text-[10px] text-slate-400 font-medium">
            {controlMode === 'hands' ? '(Fechar mão)' : '(Espaço)'}
          </span>
        </div>
      </div>
    </div>
  );
};
