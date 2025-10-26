'use client';

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

export function DashboardGreeting({ firstName, vertical }: DashboardGreetingProps) {
  const timeOfDay = getTimeOfDay();
  const name = firstName || 'User';

  return (
    <div className="py-8 sm:py-10 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
        Good {timeOfDay}, <span className="text-[#2979FF]">{name}</span>
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-2 font-normal">
        Here's your {vertical} overview
      </p>
    </div>
  );
}
