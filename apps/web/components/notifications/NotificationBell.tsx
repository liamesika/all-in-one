/**
 * Notification Bell Icon - Sprint A2
 * Global bell icon with unread dot
 * Dark theme, accessible, keyboard navigable
 */

'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function NotificationBell({ onClick, isOpen = false }: NotificationBellProps) {
  const { unreadCount } = useNotifications({ tab: 'all', enabled: true });

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[#1A2F4B] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <Bell className="w-5 h-5 text-gray-300" />
      {unreadCount > 0 && (
        <span
          className="absolute top-1 right-1 w-2 h-2 bg-[#2979FF] rounded-full ring-2 ring-[#0E1A2B]"
          aria-hidden="true"
        />
      )}
      {unreadCount > 9 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#2979FF] text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
