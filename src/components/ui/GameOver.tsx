import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber, formatDistance } from '../../lib/utils';
import { RotateCcw, Home, Trophy, Target, Sparkles, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GameOver: React.FC = () => {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const distance = useGameStore((s) => s.distance);
  const ringsPassedCount = useGameStore((s) => s.ringsPassedCount);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const isNewRecord = score >= highScore && score > 0;

  useEffect(() => {
    if (isNewRecord) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#38bdf8', '#f43f5e', '#ffffff'],
        });
      } catch {}
    }
  }, [isNewRecord]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
          <span>Voo Concluído</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1">
          Fim de Partida
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          O seu avião pousou suavemente nas colinas de origami.
        </p>

        {/* Score Display Card */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 mb-5 relative overflow-hidden">
          {isNewRecord && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>NOVO RECORDE!</span>
            </div>
          )}

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Pontuação Final
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight tabular-nums">
            {formatNumber(score)}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Melhor Recorde: <strong className="text-slate-200 font-mono">{formatNumber(highScore)}</strong></span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
              <Navigation className="w-3 h-3 text-sky-400" />
              <span>Distância</span>
            </div>
            <div className="text-sm font-bold text-slate-100 tabular-nums">
              {formatDistance(distance)}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Anéis</span>
            </div>
            <div className="text-sm font-bold text-slate-100 tabular-nums">
              {ringsPassedCount}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Combo</span>
            </div>
            <div className="text-sm font-bold text-slate-100 tabular-nums">
              {maxCombo}x
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>

          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
