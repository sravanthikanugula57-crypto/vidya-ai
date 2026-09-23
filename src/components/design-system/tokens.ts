export interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  darkHex?: string;
  description: string;
  wcagOnWhite: string;
  wcagOnDark: string;
}

export interface TypographyToken {
  name: string;
  size: string;
  sizePx: number;
  weight: string;
  lineHeight: string;
  tracking: string;
  sampleText: string;
  usage: string;
}

export interface SpacingToken {
  name: string;
  px: number;
  rem: string;
  usage: string;
}

export interface ShadowToken {
  name: string;
  css: string;
  darkCss: string;
  usage: string;
}

export interface RadiusToken {
  name: string;
  value: string;
  px: number;
  usage: string;
}

export const BRAND_IDENTITY = {
  name: 'VidyaAI Design System',
  version: '1.0.0 Enterprise',
  targetAudience: '2.4 Million Government School Students, Teachers, Parents & DEO Officers in India',
  voice: [
    { trait: 'Empathetic & Inclusive', description: 'Welcoming tone tailored for first-generation rural learners in Telugu, English, and Hindi.' },
    { trait: 'Socratic & Encouraging', description: 'Never gives raw answers directly; guides students step-by-step with hints.' },
    { trait: 'Authoritative & Secure', description: 'Government educational data standards with zero commercial fluff.' },
    { trait: 'Lightweight & Fast', description: 'Optimized for 2G/3G networks and budget Android devices.' }
  ],
  aiCharacter: {
    name: 'Vidya (విద్యా AI)',
    role: 'Socratic AI Tutor & Knowledge Companion',
    personality: 'Patient, warm, curious, encouraging, and culturally rooted.',
    avatarStyle: 'Glowing emerald-sky lotus spark particle emblem.',
    soundFeedback: 'Soft gentle chime on completion, subtle tap sounds on key interactions.'
  }
};

export const COLOR_TOKENS: ColorToken[] = [
  // Primary
  { name: 'Primary 500 (Vidya Blue)', variable: '--color-primary-500', hex: '#2563EB', darkHex: '#3B82F6', description: 'Main action color, primary buttons, hero branding', wcagOnWhite: '4.6:1 (AA)', wcagOnDark: '8.2:1 (AAA)' },
  { name: 'Primary 600 (Deep Sky)', variable: '--color-primary-600', hex: '#1D4ED8', darkHex: '#2563EB', description: 'Hover states and active tabs', wcagOnWhite: '6.8:1 (AAA)', wcagOnDark: '10.1:1 (AAA)' },
  { name: 'Primary 50 (Soft Sky Tint)', variable: '--color-primary-50', hex: '#EFF6FF', darkHex: '#1E293B', description: 'Selected card backgrounds, subtle active state', wcagOnWhite: '1.1:1', wcagOnDark: '14.5:1' },

  // Secondary
  { name: 'Secondary Emerald 500', variable: '--color-emerald-500', hex: '#10B981', darkHex: '#34D399', description: 'Teacher portal, success states, verified badges', wcagOnWhite: '3.1:1', wcagOnDark: '11.4:1' },
  { name: 'Secondary Emerald 600', variable: '--color-emerald-600', hex: '#059669', darkHex: '#10B981', description: 'Strong success text & teacher controls', wcagOnWhite: '4.7:1 (AA)', wcagOnDark: '8.8:1 (AAA)' },

  // Role Accents
  { name: 'Parent Purple 600', variable: '--color-purple-600', hex: '#9333EA', darkHex: '#A855F7', description: 'Parent portal branding & audio summary widgets', wcagOnWhite: '6.5:1 (AAA)', wcagOnDark: '7.4:1 (AA)' },
  { name: 'Admin Amber 500', variable: '--color-amber-500', hex: '#F59E0B', darkHex: '#FBBF24', description: 'District Admin DEO alerts & streak badges', wcagOnWhite: '1.9:1', wcagOnDark: '12.8:1' },
  { name: 'Admin Amber 600', variable: '--color-amber-600', hex: '#D97706', darkHex: '#F59E0B', description: 'Accessible warning & admin metric text', wcagOnWhite: '4.8:1 (AA)', wcagOnDark: '8.1:1 (AAA)' },

  // Neutrals
  { name: 'Neutral 900 (Slate Ink)', variable: '--color-slate-900', hex: '#0F172A', darkHex: '#F8FAFC', description: 'Primary headings and high-contrast text', wcagOnWhite: '17.8:1 (AAA)', wcagOnDark: '1:1' },
  { name: 'Neutral 600 (Slate Body)', variable: '--color-slate-600', hex: '#475569', darkHex: '#94A3B8', description: 'Body text and secondary instructions', wcagOnWhite: '7.1:1 (AAA)', wcagOnDark: '4.8:1 (AA)' },
  { name: 'Neutral 100 (Slate Canvas)', variable: '--color-slate-100', hex: '#F1F5F9', darkHex: '#0F172A', description: 'Page background light mode', wcagOnWhite: '1.1:1', wcagOnDark: '16.2:1' },

  // Dark Mode Surface
  { name: 'Dark Surface 950', variable: '--color-dark-surface-950', hex: '#020617', darkHex: '#020617', description: 'Dark theme primary canvas background', wcagOnWhite: '19.5:1', wcagOnDark: '1:1' },
  { name: 'Dark Surface Card', variable: '--color-dark-surface-card', hex: '#0F172A', darkHex: '#1E293B', description: 'Dark theme card surface', wcagOnWhite: '15.2:1', wcagOnDark: '1.4:1' },

  // Feedback
  { name: 'Error Rose 600', variable: '--color-rose-600', hex: '#E11D48', darkHex: '#F43F5E', description: 'Validation errors, alert banners', wcagOnWhite: '5.2:1 (AA)', wcagOnDark: '7.9:1 (AAA)' }
];

