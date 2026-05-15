import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

const ProblemListPage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '' as '' | 'easy' | 'medium' | 'hard',
    isActive: undefined as boolean | undefined,
    isPremium: undefined as boolean | undefined,
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.listProblems({
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.search && { search: filters.search }),
          ...(filters.difficulty && { difficulty: filters.difficulty }),
          ...(filters.isActive !== undefined && { isActive: filters.isActive }),
          ...(filters.isPremium !== undefined && { isPremium: filters.isPremium }),
        });

        if (mounted) {
          setProblems(response.data || []);
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
        showError('Failed to load problems');
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

  const handleToggleActive = async (problemId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this problem?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
      cancelButtonColor: '#2a2d3a',
      confirmButtonText: `Yes, ${action} it!`,
      background: '#1a1a1a',
      color: '#fff',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await adminService.updateProblem(problemId, { isActive: !currentStatus });
      showSuccess(`Problem ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      
      const response = await adminService.listProblems({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.isPremium !== undefined && { isPremium: filters.isPremium }),
      });
      setProblems(response.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : `Failed to ${action} problem`;
          showError(message);
        }
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'hard':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">Problem Management</h1>
              <p className="text-gray-400">
                Manage coding challenges, difficulties, and platform content.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/problems/create')}
              className="flex items-center gap-2 h-12 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Problem
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or tag..."
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
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  difficulty: e.target.value as '' | 'easy' | 'medium' | 'hard',
                })
              }
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Difficulty: All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>

            <select
              value={filters.isPremium === undefined ? '' : filters.isPremium.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isPremium: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Type: All</option>
              <option value="false">Free</option>
              <option value="true">Premium</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No problems found</p>
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2d3a]">
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Problem Title
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Difficulty
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Tags
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Created By
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem._id} className="border-b border-[#2a2d3a] hover:bg-[#1a1a1a] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-primary)] font-medium">
                            {problem.title}
                          </span>
                          {problem.isPremium && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {problem.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 2 && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                              +{problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            problem.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              problem.isActive ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          ></span>
                          {problem.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {problem.createdBy ? (
                          <span>Admin</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/problems/edit/${problem._id}`)}
                            className="p-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActive(problem._id, problem.isActive)}
                            className={`p-2 rounded-lg border transition-all ${
                              problem.isActive
                                ? 'border-red-500 text-red-500 hover:bg-red-500/10'
                                : 'border-green-500 text-green-500 hover:bg-green-500/10'
                            }`}
                            title={problem.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {problem.isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && problems.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} problems
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage;