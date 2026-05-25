import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateMentorApi } from '../services/mentor.service';
import type { PublicMentorResponse } from '../services/mentor.service';
import { showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const PAGE_SIZE = 9;
const DEBOUNCE_MS = 400;

const MentorsListPage = () => {
  const [mentors, setMentors] = useState<PublicMentorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchSkills = async () => {
      try {
        setIsSkillsLoading(true);
        const skills = await candidateMentorApi.getMentorSkills();
        if (!cancelled) setSkillOptions(skills);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setSkillOptions([]);
        }
      } finally {
        if (!cancelled) setIsSkillsLoading(false);
      }
    };

    fetchSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [selectedSkills]);

  useEffect(() => {
    let cancelled = false;

    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        const res = await candidateMentorApi.getMentors({
          page,
          limit: PAGE_SIZE,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(selectedSkills.length > 0 ? { skills: selectedSkills } : {}),
        });

        if (!cancelled) {
          setMentors(res.data);
          setMeta(res.meta);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error(err);
          showError('Failed to load mentors');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchMentors();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page, selectedSkills]);

  const hasSearch = search.trim().length > 0 || debouncedSearch.length > 0;
  const hasSkillFilters = selectedSkills.length > 0;
  const hasActiveFilters = debouncedSearch.length > 0 || hasSkillFilters;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const currentPage = meta?.page ?? page;

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
    );
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const clearSkillFilters = () => {
    setSelectedSkills([]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-mono tracking-tight text-[var(--color-primary)] mb-4">
            Discover Mentors
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Connect with experienced software engineers. Book 1-on-1 sessions to level up your coding skills, get architecture advice, and prepare for interviews.
          </p>
        </header>

        <section className="mb-8 border border-[#272b3a] bg-[#0f1118] rounded-xl p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-10 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {hasSkillFilters && (
              <button
                type="button"
                onClick={clearSkillFilters}
                className="h-12 px-4 rounded-lg border border-[#2a2d3a] text-gray-300 hover:text-white hover:bg-[#1a1d26] transition-colors inline-flex items-center gap-2"
                aria-label="Clear skill filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Filters
              </button>
            )}
          </div>

          {(hasSearch || hasSkillFilters) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {hasSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center gap-1 rounded border border-[#2a2d3a] px-2 py-1 text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Search
                </button>
              )}
              {hasSkillFilters && (
                <button
                  type="button"
                  onClick={clearSkillFilters}
                  className="inline-flex items-center gap-1 rounded border border-[#2a2d3a] px-2 py-1 text-gray-300 hover:bg-[#1a1d26] hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Skill filters
                </button>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {isSkillsLoading ? (
              <span className="px-3 py-1.5 rounded-lg border border-[#2a2d3a] bg-[#161922] text-sm text-gray-500">
                Loading filters...
              </span>
            ) : skillOptions.length === 0 ? (
              <span className="px-3 py-1.5 rounded-lg border border-[#2a2d3a] bg-[#161922] text-sm text-gray-500">
                No skill filters available
              </span>
            ) : (
              skillOptions.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    selected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[#2a2d3a] bg-[#161922] text-gray-300 hover:border-[var(--color-primary)]'
                  }`}
                >
                  {skill}
                </button>
              );
              })
            )}
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : mentors.length === 0 ? (
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">
              {hasActiveFilters ? 'No mentors match your filters' : 'No mentors available'}
            </h2>
            <p className="text-gray-400">
              {hasActiveFilters
                ? 'Try a different search term or remove a skill filter.'
                : 'Please check back later when mentors come online.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {(currentPage - 1) * (meta?.limit ?? PAGE_SIZE) + 1}-
                {Math.min(currentPage * (meta?.limit ?? PAGE_SIZE), meta?.total ?? mentors.length)} of{' '}
                {meta?.total ?? mentors.length} mentors
              </span>
              {isLoading && <span>Loading...</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-[#161922] border border-[#272b3a] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-all group flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="p-6 pb-0 flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full bg-[#272b3a] flex items-center justify-center overflow-hidden shrink-0">
                      {mentor.avatar ? (
                        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          {mentor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">
                        {mentor.name}
                      </h3>
                      <p className="text-sm text-[var(--color-primary)] font-medium mb-1">
                        {mentor.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-white">{mentor.stats.rating?.toFixed(1) || '5.0'}</span>
                        <span>({mentor.stats.totalSessions} sessions)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                      {mentor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {mentor.expertise.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded bg-[#272b3a] text-xs font-medium text-gray-300">
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="px-2.5 py-1 rounded bg-[#272b3a] text-xs font-medium text-gray-500">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#272b3a]">
                      <div className="flex items-center justify-between gap-3 text-sm mb-4">
                        <span className="text-gray-400">Next Available</span>
                        <span className="text-white font-medium text-right">
                          {mentor.availabilityPreview.nextAvailableSlot || 'Check calendar'}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/candidate/mentors/${mentor.id}`)}
                        className="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-colors shadow-[0_0_15px_rgba(45,95,255,0.2)] hover:shadow-[0_0_25px_rgba(45,95,255,0.4)]"
                      >
                        View Profile & Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-2 rounded border text-xs ${
                    currentPage <= 1 || isLoading
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'border-[#2a2d3a] text-gray-300 hover:bg-[#1a1d26]'
                  }`}
                >
                  Previous
                </button>

                {visiblePages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    disabled={isLoading || pageNumber === currentPage}
                    className={`min-w-9 px-3 py-2 rounded border text-xs ${
                      pageNumber === currentPage
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[#2a2d3a] text-gray-300 hover:bg-[#1a1d26]'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={isLoading || currentPage >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className={`px-3 py-2 rounded border text-xs ${
                    isLoading || currentPage >= totalPages
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'border-[#2a2d3a] text-gray-300 hover:bg-[#1a1d26]'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MentorsListPage;
