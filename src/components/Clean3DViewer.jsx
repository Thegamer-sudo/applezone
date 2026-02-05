import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Clean3DViewer({ color = '#1D1D1F' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup with WHITE background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // WHITE BACKGROUND
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);

    // Clean, soft lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, -5, 5);
    scene.add(fillLight);

    // Create REALISTIC iPhone
    const createiPhone = () => {
      const group = new THREE.Group();
      
      // Main Body (with proper iPhone proportions)
      const bodyGeometry = new THREE.BoxGeometry(2.5, 5.2, 0.3);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.9
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // Screen (with glass effect)
      const screenGeometry = new THREE.BoxGeometry(2.3, 4.9, 0.31);
      const screenMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        emissive: 0x222222,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.02,
        transparent: true,
        opacity: 0.95
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.155;
      screen.castShadow = true;
      group.add(screen);
      
      // Screen Content (app icons)
      const screenContentGeometry = new THREE.PlaneGeometry(2.2, 4.8);
      const screenContentMaterial = new THREE.MeshBasicMaterial({
        color: 0x1d1d1f,
        side: THREE.DoubleSide
      });
      const screenContent = new THREE.Mesh(screenContentGeometry, screenContentMaterial);
      screenContent.position.z = 0.31;
      group.add(screenContent);
      
      // Camera Module (modern iPhone style)
      const cameraBaseGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.2);
      const cameraBaseMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.98,
        roughness: 0.02
      });
      const cameraBase = new THREE.Mesh(cameraBaseGeometry, cameraBaseMaterial);
      cameraBase.position.set(0, 1.8, 0.25);
      group.add(cameraBase);
      
      // Camera Lenses (3 lenses like iPhone Pro)
      const lensGeometry = new THREE.CircleGeometry(0.12, 32);
      const lensMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 0.5,
        roughness: 0.1,
        sheen: 0.5
      });
      
      // Lens 1
      const lens1 = new THREE.Mesh(lensGeometry, lensMaterial);
      lens1.position.set(-0.25, 1.8, 0.36);
      lens1.rotation.x = -Math.PI / 2;
      group.add(lens1);
      
      // Lens 2
      const lens2 = lens1.clone();
      lens2.position.set(0.25, 1.8, 0.36);
      group.add(lens2);
      
      // Lens 3 (telephoto)
      const lens3 = lens1.clone();
      lens3.position.set(0, 1.65, 0.36);
      lens3.scale.setScalar(0.8);
      group.add(lens3);
      
      // Flash/LiDAR
      const flashGeometry = new THREE.CircleGeometry(0.06, 24);
      const flashMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x666666,
        metalness: 0.7,
        roughness: 0.2
      });
      const flash = new THREE.Mesh(flashGeometry, flashMaterial);
      flash.position.set(-0.25, 1.65, 0.36);
      flash.rotation.x = -Math.PI / 2;
      group.add(flash);
      
      // Side buttons
      const buttonGeometry = new THREE.CapsuleGeometry(0.05, 0.3, 4, 8);
      const buttonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
      });
      
      // Volume up
      const volumeUp = new THREE.Mesh(buttonGeometry, buttonMaterial);
      volumeUp.position.set(1.4, 0.5, 0);
      volumeUp.rotation.z = Math.PI / 2;
      group.add(volumeUp);
      
      // Volume down
      const volumeDown = volumeUp.clone();
      volumeDown.position.set(1.4, -0.2, 0);
      group.add(volumeDown);
      
      // Power button
      const powerButton = volumeUp.clone();
      powerButton.position.set(1.4, 1.8, 0);
      powerButton.scale.setScalar(0.8);
      group.add(powerButton);
      
      return group;
    };
    
    const iphone = createiPhone();
    scene.add(iphone);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    
    const onMouseDown = (e) => { 
      isDragging = true; 
      autoRotate = false;
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };
    
    const onMouseUp = () => { 
      isDragging = false; 
      setTimeout(() => { autoRotate = true; }, 2000);
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.offsetX - previousMousePosition.x;
      const deltaY = e.offsetY - previousMousePosition.y;
      
      iphone.rotation.y += deltaX * 0.01;
      iphone.rotation.x += deltaY * 0.01;
      
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };
    
    const onWheel = (e) => {
      camera.position.z += e.deltaY * 0.002;
      camera.position.z = Math.max(4, Math.min(15, camera.position.z));
    };
    
    mountRef.current.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    mountRef.current.addEventListener('mousemove', onMouseMove);
    mountRef.current.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (autoRotate && !isDragging) {
        iphone.rotation.y += 0.003;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      mountRef.current?.removeEventListener('mousemove', onMouseMove);
      mountRef.current?.removeEventListener('wheel', onWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [color]);

  return (
    <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden border border-gray-200">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Only Fullscreen Button */}
      <button
        onClick={() => mountRef.current?.querySelector('canvas')?.requestFullscreen()}
        className="absolute bottom-4 right-4 bg-white/90 hover:bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
        title="Fullscreen"
      >
        ⛶ Fullscreen
      </button>
      
      {/* Simple Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}