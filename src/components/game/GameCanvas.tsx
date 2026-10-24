import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { World } from './World';

export const GameCanvas: React.FC = () => {
  // Software WebGL detection to adapt devicePixelRatio
  const isSoftwareGl = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return false;
    }
  }, []);

  const dpr = isSoftwareGl ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 2.3, 7.8], fov: 60, near: 0.1, far: 250 }}
        dpr={dpr}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color('#0c1322');
          // Atmospheric horizon fog
          scene.fog = new THREE.FogExp2('#0c1322', 0.008);
        }}
      >
        <World />
      </Canvas>
    </div>
  );
};
