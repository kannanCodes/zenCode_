import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

interface User {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
  lastActiveDate?: string;
  streakCount?: number;
  isPremium?: boolean;
}

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    isBlocked: undefined as boolean | undefined,
    sortBy: 'createdAt' as 'createdAt' | 'lastActiveDate' | 'email',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.listUsers({
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.search && { search: filters.search }),
          ...(filters.isBlocked !== undefined && { isBlocked: filters.isBlocked }),
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });

        if (mounted) {
          setUsers(response.data || []);
          setPagination({
            page: response.meta.page,
            limit: response.meta.limit,
            total: response.meta.total,
            totalPages: response.meta.totalPages,
          });
        }
      } catch (error: unknown) {
        if (!mounted) return;
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            tokenService.clear();
            navigate('/admin/login');
            return;
          }
          if (error.response?.status && error.response.status >= 500) {
            return;
          }
          if (!error.response) {
            return;
          }
        }
        showError('Failed to load users');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [filters, pagination.page, pagination.limit, navigate]);

  const handleBlockToggle = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      if (isCurrentlyBlocked) {
        await adminService.unblockUser(userId);
        showSuccess('User unblocked successfully');
      } else {
        await adminService.blockUser(userId);
        showSuccess('User blocked successfully');
      }
      
      // Refresh data
      const response = await adminService.listUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.isBlocked !== undefined && { isBlocked: filters.isBlocked }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setUsers(response.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to update user status';
          showError(message);
        }
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-gray-600',
      'bg-cyan-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">User Management</h1>
            <p className="text-gray-400">
              Manage user roles, monitor status, and handle access control.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full h-12 pl-12 pr-10 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={filters.isBlocked === undefined ? '' : filters.isBlocked.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isBlocked: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Users</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2d3a]">
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Created Date
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-[#2a2d3a] hover:bg-[#1a1a1a] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${getAvatarColor(
                              user.fullName
                            )} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {getInitials(user.fullName)}
                          </div>
                          <span className="text-white font-medium">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.isBlocked ? 'bg-red-400' : 'bg-green-400'
                            }`}
                          ></span>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            user.isBlocked
                              ? 'border border-green-500 text-green-500 hover:bg-green-500/10'
                              : 'border border-red-500 text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && users.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;