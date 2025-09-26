'use client';
import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    type: string;
    status: string;
    deadline: string;
    budget: number;
    usedBudget: number;
    client: string;
    progress: number;
    tasks: number;
    completedTasks: number;
  };
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function ProjectCard({ project, onView, onEdit }: ProjectCardProps) {
  const { language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PLANNING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ON_HOLD':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'DONE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return language === 'he' ? 'פעיל' : 'Active';
      case 'PLANNING':
        return language === 'he' ? 'תכנון' : 'Planning';
      case 'ON_HOLD':
        return language === 'he' ? 'מושהה' : 'On Hold';
      case 'DONE':
        return language === 'he' ? 'הושלם' : 'Done';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CONFERENCE':
        return language === 'he' ? 'כנס' : 'Conference';
      case 'SHOW':
        return language === 'he' ? 'מופע' : 'Show';
      case 'FILMING':
        return language === 'he' ? 'צילום' : 'Filming';
      case 'OTHER':
        return language === 'he' ? 'אחר' : 'Other';
      default:
        return type;
    }
  };

  const budgetPercentage = Math.min((project.usedBudget / project.budget) * 100, 100);
  const budgetColor = budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
              <span className="text-sm text-gray-600">
                {getTypeLabel(project.type)}
              </span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Client & Deadline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{language === 'he' ? 'לקוח:' : 'Client:'}</span>
              <span className="text-gray-900 font-medium">{project.client}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{language === 'he' ? 'דדליין:' : 'Deadline:'}</span>
              <span className="text-gray-900">{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{language === 'he' ? 'התקדמות:' : 'Progress:'}</span>
              <span className="text-gray-900 font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{language === 'he' ? 'משימות:' : 'Tasks:'}</span>
            <span className="text-gray-900">
              {project.completedTasks}/{project.tasks} {language === 'he' ? 'הושלמו' : 'completed'}
            </span>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{language === 'he' ? 'תקציב:' : 'Budget:'}</span>
              <span className="text-gray-900">
                ${project.usedBudget.toLocaleString()} / ${project.budget.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${budgetColor}`}
                style={{ width: `${budgetPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => onView?.(project.id)}
                className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                {language === 'he' ? 'צפה' : 'View'}
              </button>
              <button
                onClick={() => onEdit?.(project.id)}
                className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {language === 'he' ? 'ערוך' : 'Edit'}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}