import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'cmv-seguimiento-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedValue === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((previous) => (previous === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
