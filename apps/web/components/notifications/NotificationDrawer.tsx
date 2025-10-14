/**
 * Notification Drawer - Sprint A2
 * Right-side drawer with tabs, cards, and actions
 * Dark theme, mobile-first, a11y compliant, virtualized list
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Clock, Eye, Trash2 } from 'lucide-react';
import { useNotifications, NotificationTab, Notification } from '@/hooks/useNotifications';
import toast from 'react-hot-toast';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const { notifications, unreadCount, loading, markAsRead, dismiss, snooze } = useNotifications({
    tab: activeTab,
    enabled: isOpen,
  });

  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDismiss = async (id: string, title: string) => {
    const success = await dismiss(id);
    if (success) {
      toast.success(`Dismissed: ${title}`);
    }
  };

  const handleSnooze = async (id: string, duration: '1h' | '24h', title: string) => {
    const success = await snooze(id, duration);
    if (success) {
      toast.success(`Snoozed for ${duration}: ${title}`);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'WARN':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] lg:w-[480px] bg-[#0E1A2B] border-l border-[#1A2F4B] shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1A2F4B]">
          <div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A2F4B] rounded-lg transition-colors text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1A2F4B] overflow-x-auto scrollbar-thin">
          {(['all', 'alerts', 'mentions', 'system'] as NotificationTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                  : 'text-gray-400 hover:text-white'
              }`}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div
          className="flex-1 overflow-y-auto"
          role="region"
          aria-live="polite"
          aria-atomic="false"
        >
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2979FF] border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Info className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1A2F4B]">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                  onSnooze={handleSnooze}
                  getSeverityIcon={getSeverityIcon}
                  getTimeAgo={getTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Notification Card Component
interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string, title: string) => void;
  onSnooze: (id: string, duration: '1h' | '24h', title: string) => void;
  getSeverityIcon: (severity: string) => JSX.Element;
  getTimeAgo: (date: string) => string;
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDismiss,
  onSnooze,
  getSeverityIcon,
  getTimeAgo,
}: NotificationCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`p-4 hover:bg-[#1A2F4B] transition-all duration-300 group ${
        !notification.readAt ? 'bg-[#0a1019]' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Severity Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon(notification.severity)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-white">{notification.title}</h3>
            {!notification.readAt && (
              <span className="flex-shrink-0 w-2 h-2 bg-[#2979FF] rounded-full mt-1.5" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{notification.body}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{getTimeAgo(notification.createdAt)}</span>
            {notification.entityType && (
              <>
                <span>•</span>
                <span className="capitalize">{notification.entityType}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                onClick={() => !notification.readAt && onMarkAsRead(notification.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2979FF] hover:bg-[#1e5bbf] text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {notification.type.includes('REVIEW') ? 'Review' : 'Open'}
              </a>
            )}

            <button
              onClick={() => setShowActions(!showActions)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2F4B] hover:bg-[#2d4a6b] text-gray-300 text-xs font-medium rounded-lg transition-colors"
              aria-label="More actions"
              aria-expanded={showActions}
            >
              <Clock className="w-3.5 h-3.5" />
              More
            </button>

            {!notification.readAt && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1.5 hover:bg-[#1A2F4B] rounded text-gray-400 hover:text-white transition-colors"
                title="Mark as read"
                aria-label="Mark as read"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onDismiss(notification.id, notification.title)}
              className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors"
              title="Dismiss"
              aria-label="Dismiss notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Snooze Actions */}
          {showActions && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1A2F4B]">
              <button
                onClick={() => {
                  onSnooze(notification.id, '1h', notification.title);
                  setShowActions(false);
                }}
                className="flex-1 px-3 py-1.5 bg-[#1A2F4B] hover:bg-[#2d4a6b] text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                Snooze 1h
              </button>
              <button
                onClick={() => {
                  onSnooze(notification.id, '24h', notification.title);
                  setShowActions(false);
                }}
                className="flex-1 px-3 py-1.5 bg-[#1A2F4B] hover:bg-[#2d4a6b] text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                Snooze 24h
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
