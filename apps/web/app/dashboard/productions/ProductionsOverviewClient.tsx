'use client';

/**
 * Creative Productions - Overview Client Component
 * Stats cards, filters, and recent activity feed
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  activeProjects: number;
  totalAssets: number;
  pendingReviews: number;
  dueThisWeek: number;
}

interface ProjectsByStatus {
  [key: string]: number;
}

interface RecentProject {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  ownerUid: string;
}

export default function ProductionsOverviewClient() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projectsByStatus, setProjectsByStatus] = useState<ProjectsByStatus>({});
  const [recentActivity, setRecentActivity] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/productions/stats');

      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      setStats(data.stats);
      setProjectsByStatus(data.projectsByStatus || {});
      setRecentActivity(data.recentActivity || []);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-400';
      case 'IN_PROGRESS':
        return 'text-blue-400';
      case 'REVIEW':
        return 'text-yellow-400';
      case 'APPROVED':
        return 'text-green-400';
      case 'DELIVERED':
        return 'text-green-600';
      default:
        return 'text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-[#1A2F4B] rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-[#1A2F4B] rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-8 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Stats</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-[#2979FF] hover:bg-[#1E5FCC] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Creative Productions
            </h1>
            <p className="text-gray-400">
              Manage video projects, assets, and creative workflows
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/productions/projects')}
            className="px-6 py-3 bg-[#2979FF] hover:bg-[#1E5FCC] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:ring-offset-2 focus:ring-offset-[#0E1A2B]"
          >
            + New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Total Assets"
            value={stats?.totalAssets || 0}
            icon="🎬"
            color="purple"
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pendingReviews || 0}
            icon="👁️"
            color="yellow"
          />
          <StatCard
            title="Due This Week"
            value={stats?.dueThisWeek || 0}
            icon="📅"
            color="red"
          />
        </div>

        {/* Projects by Status */}
        <div className="bg-[#1A2F4B] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Projects by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(projectsByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{count}</div>
                <div className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {formatStatus(status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1A2F4B] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => router.push('/dashboard/productions/projects')}
              className="text-[#2979FF] hover:text-[#1E5FCC] text-sm font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No recent activity. Create your first project to get started!
              </p>
            ) : (
              recentActivity.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/dashboard/productions/projects/${project.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-[#0E1A2B]/50 hover:bg-[#0E1A2B] rounded-lg transition-colors duration-200 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate mb-1">{project.name}</div>
                    <div className="text-sm text-gray-400">
                      Updated {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ml-4 ${getStatusColor(project.status)}`}>
                    {formatStatus(project.status)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <QuickActionCard
            title="Projects"
            description="View and manage all projects"
            icon="📋"
            onClick={() => router.push('/dashboard/productions/projects')}
          />
          <QuickActionCard
            title="Assets Library"
            description="Browse and organize media"
            icon="🎨"
            onClick={() => router.push('/dashboard/productions/assets')}
          />
          <QuickActionCard
            title="Templates"
            description="Manage briefs and scripts"
            icon="📝"
            onClick={() => router.push('/dashboard/productions/templates')}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'purple' | 'yellow' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 transition-transform hover:scale-105 duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="text-4xl font-bold text-white">{value}</div>
      </div>
      <div className="text-gray-300 font-medium">{title}</div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#1A2F4B] hover:bg-[#234060] rounded-xl p-6 transition-all duration-200 hover:scale-105 text-left focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  );
}
