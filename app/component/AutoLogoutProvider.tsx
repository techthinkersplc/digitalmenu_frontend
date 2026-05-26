'use client';

import React, { useEffect, useRef } from 'react';

// ⏱️ Set the inactivity threshold (e.g., 15 minutes = 15 * 60 * 1000 milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // 🛠 Matches your logic: Clear token from localStorage
      localStorage.removeItem('admin_token');
      
      // Clean up window event listeners to prevent memory leaks
      destroyListeners();

      // Force redirect the browser to the admin login portal
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = '/admin';
    }
  };

  const resetTimer = () => {
    // Clear the active countdown timer when any interaction is detected
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Begin a fresh countdown
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  const setupListeners = () => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);
  };

  const destroyListeners = () => {
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('mousedown', resetTimer);
    window.removeEventListener('keypress', resetTimer);
    window.removeEventListener('scroll', resetTimer);
    window.removeEventListener('touchstart', resetTimer);
  };

  useEffect(() => {
    // Only track inactivity if the admin is actually logged in
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    // Initialize user action tracking
    setupListeners();
    resetTimer();

    // Clean up tracking mechanisms when layout or subpages change
    return () => {
      destroyListeners();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}