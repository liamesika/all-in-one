/**
 * useNotifications Hook - Sprint A2
 * Manages notification fetching, polling, and mutations
 * Polling: ~15s with ETag support
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type NotificationTab = 'all' | 'alerts' | 'mentions' | 'system';

export type NotificationSeverity = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export interface Notification {
  id: string;
  type: string;
  severity: NotificationSeverity;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
}

interface UseNotificationsOptions {
  tab?: NotificationTab;
  unreadOnly?: boolean;
  pollingInterval?: number; // Default 15s
  enabled?: boolean;
}

export function useNotifications({
  tab = 'all',
  unreadOnly = false,
  pollingInterval = 15000,
  enabled = true,
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const etagRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!enabled) return;

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        tab,
        ...(unreadOnly && { unreadOnly: 'true' }),
      });

      const headers: HeadersInit = {};
      if (etagRef.current && isPolling) {
        headers['If-None-Match'] = etagRef.current;
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers,
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 304) {
        // Not Modified - no changes
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      // Update ETag
      const newEtag = response.headers.get('etag');
      if (newEtag) {
        etagRef.current = newEtag;
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignore abort errors
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Notification fetch error:', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [tab, unreadOnly, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Polling
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      fetchNotifications(true); // Polling mode
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      // Optimistically update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        )
      );

      // Decrement unread count if was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error('Mark as read error:', err);
      return false;
    }
  };

  // Dismiss notification
  const dismiss = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to dismiss');

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Decrement unread count if was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error('Dismiss error:', err);
      return false;
    }
  };

  // Snooze notification
  const snooze = async (notificationId: string, duration: '1h' | '24h') => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/snooze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });

      if (!response.ok) throw new Error('Failed to snooze');

      // Remove from local state (will reappear after snooze expires)
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Decrement unread count if was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error('Snooze error:', err);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    dismiss,
    snooze,
    refetch: () => fetchNotifications(false),
  };
}
