import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { handTracker, HandResults } from '../../lib/mediapipe';
import { HandPosition } from '../../types/game';

interface HandTrackerProps {
  onStatusChange?: (ready: boolean, error?: string) => void;
  renderDebugSkeleton?: boolean;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setHandPosition = useGameStore((s) => s.setHandPosition);
  const cameraEnabled = useGameStore((s) => s.cameraEnabled);
  const cameraPreviewVisible = useGameStore((s) => s.cameraPreviewVisible);
  const handPosition = useGameStore((s) => s.handPosition);

  useEffect(() => {
    if (!cameraEnabled) {
      handTracker.stop();
      return;
    }

    let isMounted = true;

    async function initTracker() {
      if (!videoRef.current) return;

      try {
        const ok = await handTracker.initialize(
          videoRef.current,
          (pos: HandPosition) => {
            if (isMounted) {
              setHandPosition(pos);
            }
          },
          (results: HandResults) => {
            if (!isMounted || !canvasRef.current) return;
            drawHandOverlay(results, canvasRef.current);
          }
        );

        if (!ok) {
          throw new Error('Não foi possível inicializar a biblioteca de deteção de mãos.');
        }

        await handTracker.start();

        if (isMounted) {
          setHasPermission(true);
          setErrorMessage(null);
          onStatusChange?.(true);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Erro ao aceder à câmara';
        setHasPermission(false);
        setErrorMessage(
          msg.includes('Permission') || msg.includes('NotAllowedError')
            ? 'Permissão da câmara negada. Ative o acesso à câmara nas definições do navegador ou utilize o teclado.'
            : msg
        );
        onStatusChange?.(false, msg);
      }
    }

    initTracker();

    return () => {
      isMounted = false;
      handTracker.stop();
    };
  }, [cameraEnabled, setHandPosition, onStatusChange]);

  // Draw lightweight skeleton overlay on preview canvas
  const drawHandOverlay = (results: HandResults, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const w = canvas.width;
    const h = canvas.height;

    // Draw palm & finger points
    ctx.fillStyle = handPosition.isClosed ? '#f59e0b' : '#38bdf8';
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      // Mirror x for preview
      const px = (1 - lm.x) * w;
      const py = lm.y * h;

      ctx.beginPath();
      ctx.arc(px, py, i === 0 ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Connect wrist to MCPs
    ctx.strokeStyle = handPosition.isClosed ? 'rgba(245, 158, 11, 0.7)' : 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2;
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17],            // Palm base
    ];

    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo((1 - p1.x) * w, p1.y * h);
      ctx.lineTo((1 - p2.x) * w, p2.y * h);
      ctx.stroke();
    }
  };

  return (
    <>
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Floating Camera Preview HUD in corner */}
      {cameraPreviewVisible && cameraEnabled && (
        <div className="fixed bottom-4 right-4 z-40 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-none w-48 sm:w-56 pointer-events-auto transition-all">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  handPosition.detected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                {handPosition.detected
                  ? handPosition.isClosed
                    ? 'Punho (Impulso)'
                    : 'Mão Detetada'
                  : 'Procurar Mão'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Câmara</span>
          </div>

          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            {/* Canvas receives the mirrored skeleton */}
            <canvas
              ref={canvasRef}
              width={240}
              height={180}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {!handPosition.detected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950/70">
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  Mostre a sua mão à câmara para controlar o voo
                </p>
              </div>
            )}

            {/* Hand target crosshair */}
            {handPosition.detected && (
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-amber-400 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                style={{
                  left: `${((handPosition.x + 1) / 2) * 100}%`,
                  top: `${((1 - handPosition.y) / 2) * 100}%`,
                }}
              />
            )}
          </div>

          {errorMessage && (
            <p className="mt-1.5 text-[10px] text-red-400 leading-tight">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </>
  );
};
