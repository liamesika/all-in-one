'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useOrganization, useActiveOrg, useRole } from '@/lib/organization-context';
import { orgApi } from '@/lib/api';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton, StatCardSkeleton, ErrorState, Skeleton, TableSkeleton } from '@/components/ui/loading-states';
import DashboardHeader from '@/components/layout/DashboardHeader';

// Tab navigation component
const TabNavigation = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const { language } = useLanguage();

  const tabs = [
    { id: 'overview', label: language === 'he' ? 'סקירה כללית' : 'Overview', icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' },
    { id: 'team', label: language === 'he' ? 'צוות ומקומות' : 'Team & Seats', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v12' },
    { id: 'invites', label: language === 'he' ? 'הזמנות' : 'Invites', icon: 'M3 8l7.89 7.89a1 1 0 001.415 0L21 7.414A2 2 0 0019.586 6L18 4.414A2 2 0 0016.586 4L15 5.586a1 1 0 01-1.414 0L6.414 8.414A2 2 0 005 10.586L3.586 12A2 2 0 002 13.414V20a1 1 0 001 1h7.586A2 2 0 0012 19.586V18l1.414-1.414a1 1 0 000-1.414L8.414 10.586a1 1 0 01-1.414 0z' },
    { id: 'domains', label: language === 'he' ? 'דומיינים' : 'Domains', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'billing', label: language === 'he' ? 'חיוב' : 'Billing', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'audit', label: language === 'he' ? 'יומן ביקורת' : 'Audit Log', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d={tab.icon} clipRule="evenodd" />
            </svg>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();

  // Fetch organization summary data
  const {
    data: orgSummary,
    error,
    isLoading
  } = useSWR(
    activeOrg?.id ? `/organizations/${activeOrg.id}/summary` : null,
    () => activeOrg?.id ? orgApi.getSummary(activeOrg.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת נתוני הארגון' : 'Failed to load organization data'}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא ארגון פעיל' : 'No active organization found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {language === 'he' ? 'סקירה כללית של הארגון' : 'Organization Overview'}
        </h2>
        <p className="text-gray-600">
          {language === 'he' ? 'מבט כללי על הארגון שלך והסטטיסטיקות שלו' : 'Get a high-level view of your organization and its key metrics'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'he' ? 'חברי צוות' : 'Team Members'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {orgSummary?.totalMembers || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'he' ? 'ניצול מקומות' : 'Seat Utilization'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {activeOrg?.usedSeats || 0} / {activeOrg?.seatLimit || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'he' ? 'הזמנות פעילות' : 'Active Invites'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {orgSummary?.activeInvites || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {language === 'he' ? 'תוכנית' : 'Plan'}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {activeOrg?.planTier || 'FREE'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'he' ? 'פעולות מהירות' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'he' ? 'הזמן חבר צוות' : 'Invite Team Member'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'he' ? 'הוסף חבר חדש לארגון' : 'Add a new member to your organization'}
                </div>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'he' ? 'שדרג תוכנית' : 'Upgrade Plan'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'he' ? 'קבל יותר מקומות ותכונות' : 'Get more seats and features'}
                </div>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'he' ? 'הגדרות ארגון' : 'Organization Settings'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'he' ? 'נהל הגדרות כלליות' : 'Manage general settings'}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Team & Seats Management Tab
const TeamTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();
  const { canPerform, hasRole } = useRole();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [roleChanging, setRoleChanging] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch organization members using SWR
  const {
    data: members = [],
    error,
    isLoading,
    mutate: mutateMembers
  } = useSWR(
    activeOrg?.id ? `/organizations/${activeOrg.id}/users` : null,
    () => activeOrg?.id ? orgApi.getMembers(activeOrg.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !canPerform('invite', 'member')) return;

    setIsInviting(true);
    try {
      await orgApi.sendInvite(activeOrg.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteForm(false);
      mutateMembers(); // Refresh the members list
      toast.success(language === 'he' ? 'ההזמנה נשלחה בהצלחה' : 'Invite sent successfully');
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת ההזמנה' : 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!activeOrg || !canPerform('role.change', 'member')) return;

    setRoleChanging(userId);
    try {
      await orgApi.updateMemberRole(activeOrg.id, userId, newRole);
      mutateMembers(); // Refresh the members list
      toast.success(language === 'he' ? 'התפקיד עודכן בהצלחה' : 'Role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון התפקיד' : 'Failed to update role');
    } finally {
      setRoleChanging(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeOrg || !canPerform('remove', 'member')) return;

    if (confirm(language === 'he' ? 'האם אתה בטוח שברצונך להסיר חבר זה?' : 'Are you sure you want to remove this member?')) {
      setRemoving(userId);
      try {
        await orgApi.removeMember(activeOrg.id, userId);
        mutateMembers(); // Refresh the members list
        toast.success(language === 'he' ? 'החבר הוסר בהצלחה' : 'Member removed successfully');
      } catch (error) {
        console.error('Failed to remove member:', error);
        toast.error(language === 'he' ? 'שגיאה בהסרת החבר' : 'Failed to remove member');
      } finally {
        setRemoving(null);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'MEMBER': return 'bg-green-100 text-green-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return language === 'he' ? 'בעלים' : 'Owner';
      case 'ADMIN': return language === 'he' ? 'מנהל' : 'Admin';
      case 'MANAGER': return language === 'he' ? 'מנהל צוות' : 'Manager';
      case 'MEMBER': return language === 'he' ? 'חבר' : 'Member';
      case 'VIEWER': return language === 'he' ? 'צופה' : 'Viewer';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת חברי הצוות' : 'Failed to load team members'}
          retry={() => mutateMembers()}
        />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא ארגון פעיל' : 'No active organization found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with invite button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {language === 'he' ? 'ניהול צוות ומקומות' : 'Team & Seats Management'}
          </h2>
          <p className="text-gray-600">
            {language === 'he' ? 'נהל חברי צוות, תפקידים ומקומות בארגון' : 'Manage team members, roles, and seat allocation'}
          </p>
        </div>
{canPerform('invite', 'member') && (
          <button
            onClick={() => setShowInviteForm(true)}
            disabled={activeOrg.usedSeats >= activeOrg.seatLimit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            {language === 'he' ? 'הזמן חבר' : 'Invite Member'}
          </button>
        )}
      </div>

      {/* Seat Usage Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'he' ? 'שימוש במקומות' : 'Seat Usage'}
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">{activeOrg.usedSeats} / {activeOrg.seatLimit}</div>
            <div className="text-sm text-gray-600">
              {language === 'he' ? 'מקומות בשימוש' : 'Seats used'}
            </div>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                activeOrg.usedSeats >= activeOrg.seatLimit ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min((activeOrg.usedSeats / activeOrg.seatLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {language === 'he'
            ? `${activeOrg.seatLimit - activeOrg.usedSeats} מקומות נותרו במנוי הנוכחי`
            : `${activeOrg.seatLimit - activeOrg.usedSeats} seats remaining in current plan`}
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'הזמן חבר צוות חדש' : 'Invite New Team Member'}
              </h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'כתובת אימייל' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'he' ? 'user@company.com' : 'user@company.com'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'תפקיד' : 'Role'}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VIEWER">{language === 'he' ? 'צופה' : 'Viewer'}</option>
                  <option value="MEMBER">{language === 'he' ? 'חבר' : 'Member'}</option>
                  <option value="MANAGER">{language === 'he' ? 'מנהל צוות' : 'Manager'}</option>
                  <option value="ADMIN">{language === 'he' ? 'מנהל' : 'Admin'}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {language === 'he' ? 'בטל' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isInviting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isInviting
                    ? (language === 'he' ? 'שולח...' : 'Sending...')
                    : (language === 'he' ? 'שלח הזמנה' : 'Send Invite')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'חברי צוות' : 'Team Members'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'משתמש' : 'User'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'תפקיד' : 'Role'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'תאריך הצטרפות' : 'Joined'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.fullName?.charAt(0) || member.email.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.fullName || member.email}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {language === 'he' ? 'פעיל' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {member.role !== 'OWNER' && canPerform('role.change', 'member') && (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.userId || member.id, e.target.value)}
                            disabled={roleChanging === (member.userId || member.id)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="VIEWER">{language === 'he' ? 'צופה' : 'Viewer'}</option>
                            <option value="MEMBER">{language === 'he' ? 'חבר' : 'Member'}</option>
                            <option value="MANAGER">{language === 'he' ? 'מנהל צוות' : 'Manager'}</option>
                            <option value="ADMIN">{language === 'he' ? 'מנהל' : 'Admin'}</option>
                          </select>
                          {canPerform('remove', 'member') && (
                            <button
                              onClick={() => handleRemoveMember(member.userId || member.id)}
                              disabled={removing === (member.userId || member.id)}
                              className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {removing === (member.userId || member.id) ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          )}
                          {roleChanging === (member.userId || member.id) && (
                            <div className="flex items-center text-xs text-gray-500">
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                              {language === 'he' ? 'מעדכן...' : 'Updating...'}
                            </div>
                          )}
                        </>
                      )}
                      {member.role === 'OWNER' && (
                        <span className="text-xs text-gray-500">
                          {language === 'he' ? 'בעלים' : 'Owner'}
                        </span>
                      )}
                      {member.role !== 'OWNER' && !canPerform('role.change', 'member') && (
                        <span className="text-xs text-gray-500">
                          {getRoleLabel(member.role)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Invites Management Tab
const InvitesTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();
  const { canPerform } = useRole();
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Fetch organization invites using SWR
  const {
    data: invites = [],
    error,
    isLoading,
    mutate: mutateInvites
  } = useSWR(
    activeOrg?.id ? `/organizations/${activeOrg.id}/invites` : null,
    () => activeOrg?.id ? orgApi.getInvites(activeOrg.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !canPerform('invite', 'member')) return;

    setIsInviting(true);
    try {
      await orgApi.sendInvite(activeOrg.id, newInviteEmail, newInviteRole);
      setNewInviteEmail('');
      setShowInviteForm(false);
      mutateInvites(); // Refresh the invites list
      toast.success(language === 'he' ? 'ההזמנה נשלחה בהצלחה' : 'Invite sent successfully');
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת ההזמנה' : 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    if (!activeOrg || !canPerform('invite', 'member')) return;

    setResending(inviteId);
    try {
      await orgApi.resendInvite(activeOrg.id, inviteId);
      mutateInvites(); // Refresh the invites list
      toast.success(language === 'he' ? 'ההזמנה נשלחה מחדש בהצלחה' : 'Invite resent successfully');
    } catch (error) {
      console.error('Failed to resend invite:', error);
      toast.error(language === 'he' ? 'שגיאה בשליחת ההזמנה מחדש' : 'Failed to resend invite');
    } finally {
      setResending(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!activeOrg || !canPerform('invite', 'member')) return;

    if (confirm(language === 'he' ? 'האם אתה בטוח שברצונך לבטל הזמנה זו?' : 'Are you sure you want to revoke this invite?')) {
      setRevoking(inviteId);
      try {
        await orgApi.revokeInvite(activeOrg.id, inviteId);
        mutateInvites(); // Refresh the invites list
        toast.success(language === 'he' ? 'ההזמנה בוטלה בהצלחה' : 'Invite revoked successfully');
      } catch (error) {
        console.error('Failed to revoke invite:', error);
        toast.error(language === 'he' ? 'שגיאה בביטול ההזמנה' : 'Failed to revoke invite');
      } finally {
        setRevoking(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'REVOKED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return language === 'he' ? 'ממתין' : 'Pending';
      case 'ACCEPTED': return language === 'he' ? 'התקבל' : 'Accepted';
      case 'EXPIRED': return language === 'he' ? 'פג תוקף' : 'Expired';
      case 'REVOKED': return language === 'he' ? 'בוטל' : 'Revoked';
      default: return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return language === 'he' ? 'בעלים' : 'Owner';
      case 'ADMIN': return language === 'he' ? 'מנהל' : 'Admin';
      case 'MANAGER': return language === 'he' ? 'מנהל צוות' : 'Manager';
      case 'MEMBER': return language === 'he' ? 'חבר' : 'Member';
      case 'VIEWER': return language === 'he' ? 'צופה' : 'Viewer';
      default: return role;
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > new Date(expiresAt);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת ההזמנות' : 'Failed to load invites'}
          retry={() => mutateInvites()}
        />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא ארגון פעיל' : 'No active organization found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with send invite button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {language === 'he' ? 'ניהול הזמנות' : 'Invitations Management'}
          </h2>
          <p className="text-gray-600">
            {language === 'he' ? 'שלח ונהל הזמנות עבור חברי צוות חדשים' : 'Send and manage invitations for new team members'}
          </p>
        </div>
{canPerform('invite', 'member') && (
          <button
            onClick={() => setShowInviteForm(true)}
            disabled={activeOrg.usedSeats >= activeOrg.seatLimit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {language === 'he' ? 'שלח הזמנה' : 'Send Invite'}
          </button>
        )}
      </div>

      {/* Invite Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{invites.filter((i: any) => i.status === 'PENDING').length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'ממתינות' : 'Pending'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{invites.filter((i: any) => i.status === 'ACCEPTED').length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'התקבלו' : 'Accepted'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{invites.filter((i: any) => i.status === 'EXPIRED').length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'פג תוקף' : 'Expired'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{invites.length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'סה״כ' : 'Total'}</div>
        </div>
      </div>

      {/* Send Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'שלח הזמנה חדשה' : 'Send New Invitation'}
              </h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'כתובת אימייל' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'he' ? 'user@company.com' : 'user@company.com'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'תפקיד' : 'Role'}
                </label>
                <select
                  value={newInviteRole}
                  onChange={(e) => setNewInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VIEWER">{language === 'he' ? 'צופה' : 'Viewer'}</option>
                  <option value="MEMBER">{language === 'he' ? 'חבר' : 'Member'}</option>
                  <option value="MANAGER">{language === 'he' ? 'מנהל צוות' : 'Manager'}</option>
                  <option value="ADMIN">{language === 'he' ? 'מנהל' : 'Admin'}</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  {language === 'he'
                    ? 'ההזמנה תשלח באימייל ותפוג תוקף תוך 14 יום'
                    : 'The invitation will be sent via email and will expire in 14 days'}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {language === 'he' ? 'בטל' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !newInviteEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isInviting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isInviting
                    ? (language === 'he' ? 'שולח...' : 'Sending...')
                    : (language === 'he' ? 'שלח הזמנה' : 'Send Invitation')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitations Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'הזמנות' : 'Invitations'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'אימייל' : 'Email'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'תפקיד' : 'Role'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'נשלח בתאריך' : 'Sent'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פג תוקף' : 'Expires'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invites.map((invite: any) => (
                <tr key={invite.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                    {invite.invitedBy && (
                      <div className="text-sm text-gray-500">
                        {language === 'he' ? 'הוזמן על ידי' : 'Invited by'} {invite.invitedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleLabel(invite.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invite.status)}`}>
                      {getStatusLabel(invite.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invite.invitedAt ? new Date(invite.invitedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invite.status === 'PENDING' ? (
                      <span className={invite.expiresAt && isExpired(invite.expiresAt) ? 'text-red-600' : ''}>
                        {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '-'}
                      </span>
                    ) : (
                      invite.acceptedAt ? new Date(invite.acceptedAt).toLocaleDateString() : '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {invite.status === 'PENDING' && canPerform('invite', 'member') && (
                        <>
                          <button
                            onClick={() => handleResendInvite(invite.id)}
                            disabled={resending === invite.id}
                            className="text-blue-600 hover:text-blue-900 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {resending === invite.id ? (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                {language === 'he' ? 'שולח...' : 'Sending...'}
                              </div>
                            ) : (
                              language === 'he' ? 'שלח שוב' : 'Resend'
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.id)}
                            disabled={revoking === invite.id}
                            className="text-red-600 hover:text-red-900 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {revoking === invite.id ? (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                {language === 'he' ? 'מבטל...' : 'Revoking...'}
                              </div>
                            ) : (
                              language === 'he' ? 'בטל' : 'Revoke'
                            )}
                          </button>
                        </>
                      )}
                      {invite.status === 'EXPIRED' && canPerform('invite', 'member') && (
                        <button
                          onClick={() => handleResendInvite(invite.id)}
                          disabled={resending === invite.id}
                          className="text-blue-600 hover:text-blue-900 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {resending === invite.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              {language === 'he' ? 'שולח...' : 'Sending...'}
                            </div>
                          ) : (
                            language === 'he' ? 'שלח שוב' : 'Resend'
                          )}
                        </button>
                      )}
                      {invite.status === 'ACCEPTED' && (
                        <span className="text-xs text-gray-500">
                          {language === 'he' ? 'הושלם' : 'Completed'}
                        </span>
                      )}
                      {!canPerform('invite', 'member') && (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invites.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    {language === 'he' ? 'אין הזמנות עדיין' : 'No invitations yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Domains Management Tab
const DomainsTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();
  const { canPerform } = useRole();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch organization domains using SWR
  const {
    data: domains = [],
    error,
    isLoading,
    mutate: mutateDomains
  } = useSWR(
    activeOrg?.id ? `/organizations/${activeOrg.id}/domains` : null,
    () => activeOrg?.id ? orgApi.getDomains(activeOrg.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !canPerform('add', 'domain') || !newDomain) return;

    setIsAdding(true);
    try {
      await orgApi.addDomain(activeOrg.id, newDomain);
      setNewDomain('');
      setShowAddForm(false);
      mutateDomains(); // Refresh the domains list
      toast.success(language === 'he' ? 'הדומיין נוסף בהצלחה' : 'Domain added successfully');
    } catch (error) {
      console.error('Failed to add domain:', error);
      toast.error(language === 'he' ? 'שגיאה בהוספת הדומיין' : 'Failed to add domain');
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    if (!activeOrg || !canPerform('verify', 'domain')) return;

    setVerifying(domainId);
    try {
      await orgApi.verifyDomain(activeOrg.id, domainId);
      mutateDomains(); // Refresh the domains list
      toast.success(language === 'he' ? 'הדומיין אומת בהצלחה' : 'Domain verified successfully');
    } catch (error) {
      console.error('Failed to verify domain:', error);
      toast.error(language === 'he' ? 'שגיאה באימות הדומיין' : 'Failed to verify domain');
    } finally {
      setVerifying(null);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    if (!activeOrg || !canPerform('remove', 'domain')) return;

    if (confirm(language === 'he' ? 'האם אתה בטוח שברצונך להסיר דומיין זה?' : 'Are you sure you want to remove this domain?')) {
      setRemoving(domainId);
      try {
        await orgApi.removeDomain(activeOrg.id, domainId);
        mutateDomains(); // Refresh the domains list
        toast.success(language === 'he' ? 'הדומיין הוסר בהצלחה' : 'Domain removed successfully');
      } catch (error) {
        console.error('Failed to remove domain:', error);
        toast.error(language === 'he' ? 'שגיאה בהסרת הדומיין' : 'Failed to remove domain');
      } finally {
        setRemoving(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VERIFIED': return language === 'he' ? 'מאומת' : 'Verified';
      case 'PENDING': return language === 'he' ? 'ממתין לאימות' : 'Pending Verification';
      case 'FAILED': return language === 'he' ? 'אימות נכשל' : 'Verification Failed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת הדומיינים' : 'Failed to load domains'}
          retry={() => mutateDomains()}
        />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא ארגון פעיל' : 'No active organization found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with add domain button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {language === 'he' ? 'ניהול דומיינים' : 'Domain Management'}
          </h2>
          <p className="text-gray-600">
            {language === 'he'
              ? 'נהל דומיינים מאומתים להצטרפות אוטומטית של משתמשים'
              : 'Manage verified domains for automatic user enrollment'}
          </p>
        </div>
{canPerform('add', 'domain') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {language === 'he' ? 'הוסף דומיין' : 'Add Domain'}
          </button>
        )}
      </div>

      {/* Domain Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{domains.filter((d: any) => d.status === 'VERIFIED').length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'דומיינים מאומתים' : 'Verified Domains'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{domains.filter((d: any) => d.status === 'PENDING').length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'ממתינים לאימות' : 'Pending Verification'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{domains.length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'סה״כ דומיינים' : 'Total Domains'}</div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {language === 'he' ? 'כיצד זה עובד?' : 'How it works?'}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                {language === 'he'
                  ? 'כאשר משתמש עם כתובת אימייל מדומיין מאומת נרשם, הוא יצטרף אוטומטית לארגון שלך.'
                  : 'When a user with an email address from a verified domain signs up, they will automatically join your organization.'}
              </p>
              <p>
                {language === 'he'
                  ? 'לאימות דומיין, הוסף רשומת TXT לדומיין שלך עם הערך המוצג.'
                  : 'To verify a domain, add a TXT record to your domain with the displayed value.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'he' ? 'הוסף דומיין חדש' : 'Add New Domain'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'he' ? 'שם דומיין' : 'Domain Name'}
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'he' ? 'example.com' : 'example.com'}
                  pattern="^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'he' ? 'הזן את הדומיין ללא www (למשל: company.com)' : 'Enter domain without www (e.g., company.com)'}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {language === 'he' ? 'בטל' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newDomain}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdding && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isAdding
                    ? (language === 'he' ? 'מוסיף...' : 'Adding...')
                    : (language === 'he' ? 'הוסף דומיין' : 'Add Domain')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Domains Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'דומיינים' : 'Domains'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'דומיין' : 'Domain'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'רשומת אימות' : 'Verification Record'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'תאריך הוספה' : 'Added'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.map((domain: any) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          domain.status === 'VERIFIED' ? 'bg-green-400' :
                          domain.status === 'PENDING' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                        {domain.verifiedAt && (
                          <div className="text-sm text-gray-500">
                            {language === 'he' ? 'אומת בתאריך' : 'Verified'} {domain.verifiedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(domain.status)}`}>
                      {getStatusLabel(domain.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 rounded px-2 py-1 inline-block max-w-xs truncate">
                      {domain.verificationRecord}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(domain.verificationRecord)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title={language === 'he' ? 'העתק' : 'Copy'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {domain.addedAt ? new Date(domain.addedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {domain.status === 'PENDING' && canPerform('verify', 'domain') && (
                        <button
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={verifying === domain.id}
                          className="text-blue-600 hover:text-blue-900 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {verifying === domain.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              {language === 'he' ? 'בודק...' : 'Verifying...'}
                            </div>
                          ) : (
                            language === 'he' ? 'בדק אימות' : 'Check Verification'
                          )}
                        </button>
                      )}
                      {canPerform('remove', 'domain') && (
                        <button
                          onClick={() => handleRemoveDomain(domain.id)}
                          disabled={removing === domain.id}
                          className="text-red-600 hover:text-red-900 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {removing === domain.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              {language === 'he' ? 'מסיר...' : 'Removing...'}
                            </div>
                          ) : (
                            language === 'he' ? 'הסר' : 'Remove'
                          )}
                        </button>
                      )}
                      {(!canPerform('verify', 'domain') && !canPerform('remove', 'domain')) && (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    {language === 'he' ? 'אין דומיינים עדיין' : 'No domains yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Instructions */}
      {domains.some((d: any) => d.status === 'PENDING') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {language === 'he' ? 'הוראות אימות' : 'Verification Instructions'}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                {language === 'he' ? 'שלב 1: הוסף רשומת TXT' : 'Step 1: Add TXT Record'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'he'
                  ? 'היכנס לפאנל ניהול הדומיין שלך והוסף רשומת TXT חדשה:'
                  : 'Go to your domain management panel and add a new TXT record:'}
              </p>
              <div className="mt-2 bg-gray-50 rounded p-3 text-sm">
                <div><strong>{language === 'he' ? 'שם:' : 'Name:'}</strong> @ {language === 'he' ? '(או השאר ריק)' : '(or leave empty)'}</div>
                <div><strong>{language === 'he' ? 'ערך:' : 'Value:'}</strong> {language === 'he' ? 'הערך המוצג בטבלה למעלה' : 'The value shown in the table above'}</div>
                <div><strong>TTL:</strong> 300 {language === 'he' ? '(או השאר כברירת מחדל)' : '(or leave as default)'}</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                {language === 'he' ? 'שלב 2: המתן לתפוצה' : 'Step 2: Wait for Propagation'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'he'
                  ? 'זה יכול לקחת עד 24 שעות עד שהרשומה תתפרס ברשת.'
                  : 'It can take up to 24 hours for the record to propagate across the internet.'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                {language === 'he' ? 'שלב 3: בדק אימות' : 'Step 3: Check Verification'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'he'
                  ? 'לחץ על "בדק אימות" בטבלה למעלה כדי לבדוק אם האימות הושלם.'
                  : 'Click "Check Verification" in the table above to verify the domain.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Billing Tab (Stub Implementation)
const BillingTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();
  const { canPerform } = useRole();

  // Fetch billing summary using SWR
  const {
    data: billingInfo,
    error,
    isLoading,
    mutate: mutateBilling
  } = useSWR(
    activeOrg?.id ? `/organizations/${activeOrg.id}/billing/summary` : null,
    () => activeOrg?.id ? orgApi.getBillingSummary(activeOrg.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800';
      case 'STARTER': return 'bg-blue-100 text-blue-800';
      case 'BUSINESS': return 'bg-purple-100 text-purple-800';
      case 'ENTERPRISE': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'FREE': return language === 'he' ? 'חינם' : 'Free';
      case 'STARTER': return language === 'he' ? 'מתחיל' : 'Starter';
      case 'BUSINESS': return language === 'he' ? 'עסקי' : 'Business';
      case 'ENTERPRISE': return language === 'he' ? 'ארגוני' : 'Enterprise';
      default: return plan;
    }
  };

  // Check permissions
  if (!canPerform('view', 'billing')) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-9V6a3 3 0 00-3-3H7a3 3 0 00-3 3v1M12 7v10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'he' ? 'אין הרשאה' : 'Access Denied'}
          </h3>
          <p className="text-gray-500">
            {language === 'he' ? 'אין לך הרשאה לצפות במידע חיוב' : 'You do not have permission to view billing information'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <Skeleton className="h-6 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת מידע החיוב' : 'Failed to load billing information'}
          retry={() => mutateBilling()}
        />
      </div>
    );
  }

  if (!activeOrg || !billingInfo) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא מידע חיוב' : 'No billing information found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {language === 'he' ? 'חיוב ותשלומים' : 'Billing & Payments'}
        </h2>
        <p className="text-gray-600">
          {language === 'he' ? 'נהל את המנוי, התשלומים והחשבוניות שלך' : 'Manage your subscription, payments, and billing history'}
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'he' ? 'התוכנית הנוכחית' : 'Current Plan'}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPlanColor(billingInfo.currentPlan)}`}>
              {getPlanLabel(billingInfo.currentPlan)}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-900">${billingInfo.monthlyPrice}</div>
              <div className="text-sm text-gray-500">
                {language === 'he' ? 'לחודש' : 'per month'}
              </div>
            </div>
          </div>
          {canPerform('update', 'billing') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {language === 'he' ? 'שדרג תוכנית' : 'Upgrade Plan'}
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-semibold text-gray-900">{billingInfo.usedSeats} / {billingInfo.seatLimit}</div>
            <div className="text-sm text-gray-600">{language === 'he' ? 'מקומות בשימוש' : 'Seats used'}</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-semibold text-gray-900">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</div>
            <div className="text-sm text-gray-600">{language === 'he' ? 'חיוב הבא' : 'Next billing'}</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-semibold text-gray-900">•••• {billingInfo.paymentMethod.last4}</div>
            <div className="text-sm text-gray-600">{language === 'he' ? 'כרטיס אשראי' : 'Credit card'}</div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'אמצעי תשלום' : 'Payment Method'}
          </h3>
          {canPerform('update', 'billing') && (
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {language === 'he' ? 'עדכן' : 'Update'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-6 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 16">
              <path d="M0 4a2 2 0 012-2h20a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2 0v8h20V4H2zm2 2h4v2H4V6zm10 0h4v1h-4V6z"/>
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900">•••• •••• •••• {billingInfo.paymentMethod.last4}</div>
            <div className="text-sm text-gray-500">
              {language === 'he' ? 'פג תוקף' : 'Expires'} {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'he' ? 'תוכניות זמינות' : 'Available Plans'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">{language === 'he' ? 'מתחיל' : 'Starter'}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-500">{language === 'he' ? '/חודש' : '/month'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div>{language === 'he' ? 'עד 3 משתמשים' : 'Up to 3 users'}</div>
                <div>{language === 'he' ? 'תכונות בסיסיות' : 'Basic features'}</div>
                <div>{language === 'he' ? 'תמיכה באימייל' : 'Email support'}</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-4 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                {language === 'he' ? 'נוכחי' : 'Current'}
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">{language === 'he' ? 'עסקי' : 'Business'}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">$29.99</span>
                <span className="text-gray-500">{language === 'he' ? '/חודש' : '/month'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div>{language === 'he' ? 'עד 10 משתמשים' : 'Up to 10 users'}</div>
                <div>{language === 'he' ? 'כל התכונות' : 'All features'}</div>
                <div>{language === 'he' ? 'תמיכה בצ\'אט' : 'Chat support'}</div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">{language === 'he' ? 'ארגוני' : 'Enterprise'}</h4>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">$99.99</span>
                <span className="text-gray-500">{language === 'he' ? '/חודש' : '/month'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div>{language === 'he' ? 'משתמשים ללא הגבלה' : 'Unlimited users'}</div>
                <div>{language === 'he' ? 'תכונות מתקדמות' : 'Advanced features'}</div>
                <div>{language === 'he' ? 'תמיכה מועדפת' : 'Priority support'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'היסטוריית חשבוניות' : 'Invoice History'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'מס\' חשבונית' : 'Invoice #'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'תאריך' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'סכום' : 'Amount'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פעולות' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingInfo.invoices.map((invoice: any) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {language === 'he' ? 'שולם' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href={invoice.downloadUrl} className="text-blue-600 hover:text-blue-900">
                      {language === 'he' ? 'הורד' : 'Download'}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {language === 'he' ? 'זקוק לעזרה?' : 'Need help?'}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {language === 'he'
                  ? 'יש לך שאלות לגבי החיוב או רוצה לשנות את התוכנית? צור איתנו קשר.'
                  : 'Have questions about billing or want to change your plan? Contact our support team.'}
              </p>
              <div className="mt-2">
                <a href="mailto:support@effinity.co" className="font-medium underline">
                  support@effinity.co
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audit Log Tab
const AuditTab = () => {
  const { language } = useLanguage();
  const { activeOrg } = useActiveOrg();
  const { canPerform } = useRole();
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    user: '',
    action: '',
    dateRange: '7d',
    from: '',
    to: '',
    page: 1
  });

  // Calculate date range for API call
  const getDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30); // Default to last 30 days
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  // Merge filters with date range
  const apiFilters = {
    ...filters,
    ...getDateRange()
  };

  // Fetch audit logs using SWR
  const {
    data: auditLogs = [],
    error,
    isLoading,
    mutate: mutateAuditLogs
  } = useSWR(
    activeOrg?.id && canPerform('view', 'audit') ? `/organizations/${activeOrg.id}/audit` : null,
    () => activeOrg?.id ? orgApi.getAuditLogs(activeOrg.id, apiFilters) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const handleExportLogs = async () => {
    if (!activeOrg?.id || !canPerform('export', 'audit')) return;

    try {
      const exportData = await orgApi.exportAuditLogs(activeOrg.id, apiFilters);
      // Create download link
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${activeOrg.slug}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(language === 'he' ? 'יומן הביקורת יוצא בהצלחה' : 'Audit logs exported successfully');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      toast.error(language === 'he' ? 'שגיאה בייצוא יומן הביקורת' : 'Failed to export audit logs');
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER_INVITED':
      case 'MEMBER_ADDED':
      case 'DOMAIN_ADDED':
        return 'bg-green-100 text-green-800';
      case 'MEMBER_REMOVED':
      case 'MEMBER_REVOKED':
      case 'DOMAIN_REMOVED':
        return 'bg-red-100 text-red-800';
      case 'MEMBER_ROLE_CHANGED':
      case 'ORGANIZATION_UPDATED':
      case 'DOMAIN_VERIFIED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'LOGIN': return language === 'he' ? 'כניסה למערכת' : 'Login';
      case 'LOGOUT': return language === 'he' ? 'יציאה מהמערכת' : 'Logout';
      case 'MEMBER_INVITED': return language === 'he' ? 'הזמנת חבר' : 'Member Invited';
      case 'MEMBER_ADDED': return language === 'he' ? 'הוספת חבר' : 'Member Added';
      case 'MEMBER_REMOVED': return language === 'he' ? 'הסרת חבר' : 'Member Removed';
      case 'MEMBER_ROLE_CHANGED': return language === 'he' ? 'שינוי תפקיד' : 'Role Changed';
      case 'ORGANIZATION_UPDATED': return language === 'he' ? 'עדכון ארגון' : 'Organization Updated';
      case 'DOMAIN_ADDED': return language === 'he' ? 'הוספת דומיין' : 'Domain Added';
      case 'DOMAIN_VERIFIED': return language === 'he' ? 'אימות דומיין' : 'Domain Verified';
      case 'DOMAIN_REMOVED': return language === 'he' ? 'הסרת דומיין' : 'Domain Removed';
      default: return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'MEMBER_INVITED':
      case 'MEMBER_ADDED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        );
      case 'MEMBER_REMOVED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'MEMBER_ROLE_CHANGED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDetails = (action: string, details: any) => {
    switch (action) {
      case 'MEMBER_ROLE_CHANGED':
        return `${details.oldRole} → ${details.newRole}`;
      case 'ORGANIZATION_UPDATED':
        return `${details.field}: ${details.oldValue} → ${details.newValue}`;
      case 'MEMBER_INVITED':
        return `${language === 'he' ? 'תפקיד:' : 'Role:'} ${details.role}`;
      case 'DOMAIN_ADDED':
        return details.domain;
      case 'LOGIN':
        return `${language === 'he' ? 'שיטה:' : 'Method:'} ${details.method}`;
      default:
        return JSON.stringify(details);
    }
  };

  // Check permissions
  if (!canPerform('view', 'audit')) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'he' ? 'אין הרשאה' : 'Access Denied'}
          </h3>
          <p className="text-gray-500">
            {language === 'he' ? 'אין לך הרשאה לצפות ביומן הביקורת' : 'You do not have permission to view audit logs'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Filters skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <TableSkeleton columns={6} rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={language === 'he' ? 'שגיאה בטעינת יומן הביקורת' : 'Failed to load audit logs'}
          retry={() => mutateAuditLogs()}
        />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="p-6 text-center text-gray-500">
        {language === 'he' ? 'לא נמצא ארגון פעיל' : 'No active organization found'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {language === 'he' ? 'יומן ביקורת' : 'Audit Log'}
        </h2>
        <p className="text-gray-600">
          {language === 'he' ? 'מעקב אחר כל הפעילויות והשינויים בארגון' : 'Track all activities and changes in your organization'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'he' ? 'פעולה' : 'Action'}
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">{language === 'he' ? 'כל הפעולות' : 'All actions'}</option>
              <option value="LOGIN">{language === 'he' ? 'כניסות' : 'Logins'}</option>
              <option value="MEMBER">{language === 'he' ? 'פעולות חברים' : 'Member actions'}</option>
              <option value="ORGANIZATION">{language === 'he' ? 'פעולות ארגון' : 'Organization actions'}</option>
              <option value="DOMAIN">{language === 'he' ? 'פעולות דומיין' : 'Domain actions'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'he' ? 'משתמש' : 'User'}
            </label>
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">{language === 'he' ? 'כל המשתמשים' : 'All users'}</option>
              <option value="admin@company.com">admin@company.com</option>
              <option value="manager@company.com">manager@company.com</option>
              <option value="user@company.com">user@company.com</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'he' ? 'תקופה' : 'Time range'}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="7">{language === 'he' ? '7 ימים אחרונים' : 'Last 7 days'}</option>
              <option value="30">{language === 'he' ? '30 ימים אחרונים' : 'Last 30 days'}</option>
              <option value="90">{language === 'he' ? '90 ימים אחרונים' : 'Last 90 days'}</option>
              <option value="365">{language === 'he' ? 'שנה אחרונה' : 'Last year'}</option>
            </select>
          </div>
          <div className="flex items-end">
            {canPerform('export', 'audit') && (
              <button
                onClick={handleExportLogs}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {language === 'he' ? 'ייצא לCSV' : 'Export CSV'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{auditLogs.filter((log: any) => log.action.includes('LOGIN')).length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'כניסות' : 'Logins'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{auditLogs.filter((log: any) => log.action.includes('MEMBER')).length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'פעולות חברים' : 'Member Actions'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-yellow-600">{auditLogs.filter((log: any) => log.action.includes('ORGANIZATION')).length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'עדכוני ארגון' : 'Org Updates'}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{auditLogs.filter((log: any) => log.action.includes('DOMAIN')).length}</div>
          <div className="text-sm text-gray-600">{language === 'he' ? 'פעולות דומיין' : 'Domain Actions'}</div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'he' ? 'פעילות אחרונה' : 'Recent Activity'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פעולה' : 'Action'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'משתמש' : 'User'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'יעד' : 'Target'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'פרטים' : 'Details'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'זמן' : 'Time'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="ml-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.actor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDetails(log.action, log.details)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {log.timestamp.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {language === 'he' ? 'הודעת אבטחה' : 'Security Notice'}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                {language === 'he'
                  ? 'רשומות הביקורת נשמרות למשך 12 חודשים לצורכי אבטחה ועמידה בתקנות. רשומות אלו אינן ניתנות לעריכה או מחיקה.'
                  : 'Audit logs are retained for 12 months for security and compliance purposes. These records cannot be edited or deleted.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrgAdminPage() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{language === 'he' ? 'טוען...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'team':
        return <TeamTab />;
      case 'invites':
        return <InvitesTab />;
      case 'domains':
        return <DomainsTab />;
      case 'billing':
        return <BillingTab />;
      case 'audit':
        return <AuditTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'he' ? 'ניהול ארגון' : 'Organization Administration'}
          </h1>
          <p className="mt-2 text-gray-600">
            {language === 'he'
              ? 'נהל את הארגון שלך, חברי הצוות והגדרות'
              : 'Manage your organization, team members, and settings'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderTabContent()}
        </div>
      </div>
    </>
  );
}