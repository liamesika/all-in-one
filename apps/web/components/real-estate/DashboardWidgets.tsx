'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Target,
  Award
} from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  activeClients: number;
  activeProperties: number;
  tasksDueThisWeek: number;
  todaysMeetings: number;
  conversionRate: number;
  topAgents: Array<{
    agentId: string;
    agentName: string;
    agentEmail: string;
    agentAvatar: string | null;
    convertedLeads: number;
  }>;
}

interface Props {
  language?: 'en' | 'he';
}

export function DashboardWidgets({ language = 'en' }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const t = language === 'he' ? {
    totalLeads: 'סה"כ לידים',
    activeClients: 'לקוחות פעילים',
    activeProperties: 'נכסים פעילים',
    tasksDue: 'משימות השבוע',
    todaysMeetings: 'פגישות היום',
    conversionRate: 'שיעור המרה',
    topAgents: 'סוכנים מובילים',
    conversions: 'המרות'
  } : {
    totalLeads: 'Total Leads',
    activeClients: 'Active Clients',
    activeProperties: 'Active Properties',
    tasksDue: 'Tasks This Week',
    todaysMeetings: "Today's Meetings",
    conversionRate: 'Conversion Rate',
    topAgents: 'Top Agents',
    conversions: 'Conversions'
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/real-estate/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-[#1a2942] rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const widgets = [
    {
      title: t.totalLeads,
      value: stats.totalLeads,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: t.activeClients,
      value: stats.activeClients,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: t.activeProperties,
      value: stats.activeProperties,
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: t.tasksDue,
      value: stats.tasksDueThisWeek,
      icon: CheckCircle2,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: t.todaysMeetings,
      value: stats.todaysMeetings,
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      title: t.conversionRate,
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {widgets.map((widget, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1a2942] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${widget.bgColor} p-2.5 rounded-lg`}>
                <widget.icon className={`w-5 h-5 bg-gradient-to-br ${widget.color} bg-clip-text text-transparent`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{widget.title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{widget.value}</p>
          </div>
        ))}
      </div>

      {/* Top Agents */}
      {stats.topAgents.length > 0 && (
        <div className="bg-white dark:bg-[#1a2942] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Award className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.topAgents}</h3>
          </div>
          <div className="space-y-3">
            {stats.topAgents.map((agent, index) => (
              <div
                key={agent.agentId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0E1A2B] rounded-lg"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2979FF] to-[#1E5FCC] rounded-full flex items-center justify-center text-white font-semibold">
                      {agent.agentName.charAt(0).toUpperCase()}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                        🏆
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{agent.agentName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{agent.agentEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#2979FF]">{agent.convertedLeads}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.conversions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
