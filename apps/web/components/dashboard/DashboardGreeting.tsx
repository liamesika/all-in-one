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
    <div className="px-6 pt-6 pb-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
        Good {timeOfDay}, {name} — here's your {vertical} overview.
      </h1>
    </div>
  );
}
