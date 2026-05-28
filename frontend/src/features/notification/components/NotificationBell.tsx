import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../../../store/slices/notificationSlice';
import NotificationDropdown from './NotificationDropdown';

/**
 * Notification bell icon with animated unread badge.
 * Clicking toggles the dropdown panel.
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount  = useSelector(selectUnreadCount);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 rounded-full bg-[#1a1d26] border border-[#272b3a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#3a3f52] transition-all"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Bell icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2d5fff] text-white text-[10px] font-bold flex items-center justify-center leading-none animate-in zoom-in duration-200"
            style={{ boxShadow: '0 0 0 2px #0d0d14' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
