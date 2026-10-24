import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <>
      {/* Cool Sky / Ground ambient fill */}
      <hemisphereLight
        args={['#7dd3fc', '#1e293b', 0.85]}
      />

      {/* Warm Golden Key Light with shadows */}
      <directionalLight
        position={[15, 25, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
        color="#fffbeb"
      />

      {/* Gentle Fill light from opposite side */}
      <directionalLight
        position={[-15, 10, -10]}
        intensity={0.45}
        color="#bae6fd"
      />

      {/* Subtle Rim backlight */}
      <directionalLight
        position={[0, -5, -30]}
        intensity={0.6}
        color="#38bdf8"
      />
    </>
  );
};
