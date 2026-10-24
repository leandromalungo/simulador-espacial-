import React from 'react';
import { X, Hand, Sparkles, AlertTriangle, Zap, Target, Keyboard } from 'lucide-react';

interface GameInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">
              Como Jogar
            </h3>
            <p className="text-xs text-slate-400">
              Aprenda as regras de voo e domine os céus de papel
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Hand Gestures */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <Hand className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">
                Controlo por Gestos (Câmara)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mantenha a <strong>mão aberta</strong> em frente à câmara do seu computador ou telemóvel. Mova a mão para a esquerda, direita, cima e baixo para guiar o avião com precisão e inclinação natural.
              </p>
            </div>
          </div>

          {/* Boost Fist */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">
                Turbo / Impulso (Punho Fechado)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Feche a mão num punho</strong> (ou pressione a barra de <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">Espaço</kbd>) para ativar o modo Turbo! Aumenta a velocidade e o multiplicador de pontuação.
              </p>
            </div>
          </div>

          {/* Rings & Multipliers */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">
                Atravesse os Anéis Dourados
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passe pelo centro dos anéis de origami para acumular <strong>combos consecutivos</strong> e aumentar o multiplicador de pontuação até 3.5x!
              </p>
            </div>
          </div>

          {/* Collectibles & Obstacles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-200">Estrelas de Papel</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Recolha cristais flutuantes para pontos bónus instantâneos.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-200">Nuvens de Tempestade</h5>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Evite embater nas nuvens escuras e espigões vermelhos para não perder a sua sequência de combo.
                </p>
              </div>
            </div>
          </div>

          {/* Keyboard / Touch note */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-sky-400 shrink-0" />
            <p className="text-xs text-slate-300">
              Não tem câmara disponível? Jogue facilmente com <strong className="text-sky-300">WASD / Teclas de Direção</strong> ou toque no ecrã.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm uppercase tracking-wide transition-all cursor-pointer"
          >
            Entendido, Vamos Voar!
          </button>
        </div>
      </div>
    </div>
  );
};
