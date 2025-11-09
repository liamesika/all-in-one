'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TasksWidget() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/real-estate/tasks/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-white dark:bg-[#1A2F4B] rounded-xl p-6 border border-gray-200 dark:border-[#2979FF]/20 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A2F4B] rounded-xl p-6 border border-gray-200 dark:border-[#2979FF]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Tasks Overview</h3>
        <button
          onClick={() => router.push('/dashboard/real-estate/agents')}
          className="text-sm text-[#2979FF] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Open</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.openTasks || 0}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.urgentTasks || 0}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completedThisWeek || 0}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.completionRate || 0}%
          </div>
        </div>
      </div>

      {stats.tasksByAgent && stats.tasksByAgent.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Top Agents
          </h4>
          <div className="space-y-2">
            {stats.tasksByAgent.slice(0, 3).map((agent: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{agent.name}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {agent.taskCount} tasks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
