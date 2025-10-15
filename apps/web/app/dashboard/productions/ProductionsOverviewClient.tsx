'use client';

/**
 * Creative Productions - Overview Client Component (Redesigned with Design System 2.0)
 * Modern dashboard with KPI cards, project status, and quick actions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Film,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  Play,
} from 'lucide-react';

// Import unified components
import {
  UniversalCard,
  KPICard,
  UniversalButton,
  StatusBadge,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  TableEmptyState,
} from '@/components/shared';

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

  const getStatusBadgeType = (status: string): 'active' | 'pending' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'DRAFT':
        return 'pending';
      case 'IN_PROGRESS':
        return 'active';
      case 'REVIEW':
        return 'pending';
      case 'APPROVED':
      case 'DELIVERED':
        return 'completed';
      default:
        return 'pending';
    }
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg animate-pulse w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-8 flex items-center justify-center">
        <UniversalCard variant="outlined" className="max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <UniversalButton variant="primary" onClick={fetchStats}>
            Retry
          </UniversalButton>
        </UniversalCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white mb-2">
              Creative Productions
            </h1>
            <p className="text-body-base text-gray-600 dark:text-gray-400">
              Manage video projects, assets, and creative workflows
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="lg"
            leftIcon={<Play className="w-5 h-5" />}
            onClick={() => router.push('/dashboard/productions/projects')}
          >
            New Project
          </UniversalButton>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={<FolderOpen className="w-6 h-6" />}
            label="Active Projects"
            value={stats?.activeProjects || 0}
            change={{ value: '+12% from last month', trend: 'up' }}
          />
          <KPICard
            icon={<Film className="w-6 h-6" />}
            label="Total Assets"
            value={stats?.totalAssets || 0}
            change={{ value: '+245 this month', trend: 'up' }}
          />
          <KPICard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Reviews"
            value={stats?.pendingReviews || 0}
            change={{ value: '3 urgent', trend: 'neutral' }}
          />
          <KPICard
            icon={<Calendar className="w-6 h-6" />}
            label="Due This Week"
            value={stats?.dueThisWeek || 0}
            change={{ value: '2 overdue', trend: 'down' }}
          />
        </div>

        {/* Projects by Status */}
        <UniversalCard>
          <div className="p-6 border-b border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-3 text-gray-900 dark:text-white">
                  Projects by Status
                </h2>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                  Overview of all project stages
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-[#2979FF]" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(projectsByStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-display-2 font-bold text-gray-900 dark:text-white mb-2">
                    {count}
                  </div>
                  <StatusBadge status={getStatusBadgeType(status)} />
                </div>
              ))}
              {Object.keys(projectsByStatus).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No projects yet. Create your first project to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        </UniversalCard>

        {/* Recent Activity Table */}
        <UniversalCard>
          <div className="p-6 border-b border-gray-200 dark:border-[#2979FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-3 text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
                  Latest updates across all projects
                </p>
              </div>
              <UniversalButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/productions/projects')}
              >
                View All
              </UniversalButton>
            </div>
          </div>

          <UniversalTable>
            <UniversalTableHeader>
              <UniversalTableRow>
                <UniversalTableHead>Project Name</UniversalTableHead>
                <UniversalTableHead>Status</UniversalTableHead>
                <UniversalTableHead>Last Updated</UniversalTableHead>
                <UniversalTableHead></UniversalTableHead>
              </UniversalTableRow>
            </UniversalTableHeader>
            <UniversalTableBody>
              {recentActivity.length === 0 ? (
                <TableEmptyState
                  icon={<FolderOpen className="w-12 h-12" />}
                  title="No recent activity"
                  description="Create your first project to see activity here"
                  action={
                    <UniversalButton
                      variant="primary"
                      onClick={() => router.push('/dashboard/productions/projects')}
                    >
                      Create Project
                    </UniversalButton>
                  }
                />
              ) : (
                recentActivity.map((project) => (
                  <UniversalTableRow key={project.id} hoverable>
                    <UniversalTableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </div>
                    </UniversalTableCell>
                    <UniversalTableCell>
                      <StatusBadge status={getStatusBadgeType(project.status)} />
                    </UniversalTableCell>
                    <UniversalTableCell>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(project.updatedAt)}
                      </span>
                    </UniversalTableCell>
                    <UniversalTableCell>
                      <UniversalButton
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/productions/projects/${project.id}`)}
                      >
                        View
                      </UniversalButton>
                    </UniversalTableCell>
                  </UniversalTableRow>
                ))
              )}
            </UniversalTableBody>
          </UniversalTable>
        </UniversalCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UniversalCard hoverable className="cursor-pointer" onClick={() => router.push('/dashboard/productions/projects')}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#2979FF]/10 rounded-lg mb-4">
                <FolderOpen className="w-6 h-6 text-[#2979FF]" />
              </div>
              <h3 className="text-heading-4 text-gray-900 dark:text-white mb-2">
                All Projects
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                View and manage all your video projects
              </p>
            </div>
          </UniversalCard>

          <UniversalCard hoverable className="cursor-pointer" onClick={() => router.push('/dashboard/productions/assets')}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mb-4">
                <Film className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-heading-4 text-gray-900 dark:text-white mb-2">
                Assets Library
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Browse and organize your media files
              </p>
            </div>
          </UniversalCard>

          <UniversalCard hoverable className="cursor-pointer" onClick={() => router.push('/dashboard/productions/team')}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-heading-4 text-gray-900 dark:text-white mb-2">
                Team & Clients
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Manage your team members and clients
              </p>
            </div>
          </UniversalCard>
        </div>
      </div>
    </div>
  );
}