export const TYPOGRAPHY_TOKENS: TypographyToken[] = [
  { name: 'Display XL', size: 'text-4xl sm:text-5xl lg:text-6xl', sizePx: 56, weight: 'font-black (900)', lineHeight: 'leading-tight (1.1)', tracking: 'tracking-tight (-0.03em)', sampleText: 'AI Tutor for Every Child', usage: 'Hero headlines on landing page' },
  { name: 'Display Large', size: 'text-3xl sm:text-4xl', sizePx: 36, weight: 'font-extrabold (800)', lineHeight: 'leading-snug (1.2)', tracking: 'tracking-tight (-0.02em)', sampleText: 'District DEO Analytics', usage: 'Major section titles' },
  { name: 'Heading H1', size: 'text-2xl sm:text-3xl', sizePx: 28, weight: 'font-bold (700)', lineHeight: 'leading-snug (1.25)', tracking: 'tracking-normal', sampleText: 'Class 9 Physical Science', usage: 'Dashboard main header' },
  { name: 'Heading H2', size: 'text-xl sm:text-2xl', sizePx: 24, weight: 'font-bold (700)', lineHeight: 'leading-snug (1.3)', tracking: 'tracking-normal', sampleText: 'Newton\'s Laws of Motion', usage: 'Chapter titles & modal headers' },
  { name: 'Heading H3', size: 'text-lg', sizePx: 18, weight: 'font-semibold (600)', lineHeight: 'leading-normal (1.4)', tracking: 'tracking-normal', sampleText: 'Socratic Quiz Question 1', usage: 'Card headers & widget titles' },
  { name: 'Body Large', size: 'text-base', sizePx: 16, weight: 'font-normal (400)', lineHeight: 'leading-relaxed (1.625)', tracking: 'tracking-normal', sampleText: 'An object at rest remains at rest unless acted upon by an external unbalanced force.', usage: 'Primary lesson content & explanations' },
  { name: 'Body Medium', size: 'text-sm', sizePx: 14, weight: 'font-normal (400)', lineHeight: 'leading-relaxed (1.5)', tracking: 'tracking-normal', sampleText: 'Telugu Audio Summary generated at 08:30 AM for Parents.', usage: 'Card descriptions, list items' },
  { name: 'Body Small', size: 'text-xs', sizePx: 12, weight: 'font-medium (500)', lineHeight: 'leading-normal (1.4)', tracking: 'tracking-normal', sampleText: 'ZPHS High School • Medak District • State Board', usage: 'Subtitles, tags, table rows' },
  { name: 'Caption / Label', size: 'text-[11px]', sizePx: 11, weight: 'font-extrabold (800)', lineHeight: 'leading-none (1.0)', tracking: 'tracking-wider (0.05em)', sampleText: 'GOVERNMENT VERIFIED • WCAG AAA', usage: 'Badges, pill tags, metadata uppercase labels' },
  { name: 'Code / Formula', size: 'text-xs font-mono', sizePx: 12, weight: 'font-bold (700)', lineHeight: 'leading-relaxed (1.5)', tracking: 'tracking-mono', sampleText: 'F = m × a  (Force = Mass × Acceleration)', usage: 'Math formulas, physics equations, code snippets' }
];

