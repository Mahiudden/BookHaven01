import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Then check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Default to light mode for SSR
  });

  useEffect(() => {
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      
      // Update document class
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        // Only update if user hasn't manually set a preference
        const saved = localStorage.getItem('darkMode');
        if (saved === null) {
          setIsDarkMode(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark');
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
