import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber } from '../../lib/utils';
import {
  Play,
  HelpCircle,
  Settings,
  Hand,
  Keyboard,
  Smartphone,
  Trophy,
  Compass,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GameInstructions } from './GameInstructions';
import { SettingsPanel } from './SettingsPanel';

interface MainMenuProps {
  onPlayClick: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlayClick }) => {
  const highScore = useGameStore((s) => s.highScore);
  const controlMode = useGameStore((s) => s.controlMode);
  const setControlMode = useGameStore((s) => s.setControlMode);

  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative z-20 flex flex-col items-center justify-between min-h-screen px-4 py-8 sm:py-12 pointer-events-none select-none max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Paper World Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-amber-400 border border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <svg
              className="w-5 h-5 -rotate-45"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
          <span className="font-['Space_Grotesk'] text-lg font-bold tracking-wider text-white">
            PAPER WORLD
          </span>
        </div>

        {/* High score badge & Settings button */}
        <div className="flex items-center gap-3">
          {highScore > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-amber-300 text-xs font-semibold shadow-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums font-mono">
                {formatNumber(highScore)} PTS
              </span>
            </div>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Abrir Definições"
            className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="my-auto text-center flex flex-col items-center max-w-2xl py-8 pointer-events-auto">
        {/* Hand gesture pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6 shadow-sm">
          <Hand className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>Controlado por Gestos da Mão via Câmara</span>
        </div>

        {/* Main Title Lockup */}
        <h1 className="font-['Space_Grotesk'] text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-4 uppercase drop-shadow-xl leading-none">
          Paper <span className="text-amber-400">World</span>
        </h1>

        {/* Tagline */}
        <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal">
          Pilote um avião de papel num mundo 3D estilizado de origami. Use os movimentos da sua mão para planar, atravessar anéis e alcançar novos recordes.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-8">
          <button
            onClick={onPlayClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-base tracking-wider uppercase transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>Jogar Agora</span>
          </button>

          <button
            onClick={() => setInstructionsOpen(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:scale-95 border border-slate-700/80 text-slate-200 font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Como Jogar</span>
          </button>
        </div>

        {/* Control Mode Quick Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-inner">
          <button
            onClick={() => setControlMode('hands')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              controlMode === 'hands'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Câmara</span>
          </button>

          <button
            onClick={() => setControlMode('keyboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              controlMode === 'keyboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Teclado</span>
          </button>

          <button
            onClick={() => setControlMode('touch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              controlMode === 'touch'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Toque</span>
          </button>
        </div>
      </div>

      {/* Bottom Features Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pointer-events-auto">
        <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-none flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 mb-0.5">
              Cenário Origami Contínuo
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Montanhas dobradas, ilhas flutuantes e nuvens volumétricas estilizadas.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-none flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 mb-0.5">
              Gestos & Impulso com Punho
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Deteção em tempo real de mão aberta e punho para aceleração turbo.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-none flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 mb-0.5">
              Anéis, Combos e Multiplicadores
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Encadeie passagens consecutivas para multiplicar a sua pontuação até 3.5x.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GameInstructions
        isOpen={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
