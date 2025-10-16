'use client';

/**
 * Productions - Overview Dashboard
 * Modern dashboard with live analytics, KPIs, and project stats
 * Connected to ProductionProject backend via React Query
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Film,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ListTodo,
  Folder,
  BarChart3,
} from 'lucide-react';

// Import unified components
import {
  UniversalCard,
  CardHeader,
  CardBody,
  KPICard,
  UniversalButton,
  UniversalBadge,
  UniversalTable,
  UniversalTableHeader,
  UniversalTableBody,
  UniversalTableRow,
  UniversalTableHead,
  UniversalTableCell,
  TableEmptyState,
} from '@/components/shared';

// Import React Query hooks
import {
  useProjects,
  useProjectStats,
  useAnalyticsOverview,
  useRevenueData,
  useProjectDistribution,
  useTaskMetrics,
} from '@/hooks/useProductionsData';

import { ProjectStatus } from '@/lib/api/productions';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' }> = {
  PLANNING: { label: 'Planning', color: 'default' },
  ACTIVE: { label: 'Active', color: 'primary' },
  DONE: { label: 'Done', color: 'success' },
  ON_HOLD: { label: 'On Hold', color: 'warning' },
};

export default function ProductionsOverviewClient() {
  const router = useRouter();
  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Fetch data with React Query
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: projectStats, isLoading: statsLoading } = useProjectStats();
  const { data: analyticsOverview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueData(revenuePeriod);
  const { data: projectDistribution = [], isLoading: distributionLoading } = useProjectDistribution();
  const { data: taskMetrics = [], isLoading: taskMetricsLoading } = useTaskMetrics();

  const isLoading = projectsLoading || statsLoading || overviewLoading;

  // Recent projects (last 5 updated)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-[#1A2F4B] rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-[#1A2F4B] rounded-xl"></div>
              ))}
            </div>
            <div className="h-[400px] bg-gray-200 dark:bg-[#1A2F4B] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 text-gray-900 dark:text-white">Productions Dashboard</h1>
            <p className="text-body-base text-gray-600 dark:text-gray-400 mt-1">
              Manage your production projects, budgets, and tasks
            </p>
          </div>
          <UniversalButton
            variant="primary"
            size="lg"
            leftIcon={<Film className="w-5 h-5" />}
            onClick={() => router.push('/dashboard/productions/projects')}
          >
            View All Projects
          </UniversalButton>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Projects"
            value={projectStats?.total || 0}
            icon={<Film className="w-6 h-6" />}
            trend={projectStats ? `${projectStats.active} active` : undefined}
            variant="primary"
          />
          <KPICard
            title="Active Projects"
            value={projectStats?.active || 0}
            icon={<Clock className="w-6 h-6" />}
            trend={projectStats ? `${projectStats.planning} planning` : undefined}
            variant="info"
          />
          <KPICard
            title="Completed"
            value={projectStats?.done || 0}
            icon={<CheckCircle2 className="w-6 h-6" />}
            variant="success"
          />
          <KPICard
            title="On Hold"
            value={projectStats?.byType?.ON_HOLD || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            variant="warning"
          />
        </div>

        {/* Analytics Overview */}
        {analyticsOverview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UniversalCard>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₪{analyticsOverview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-500" />
                </div>
              </CardBody>
            </UniversalCard>

            <UniversalCard>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analyticsOverview.completedTasks}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {analyticsOverview.taskCompletionRate.toFixed(1)}% completion rate
                    </p>
                  </div>
                  <ListTodo className="w-10 h-10 text-blue-500" />
                </div>
              </CardBody>
            </UniversalCard>

            <UniversalCard>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Growth</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analyticsOverview.projectGrowth >= 0 ? '+' : ''}
                      {analyticsOverview.projectGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-500" />
                </div>
              </CardBody>
            </UniversalCard>
          </div>
        )}

        {/* Project Distribution by Type */}
        {!distributionLoading && projectDistribution.length > 0 && (
          <UniversalCard>
            <CardHeader
              title="Projects by Type"
              action={
                <UniversalButton variant="ghost" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
                  View Details
                </UniversalButton>
              }
            />
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projectDistribution.map((item) => (
                  <div
                    key={item.label}
                    className="p-4 bg-gray-50 dark:bg-[#1A2F4B] rounded-lg border border-gray-200 dark:border-[#2979FF]/20"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                    <div
                      className="mt-3 h-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        width: `${(item.value / projects.length) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </UniversalCard>
        )}

        {/* Revenue Chart */}
        {!revenueLoading && revenueData.length > 0 && (
          <UniversalCard>
            <CardHeader
              title="Revenue Over Time"
              action={
                <select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-300 dark:border-[#2979FF]/20 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              }
            />
            <CardBody>
              <div className="space-y-2">
                {revenueData.slice(-10).map((item, index) => {
                  const maxValue = Math.max(...revenueData.map((d) => d.value));
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-24">
                        {new Date(item.label).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex-1 h-8 bg-gray-100 dark:bg-[#1A2F4B] rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                        ₪{item.value.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </UniversalCard>
        )}

        {/* Task Metrics */}
        {!taskMetricsLoading && taskMetrics.length > 0 && (
          <UniversalCard>
            <CardHeader title="Task Status Distribution" />
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {taskMetrics.map((metric) => {
                  const colors = {
                    OPEN: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                    IN_PROGRESS: 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    DONE: 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                    BLOCKED: 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                  };

                  return (
                    <div
                      key={metric.label}
                      className={`p-4 rounded-lg ${colors[metric.label as keyof typeof colors] || 'bg-gray-200'}`}
                    >
                      <p className="text-sm font-medium mb-1">{metric.label.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold">{metric.value}</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </UniversalCard>
        )}

        {/* Recent Projects */}
        <UniversalCard>
          <CardHeader
            title="Recent Projects"
            action={
              <UniversalButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/productions/projects')}
              >
                View All
              </UniversalButton>
            }
          />
          <CardBody>
            {recentProjects.length === 0 ? (
              <TableEmptyState
                icon={<Film className="w-16 h-16" />}
                title="No projects yet"
                description="Create your first production project to get started"
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
              <UniversalTable>
                <UniversalTableHeader>
                  <UniversalTableRow>
                    <UniversalTableHead>Project Name</UniversalTableHead>
                    <UniversalTableHead>Status</UniversalTableHead>
                    <UniversalTableHead>Type</UniversalTableHead>
                    <UniversalTableHead>Last Updated</UniversalTableHead>
                    <UniversalTableHead>Actions</UniversalTableHead>
                  </UniversalTableRow>
                </UniversalTableHeader>
                <UniversalTableBody>
                  {recentProjects.map((project) => (
                    <UniversalTableRow key={project.id}>
                      <UniversalTableCell>
                        <button
                          onClick={() => router.push(`/dashboard/productions/projects/${project.id}`)}
                          className="font-medium text-[#2979FF] hover:underline"
                        >
                          {project.name}
                        </button>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <UniversalBadge variant={STATUS_CONFIG[project.status].color}>
                          {STATUS_CONFIG[project.status].label}
                        </UniversalBadge>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        <UniversalBadge variant="default">{project.type}</UniversalBadge>
                      </UniversalTableCell>
                      <UniversalTableCell>
                        {new Date(project.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
                  ))}
                </UniversalTableBody>
              </UniversalTable>
            )}
          </CardBody>
        </UniversalCard>
      </div>
    </div>
  );
}
