import React from 'react';

interface ThreeDSubjectIconProps {
  subjectName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ThreeDSubjectIcon: React.FC<ThreeDSubjectIconProps> = ({
  subjectName,
  className = '',
  size = 'md'
}) => {
  const norm = (subjectName || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-4xl'
  }[size];

  // Derive visual 3D archetype based on subject
  let gradient = 'from-blue-600 to-indigo-700';
  let shadow = 'shadow-blue-500/30';
  let badge = '📐';
  let glyph = '+ − × ÷';
  let label = 'Math';

  if (norm.includes('math') || norm.includes('గణితం') || norm.includes('ganitham')) {
    gradient = 'from-sky-500 via-blue-600 to-indigo-700';
    shadow = 'shadow-sky-500/35';
    badge = '📐';
    glyph = 'π √ ∑';
    label = 'Mathematics';
  } else if (norm.includes('sci') || norm.includes('సైన్స్') || norm.includes('vigyan') || norm.includes('physics') || norm.includes('chemistry') || norm.includes('biology')) {
    gradient = 'from-emerald-500 via-teal-600 to-cyan-700';
    shadow = 'shadow-emerald-500/35';
    badge = '🔬';
    glyph = '⚛ ⚗ 🧬';
    label = 'Science';
  } else if (norm.includes('eng') || norm.includes('ఇంగ్లీష్') || norm.includes('english')) {
    gradient = 'from-indigo-500 via-purple-600 to-pink-600';
    shadow = 'shadow-indigo-500/35';
    badge = '📖';
    glyph = 'A B C';
    label = 'English';
  } else if (norm.includes('soc') || norm.includes('సోషల్') || norm.includes('social') || norm.includes('history') || norm.includes('geography')) {
    gradient = 'from-amber-500 via-orange-600 to-red-600';
    shadow = 'shadow-amber-500/35';
    badge = '🌍';
    glyph = '🗺 🏛 🧭';
    label = 'Social Studies';
  } else if (norm.includes('evs') || norm.includes('environmental') || norm.includes('పరిసరాల')) {
    gradient = 'from-lime-500 via-emerald-600 to-teal-700';
    shadow = 'shadow-lime-500/35';
    badge = '🌱';
    glyph = '🌿 ☀️ 💧';
    label = 'EVS';
  } else if (norm.includes('tel') || norm.includes('తెలుగు')) {
    gradient = 'from-orange-500 via-amber-600 to-yellow-600';
    shadow = 'shadow-orange-500/35';
    badge = '📜';
    glyph = 'అ ఆ ఇ ఈ';
    label = 'Telugu';
  } else if (norm.includes('hin') || norm.includes('हिन्दी')) {
    gradient = 'from-rose-500 via-red-600 to-amber-600';
    shadow = 'shadow-rose-500/35';
    badge = '🖋️';
    glyph = 'अ आ इ ई';
    label = 'Hindi';
  } else if (norm.includes('comp') || norm.includes('code') || norm.includes('ai') || norm.includes('tech')) {
    gradient = 'from-cyan-500 via-blue-600 to-indigo-800';
    shadow = 'shadow-cyan-500/35';
    badge = '💻';
    glyph = '< / >';
    label = 'Computer';
  }

  return (
    <div
      style={{ perspective: '800px' }}
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      title={label}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(8deg) rotateY(-8deg) translateZ(4px)'
        }}
        className={`${sizeClasses} rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-lg ${shadow} border border-white/20 relative overflow-hidden transition-all duration-300 group-hover:rotate-0 group-hover:scale-110`}
      >
        {/* Specular highlight rim */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />

        {/* Floating 3D Badge icon */}
        <span
          style={{ transform: 'translateZ(12px)' }}
          className="relative z-10 filter drop-shadow-md select-none transform transition-transform group-hover:scale-115"
        >
          {badge}
        </span>

        {/* Subtle background glyph watermark */}
        <span className="absolute bottom-0 right-1 text-[9px] font-mono font-black text-white/25 pointer-events-none select-none tracking-tight">
          {glyph}
        </span>
      </div>
    </div>
  );
};
