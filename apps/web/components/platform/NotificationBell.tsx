'use client';

import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const { isOpen, setOpen, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationPanel />}
    </>
  );
}
