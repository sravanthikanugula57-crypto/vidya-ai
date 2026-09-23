import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Floating3DEducationalHeroProps {
  className?: string;
  onInteract?: () => void;
}

export const Floating3DEducationalHero: React.FC<Floating3DEducationalHeroProps> = ({
  className = '',
  onInteract
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const initialWidth = Math.max(container.clientWidth || 0, 300);
    const initialHeight = Math.max(container.clientHeight || 0, 360);

    let handleMouseMove: ((event: MouseEvent) => void) | null = null;

    try {
      // 1. Scene Setup
      const scene = new THREE.Scene();
      
      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(
        45,
        initialWidth / initialHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.2, 8.5);

      // 3. Renderer with high performance & antialias
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(initialWidth, initialHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainDirectionalLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    mainDirectionalLight.position.set(5, 8, 5);
    mainDirectionalLight.castShadow = true;
    scene.add(mainDirectionalLight);

    const warmPointLight = new THREE.PointLight(0xf59e0b, 3.0, 15);
    warmPointLight.position.set(-3, 2, 2);
    scene.add(warmPointLight);

    const purpleLight = new THREE.PointLight(0x818cf8, 2.5, 12);
    purpleLight.position.set(3, -2, 2);
    scene.add(purpleLight);

    // Main Group to hold all objects for unified orbit & tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ----------------------------------------------------
    // 5. 3D EDUCATIONAL OBJECTS
    // ----------------------------------------------------

    // --- A. 3D OPEN BOOK ---
    const bookGroup = new THREE.Group();
    bookGroup.position.set(-2.2, 0.4, 0.5);
    bookGroup.rotation.set(0.3, 0.5, -0.15);

    // Book Cover (Navy Blue with golden trim)
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.2
    });
    const pagesMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6
    });

    const leftCover = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.6), coverMaterial);
    leftCover.position.set(-0.55, -0.04, 0);
    leftCover.rotation.z = 0.18;
    bookGroup.add(leftCover);

    const rightCover = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.6), coverMaterial);
    rightCover.position.set(0.55, -0.04, 0);
    rightCover.rotation.z = -0.18;
    bookGroup.add(rightCover);

    // Pages stack
    const leftPages = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.5), pagesMaterial);
    leftPages.position.set(-0.52, 0.04, 0);
    leftPages.rotation.z = 0.15;
    bookGroup.add(leftPages);

    const rightPages = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.5), pagesMaterial);
    rightPages.position.set(0.52, 0.04, 0);
    rightPages.rotation.z = -0.15;
    bookGroup.add(rightPages);

    // Spine
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.2 })
    );
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, -0.05, 0);
    bookGroup.add(spine);

    mainGroup.add(bookGroup);

    // --- B. 3D LAPTOP / TABLET ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(2.4, -0.3, 0.2);
    laptopGroup.rotation.set(0.2, -0.6, 0.1);

    const laptopBaseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.7
    });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.1), laptopBaseMat);
    laptopGroup.add(laptopBase);

    // Trackpad
    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.01, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 })
    );
    trackpad.position.set(0, 0.035, 0.28);
    laptopGroup.add(trackpad);

    // Screen
    const screenLid = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.05), laptopBaseMat);
    screenLid.position.set(0, 0.55, -0.5);
    screenLid.rotation.x = -0.22;
    laptopGroup.add(screenLid);

    const screenDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.95), screenMat);
    screenDisplay.position.set(0, 0.55, -0.47);
    screenDisplay.rotation.x = -0.22;
    laptopGroup.add(screenDisplay);

    mainGroup.add(laptopGroup);

    // --- C. 3D GRADUATION CAP ---
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 1.6, 0.3);
    capGroup.rotation.set(0.35, 0.2, -0.1);

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.1
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8
    });

    // Skullcap base
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.3, 24), capMat);
    capGroup.add(capBase);

    // Square top board
    const capTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.4), capMat);
    capTop.position.set(0, 0.16, 0);
    capTop.rotation.y = Math.PI / 4;
    capGroup.add(capTop);

    // Button on top
    const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), goldMat);
    capButton.position.set(0, 0.2, 0);
    capGroup.add(capButton);

    // Tassel string & fringe
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.4, 8), goldMat);
    tassel.position.set(0.5, 0.02, 0.5);
    tassel.rotation.z = 0.4;
    capGroup.add(tassel);

    mainGroup.add(capGroup);

    // --- D. 3D LIGHT BULB (Wisdom / Ideas) ---
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(-1.8, -1.2, 0.8);
    bulbGroup.rotation.set(-0.2, 0.4, 0.15);

    const bulbGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5
    });

    const bulbSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24), bulbGlassMat);
    bulbGroup.add(bulbSphere);

    const bulbCone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.35, 24), bulbGlassMat);
    bulbCone.position.set(0, -0.28, 0);
    bulbCone.rotation.x = Math.PI;
    bulbGroup.add(bulbCone);

    const bulbBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    bulbBase.position.set(0, -0.52, 0);
    bulbGroup.add(bulbBase);

    mainGroup.add(bulbGroup);

    // --- E. 3D SCIENCE ATOM & ORBITALS ---
    const atomGroup = new THREE.Group();
    atomGroup.position.set(1.7, 1.4, -0.2);

    // Core Nucleus
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xdb2777,
        emissiveIntensity: 0.8,
        roughness: 0.2
      })
    );
    atomGroup.add(nucleus);

    // Ring 1
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 12, 48), ringMat);
    ring1.rotation.set(Math.PI / 3, Math.PI / 6, 0);
    atomGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 12, 48), ringMat);
    ring2.rotation.set(-Math.PI / 3, Math.PI / 4, 0);
    atomGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 12, 48), ringMat);
    ring3.rotation.set(0, Math.PI / 2, Math.PI / 5);
    atomGroup.add(ring3);

    // Orbiting Electron
    const electron = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1 })
    );
    electron.position.set(0.65, 0, 0);
    atomGroup.add(electron);

    mainGroup.add(atomGroup);

    // --- F. FLOATING MATHEMATICS & SCIENCE SYMBOLS (3D Glyphs) ---
    const symbolGroup = new THREE.Group();
    
    // Canvas helper to generate sharp glowing 3D particle sprites
    const createSymbolSprite = (char: string, color: string) => {
      const cvs = document.createElement('canvas');
      cvs.width = 128;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = 'bold 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 64, 64);
      }
      const texture = new THREE.CanvasTexture(cvs);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85 });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.65, 0.65, 1);
      return sprite;
    };

    const mathSymbols = [
      { char: 'π', color: '#38bdf8', pos: [0.8, -1.3, 1.2] },
      { char: '√x', color: '#10b981', pos: [-2.6, 1.5, 0.2] },
      { char: '∑', color: '#f59e0b', pos: [2.8, 0.8, -0.5] },
      { char: '∆', color: '#a855f7', pos: [-0.6, -1.6, 0.4] },
      { char: 'E=mc²', color: '#ec4899', pos: [-1.2, 1.8, -0.6] },
      { char: '+', color: '#6366f1', pos: [1.2, 0.2, 1.4] },
      { char: '∫dx', color: '#06b6d4', pos: [2.5, -1.5, 0.3] }
    ];

    const spriteRefs: THREE.Sprite[] = [];
    mathSymbols.forEach(item => {
      const sp = createSymbolSprite(item.char, item.color);
      sp.position.set(item.pos[0], item.pos[1], item.pos[2]);
      symbolGroup.add(sp);
      spriteRefs.push(sp);
    });

    mainGroup.add(symbolGroup);

    // --- G. FLOATING SPARKS & KNOWLEDGE PARTICLES ---
    const particlesCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      // Color variation (Cyan, Gold, Sky Blue)
      const isGold = Math.random() > 0.6;
      particleColors[i * 3] = isGold ? 0.96 : 0.22;
      particleColors[i * 3 + 1] = isGold ? 0.62 : 0.74;
      particleColors[i * 3 + 2] = isGold ? 0.12 : 0.97;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    setIsLoaded(true);

    // ----------------------------------------------------
    // 6. INTERACTIVITY (MOUSE PARALLAX & GYROSCOPE)
    // ----------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    handleMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

      // ----------------------------------------------------
      // 7. ANIMATION LOOP
      // ----------------------------------------------------
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          // Smooth target interpolation for mouse parallax
          targetRotationY = mouseX * 0.45;
          targetRotationX = mouseY * 0.35;

          mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
          mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

          // Subtle gentle floating motions
          bookGroup.position.y = 0.4 + Math.sin(elapsedTime * 1.2) * 0.08;
          bookGroup.rotation.z = -0.15 + Math.cos(elapsedTime * 0.8) * 0.03;

          laptopGroup.position.y = -0.3 + Math.cos(elapsedTime * 1.4) * 0.07;
          laptopGroup.rotation.y = -0.6 + Math.sin(elapsedTime * 0.6) * 0.04;

          capGroup.position.y = 1.6 + Math.sin(elapsedTime * 1.5 + 1) * 0.09;
          capGroup.rotation.y = 0.2 + Math.sin(elapsedTime * 0.7) * 0.06;

          bulbGroup.position.y = -1.2 + Math.sin(elapsedTime * 1.3 + 2) * 0.07;
          bulbGroup.rotation.z = 0.15 + Math.cos(elapsedTime * 0.9) * 0.05;

          // Atom spins
          atomGroup.rotation.y = elapsedTime * 0.9;
          atomGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.3;
          electron.position.x = Math.cos(elapsedTime * 3) * 0.65;
          electron.position.y = Math.sin(elapsedTime * 3) * 0.65;

          // Symbol gentle drift
          spriteRefs.forEach((sp, idx) => {
            sp.position.y += Math.sin(elapsedTime * 1.5 + idx) * 0.0015;
          });

          // Slow particle drift
          particleSystem.rotation.y = elapsedTime * 0.03;
        }

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();
      setIsLoaded(true);

      // ----------------------------------------------------
      // 8. RESIZE OBSERVER
      // ----------------------------------------------------
      const handleResize = () => {
        if (!container || !renderer) return;
        const width = Math.max(container.clientWidth || 0, 300);
        const height = Math.max(container.clientHeight || 0, 360);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      };

      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } catch (e) {
      console.warn('WebGL initialization fallback in Floating3DEducationalHero:', e);
      setHasWebGL(false);
    }

    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (handleMouseMove) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      try {
        if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) {
          renderer.dispose();
        }
      } catch (err) {
        console.warn('Floating3DEducationalHero cleanup notice:', err);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onInteract}
      className={`relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="3D Floating Educational Environment"
    >
      {/* 2D Fallback if WebGL is unavailable */}
      {!hasWebGL && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur">
          <div className="flex items-center space-x-3 text-4xl animate-bounce">
            <span>📚</span>
            <span>💻</span>
            <span>💡</span>
            <span>🎓</span>
            <span>🔬</span>
          </div>
          <p className="text-sm text-slate-300 font-medium max-w-sm">
            Interactive 3D Educational Space. Aligned with Government High School & ZPHS Curriculum.
          </p>
        </div>
      )}

      {/* Subtle overlay lighting badge */}
      {isLoaded && (
        <div className="absolute bottom-2 right-4 pointer-events-none text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive 3D Canvas</span>
        </div>
      )}
    </div>
  );
};
