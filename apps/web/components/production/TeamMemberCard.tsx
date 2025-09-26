'use client';
import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface TeamMemberCardProps {
  member: {
    id: number;
    name: string;
    email: string;
    role: string;
    position: string;
    status: string;
    currentProjects: number;
    completedProjects: number;
    phone: string;
    skills: string[];
    lastActive: string;
    joinedAt: string;
  };
  onViewProfile?: (id: number) => void;
  onMessage?: (id: number) => void;
}

export function TeamMemberCard({ member, onViewProfile, onMessage }: TeamMemberCardProps) {
  const { language } = useLanguage();

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
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
              <button
                onClick={() => onViewProfile?.(member.id)}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {language === 'he' ? 'צפה בפרופיל' : 'View Profile'}
              </button>
              <button
                onClick={() => onMessage?.(member.id)}
                className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {language === 'he' ? 'צור קשר' : 'Message'}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}