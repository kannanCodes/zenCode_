import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import {
  clearSubscription,
  selectIsHydrated,
  selectIsPremium,
  selectSubscription,
} from '../../store/slices/subscriptionSlice';
import { tokenService } from '../lib/token';
import { notificationSocketManager } from '../lib/notificationSocket';
import { clearNotifications } from '../../store/slices/notificationSlice';
import NotificationBell from '../../features/notification/components/NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!tokenService.getAccessToken();
  const isPremium = useSelector(selectIsPremium);
  const subscription = useSelector(selectSubscription);
  const isHydrated = useSelector(selectIsHydrated);
  // While token exists but subscription is still loading, show nothing to prevent flash
  const showBadge = isAuthenticated && isHydrated;
  const navLinks = isAuthenticated
    ? [
        { label: 'Problems', to: '/problems' },
        { label: 'Mock Interview', to: '/candidate/mentors' },
        { label: 'Schedule', to: '/candidate/bookings' },
        { label: 'Dashboard', to: '/dashboard' },
      ]
    : [
        { label: 'Problems', to: '/problems' },
        { label: 'Mentors', to: '/login' },
        { label: 'Mock Interviews', to: '/login' },
      ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    tokenService.clear();
    dispatch(clearSubscription());
    dispatch(clearNotifications());
    notificationSocketManager.disconnect();
    navigate('/login');
  };

  const planName =
    subscription && typeof subscription.planId === 'object'
      ? subscription.planId.name
      : 'Premium';
  const planNameLower = planName.toLowerCase();
  const planBadgeLabel = planNameLower.includes('pro')
    ? 'PRO'
    : planNameLower.includes('basic')
    ? 'BASIC'
    : planName.split(/\s+/)[0].slice(0, 10).toUpperCase();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#1c1c1c] bg-[var(--color-background-dark)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-[var(--color-primary)]">
          zenCode
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = link.to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.to) && link.to !== '/login';
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm transition-colors border-b-2 h-16 flex items-center ${
                  isActive
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)] font-medium'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm font-medium text-white hover:text-[var(--color-primary)] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center h-9 px-4 rounded-md bg-[var(--color-primary)] hover:bg-blue-600 text-white text-sm font-bold transition-all"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Subscription Badge — only shown once hydrated to prevent flash */}
              {showBadge && (
                isPremium ? (
                  <Link
                    to="/subscription/manage"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-400/60 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold text-yellow-500">{planBadgeLabel}</span>
                  </Link>
                ) : (
                  <Link
                    to="/plans"
                    className="flex items-center justify-center h-8 px-4 rounded-md bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 text-xs font-bold transition-all"
                  >
                    Upgrade to Pro
                  </Link>
                )
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-[#1a1d26] border border-[#272b3a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#3a3f52] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111111] border border-[#272b3a] shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/submissions"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                    >
                      My Submissions
                    </Link>
                    <Link
                      to="/candidate/mentors"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                    >
                      Mentors
                    </Link>
                    <Link
                      to="/candidate/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                    >
                      My Sessions
                    </Link>
                    <Link
                      to="/subscription/manage"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                    >
                      Manage Subscription
                    </Link>
                    <div className="h-px bg-[#272b3a] my-1" />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-sm text-red-400 hover:bg-[#1a1d26] hover:text-red-300 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
