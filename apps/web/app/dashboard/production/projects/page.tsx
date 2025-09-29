'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function ProductionProjectsContent() {
  const { language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!ownerUid || authLoading) return;

    // Mock data for projects
    setProjects([
      {
        id: 1,
        name: 'Tech Conference 2024',
        type: 'CONFERENCE',
        status: 'ACTIVE',
        deadline: '2024-12-15',
        budget: 35000,
        usedBudget: 28000,
        client: 'TechCorp Inc.',
        progress: 80,
        tasks: 12,
        completedTasks: 9
      },
      {
        id: 2,
        name: 'Product Launch Event',
        type: 'SHOW',
        status: 'PLANNING',
        deadline: '2025-01-20',
        budget: 50000,
        usedBudget: 15000,
        client: 'StartupXYZ',
        progress: 30,
        tasks: 20,
        completedTasks: 6
      },
      {
        id: 3,
        name: 'Corporate Video Production',
        type: 'FILMING',
        status: 'ON_HOLD',
        deadline: '2024-11-30',
        budget: 25000,
        usedBudget: 12000,
        client: 'BigCorp Ltd.',
        progress: 45,
        tasks: 8,
        completedTasks: 3
      },
      {
        id: 4,
        name: 'Wedding Photography',
        type: 'OTHER',
        status: 'DONE',
        deadline: '2024-10-15',
        budget: 5000,
        usedBudget: 4800,
        client: 'Private Client',
        progress: 100,
        tasks: 6,
        completedTasks: 6
      }
    ]);
  }, [ownerUid, authLoading]);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter.toUpperCase();
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-gray-50">
      {/* Header */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {language === 'he' ? 'ניהול פרויקטים' : 'Project Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'he'
                  ? `מנהל ${filteredProjects.length} פרויקטים פעילים`
                  : `Managing ${filteredProjects.length} active projects`
                }
              </p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { key: 'all', label: language === 'he' ? 'הכל' : 'All' },
              { key: 'active', label: language === 'he' ? 'פעיל' : 'Active' },
              { key: 'planning', label: language === 'he' ? 'תכנון' : 'Planning' },
              { key: 'on_hold', label: language === 'he' ? 'מושהה' : 'On Hold' },
              { key: 'done', label: language === 'he' ? 'הושלם' : 'Done' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (project.usedBudget / project.budget) > 0.9 ? 'bg-red-500' :
                          (project.usedBudget / project.budget) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((project.usedBudget / project.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                        {language === 'he' ? 'צפה' : 'View'}
                      </button>
                      <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        {language === 'he' ? 'ערוך' : 'Edit'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'he' ? 'אין פרויקטים להצגה' : 'No projects to show'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'he' ? 'התחל בצירת הפרויקט הראשון שלך' : 'Get started by creating your first project'}
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              {language === 'he' ? 'צור פרויקט חדש' : 'Create New Project'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductionProjectsPage() {
  return (
    <LanguageProvider>
      <ProductionProjectsContent />
    </LanguageProvider>
  );
}