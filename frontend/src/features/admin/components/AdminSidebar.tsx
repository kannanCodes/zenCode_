import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { tokenService } from '../../../shared/lib/token';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProblemsOpen, setIsProblemsOpen] = useState(
    location.pathname.startsWith('/admin/problems')
  );

  const handleLogout = () => {
    tokenService.clear();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-[#1c1c1c] flex flex-col">
      <div className="p-6 border-b border-[#1c1c1c]">
        <span className="text-xl font-bold text-[var(--color-primary)]">ZenCode</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => navigate('/admin/mentors')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/admin/users')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/users')
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Users</span>
        </button>

        <button
          onClick={() => navigate('/admin/mentors')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/mentors') || isActive('/admin/dashboard')
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Mentors</span>
        </button>

        {/* Problems with Submenu */}
        <div>
          <button
            onClick={() => setIsProblemsOpen(!isProblemsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/problems')
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Problems</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isProblemsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProblemsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => navigate('/admin/problems')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/admin/problems')
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>All Problems</span>
              </button>
              <button
                onClick={() => navigate('/admin/problems/create')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/admin/problems/create')
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Problem</span>
              </button>
            </div>
          )}
        </div>

        <Link
          to="/admin/plan-management"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/plan-management')
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Plan Management</span>
        </Link>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sessions</span>
        </button>
      </nav>

      <div className="p-4 border-t border-[#1c1c1c]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;