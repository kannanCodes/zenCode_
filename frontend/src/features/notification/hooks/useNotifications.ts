import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../../../store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  prependSocketNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
  selectHasMoreNotifications,
} from '../../../store/slices/notificationSlice';
import { notificationSocketManager } from '../../../shared/lib/notificationSocket';
import type { NotificationSocketPayload } from '../types/notification.types';

/**
 * Central hook for the notification system.
 *
 * On mount:
 *   1. Fetches initial notifications from REST (ensures persistence after refresh)
 *   2. Subscribes to `notification:new` socket event for real-time delivery
 *
 * The socket is the DELIVERY layer; the REST API is the SOURCE OF TRUTH.
 */
export function useNotifications() {
  const dispatch = useDispatch<AppDispatch>();

  const notifications   = useSelector(selectNotifications);
  const unreadCount     = useSelector(selectUnreadCount);
  const isLoading       = useSelector(selectNotificationLoading);
  const hasMore         = useSelector(selectHasMoreNotifications);

  // ── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // ── Real-time socket subscription ─────────────────────────────────────────
  useEffect(() => {
    const socket = notificationSocketManager.getSocket();
    if (!socket) return;

    const handleNewNotification = (payload: NotificationSocketPayload) => {
      dispatch(prependSocketNotification(payload));

      // Show a toast for real-time feedback
      toast(payload.title, {
        icon: getNotificationIcon(payload.type),
        style: {
          background: '#111',
          color: '#fff',
          border: '1px solid #2d5fff',
          fontSize: '13px',
        },
        duration: 4000,
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [dispatch]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markAsRead = useCallback(
    (notificationId: string) => dispatch(markNotificationRead(notificationId)),
    [dispatch]
  );

  const markAllRead = useCallback(
    () => dispatch(markAllNotificationsRead()),
    [dispatch]
  );

  const loadMore = useCallback(
    (page: number) => dispatch(fetchNotifications({ page })),
    [dispatch]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllRead,
    loadMore,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'mentor_session_booked':    return '📅';
    case 'mentor_session_cancelled': return '❌';
    case 'mentor_session_reminder':  return '⏰';
    case 'mentor_session_started':   return '🚀';
    default:                         return '🔔';
  }
}
