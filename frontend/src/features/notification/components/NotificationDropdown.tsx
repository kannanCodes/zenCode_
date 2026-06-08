import { useState, useRef, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { INotification } from '../types/notification.types';

interface Props {
  onClose: () => void;
}

type FilterType = 'all' | 'unread';

const NotificationDropdown = ({ onClose }: Props) => {
  const { notifications, unreadCount, isLoading, hasMore, markAsRead, markAllRead, loadMore } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter notifications locally
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  // Infinite Scroll Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setPage(prev => {
          const next = prev + 1;
          loadMore(next);
          return next;
        });
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    });
    
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div 
      className="absolute right-0 mt-2 w-[400px] rounded-xl bg-[#0a0a0a] border border-[#1c1c1c] shadow-2xl z-50 flex flex-col overflow-hidden max-h-[85vh]"
      style={{ animation: 'slideDown 0.15s ease-out' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Notification</h2>
            <p className="text-sm text-gray-500 font-mono">
              {unreadCount === 0 ? 'No unread notifications' : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Subheader / Tabs */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-lg">
          <button 
            onClick={() => setFilter('unread')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === 'unread' ? 'bg-[var(--color-primary)] text-white font-medium' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Unread 
            {unreadCount > 0 && (
              <span className={`px-1.5 rounded-full text-[11px] font-mono ${
                filter === 'unread' ? 'bg-white/20' : 'bg-[#2c2c2c] text-gray-300'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              filter === 'all' ? 'bg-[var(--color-primary)] text-white font-medium' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => void markAllRead()}
            className="p-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2c2c2c] rounded-lg text-gray-400 hover:text-white transition-all group"
            title="Mark all as read"
          >
            <svg className="w-5 h-5 group-hover:text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 18l4 4L19 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto flex-1 min-h-[400px] bg-[#0a0a0a]">
        {filteredNotifications.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 px-6">
            <svg className="w-16 h-16 text-[#2c2c2c] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-gray-400 font-medium">No notifications found</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredNotifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onRead={() => {
                  if (!n.isRead) void markAsRead(n._id);
                }}
              />
            ))}
            
            {/* Loading Indicator & Intersection Target */}
            <div ref={observerTarget} className="py-4 flex justify-center">
              {isLoading && (
                <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Individual notification row ────────────────────────────────────────────────

interface NotificationItemProps {
  notification: INotification;
  onRead: () => void;
}

const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const { title, message, isRead, createdAt } = notification;

  return (
    <button
      onClick={onRead}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        !isRead 
          ? 'bg-[#141414] border-[#2c2c2c] hover:border-[var(--color-primary)]/50' 
          : 'bg-[#0a0a0a] border-transparent hover:bg-[#141414] hover:border-[#1c1c1c]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h4 className={`text-[15px] font-semibold leading-tight ${!isRead ? 'text-white' : 'text-gray-300'}`}>
          {title}
        </h4>
        <span className="text-[12px] text-gray-500 whitespace-nowrap font-mono mt-0.5">
          {formatDatePrecise(createdAt)}
        </span>
      </div>
      <p className={`text-[13.5px] leading-relaxed ${!isRead ? 'text-gray-300' : 'text-gray-500'}`}>
        {message}
      </p>
    </button>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDatePrecise(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${month} ${day} ${year} ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

export default NotificationDropdown;
