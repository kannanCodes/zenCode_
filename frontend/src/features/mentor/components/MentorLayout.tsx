import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tokenService } from '../../../shared/lib/token';
import { notificationSocketManager } from '../../../shared/lib/notificationSocket';
import { clearNotifications } from '../../../store/slices/notificationSlice';
import type { AppDispatch } from '../../../store';
import NotificationBell from '../../notification/components/NotificationBell';

export const MentorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    setDropdownOpen(false);
    tokenService.clear();
    dispatch(clearNotifications());
    notificationSocketManager.disconnect();
    navigate('/mentor/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/mentor/dashboard' },
    { name: 'Availability', path: '/mentor/availability' },
    { name: 'Bookings', path: '/mentor/bookings' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#1c1c1c] bg-[var(--color-background-dark)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/mentor/dashboard" className="text-xl font-bold text-white tracking-wide">
          zenCode_
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors border-b-2 h-16 flex items-center ${
                    isActive
                      ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="h-6 w-px bg-[#272b3a] hidden md:block"></div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile / Dropdown */}
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs text-gray-500 leading-tight">zenCode</span>
              <span className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded mt-0.5">
                Mentor
              </span>
            </div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border border-[#272b3a] hover:border-[#3a3f52] transition-colors focus:outline-none"
            >
              {/* Default avatar for now */}
              <div className="w-full h-full bg-[#1a1d26] flex items-center justify-center text-[var(--color-primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-xl bg-[#111111] border border-[#272b3a] shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  to="/mentor/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                >
                  Profile Settings
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
      </div>
    </nav>
  );
};

export const MentorLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col font-mono text-white">
      <MentorNavbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MentorLayout;
