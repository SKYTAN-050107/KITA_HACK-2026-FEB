// src/hooks/useDarkMode.js

import { useState, useEffect } from 'react';

/**
 * Dark mode hook with system preference detection + manual override.
 * Persists user choice to localStorage.
 * 
 * Priority: localStorage override > system preference
 */
export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Listen for system preference changes (only when no manual override)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        // No manual override — follow system
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { isDark, toggleDarkMode };
}