export const SPACING_TOKENS: SpacingToken[] = [
  { name: '4px (xs)', px: 4, rem: '0.25rem', usage: 'Tight icon-to-label gaps, badge padding' },
  { name: '8px (sm)', px: 8, rem: '0.5rem', usage: 'Chip padding, small list item spacing' },
  { name: '12px (md)', px: 12, rem: '0.75rem', usage: 'Standard button vertical padding, input padding' },
  { name: '16px (lg)', px: 16, rem: '1.0rem', usage: 'Card inner padding minimum, stack spacing' },
  { name: '20px (xl)', px: 20, rem: '1.25rem', usage: 'Modal container padding, form section gap' },
  { name: '24px (2xl)', px: 24, rem: '1.5rem', usage: 'Dashboard card padding, grid gaps' },
  { name: '32px (3xl)', px: 32, rem: '2.0rem', usage: 'Section spacing on tablet/desktop' },
  { name: '48px (4xl)', px: 48, rem: '3.0rem', usage: 'Hero section vertical padding' },
  { name: '64px (5xl)', px: 64, rem: '4.0rem', usage: 'Page section layout gaps' }
];

export const RADIUS_TOKENS: RadiusToken[] = [
  { name: 'Small (sm)', value: 'rounded-lg', px: 8, usage: 'Inputs, dropdown menus, small badges' },
  { name: 'Medium (md)', value: 'rounded-xl', px: 12, usage: 'Standard buttons, mini cards, tooltips' },
  { name: 'Large (lg)', value: 'rounded-2xl', px: 16, usage: 'Standard cards, dialog containers' },
  { name: 'Extra Large (xl)', value: 'rounded-3xl', px: 24, usage: 'Hero containers, floating AI panels' },
  { name: 'Pill (full)', value: 'rounded-full', px: 9999, usage: 'Avatars, status pills, play buttons' }
];

export const SHADOW_TOKENS: ShadowToken[] = [
  { name: 'Subtle Card (sm)', css: 'shadow-sm border border-slate-200/80', darkCss: 'border-slate-800 bg-slate-900', usage: 'List cards & passive grid widgets' },
  { name: 'Elevated Card (md)', css: 'shadow-md border border-slate-200', darkCss: 'shadow-lg shadow-black/40 border-slate-800', usage: 'Interactive cards on hover' },
  { name: 'Floating AI Panel (lg)', css: 'shadow-xl shadow-blue-500/10 border border-blue-100', darkCss: 'shadow-2xl shadow-blue-950/50 border-blue-900/50', usage: 'AI Chat drawer & Floating tutor bar' },
  { name: 'Modal Overlay (2xl)', css: 'shadow-2xl shadow-slate-900/20', darkCss: 'shadow-2xl shadow-black/80', usage: 'Auth modals & DEO alert dialogs' },
  { name: 'Glass Surface', css: 'backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg', darkCss: 'backdrop-blur-xl bg-slate-900/80 border border-slate-800/60', usage: 'Sticky navbar & overlay action bars' }
];
