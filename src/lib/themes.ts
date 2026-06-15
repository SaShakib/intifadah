import type { ThemeId } from '@/types';

export const THEMES: ThemeId[] = [
  { id: 'default', label: 'গোলাপী (ডিফল্ট)', color: 'oklch(50% 0.26 354)' },
  { id: 'green',   label: 'সবুজ',             color: 'oklch(44% 0.14 145)' },
  { id: 'blue',    label: 'নীল',               color: 'oklch(55% 0.20 240)' },
  { id: 'teal',    label: 'টিল',               color: 'oklch(52% 0.16 195)' },
];

export type ColorMode = 'light' | 'dark' | 'system';

export const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: 'system', label: 'সিস্টেম' },
  { id: 'light',  label: 'আলো'   },
  { id: 'dark',   label: 'অন্ধকার' },
];
