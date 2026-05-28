import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { adminSessionApi } from '../services/adminSessionApi';
import type { AdminSessionListDto } from '../types/session';

const SessionMonitoringPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AdminSessionListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminSessionApi.getSessions({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        );
      case 'SCHEDULED':
        return <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono">Scheduled</span>;
      case 'ENDED':
      case 'COMPLETED':
        return <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">Completed</span>;
      case 'CANCELLED':
      case 'NO_SHOW':
      case 'ABANDONED':
      case 'EXPIRED':
        return <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-mono">{status}</span>;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] px-6 py-5 shrink-0">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Session Monitoring</h1>
            <p className="text-gray-500 text-xs font-mono mt-0.5">
              Real-time interview oversight
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-4">
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search sessions by room ID..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[var(--color-primary)] font-mono transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
              Status:
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:border-[var(--color-primary)] font-mono transition-colors"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Live</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ENDED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 bg-[#0f0f0f] border border-[#1c1c1c] rounded-xl flex flex-col overflow-hidden">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1c1c1c] bg-[#141414]">
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-2/12">Candidate</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-2/12">Mentor</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-3/12">Problem</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-1/12">Status</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-1/12">Start Time</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-1/12">End Time</th>
                    <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider font-semibold w-2/12 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-[#1c1c1c] rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#1c1c1c] rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#1c1c1c] rounded w-40"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-[#1c1c1c] rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#1c1c1c] rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#1c1c1c] rounded w-16"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-[#1c1c1c] rounded w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-400 font-mono text-sm">
                        {error}
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-mono text-sm">
                        No sessions found.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-[#141414] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                              {session.candidateName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-300 font-mono text-sm">{session.candidateName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-mono text-sm">{session.mentorName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300 font-mono text-sm">{session.problemTitle || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(session.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-mono text-sm">{formatTime(session.scheduledStart)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-mono text-sm">-</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/sessions/${session.id}`)}
                            className="text-[var(--color-primary)] hover:text-blue-400 font-mono text-xs font-bold tracking-wider transition-colors"
                          >
                            VIEW DETAILS
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-[#1c1c1c] p-4 flex items-center justify-between bg-[#0a0a0a]">
              <span className="text-xs text-gray-500 font-mono">
                Showing {sessions.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount} sessions
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-[#2a2d3a] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-[#0f0f0f]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-mono text-xs font-bold">
                  {page}
                </div>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-[#2a2d3a] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-[#0f0f0f]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionMonitoringPage;
