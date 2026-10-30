import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'brave';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'brave',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ipl_theme') as ThemeMode;
    return saved === 'light' || saved === 'dark' || saved === 'brave' ? saved : 'brave';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('ipl_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-brave');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'brave') {
      root.classList.add('dark', 'theme-brave');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
