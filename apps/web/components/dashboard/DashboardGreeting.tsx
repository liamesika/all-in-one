'use client';

import { useState, useEffect } from 'react';

interface DashboardGreetingProps {
  firstName?: string;
  vertical: 'Real-Estate' | 'Law' | 'E-commerce' | 'Production';
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function DashboardGreeting({ firstName: initialFirstName, vertical }: DashboardGreetingProps) {
  const timeOfDay = getTimeOfDay();
  const [firstName, setFirstName] = useState(initialFirstName || 'User');

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const profile = event.detail;
      const newName = profile.displayName || profile.firstName || 'User';
      setFirstName(newName.split(' ')[0]);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

    // Check localStorage on mount for persisted profile
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        const profile = JSON.parse(stored);
        const newName = profile.displayName || profile.firstName || 'User';
        setFirstName(newName.split(' ')[0]);
      }
    } catch (error) {
      // Silently ignore localStorage errors
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  return (
    <div className="py-8 sm:py-10 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
        Good {timeOfDay}, <span className="text-[#2979FF]">{firstName}</span>
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-2 font-normal">
        Here's your {vertical} overview
      </p>
    </div>
  );
}
