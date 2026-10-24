import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ControlMode } from '../../types/game';
import { X, Hand, Keyboard, Smartphone, Volume2, VolumeX, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const controlMode = useGameStore((s) => s.controlMode);
  const setControlMode = useGameStore((s) => s.setControlMode);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const cameraPreviewVisible = useGameStore((s) => s.cameraPreviewVisible);
  const toggleCameraPreview = useGameStore((s) => s.toggleCameraPreview);

  if (!isOpen) return null;

  const modes: { id: ControlMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'hands',
      label: 'Gestos da Mão',
      desc: 'Use a sua mão em frente à câmara para planar',
      icon: <Hand className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'keyboard',
      label: 'Teclado',
      desc: 'WASD ou Teclas de Direção + Espaço para Turbo',
      icon: <Keyboard className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'touch',
      label: 'Toque / Mobile',
      desc: 'Joystick virtual tátil no ecrã',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Definições do Jogo
            </h3>
            <p className="text-xs text-slate-400">
              Personalize os controlos e a experiência sensorial
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Control Mode Selection */}
        <div className="mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Método de Controlo Principal
          </label>
          <div className="grid grid-cols-1 gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setControlMode(m.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  controlMode === m.id
                    ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-100">{m.label}</div>
                  <div className="text-xs text-slate-400">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-5">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Efeitos Sonoros e Vento</div>
                <div className="text-[11px] text-slate-400">Sintetizador Web Audio procedural</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {soundEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>

          {/* Camera Preview Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                {cameraPreviewVisible ? <Eye className="w-4 h-4 text-sky-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Janela de Pré-visualização da Câmara</div>
                <div className="text-[11px] text-slate-400">Mostra o esqueleto da mão no canto</div>
              </div>
            </div>
            <button
              onClick={toggleCameraPreview}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cameraPreviewVisible
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {cameraPreviewVisible ? 'VISÍVEL' : 'OCULTA'}
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
          <p className="leading-snug">
            <strong>Privacidade Garantida:</strong> O processamento do vídeo ocorre 100% no seu dispositivo através de WebAssembly / MediaPipe. Nenhuma imagem ou vídeo é transmitido ou gravado.
          </p>
        </div>
      </div>
    </div>
  );
};
