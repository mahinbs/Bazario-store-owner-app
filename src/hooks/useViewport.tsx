
import { useState, useEffect } from 'react';

interface ViewportInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isActualMobile: boolean;
}

export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 0,
    height: 0,
    isActualMobile: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if it's an actual mobile device
      const isActualMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || ('ontouchstart' in window && width <= 768);

      setViewport({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        width,
        height,
        isActualMobile,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Utility function to determine if we should show mobile container
export const shouldShowMobileContainer = (viewport: ViewportInfo): boolean => {
  return viewport.isDesktop && !viewport.isActualMobile;
};
