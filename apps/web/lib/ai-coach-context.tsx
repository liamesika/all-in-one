'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AiCoachContextType {
  shouldShowWelcome: boolean;
  dismissWelcome: () => void;
  resetWelcome: () => void;
  isWelcomeEnabled: boolean;
  setWelcomeEnabled: (enabled: boolean) => void;
}

const AiCoachContext = createContext<AiCoachContextType | undefined>(undefined);

interface AiCoachProviderProps {
  children: ReactNode;
  ownerUid?: string;
}

const WELCOME_STORAGE_KEY = 'ai-coach-welcome';
const WELCOME_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function AiCoachProvider({ children, ownerUid }: AiCoachProviderProps) {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [isWelcomeEnabled, setWelcomeEnabled] = useState(true);

  useEffect(() => {
    if (!ownerUid || !isWelcomeEnabled) return;

    checkWelcomeStatus(ownerUid);
  }, [ownerUid, isWelcomeEnabled]);

  const checkWelcomeStatus = (uid: string) => {
    try {
      const stored = localStorage.getItem(`${WELCOME_STORAGE_KEY}_${uid}`);

      if (!stored) {
        // First time user - show welcome
        setShouldShowWelcome(true);
        return;
      }

      const { lastShown, dismissedAt } = JSON.parse(stored);
      const now = Date.now();

      // If user dismissed welcome, respect that for the session
      if (dismissedAt && (now - dismissedAt) < WELCOME_COOLDOWN) {
        setShouldShowWelcome(false);
        return;
      }

      // If it's been more than 24 hours since last shown, show again
      if (!lastShown || (now - lastShown) > WELCOME_COOLDOWN) {
        setShouldShowWelcome(true);
        return;
      }

      setShouldShowWelcome(false);
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setShouldShowWelcome(false);
    }
  };

  const dismissWelcome = () => {
    if (!ownerUid) return;

    setShouldShowWelcome(false);

    try {
      const data = {
        lastShown: Date.now(),
        dismissedAt: Date.now(),
      };
      localStorage.setItem(`${WELCOME_STORAGE_KEY}_${ownerUid}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing welcome dismissal:', error);
    }
  };

  const resetWelcome = () => {
    if (!ownerUid) return;

    try {
      localStorage.removeItem(`${WELCOME_STORAGE_KEY}_${ownerUid}`);
      setShouldShowWelcome(true);
    } catch (error) {
      console.error('Error resetting welcome:', error);
    }
  };

  // Mark welcome as shown when it's displayed
  useEffect(() => {
    if (shouldShowWelcome && ownerUid) {
      try {
        const stored = localStorage.getItem(`${WELCOME_STORAGE_KEY}_${ownerUid}`);
        let data = { lastShown: Date.now() };

        if (stored) {
          const parsed = JSON.parse(stored);
          data = { ...parsed, lastShown: Date.now() };
        }

        localStorage.setItem(`${WELCOME_STORAGE_KEY}_${ownerUid}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error marking welcome as shown:', error);
      }
    }
  }, [shouldShowWelcome, ownerUid]);

  const value: AiCoachContextType = {
    shouldShowWelcome,
    dismissWelcome,
    resetWelcome,
    isWelcomeEnabled,
    setWelcomeEnabled,
  };

  return <AiCoachContext.Provider value={value}>{children}</AiCoachContext.Provider>;
}

export function useAiCoach(): AiCoachContextType {
  const context = useContext(AiCoachContext);
  if (context === undefined) {
    throw new Error('useAiCoach must be used within an AiCoachProvider');
  }
  return context;
}

// Hook for checking if user just logged in (for triggering proactive messages)
export function useLoginDetection(ownerUid?: string) {
  const [isNewSession, setIsNewSession] = useState(false);

  useEffect(() => {
    if (!ownerUid) return;

    const sessionKey = `ai-coach-session_${ownerUid}`;
    const now = Date.now();

    try {
      const lastSession = localStorage.getItem(sessionKey);

      if (!lastSession || (now - parseInt(lastSession)) > 30 * 60 * 1000) {
        // No session or session older than 30 minutes - consider this a new login
        setIsNewSession(true);
        localStorage.setItem(sessionKey, now.toString());
      } else {
        setIsNewSession(false);
      }
    } catch (error) {
      console.error('Error detecting login:', error);
      setIsNewSession(false);
    }
  }, [ownerUid]);

  return isNewSession;
}