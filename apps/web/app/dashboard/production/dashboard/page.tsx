'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  Plus,
  Upload,
  FileText,
  Brain,
  Activity,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';

export default function ProductionsDashboard() {
  const [userName] = useState('Production Manager');

  // Sample data
  const kpis = [
    {
      label: 'Active Projects',
      value: '12',
      change: '+2 this week',
      trend: 'up' as const,
      icon: FolderKanban,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Completed Tasks',
      value: '247',
      change: '+18 today',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'Upcoming Deadlines',
      value: '8',
      change: '3 critical',
      trend: 'neutral' as const,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Budget Used',
      value: '68%',
      change: '$42K of $62K',
      trend: 'neutral' as const,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'task_complete',
      title: 'Final Cut Export completed',
      project: 'Tech Conference 2024',
      user: 'Sarah Chen',
      time: '5 minutes ago',
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Deadline approaching: Color grading review',
      project: 'Brand Video Q1',
      user: null,
      time: '1 hour ago',
      icon: AlertCircle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 3,
      type: 'upload',
      title: 'New assets uploaded: Raw footage batch 3',
      project: 'Product Launch Video',
      user: 'Michael Torres',
      time: '2 hours ago',
      icon: Upload,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 4,
      type: 'project_start',
      title: 'New project created: Social Media Campaign',
      project: 'Q2 2024 Campaign',
      user: 'Jessica Park',
      time: '3 hours ago',
      icon: FolderKanban,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  const aiInsights = {
    summary: "3 projects are ahead of schedule. However, 'Tech Conference 2024' shows signs of resource bottleneck in post-production.",
    recommendations: [
      'Consider reallocating 1 editor from "Brand Video Q1" to expedite conference project',
      'Schedule client review meeting for "Product Launch" — pending for 4 days',
      'Budget utilization is healthy at 68%. Safe to approve new equipment request.'
    ],
    healthScore: 85,
    trend: 'stable'
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader userName={userName} />

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome back, {userName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <p className="text-gray-600">
            You have 8 upcoming deadlines this week. 3 projects need your attention.
          </p>
        </motion.div>

        {/* KPI Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className={`bg-white rounded-xl p-6 border ${kpi.borderColor} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                  <kpi.icon className={kpi.iconColor} size={24} />
                </div>
                {kpi.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-sm ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                )}
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm font-medium text-gray-600 mb-1">{kpi.label}</div>
              <div className="text-xs text-gray-500">{kpi.change}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Insights Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Brain className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">AI Project Advisor</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-200/50 rounded-full text-xs font-medium text-orange-700">
                    <Sparkles size={12} />
                    Live Analysis
                  </span>
                </div>
                <p className="text-sm text-gray-600">{aiInsights.summary}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-600">{aiInsights.healthScore}</div>
                <div className="text-xs text-gray-600">Health Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 mb-2">Recommendations:</div>
              {aiInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Add Task</div>
                  <div className="text-xs text-gray-500">Quick task creation</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Upload File</div>
                  <div className="text-xs text-gray-500">Add assets or docs</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Create Report</div>
                  <div className="text-xs text-gray-500">Generate analytics</div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className={`w-10 h-10 rounded-lg ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={activity.iconColor} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{activity.project}</span>
                    {activity.user && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress (Last 30 Days)</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Line chart: Tasks completed over time</p>
                <p className="text-xs text-gray-400 mt-1">(Chart integration pending)</p>
              </div>
            </div>
          </motion.div>

          {/* Budget Allocation Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center text-gray-500">
                <DollarSign size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Donut chart: Budget by category</p>
                <p className="text-xs text-gray-400 mt-1">(Chart integration pending)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
