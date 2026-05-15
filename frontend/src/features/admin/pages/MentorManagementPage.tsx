import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import CreateMentorModal from '../components/CreateMentorModal';
import axios from 'axios';
import { addExpertiseOption, loadExpertiseOptions } from '../lib/expertise-options';
import AdminSidebar from '../components/AdminSidebar';

interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  expertise: string[];
  experienceLevel: string;
  mentorStatus: 'INVITED' | 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

type MentorStatusFilter = '' | 'INVITED' | 'ACTIVE' | 'DISABLED';
const PAGE_SIZE = 10;

const MentorManagementPage = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resendingMentorId, setResendingMentorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expertiseOptions, setExpertiseOptions] = useState<string[]>(() =>
    loadExpertiseOptions()
  );
  const [filters, setFilters] = useState({
    search: '',
    status: '' as MentorStatusFilter,
    expertise: '',
  });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.listMentors({
          page,
          limit: PAGE_SIZE,
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.expertise && { expertise: filters.expertise }),
        });
        if (mounted) {
          setMentors(response?.data || []);
          if (response?.meta) {
            setMeta(response.meta);
          }
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

        showError('Failed to load mentors');
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
  }, [filters, page, navigate]);

  const fetchMentors = async () => {
    try {
      const response = await adminService.listMentors({
        page,
        limit: PAGE_SIZE,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.expertise && { expertise: filters.expertise }),
      });
      setMentors(response?.data || []);
      if (response?.meta) {
        setMeta(response.meta);
      }
    } catch {
      // Background refresh errors handled quietly
    }
  };

  const handleStatusToggle = async (mentorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await adminService.updateMentorStatus(mentorId, newStatus);
      showSuccess(`Mentor ${newStatus.toLowerCase()} successfully`);
      fetchMentors();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to update status';
          showError(message);
        }
      }
    }
  };

  const handleResendInvite = async (mentorId: string) => {
    setResendingMentorId(mentorId);
    try {
      await adminService.resendInvite(mentorId);
      showSuccess('Invite resent successfully');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to resend invite';
          showError(message);
        }
      }
    } finally {
      setResendingMentorId(null);
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
      'bg-purple-500',
      'bg-orange-500',
      'bg-blue-500',
      'bg-gray-600',
      'bg-red-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-yellow-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">Mentor Management</h1>
              <p className="text-gray-400">
                Oversee mentor profiles, track session activity, and manage account status.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 h-12 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Mentor
            </button>
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
                placeholder="Search mentors by name, email, or skills..."
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, search: e.target.value });
                }}
                className="w-full h-12 pl-12 pr-10 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setFilters({ ...filters, search: '' });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={filters.expertise}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, expertise: e.target.value });
              }}
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Expertise: All</option>
              {expertiseOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, status: e.target.value as MentorStatusFilter });
              }}
              className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="INVITED">Invited</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500">No mentors found</p>
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
                      Expertise
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Sessions Count
                    </th>
                    <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor) => (
                    <tr key={mentor._id} className="border-b border-[#2a2d3a] hover:bg-[#1a1a1a] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${getAvatarColor(
                              mentor.fullName
                            )} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {getInitials(mentor.fullName)}
                          </div>
                          <span className="text-white font-medium">{mentor.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{mentor.email}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded text-xs font-medium bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                            >
                              {skill}
                            </span>
                          ))}
                          {mentor.expertise.length > 2 && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                              +{mentor.expertise.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            mentor.mentorStatus === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-400'
                              : mentor.mentorStatus === 'INVITED'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              mentor.mentorStatus === 'ACTIVE'
                                ? 'bg-green-400'
                                : mentor.mentorStatus === 'INVITED'
                                ? 'bg-gray-400'
                                : 'bg-red-400'
                            }`}
                          ></span>
                          {mentor.mentorStatus === 'ACTIVE' ? 'Active' : mentor.mentorStatus === 'INVITED' ? 'Inactive' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">0</td>
                      <td className="p-4">
                        {mentor.mentorStatus === 'INVITED' ? (
                          <button
                            onClick={() => handleResendInvite(mentor._id)}
                            disabled={resendingMentorId === mentor._id}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[124px]"
                          >
                            {resendingMentorId === mentor._id ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resending...
                              </>
                            ) : (
                              'Resend Invite'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(mentor._id, mentor.mentorStatus)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              mentor.mentorStatus === 'ACTIVE'
                                ? 'border border-red-500 text-red-500 hover:bg-red-500/10'
                                : 'border border-green-500 text-green-500 hover:bg-green-500/10'
                            }`}
                          >
                            {mentor.mentorStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && mentors.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
              {(() => {
                const currentPage = meta?.page ?? page;
                const limit = meta?.limit ?? PAGE_SIZE;
                const total = meta?.total ?? mentors.length;
                const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
                const end = Math.min(currentPage * limit, total);

                return (
                  <>
                    <span>
                      Showing {start}-{end} of {total} mentors
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={currentPage <= 1 || isLoading}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className={`px-3 py-1 rounded border text-xs ${
                          currentPage <= 1 || isLoading
                            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                            : 'border-[#2a2d3a] text-gray-300 hover:bg-[#1a1a1a]'
                        }`}
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentPage} of {meta?.totalPages ?? 1}
                      </span>
                      <button
                        type="button"
                        disabled={
                          isLoading ||
                          !meta ||
                          currentPage >= meta.totalPages
                        }
                        onClick={() =>
                          setPage((prev) =>
                            meta ? Math.min(meta.totalPages, prev + 1) : prev + 1
                          )
                        }
                        className={`px-3 py-1 rounded border text-xs ${
                          isLoading || !meta || currentPage >= (meta?.totalPages ?? 1)
                            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                            : 'border-[#2a2d3a] text-gray-300 hover:bg-[#1a1a1a]'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Create Mentor Modal */}
      <CreateMentorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpertiseOptions(loadExpertiseOptions());
        }}
        onSuccess={async () => {
          await fetchMentors();
          setExpertiseOptions(loadExpertiseOptions());
        }}
        expertiseOptions={expertiseOptions}
        onAddExpertiseOption={(value: string) => {
          const next = addExpertiseOption(value);
          setExpertiseOptions(next);
        }}
      />
    </div>
  );
};

export default MentorManagementPage;