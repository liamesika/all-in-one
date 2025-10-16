'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Sparkles,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';
import {
  useAnalyticsOverview,
  useRevenueData,
  useProjectDistribution,
  useTaskMetrics,
  useProjects,
} from '@/hooks/useProductionsData';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'revenue' | 'projects' | 'tasks';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedChart, setSelectedChart] = useState<ChartType>('revenue');
  const [showAIInsights, setShowAIInsights] = useState(true);

  // Fetch live analytics data
  const { data: analyticsOverview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueData(timeRange);
  const { data: projectDistribution = [], isLoading: distributionLoading } = useProjectDistribution();
  const { data: taskMetrics = [], isLoading: taskMetricsLoading } = useTaskMetrics();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const isLoading = overviewLoading || revenueLoading || distributionLoading || taskMetricsLoading;

  // Generate AI insights from live data
  const aiInsights = analyticsOverview ? [
    {
      type: analyticsOverview.revenueGrowth > 0 ? 'opportunity' : 'warning',
      title: analyticsOverview.revenueGrowth > 0 ? 'Revenue Growth Opportunity' : 'Revenue Growth Concern',
      description: `Revenue ${analyticsOverview.revenueGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(analyticsOverview.revenueGrowth).toFixed(1)}% in the selected period. ${analyticsOverview.revenueGrowth > 10 ? 'Strong momentum - consider scaling efforts.' : 'Review pricing and market strategy.'}`,
      impact: Math.abs(analyticsOverview.revenueGrowth) > 10 ? 'high' : 'medium',
      icon: analyticsOverview.revenueGrowth > 0 ? TrendingUp : TrendingDown
    },
    {
      type: analyticsOverview.taskCompletionRate > 80 ? 'success' : 'warning',
      title: analyticsOverview.taskCompletionRate > 80 ? 'Strong Task Performance' : 'Task Completion Below Target',
      description: `Current task completion rate is ${analyticsOverview.taskCompletionRate.toFixed(1)}%. ${analyticsOverview.taskCompletionRate > 80 ? 'Team is performing well.' : 'Review team capacity and project timelines.'}`,
      impact: analyticsOverview.taskCompletionRate < 70 ? 'high' : 'medium',
      icon: Activity
    },
    {
      type: analyticsOverview.projectGrowth > 0 ? 'success' : 'warning',
      title: analyticsOverview.projectGrowth > 0 ? 'Project Portfolio Growing' : 'Project Growth Stagnant',
      description: `Project count ${analyticsOverview.projectGrowth > 0 ? 'increased' : 'decreased'} by ${Math.abs(analyticsOverview.projectGrowth).toFixed(1)}%. ${analyticsOverview.projectGrowth > 15 ? 'Excellent client acquisition.' : 'Focus on new business development.'}`,
      impact: Math.abs(analyticsOverview.projectGrowth) > 15 ? 'high' : 'medium',
      icon: analyticsOverview.projectGrowth > 0 ? FolderKanban : Users
    }
  ] : [];

  const exportFormats = [
    { label: 'Export as PDF', icon: FileText, format: 'pdf' },
    { label: 'Export as CSV', icon: FileText, format: 'csv' },
    { label: 'Export as Excel', icon: FileText, format: 'xlsx' }
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}...`);
    // TODO: Implement actual export functionality
  };

  // Simple line chart visualization
  const LineChart = ({ data }: { data: ChartData[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((maxValue - item.value) / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative" style={{ height: chartHeight + 40 }}>
        <svg className="w-full" style={{ height: chartHeight }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0%"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#FF6F00"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((maxValue - item.value) / maxValue) * chartHeight;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill="#FF6F00"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2 px-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-500">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple donut chart visualization
  const DonutChart = ({ data }: { data: ChartData[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    const slices = data.map((item) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      return {
        ...item,
        percentage: percentage.toFixed(1),
        startAngle,
        endAngle
      };
    });

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
      };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

      return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'L', x, y,
        'Z'
      ].join(' ');
    };

    return (
      <div className="flex items-center justify-center gap-8">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={describeArc(100, 100, 80, slice.startAngle, slice.endAngle)}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
          <circle cx="100" cy="100" r="50" fill="white" />
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold" fill="#111827">
            {total}
          </text>
          <text x="100" y="110" textAnchor="middle" className="text-sm" fill="#6B7280">
            Projects
          </text>
        </svg>

        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: slice.color }} />
              <div>
                <div className="text-sm font-medium text-gray-900">{slice.label}</div>
                <div className="text-xs text-gray-500">{slice.value} projects ({slice.percentage}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple bar chart visualization
  const BarChart = ({ data }: { data: ChartData[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">{item.label}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-sm font-medium text-gray-700">{item.value}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const getChartData = () => {
    switch (selectedChart) {
      case 'revenue':
        return revenueData;
      case 'projects':
        return projectDistribution;
      case 'tasks':
        return taskMetrics;
      default:
        return revenueData;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <ProductionsHeader
          title="Reports & Analytics"
          subtitle="Comprehensive insights and performance metrics"
          icon={BarChart3}
        />
        <div className="p-8 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-[400px] bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader
        title="Reports & Analytics"
        subtitle="Comprehensive insights and performance metrics"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-3">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 transition-colors">
                <Download size={16} />
                <span>Export</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {exportFormats.map((format, index) => (
                  <button
                    key={index}
                    onClick={() => handleExport(format.format)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <format.icon size={16} />
                    <span>{format.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* AI Insights Widget */}
        {showAIInsights && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    AI Performance Insights
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">Live Analysis</span>
                  </h3>
                  <p className="text-sm text-gray-600">AI-powered recommendations based on your data</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 border border-orange-200"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        insight.impact === 'high' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={insight.impact === 'high' ? 'text-orange-600' : 'text-gray-600'} size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.impact === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {insight.impact === 'high' ? 'High Impact' : 'Medium Impact'}
                      </span>
                      <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Key Metrics Cards */}
        {analyticsOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Revenue',
                value: `₪${analyticsOverview.totalRevenue.toLocaleString()}`,
                change: analyticsOverview.revenueGrowth,
                trend: analyticsOverview.revenueGrowth >= 0 ? 'up' : 'down',
                icon: DollarSign,
                color: 'green'
              },
              {
                title: 'Active Projects',
                value: analyticsOverview.activeProjects.toString(),
                change: analyticsOverview.projectGrowth,
                trend: analyticsOverview.projectGrowth >= 0 ? 'up' : 'down',
                icon: FolderKanban,
                color: 'blue'
              },
              {
                title: 'Completed Tasks',
                value: analyticsOverview.completedTasks.toString(),
                change: analyticsOverview.taskCompletionRate - 100,
                trend: analyticsOverview.taskCompletionRate >= 80 ? 'up' : 'down',
                icon: CheckSquare,
                color: 'purple'
              },
              {
                title: 'Total Clients',
                value: analyticsOverview.totalClients.toString(),
                change: analyticsOverview.clientGrowth,
                trend: analyticsOverview.clientGrowth >= 0 ? 'up' : 'down',
                icon: Users,
                color: 'orange'
              }
            ].map((metric, index) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      metric.color === 'green' ? 'bg-green-100' :
                      metric.color === 'blue' ? 'bg-blue-100' :
                      metric.color === 'purple' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <Icon className={`${
                        metric.color === 'green' ? 'text-green-600' :
                        metric.color === 'blue' ? 'text-blue-600' :
                        metric.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} size={24} />
                    </div>
                    {metric.change !== undefined && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        metric.trend === 'up'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <TrendIcon size={12} />
                        <span>{Math.abs(metric.change).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.title}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-500" />
                  Revenue Trends
                </h3>
                <p className="text-sm text-gray-500 mt-1">Monthly revenue performance</p>
              </div>
            </div>
            <LineChart data={revenueData} />
          </motion.div>

          {/* Project Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart size={20} className="text-orange-500" />
                  Project Distribution
                </h3>
                <p className="text-sm text-gray-500 mt-1">Current project status breakdown</p>
              </div>
            </div>
            <DonutChart data={projectDistribution} />
          </motion.div>

          {/* Task Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-orange-500" />
                  Task Completion Rate
                </h3>
                <p className="text-sm text-gray-500 mt-1">Weekly completion percentage</p>
              </div>
            </div>
            <BarChart data={taskCompletion} />
          </motion.div>

          {/* Client Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-orange-500" />
                  Client Growth
                </h3>
                <p className="text-sm text-gray-500 mt-1">Quarterly new client acquisition</p>
              </div>
            </div>
            <BarChart data={clientGrowth} />
          </motion.div>
        </div>

        {/* Recent Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-500" />
              Recent Projects
            </h3>
            <p className="text-sm text-gray-500 mt-1">Latest production projects sorted by date</p>
          </div>
          <div className="overflow-x-auto">
            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-sm text-gray-500">Create your first production project to see analytics</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.slice(0, 5).map((project) => {
                    const statusConfig = {
                      PLANNING: { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
                      ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
                      DONE: { label: 'Done', color: 'bg-gray-100 text-gray-700' },
                      ON_HOLD: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
                    };

                    return (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.budget ? `₪${project.budget.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[project.status].color}`}>
                            {statusConfig[project.status].label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
