'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LIGHT_COLORS, DARK_COLORS } from '../lib/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('healthgis_theme');
    if (saved === 'dark') setIsDark(true);
    else if (saved === 'light') setIsDark(false);
    else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, isReady]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('healthgis_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    isDark, isReady, colors: isDark ? DARK_COLORS : LIGHT_COLORS, toggleTheme,
  }), [isDark, isReady, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
