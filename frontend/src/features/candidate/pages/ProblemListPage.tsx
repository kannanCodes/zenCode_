import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateProblemService } from '../services/problem.service';
import { tokenService } from '../../../shared/lib/token';
import { showError } from '../../../shared/utils/toast.util';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectHasFeatureAccess } from '../../../store/slices/subscriptionSlice';
import Navbar from '../../../shared/components/Navbar';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  isPremium: boolean;
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
    tag: '',
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCompanyTags, setAvailableCompanyTags] = useState<{ name: string; count: number }[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  
  const canAccessPremiumProblems = useSelector(selectHasFeatureAccess('premiumProblems'));

  // Fetch available tags and company tags on mount
  useEffect(() => {
    const fetchTagsAndCompanies = async () => {
      try {
        const [tags, companyTags] = await Promise.all([
          candidateProblemService.getTags(),
          candidateProblemService.getCompanyTags(),
        ]);
        setAvailableTags(tags);
        setAvailableCompanyTags(companyTags);
      } catch (error) {
        // Silent fail - tags are optional
      }
    };

    fetchTagsAndCompanies();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await candidateProblemService.listProblems({
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.search && { search: filters.search }),
          ...(filters.difficulty && { difficulty: filters.difficulty }),
          ...(filters.tag && { tag: filters.tag }),
        });

        if (mounted) {
          setProblems(response.data.data || []);
          setPagination({
            page: response.data.meta.page,
            limit: response.data.meta.limit,
            total: response.data.meta.total,
            totalPages: response.data.meta.totalPages,
          });
        }
      } catch (error: unknown) {
        if (!mounted) return;
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            tokenService.clear();
            navigate('/login');
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredCompanyTags = availableCompanyTags.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="px-6 pt-24 pb-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">Practice Problems</h1>
              <p className="text-gray-400">
                Sharpen your coding skills with our curated collection of problems.
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <svg
                  className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems..."
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
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    difficulty: e.target.value as '' | 'easy' | 'medium' | 'hard',
                  })
                }
                className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                className="h-12 px-4 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all cursor-pointer min-w-[150px]"
              >
                <option value="">All Topics</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              {filters.tag && (
                <button
                  onClick={() => setFilters({ ...filters, tag: '' })}
                  className="h-12 px-3 rounded-lg border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Problems Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <svg
                  className="w-16 h-16 text-gray-700 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-gray-500">No problems found</p>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2d3a]">
                      <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide w-16">
                        #
                      </th>
                      <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                        Title
                      </th>
                      <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide w-32">
                        Difficulty
                      </th>
                      <th className="text-left p-4 text-gray-500 text-xs font-medium uppercase tracking-wide">
                        Tags
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((problem, index) => (
                      <tr
                        key={problem._id}
                        onClick={() => {
                          if (problem.isPremium && !canAccessPremiumProblems) {
                            showError('Your current plan does not include premium problems.');
                            return;
                          }
                          navigate(`/problems/${problem._id}`);
                        }}
                        className={`border-b border-[#2a2d3a] transition-colors ${
                          problem.isPremium && !canAccessPremiumProblems
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:bg-[#1a1a1a] cursor-pointer'
                        }`}
                      >
                        <td className="p-4 text-gray-400 text-sm">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{problem.title}</span>
                            {problem.isPremium && !canAccessPremiumProblems && (
                              <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>Premium Problem - Upgrade to unlock</title>
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-medium capitalize ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {problem.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {problem.tags.length > 3 && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                                +{problem.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && problems.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
                  problems
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

          {/* Company Tags Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            {/* Spacer to align sidebar with filters row (below title block) */}
            <div className="h-[88px]"></div>
            <div className="sticky top-24">
              <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6">
                <h2 className="text-white text-lg font-bold mb-4">Trending Companies</h2>

                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white text-sm placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all"
                  />
                </div>

                {availableCompanyTags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No company tags added yet
                  </div>
                ) : filteredCompanyTags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No matching companies
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCompanyTags.map((company) => (
                      <button
                        key={company.name}
                        onClick={() =>
                          setFilters({
                            ...filters,
                            tag: filters.tag === company.name ? '' : company.name,
                          })
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                          filters.tag === company.name
                            ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40'
                            : 'bg-[#1a1a1a] hover:bg-[#2a2d3a]'
                        }`}
                      >
                        <span
                          className={`text-sm transition-colors ${
                            filters.tag === company.name
                              ? 'text-[var(--color-primary)]'
                              : 'text-gray-300 group-hover:text-white'
                          }`}
                        >
                          {company.name}
                        </span>
                        <span className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold">
                          {company.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage;
