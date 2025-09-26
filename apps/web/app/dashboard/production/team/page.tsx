'use client';
import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { EffinityHeader } from '@/components/effinity-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function ProductionTeamContent() {
  const { language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!ownerUid || authLoading) return;

    // Mock data for team members
    setTeamMembers([
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'ADMIN',
        position: 'Production Manager',
        avatar: null,
        status: 'ACTIVE',
        joinedAt: '2024-01-15',
        lastActive: '2024-12-10T14:30:00Z',
        currentProjects: 3,
        completedProjects: 12,
        phone: '+1-555-0201',
        skills: ['Project Management', 'Event Coordination', 'Budget Planning']
      },
      {
        id: 2,
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        role: 'MANAGER',
        position: 'Technical Director',
        avatar: null,
        status: 'ACTIVE',
        joinedAt: '2024-02-01',
        lastActive: '2024-12-10T16:45:00Z',
        currentProjects: 2,
        completedProjects: 8,
        phone: '+1-555-0202',
        skills: ['Audio/Visual', 'Stage Design', 'Equipment Management']
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        role: 'MEMBER',
        position: 'Event Coordinator',
        avatar: null,
        status: 'ACTIVE',
        joinedAt: '2024-03-10',
        lastActive: '2024-12-10T13:20:00Z',
        currentProjects: 4,
        completedProjects: 15,
        phone: '+1-555-0203',
        skills: ['Vendor Management', 'Client Relations', 'Logistics']
      },
      {
        id: 4,
        name: 'David Park',
        email: 'david.park@company.com',
        role: 'MEMBER',
        position: 'Creative Designer',
        avatar: null,
        status: 'ACTIVE',
        joinedAt: '2024-04-05',
        lastActive: '2024-12-09T18:10:00Z',
        currentProjects: 1,
        completedProjects: 6,
        phone: '+1-555-0204',
        skills: ['Graphic Design', 'Brand Design', 'Marketing Materials']
      },
      {
        id: 5,
        name: 'Lisa Thompson',
        email: 'lisa.thompson@company.com',
        role: 'MEMBER',
        position: 'Operations Assistant',
        avatar: null,
        status: 'INACTIVE',
        joinedAt: '2024-01-20',
        lastActive: '2024-11-15T10:30:00Z',
        currentProjects: 0,
        completedProjects: 4,
        phone: '+1-555-0205',
        skills: ['Administrative Support', 'Data Entry', 'Scheduling']
      }
    ]);
  }, [ownerUid, authLoading]);

  const filteredMembers = teamMembers.filter(member => {
    if (filter === 'all') return true;
    if (filter === 'active') return member.status === 'ACTIVE';
    if (filter === 'inactive') return member.status === 'INACTIVE';
    return member.role === filter.toUpperCase();
  });

  const getRoleLabel = (role: string) => {
    const labels = {
      'OWNER': language === 'he' ? 'בעלים' : 'Owner',
      'ADMIN': language === 'he' ? 'מנהל' : 'Admin',
      'MANAGER': language === 'he' ? 'מנהל פרויקטים' : 'Manager',
      'MEMBER': language === 'he' ? 'חבר צוות' : 'Member',
      'VIEWER': language === 'he' ? 'צופה' : 'Viewer'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'OWNER': 'bg-purple-100 text-purple-700',
      'ADMIN': 'bg-red-100 text-red-700',
      'MANAGER': 'bg-blue-100 text-blue-700',
      'MEMBER': 'bg-green-100 text-green-700',
      'VIEWER': 'bg-gray-100 text-gray-700'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return language === 'he' ? 'פעיל כעת' : 'Active now';
    if (diffHours < 24) return language === 'he' ? `לפני ${diffHours} שעות` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return language === 'he' ? `לפני ${diffDays} ימים` : `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-gray-50">
      {/* Header */}
      <EffinityHeader
        variant="dashboard"
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl border-0"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {language === 'he' ? 'ניהול צוות' : 'Team Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'he'
                  ? `מנהל ${filteredMembers.length} חברי צוות`
                  : `Managing ${filteredMembers.length} team members`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {language === 'he' ? 'ייצא נתונים' : 'Export Data'}
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {language === 'he' ? 'הזמן חבר צוות' : 'Invite Member'}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { key: 'all', label: language === 'he' ? 'הכל' : 'All' },
              { key: 'active', label: language === 'he' ? 'פעיל' : 'Active' },
              { key: 'admin', label: language === 'he' ? 'מנהלים' : 'Admins' },
              { key: 'manager', label: language === 'he' ? 'מנהלי פרויקטים' : 'Managers' },
              { key: 'member', label: language === 'he' ? 'חברי צוות' : 'Members' },
              { key: 'inactive', label: language === 'he' ? 'לא פעיל' : 'Inactive' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-lg">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {member.name}
                      </CardTitle>
                      <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{member.position}</p>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(member.status)}`}>
                        {member.status === 'ACTIVE' ? (language === 'he' ? 'פעיל' : 'Active') : (language === 'he' ? 'לא פעיל' : 'Inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline truncate">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${member.phone}`} className="text-gray-600 hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 bg-gray-50 rounded-lg px-3">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-blue-600">{member.currentProjects}</p>
                      <p className="text-xs text-gray-600">{language === 'he' ? 'פרויקטים פעילים' : 'Active Projects'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-green-600">{member.completedProjects}</p>
                      <p className="text-xs text-gray-600">{language === 'he' ? 'הושלמו' : 'Completed'}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{language === 'he' ? 'כישורים:' : 'Skills:'}</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 2).map((skill: string, idx: number) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{member.skills.length - 2} {language === 'he' ? 'נוספים' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Active & Join Date */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      {language === 'he' ? 'פעיל לאחרונה:' : 'Last active:'} {formatLastActive(member.lastActive)}
                    </div>
                    <div>
                      {language === 'he' ? 'הצטרף:' : 'Joined:'} {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        {language === 'he' ? 'צפה בפרופיל' : 'View Profile'}
                      </button>
                      <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        {language === 'he' ? 'צור קשר' : 'Message'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'he' ? 'אין חברי צוות להצגה' : 'No team members to show'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'he' ? 'התחל בהזמנת חברי צוות לעבודה משותפת' : 'Get started by inviting team members to collaborate'}
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {language === 'he' ? 'הזמן חבר צוות ראשון' : 'Invite First Team Member'}
            </button>
          </div>
        )}

        {/* Team Statistics */}
        {filteredMembers.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {teamMembers.filter(m => m.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-gray-600">{language === 'he' ? 'חברי צוות פעילים' : 'Active Team Members'}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {teamMembers.reduce((sum, m) => sum + m.currentProjects, 0)}
                </p>
                <p className="text-sm text-gray-600">{language === 'he' ? 'פרויקטים פעילים' : 'Active Projects'}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {teamMembers.reduce((sum, m) => sum + m.completedProjects, 0)}
                </p>
                <p className="text-sm text-gray-600">{language === 'he' ? 'פרויקטים שהושלמו' : 'Completed Projects'}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductionTeamPage() {
  return (
    <LanguageProvider>
      <ProductionTeamContent />
    </LanguageProvider>
  );
}