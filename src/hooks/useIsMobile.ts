import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window;
  });

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
