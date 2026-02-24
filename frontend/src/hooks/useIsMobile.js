// src/hooks/useIsMobile.js

import { useState, useEffect } from 'react';

/**
 * Responsive hook using matchMedia for mobile detection.
 * Mobile = max-width: 767px (below md breakpoint).
 * Listens for live resize changes.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}
