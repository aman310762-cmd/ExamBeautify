// ============================================================
// ExamBeautify — Theme Definitions
// ============================================================

import { ThemeDefinition, ThemeId } from '@/types/exam';

export const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    description: 'Clean whites, subtle grays, and blue accents',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      muted: '#64748b',
      border: '#e2e8f0',
      headerBg: '#eff6ff',
      headerText: '#1e40af',
    },
    preview: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
  },
  'classic-exam': {
    id: 'classic-exam',
    name: 'Classic Examination',
    description: 'Traditional serif, formal borders, cream tones',
    colors: {
      primary: '#78350f',
      secondary: '#92400e',
      accent: '#b45309',
      background: '#fefce8',
      surface: '#fffbeb',
      text: '#1c1917',
      muted: '#57534e',
      border: '#d6d3d1',
      headerBg: '#fef3c7',
      headerText: '#78350f',
    },
    preview: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)',
  },
  'corporate-navy': {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Dark navy headers, gold accents, professional',
    colors: {
      primary: '#1e3a5f',
      secondary: '#2d5a8e',
      accent: '#d4a843',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#111827',
      muted: '#4b5563',
      border: '#d1d5db',
      headerBg: '#1e3a5f',
      headerText: '#ffffff',
    },
    preview: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #d4a843 100%)',
  },
  'emerald-academic': {
    id: 'emerald-academic',
    name: 'Emerald Academic',
    description: 'Rich green headers, warm ivory, academic feel',
    colors: {
      primary: '#065f46',
      secondary: '#047857',
      accent: '#10b981',
      background: '#faf5ef',
      surface: '#fffdf7',
      text: '#1a1a1a',
      muted: '#525252',
      border: '#d4d4d4',
      headerBg: '#065f46',
      headerText: '#ffffff',
    },
    preview: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)',
  },
};
