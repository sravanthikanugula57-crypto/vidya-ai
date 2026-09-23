import React, { useRef, useState, useEffect } from 'react';

interface Modern3DCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (e.g. 8 to 15)
  glare?: boolean;
  scale?: number; // scale on hover (e.g. 1.02)
  onClick?: () => void;
  id?: string;
}

export const Modern3DCard: React.FC<Modern3DCardProps> = ({
  children,
  className = '',
  depth = 10,
  glare = true,
  scale = 1.02,
  onClick,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (mediaQuery) {
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handler);
          return () => mediaQuery.removeEventListener('change', handler);
        } else if ((mediaQuery as any).addListener) {
          (mediaQuery as any).addListener(handler);
          return () => (mediaQuery as any).removeListener(handler);
        }
      }
    } catch (e) {
      // Gracefully fall back to standard motion
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(1, mouseX / width));
    const percentY = Math.max(0, Math.min(1, mouseY / height));

    const rY = (percentX - 0.5) * (depth * 2);
    const rX = (0.5 - percentY) * (depth * 2);

    setRotateX(rX);
    setRotateY(rY);

    if (glare) {
      setGlarePos({
        x: percentX * 100,
        y: percentY * 100,
        opacity: 0.25
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  if (prefersReducedMotion) {
    return (
      <div id={id} className={`transition-all ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(4px)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
          transformStyle: 'preserve-3d'
        }}
        className="w-full h-full relative"
      >
        {children}

        {/* Specular glare reflection effect */}
        {glare && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-30"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, rgba(255, 255, 255, 0) 65%)`
            }}
          />
        )}
      </div>
    </div>
  );
};
