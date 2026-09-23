import React from 'react';

interface ThreeDCareerIconProps {
  careerId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ThreeDCareerIcon: React.FC<ThreeDCareerIconProps> = ({
  careerId,
  className = '',
  size = 'md'
}) => {
  const norm = (careerId || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl'
  }[size];

  let gradient = 'from-blue-600 to-indigo-700';
  let shadow = 'shadow-blue-500/30';
  let emoji = '🚀';
  let subtitle = 'Career';

  if (norm.includes('scientist') || norm.includes('research')) {
    gradient = 'from-emerald-500 via-teal-600 to-cyan-700';
    shadow = 'shadow-emerald-500/40';
    emoji = '🔬';
    subtitle = 'Microscope';
  } else if (norm.includes('doctor') || norm.includes('medical') || norm.includes('surgeon')) {
    gradient = 'from-rose-500 via-pink-600 to-red-600';
    shadow = 'shadow-rose-500/40';
    emoji = '🩺';
    subtitle = 'Stethoscope';
  } else if (norm.includes('engineer') || norm.includes('mechanical') || norm.includes('civil')) {
    gradient = 'from-amber-500 via-orange-600 to-yellow-600';
    shadow = 'shadow-amber-500/40';
    emoji = '⚙️';
    subtitle = 'Tools & Gear';
  } else if (norm.includes('software') || norm.includes('developer') || norm.includes('coder') || norm.includes('tech')) {
    gradient = 'from-sky-500 via-blue-600 to-indigo-700';
    shadow = 'shadow-sky-500/40';
    emoji = '💻';
    subtitle = 'Workstation';
  } else if (norm.includes('pilot') || norm.includes('aviation') || norm.includes('astronaut')) {
    gradient = 'from-cyan-500 via-sky-600 to-blue-700';
    shadow = 'shadow-cyan-500/40';
    emoji = '✈️';
    subtitle = 'Aircraft';
  } else if (norm.includes('teacher') || norm.includes('professor') || norm.includes('educator')) {
    gradient = 'from-indigo-500 via-purple-600 to-pink-600';
    shadow = 'shadow-indigo-500/40';
    emoji = '📚';
    subtitle = 'Books';
  } else if (norm.includes('civil') || norm.includes('ias') || norm.includes('ips') || norm.includes('officer')) {
    gradient = 'from-yellow-500 via-amber-600 to-orange-700';
    shadow = 'shadow-yellow-500/40';
    emoji = '🏛️';
    subtitle = 'Public Service';
  } else if (norm.includes('art') || norm.includes('design') || norm.includes('animat')) {
    gradient = 'from-fuchsia-500 via-purple-600 to-pink-600';
    shadow = 'shadow-fuchsia-500/40';
    emoji = '🎨';
    subtitle = 'Creative Art';
  }

  return (
    <div
      style={{ perspective: '800px' }}
      className={`relative inline-flex items-center justify-center group shrink-0 ${className}`}
      title={subtitle}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(6deg) rotateY(-6deg) translateZ(4px)'
        }}
        className={`${sizeClasses} rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-xl ${shadow} border border-white/25 relative overflow-hidden transition-all duration-300 group-hover:rotate-0 group-hover:scale-108`}
      >
        {/* Ambient Top Light */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/30 pointer-events-none" />

        {/* 3D Emoji Icon */}
        <span
          style={{ transform: 'translateZ(14px)' }}
          className="relative z-10 filter drop-shadow-md select-none transform transition-transform group-hover:scale-120"
        >
          {emoji}
        </span>
      </div>
    </div>
  );
};
