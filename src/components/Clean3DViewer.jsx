// src/components/Clean3DViewer.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

function IPhoneModel({ url }) {
  const { scene } = useGLTF(url);
  // Perfect positioning
  return <primitive object={scene} position={[0, -0.2, 0]} />;
}

function BasicIPhone() {
  return (
    <mesh position={[0, -0.2, 0]}>
      <boxGeometry args={[1.6, 3.1, 0.3]} />
      <meshStandardMaterial color="#1D1D1F" />
    </mesh>
  );
}

export default function Clean3DViewer({ modelPath }) {
  return (
    <div className="relative w-full h-[500px] bg-white rounded-2xl overflow-hidden">
      {/* Instructions at the TOP */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white/90 px-3 py-1.5 rounded-full z-10">
        Click and drag to spin • Scroll to zoom
      </div>
      
      <Canvas camera={{ position: [0, 0, 1.2], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <Suspense fallback={<BasicIPhone />}>
          {modelPath ? <IPhoneModel url={modelPath} /> : <BasicIPhone />}
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
        />
      </Canvas>
    </div>
  );
}