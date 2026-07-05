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
  const [theme, setThemeState] = useState<ThemeId['id']>(() => {
    if (typeof window === 'undefined') {
      return 'default';
    }

    return (localStorage.getItem('intifadah-theme') as ThemeId['id'] | null) ?? 'default';
  });
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedMode = localStorage.getItem('intifadah-mode') as ColorMode | null;
    return savedMode === 'dark' ? 'dark' : 'light';
  });

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
