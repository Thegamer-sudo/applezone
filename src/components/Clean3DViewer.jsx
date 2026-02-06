// src/components/Clean3DViewer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-gray-600 text-sm">Loading 3D model...</div>
    </div>
  );
}

// 3D iPhone Model Component
function IPhoneModel({ modelPath, color }) {
  const group = useRef();
  const { scene } = useGLTF(modelPath);
  
  // Auto-rotate
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  // Clone the scene to avoid mutating the original
  const clonedScene = scene.clone();
  
  // Apply color to materials if specified
  if (color) {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Create a new material with the color
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.4,
          metalness: 0.8,
        });
      }
    });
  }

  return <primitive ref={group} object={clonedScene} scale={0.5} />;
}

// Basic colored iPhone (fallback when no model)
function BasicIPhone({ color = '#1D1D1F' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* iPhone body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.1, 0.3]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.151]}>
        <planeGeometry args={[1.55, 3.05]} />
        <meshStandardMaterial 
          color="#000" 
          emissive="#111" 
          emissiveIntensity={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Camera bump */}
      <mesh position={[0, -1.2, 0.2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// Main component
export default function Clean3DViewer({ 
  color = '#1D1D1F', 
  modelPath = null,
  autoRotate = true 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const controlsRef = useRef();

  // Handle model loading
  useEffect(() => {
    if (modelPath) {
      setIsLoading(true);
      setError(null);
    }
  }, [modelPath]);

  const handleModelLoaded = () => {
    setIsLoading(false);
  };

  const handleModelError = (err) => {
    console.error('Failed to load 3D model:', err);
    setError('Failed to load 3D model');
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
      {/* Loading/Error states */}
      {isLoading && modelPath && <LoadingSpinner />}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-600 text-sm">Failed to load model</div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [3, 2, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Model */}
        {modelPath ? (
          <React.Suspense fallback={null}>
            <IPhoneModel 
              modelPath={modelPath} 
              color={color}
              onLoad={handleModelLoaded}
              onError={handleModelError}
            />
          </React.Suspense>
        ) : (
          <BasicIPhone color={color} />
        )}
        
        {/* Environment and effects */}
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={1.5} 
          far={0.8} 
        />
        
        {/* Controls - Different for mobile/desktop */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}