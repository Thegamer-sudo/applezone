import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Model({ color = '#FF3B30' }) {
  // Load the model
  const { scene } = useGLTF('/models/iphone-xr.glb');
  
  useEffect(() => {
    // Debug: Log the scene structure
    console.log('Model loaded:', scene);
    scene.traverse((child) => {
      if (child.isMesh) {
        console.log('Mesh found:', child.name, 'Material:', child.material?.name);
      }
    });
  }, [scene]);

  // Clone scene to apply modifications
  const clonedScene = scene.clone();
  
  // Apply color if possible
  clonedScene.traverse((child) => {
    if (child.isMesh && child.material) {
      const material = child.material.clone();
      
      // Try to apply color to body materials
      // iPhone XR Red should already be red from textures
      // We'll just make sure it renders
      child.material = material;
    }
  });

  return <primitive object={clonedScene} scale={1.5} position={[0, 0, 0]} />;
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white">
      <div className="text-center p-6">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Loading iPhone XR 3D Model...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
      </div>
    </div>
  );
}

export default function iPhoneXR3DViewer() {
  return (
    <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden border border-gray-200">
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#ffffff' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-5, -5, -5]} intensity={0.3} />
          
          {/* Model */}
          <Model />
          
          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={10}
          />
          
          <Environment preset="studio" />
        </Canvas>
      </Suspense>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm shadow-sm">
        Drag to rotate • Scroll to zoom
      </div>
      
      {/* Fullscreen */}
      <button
        onClick={() => document.querySelector('canvas')?.requestFullscreen()}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm shadow-sm"
      >
        ⛶ Fullscreen
      </button>
    </div>
  );
}

// Preload
useGLTF.preload('/models/iphone-xr.glb');