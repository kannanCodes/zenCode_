import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import type { INotification } from '../types/notification.types';
import { tokenService } from '../../../shared/lib/token';

interface Props {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: Props) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead } = useNotifications();

  const recent = notifications.slice(0, 8);
  const payload = tokenService.getTokenPayload();
  const isMentor = payload?.role === 'mentor';
  const targetRoute = isMentor ? '/mentor/notifications' : '/notifications';

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0d0d14] border border-[#1c1c2e] shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{ animation: 'slideDown 0.15s ease-out' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c2e]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#2d5fff]/20 text-[#2d5fff] text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="text-[11px] text-[#2d5fff] hover:text-blue-400 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[380px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#2d5fff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1d26] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          recent.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={() => {
                if (!n.isRead) void markAsRead(n._id);
              }}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1c1c2e]">
        <Link
          to={targetRoute}
          onClick={onClose}
          className="block w-full text-center py-3 text-sm text-[#2d5fff] hover:bg-[#1a1d26] transition-colors font-medium"
        >
          View all notifications →
        </Link>
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
  const { type, title, message, isRead, createdAt } = notification;

  return (
    <button
      onClick={onRead}
      className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[#1a1d26] transition-colors border-b border-[#1c1c2e] last:border-b-0 ${
        !isRead ? 'bg-[#1a1d26]/60' : ''
      }`}
    >
      {/* Icon */}
      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{getIcon(type)}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] font-medium leading-tight ${isRead ? 'text-gray-400' : 'text-white'}`}>
            {title}
          </p>
          {!isRead && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2d5fff] mt-1" />
          )}
        </div>
        <p className="text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2">{message}</p>
        <p className="text-[11px] text-gray-600 mt-1.5">{formatTimeAgo(createdAt)}</p>
      </div>
    </button>
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
  const date  = new Date(dateStr);
  const now   = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default NotificationDropdown;
