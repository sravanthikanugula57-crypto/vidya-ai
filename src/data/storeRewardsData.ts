import { StoreItem } from '../types';

export const REWARD_STORE_ITEMS: StoreItem[] = [
  {
    id: 'reward_dark_theme',
    title: 'Midnight Focus Study Theme',
    description: 'High-contrast dark theme optimized for late-evening study sessions',
    cost: 100,
    category: 'Theme',
    icon: '🌙',
    unlocked: false
  },
  {
    id: 'reward_math_sheet',
    title: 'SSC Mathematics Key Theorems Reference',
    description: 'Summary sheet of essential geometry theorems and algebraic identities',
    cost: 150,
    category: 'Formula Sheet',
    icon: '📐',
    unlocked: false
  },
  {
    id: 'reward_science_sheet',
    title: 'Physical Science Laws & Formulas Reference',
    description: 'Quick-reference guide for laws of motion, optics, and chemical equations',
    cost: 150,
    category: 'Formula Sheet',
    icon: '🔬',
    unlocked: false
  },
  {
    id: 'reward_socratic_badge',
    title: 'Curious Learner Badge',
    description: 'Recognition for consistent step-by-step problem solving with Socratic AI Tutor',
    cost: 200,
    category: 'Badge',
    icon: '💡',
    unlocked: false
  }
];
