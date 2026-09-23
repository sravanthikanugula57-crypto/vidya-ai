import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ThreeDAssistantOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  theme?: 'blue' | 'purple' | 'emerald' | 'amber';
  className?: string;
  onClick?: () => void;
}

export const ThreeDAssistantOrb: React.FC<ThreeDAssistantOrbProps> = ({
  size = 'md',
  state = 'idle',
  theme = 'blue',
  className = '',
  onClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const sizePixels = {
    sm: 56,
    md: 96,
    lg: 140,
    xl: 200
  }[size];

  const colorPalette = {
    blue: { core: 0x0284c7, ring: 0x38bdf8, glow: 0x0ea5e9, particle: 0x7dd3fc },
    purple: { core: 0x7c3aed, ring: 0xa855f7, glow: 0xc084fc, particle: 0xe9d5ff },
    emerald: { core: 0x059669, ring: 0x10b981, glow: 0x34d399, particle: 0xa7f3d0 },
    amber: { core: 0xd97706, ring: 0xf59e0b, glow: 0xfbbf24, particle: 0xfde68a }
  }[theme];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number | null = null;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4.2;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
      });
      renderer.setSize(sizePixels, sizePixels);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(colorPalette.glow, 4.0, 10);
      pointLight.position.set(2, 2, 3);
      scene.add(pointLight);

      const group = new THREE.Group();
      scene.add(group);

      // 1. Core Sphere with glowing material
      const coreGeo = new THREE.SphereGeometry(1.0, 24, 24);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: colorPalette.core,
        emissive: colorPalette.glow,
        emissiveIntensity: 0.85,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.4,
        transparent: true,
        opacity: 0.9
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // 2. Orbital rings
      const ringGeo = new THREE.TorusGeometry(1.4, 0.035, 12, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorPalette.ring,
        emissive: colorPalette.ring,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.7
      });

      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 3;
      group.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, ringMat);
      ring2.rotation.y = Math.PI / 4;
      ring2.rotation.x = -Math.PI / 4;
      group.add(ring2);

      // 3. Orbiting Sparkles
      const particleCount = 20;
      const particlesGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2;
        const radius = 1.45 + (Math.random() - 0.5) * 0.3;
        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = Math.sin(theta) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: colorPalette.particle,
        size: 0.1,
        transparent: true,
        opacity: 0.8
      });
      const particles = new THREE.Points(particlesGeo, particleMat);
      group.add(particles);

      const clock = new THREE.Clock();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          const speed = state === 'thinking' ? 2.8 : state === 'speaking' ? 2.0 : state === 'listening' ? 1.4 : 1.0;

          group.rotation.y = t * 0.5 * speed;
          group.rotation.x = Math.sin(t * 0.3 * speed) * 0.25;

          ring1.rotation.z = t * 0.8 * speed;
          ring2.rotation.z = -t * 0.7 * speed;

          const pulse = 1.0 + Math.sin(t * 2.5 * speed) * (state === 'speaking' ? 0.12 : 0.05);
          coreMesh.scale.set(pulse, pulse, pulse);

          particles.rotation.z = -t * 0.4 * speed;
        }

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();
    } catch (e) {
      console.warn('ThreeDAssistantOrb WebGL initialization notice:', e);
      setHasWebGL(false);
    }

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      try {
        if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) {
          renderer.dispose();
        }
      } catch (err) {
        console.warn('ThreeDAssistantOrb cleanup error:', err);
      }
    };
  }, [size, state, theme]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{ width: sizePixels, height: sizePixels }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      title="VidyaAI 3D Socratic Assistant Orb"
    >
      {!hasWebGL && (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold animate-pulse shadow-lg">
          ✨
        </div>
      )}
    </div>
  );
};
