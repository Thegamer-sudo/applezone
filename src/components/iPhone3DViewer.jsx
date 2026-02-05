// src/components/iPhone3DViewer.jsx
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

// Loading fallback
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// iPhone Model Component
function iPhoneModel({ modelUrl, color, scale = 1.2 }) {
  const group = useRef();
  const { scene } = useGLTF(modelUrl);
  
  // Clone the scene to avoid mutating the original
  const clonedScene = scene.clone();
  
  // Apply color to materials
  clonedScene.traverse((child) => {
    if (child.isMesh && child.material) {
      // Create new material with the selected color
      const newMaterial = child.material.clone();
      
      // For iPhone body parts (not screen/glass)
      if (child.name.includes('Body') || child.name.includes('Frame')) {
        newMaterial.color = new THREE.Color(color);
        newMaterial.metalness = 0.8;
        newMaterial.roughness = 0.2;
      }
      
      // For screen/glass parts
      if (child.name.includes('Screen') || child.name.includes('Glass')) {
        newMaterial.opacity = 0.95;
        newMaterial.transparent = true;
      }
      
      child.material = newMaterial;
    }
  });

  // Rotation animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={group} 
        object={clonedScene} 
        scale={scale} 
        position={[0, -0.5, 0]} 
      />
    </Float>
  );
}

// Main 3D Viewer Component
export default function iPhone3DViewer({ 
  modelName = 'iPhone 15 Pro',
  availableColors = ['#1D1D1F', '#F5F5F7', '#007AFF', '#34C759'],
  initialColor = '#1D1D1F'
}) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  
  // Model URL based on iPhone model
  const getModelUrl = () => {
    // For now, using a placeholder model
    // You'll replace these with actual iPhone 3D models
    const modelMap = {
      'iPhone XR': '/models/iphone-xr.glb',
      'iPhone 11': '/models/iphone-11.glb',
      'iPhone 12': '/models/iphone-12.glb',
      'iPhone 13': '/models/iphone-13.glb',
      'iPhone 14': '/models/iphone-14.glb',
      'iPhone 15': '/models/iphone-15.glb',
      'iPhone 16': '/models/iphone-16.glb',
      'default': '/models/iphone-15-pro.glb'
    };
    
    return modelMap[modelName] || modelMap.default;
  };

  const modelUrl = getModelUrl();

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          shadows
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#007AFF" />
            
            {/* iPhone Model */}
            <iPhoneModel modelUrl={modelUrl} color={selectedColor} />
            
            {/* Environment */}
            <Environment preset="studio" />
            
            {/* Controls */}
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={rotationEnabled}
              maxPolarAngle={Math.PI / 2}
              minDistance={3}
              maxDistance={10}
              autoRotate={rotationEnabled}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Color Picker Overlay */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
        {availableColors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-full border-2 ${
              selectedColor === color ? 'border-white' : 'border-gray-600'
            } transition-transform hover:scale-110`}
            style={{ backgroundColor: color }}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => setRotationEnabled(!rotationEnabled)}
          className="bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition"
          title={rotationEnabled ? 'Pause Rotation' : 'Start Rotation'}
        >
          {rotationEnabled ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              canvas.requestFullscreen();
            }
          }}
          className="bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition"
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>

      {/* Model Info */}
      <div className="absolute top-6 left-6 bg-black/70 text-white px-4 py-2 rounded-lg">
        <p className="text-sm font-medium">{modelName}</p>
        <p className="text-xs opacity-75">Drag to rotate • Scroll to zoom</p>
      </div>

      {/* Loading Fallback (if model not found) */}
      <Suspense fallback={<Loader />}>
        {/* Component already loaded */}
      </Suspense>
    </div>
  );
}