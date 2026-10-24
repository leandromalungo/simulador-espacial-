import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

export const PauseMenu: React.FC = () => {
  const resumeGame = useGameStore((s) => s.resumeGame);
  const startGame = useGameStore((s) => s.startGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Jogo em Pausa
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          O avião está a planar no vento. Faça uma pausa e retome quando estiver pronto.
        </p>

        <div className="space-y-3">
          {/* Resume */}
          <button
            onClick={resumeGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Continuar</span>
          </button>

          {/* Restart */}
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Partida</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-all border border-slate-700/60 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Som: Ativado</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span>Som: Desativado</span>
              </>
            )}
          </button>

          {/* Main Menu */}
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 font-medium text-xs transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
