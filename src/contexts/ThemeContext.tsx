'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeId } from '@/types';
import type { ColorMode } from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeId['id'];
  mode: ColorMode;
  setTheme: (id: ThemeId['id']) => void;
  setMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId['id']>('default');
  const [mode, setModeState] = useState<ColorMode>('light'); // always light by default

  /* Load from localStorage on mount — default to 'light' if nothing saved */
  useEffect(() => {
    const savedTheme = localStorage.getItem('intifadah-theme') as ThemeId['id'] | null;
    const savedMode  = localStorage.getItem('intifadah-mode') as ColorMode | null;
    if (savedTheme) setThemeState(savedTheme);
    // Only restore dark mode if user explicitly chose it before
    if (savedMode && savedMode === 'dark') setModeState('dark');
  }, []);

  /* Apply theme to <html> data-theme attribute */
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'default') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
    localStorage.setItem('intifadah-theme', theme);
  }, [theme]);

  /* Apply color mode to <html> data-mode attribute */
  useEffect(() => {
    const html = document.documentElement;
    if (mode === 'system') {
      html.removeAttribute('data-mode');
    } else {
      html.setAttribute('data-mode', mode);
    }
    localStorage.setItem('intifadah-mode', mode);
  }, [mode]);

  const setTheme = (id: ThemeId['id']) => setThemeState(id);
  const setMode  = (m: ColorMode) => setModeState(m);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
