import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that on EVERY navigation (routes, modules, brother profiles),
 * all scrollable containers (window, document, and MainLayout's <main>)
 * immediately and reliably reset to the top (0, 0).
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  const resetAllScrollPositions = () => {
    // 1. Reset standard browser window and body
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    // 2. Reset MainLayout <main> container (which has overflow-y-auto)
    const mainElement = document.querySelector('main') || document.getElementById('main-content');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainElement.scrollTop = 0;
    }

    // 3. Reset any other scroll containers that might be present
    const scrollContainers = document.querySelectorAll<HTMLElement>('.overflow-y-auto, [data-scroll-container]');
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  };

  // Immediate reset before paint
  useLayoutEffect(() => {
    resetAllScrollPositions();
  }, [pathname, search]);

  // Secondary reset on mount and subsequent render frames to overcome any async rendering or layout shifts
  useEffect(() => {
    resetAllScrollPositions();

    const animFrame = requestAnimationFrame(() => {
      resetAllScrollPositions();
    });

    const timer1 = setTimeout(() => {
      resetAllScrollPositions();
    }, 50);

    const timer2 = setTimeout(() => {
      resetAllScrollPositions();
    }, 150);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search]);

  return null;
};
