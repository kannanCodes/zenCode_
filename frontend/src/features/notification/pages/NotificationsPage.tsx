import { useNotifications } from '../hooks/useNotifications';
import type { INotification } from '../types/notification.types';
import { tokenService } from '../../../shared/lib/token';


const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllRead,
    loadMore,
  } = useNotifications();

  const handleLoadMore = () => {
    const nextPage = Math.ceil(notifications.length / 20) + 1;
    void loadMore(nextPage);
  };

  const payload = tokenService.getTokenPayload();
  const isMentor = payload?.role === 'mentor';

  return (
    <div className={`min-h-screen bg-[var(--color-background-dark)] pb-16 px-4 ${isMentor ? 'pt-8' : 'pt-24'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="text-sm text-[#2d5fff] hover:text-blue-400 transition-colors font-medium px-3 py-1.5 rounded-lg border border-[#2d5fff]/30 hover:border-[#2d5fff]/60"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#2d5fff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((n) => (
                <NotificationCard
                  key={n._id}
                  notification={n}
                  onRead={() => { if (!n.isRead) void markAsRead(n._id); }}
                />
              ))}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="mt-4 w-full py-3 text-sm text-gray-400 hover:text-white border border-[#1c1c2e] hover:border-[#272b3a] rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: INotification;
  onRead: () => void;
}

const NotificationCard = ({ notification, onRead }: NotificationCardProps) => {
  const { type, title, message, isRead, createdAt } = notification;

  return (
    <button
      onClick={onRead}
      className={`w-full text-left rounded-xl border transition-all group ${
        isRead
          ? 'bg-[#0d0d14] border-[#1c1c2e] hover:border-[#272b3a]'
          : 'bg-[#111122] border-[#2d3058] hover:border-[#3d4080]'
      }`}
    >
      <div className="flex gap-4 p-4 items-start">
        {/* Icon bubble */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          isRead ? 'bg-[#1a1d26]' : 'bg-[#2d5fff]/15'
        }`}>
          {getIcon(type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={`text-[14px] font-semibold leading-tight ${isRead ? 'text-gray-400' : 'text-white'}`}>
              {title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-gray-600">{formatTimeAgo(createdAt)}</span>
              {!isRead && (
                <span className="w-2 h-2 rounded-full bg-[#2d5fff] flex-shrink-0" />
              )}
            </div>
          </div>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </button>
  );
};

const EmptyState = () => {
  const payload = tokenService.getTokenPayload();
  const isMentor = payload?.role === 'mentor';

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1a1d26] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-400 mb-2">No notifications yet</h3>
      <p className="text-sm text-gray-600 max-w-sm">
        {isMentor
          ? "When candidates book sessions or updates occur, they'll appear here."
          : "When you book a mentor session or receive updates, they'll appear here."}
      </p>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getIcon(type: string): string {
  switch (type) {
    case 'mentor_session_booked':    return '📅';
    case 'mentor_session_cancelled': return '❌';
    case 'mentor_session_reminder':  return '⏰';
    case 'mentor_session_started':   return '🚀';
    default:                         return '🔔';
  }
}

function formatTimeAgo(dateStr: string): string {
  const date    = new Date(dateStr);
  const now     = new Date();
  const diffMs  = now.getTime() - date.getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default NotificationsPage;
