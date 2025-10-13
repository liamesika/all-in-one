'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismiss?: boolean;
  dismissTime?: number; // milliseconds
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
}

export function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show new notifications with slide-in animation
    notifications.forEach((notif) => {
      if (!dismissedNotifications.has(notif.id) && !visibleNotifications.includes(notif.id)) {
        setTimeout(() => {
          setVisibleNotifications((prev) => [...prev, notif.id]);
        }, 50);

        // Auto-dismiss after specified time (default 5 seconds)
        if (notif.autoDismiss !== false) {
          const timeout = notif.dismissTime || 5000;
          setTimeout(() => {
            handleDismiss(notif.id);
          }, timeout);
        }
      }
    });
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setDismissedNotifications((prev) => new Set([...prev, id]));
    setVisibleNotifications((prev) => prev.filter((nid) => nid !== id));
    onDismiss?.(id);
  };

  const handleAction = (notification: Notification) => {
    notification.onAction?.();
    handleDismiss(notification.id);
  };

  const getNotificationStyles = (type: Notification['type']) => {
    const styles = {
      warning: {
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        border: '#fbbf24',
        icon: '⚠️',
      },
      error: {
        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        border: '#f87171',
        icon: '🚨',
      },
      info: {
        bg: 'linear-gradient(135deg, #2979FF 0%, #1d4ed8 100%)',
        border: '#60a5fa',
        icon: 'ℹ️',
      },
      success: {
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '#34d399',
        icon: '✓',
      },
    };
    return styles[type] || styles.info;
  };

  const activeNotifications = notifications.filter(
    (n) => !dismissedNotifications.has(n.id)
  );

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 w-96 max-w-[calc(100vw-3rem)]">
      {activeNotifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        const isVisible = visibleNotifications.includes(notification.id);

        return (
          <div
            key={notification.id}
            className="transform transition-all duration-300 ease-out"
            style={{
              opacity: isVisible ? 0.95 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="rounded-xl shadow-2xl border backdrop-blur-md"
              style={{
                background: styles.bg,
                borderColor: styles.border,
                boxShadow: `0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px ${styles.border}40`,
              }}
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl flex-shrink-0">{styles.icon}</span>
                    <p className="text-white font-medium leading-relaxed text-sm">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {notification.actionLabel && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAction(notification)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
                    >
                      {notification.actionLabel}
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar for auto-dismiss */}
              {notification.autoDismiss !== false && (
                <div
                  className="h-1 bg-white/30 rounded-b-xl overflow-hidden"
                  style={{ animation: `shrink ${notification.dismissTime || 5000}ms linear` }}
                >
                  <style jsx>{`
                    @keyframes shrink {
                      from {
                        width: 100%;
                      }
                      to {
                        width: 0%;
                      }
                    }
                  `}</style>
                  <div
                    className="h-full bg-white/50"
                    style={{
                      animation: `shrink ${notification.dismissTime || 5000}ms linear`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
