// src/components/Clean3DViewer.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

function IPhoneModel({ url, position }) {
  const { scene } = useGLTF(url);
  // Use the position prop passed from [id].astro
  return <primitive object={scene} position={position} />;
}

function BasicIPhone({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.6, 3.1, 0.3]} />
      <meshStandardMaterial color="#1D1D1F" />
    </mesh>
  );
}

export default function Clean3DViewer({ modelPath, modelPosition = [0, -0.2, 0] }) {
  return (
    <div className="relative w-full h-[500px] bg-white rounded-2xl overflow-hidden">
      {/* Instructions at the TOP */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white/90 px-3 py-1.5 rounded-full z-10">
        Click and drag to spin • Scroll to zoom
      </div>
      
      <Canvas camera={{ position: [0, 0, 1.2], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <Suspense fallback={<BasicIPhone position={modelPosition} />}>
          {modelPath ? (
            <IPhoneModel url={modelPath} position={modelPosition} />
          ) : (
            <BasicIPhone position={modelPosition} />
          )}
        </Suspense>
        
        <Environment preset="city" />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={false}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={20}
          // Only set target if position is not the default
          {...(modelPosition[0] !== 0 || modelPosition[1] !== -0.2 || modelPosition[2] !== 0 
              ? { target: modelPosition } 
              : {})}
        />
      </Canvas>
    </div>
  );
}