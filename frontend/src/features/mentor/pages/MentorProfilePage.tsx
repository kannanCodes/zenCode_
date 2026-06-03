import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { mentorProfileApi } from '../services/mentorProfileApi';
import type { MentorExperienceLevel, MentorProfile } from '../types/profile';
import { showError, showSuccess } from '../../../shared/utils/toast.util';
import { mentorReviewApi } from '../../candidate/services/review.service';
import type { ReviewResponse } from '../../candidate/services/review.service';
import { tokenService } from '../../../shared/lib/token';

const MAX_EXPERTISE_ITEMS = 20;

const MentorProfilePage = () => {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<MentorExperienceLevel>('senior');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const payload = tokenService.getTokenPayload();
        const currentMentorId = (payload as Record<string, string>)?.id || (payload as Record<string, string>)?.sub;

        const [profileRes, reviewsRes] = await Promise.all([
          mentorProfileApi.getMyProfile(),
          currentMentorId 
            ? mentorReviewApi.getMentorReviews(currentMentorId, 1, 5).catch(() => ({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } })) 
            : Promise.resolve({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } })
        ]);

        if (cancelled) return;

        const data = profileRes.data;
        setProfile(data);
        setReviews(reviewsRes.data);
        setHasMore(reviewsRes.meta.page < reviewsRes.meta.totalPages);
        setPage(1);
        setFullName(data?.fullName || '');
        setTitle(data?.title || '');
        setBio(data?.bio || '');
        setExperienceLevel((data?.experienceLevel || 'senior') as MentorExperienceLevel);
        setExpertise(data?.expertise || []);
        setAvatarUrl(data?.avatarUrl || '');
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          showError('Failed to load profile');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMoreReviews = useCallback(async () => {
    if (!profile?.id || isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await mentorReviewApi.getMentorReviews(profile.id, nextPage, 5);
      
      setReviews((prev) => [...prev, ...res.data]);
      setHasMore(res.meta.page < res.meta.totalPages);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      showError('Failed to load more reviews');
    } finally {
      setIsLoadingMore(false);
    }
  }, [profile?.id, page, hasMore, isLoadingMore]);

  const lastReviewElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        void loadMoreReviews();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, loadMoreReviews]);

  const initials = useMemo(() => {
    const value = fullName || profile?.fullName || 'M';
    return value
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [fullName, profile?.fullName]);

  const handleAddExpertise = () => {
    const value = expertiseInput.trim().replace(/\s+/g, ' ');
    if (!value) return;
    if (expertise.includes(value)) {
      setExpertiseInput('');
      return;
    }
    if (expertise.length >= MAX_EXPERTISE_ITEMS) {
      showError(`You can add up to ${MAX_EXPERTISE_ITEMS} skills`);
      return;
    }

    setExpertise((prev) => [...prev, value]);
    setExpertiseInput('');
  };

  const handleRemoveExpertise = (skill: string) => {
    setExpertise((prev) => prev.filter((item) => item !== skill));
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      const uploadMeta = await mentorProfileApi.getAvatarUploadUrl(file);
      const { uploadUrl, fileUrl } = uploadMeta.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setAvatarUrl(fileUrl);
      
      // Auto-save the profile with the new avatar URL
      const response = await mentorProfileApi.updateMyProfile({
        fullName,
        title,
        bio,
        experienceLevel,
        expertise,
        avatarUrl: fileUrl,
      });
      setProfile(response.data);
      
      showSuccess('Avatar uploaded successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!bio.trim()) newErrors.bio = 'Bio is required';
    if (expertise.length === 0) newErrors.expertise = 'At least one skill is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Please fix the validation errors');
      return;
    }
    setErrors({});

    try {
      setIsSaving(true);
      const response = await mentorProfileApi.updateMyProfile({
        fullName,
        title,
        bio,
        experienceLevel,
        expertise,
        avatarUrl: avatarUrl || undefined,
      });
      setProfile(response.data);
      showSuccess('Profile updated successfully');
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      showError(message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mentor Profile</h1>
          <p className="text-gray-400">This profile is shown to candidates before they book a session.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#1a1d26] border border-[#272b3a] overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName || 'Mentor'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[var(--color-primary)]">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-lg truncate">{fullName || 'Your Name'}</p>
                <p className="text-[var(--color-primary)] text-sm truncate">{title || 'Mentor Title'}</p>
              </div>
            </div>

            <label className="mt-6 block">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUploadAvatar(file);
                  }
                  event.target.value = '';
                }}
              />
              <span className="inline-flex items-center justify-center h-10 px-4 w-full rounded-lg border border-[#2a2d3a] text-gray-300 hover:text-white hover:border-[#3a3f52] transition-colors cursor-pointer">
                {isUploadingAvatar ? 'Uploading avatar...' : 'Upload Avatar'}
              </span>
            </label>

            <div className="mt-6 pt-6 border-t border-[#272b3a]">
              <p className="text-xs text-gray-500 leading-relaxed">
                Candidate cards and booking preview will reflect your profile updates immediately.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#2a2d3a]">
              <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Student Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#1a1d26] p-4 rounded-xl border border-[#2a2d3a]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#272b3a] flex items-center justify-center overflow-hidden">
                          {review.studentAvatar ? (
                            <img src={review.studentAvatar} alt={review.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              {review.studentName?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{review.studentName || 'Anonymous Student'}</p>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-300">{review.rating}</span>
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed italic">"{review.feedback}"</p>
                    </div>
                  ))}
                  
                  {isLoadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                    </div>
                  )}
                  {hasMore && !isLoadingMore && (
                    <div ref={lastReviewElementRef} className="h-4" />
                  )}
                </div>
              ) : (
                <div className="bg-[#1a1d26] p-6 rounded-xl border border-[#2a2d3a] text-center">
                  <p className="text-sm text-gray-400">No student reviews yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Students can leave a review after completing a session.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' }));
                  }}
                  disabled={!isEditing}
                  className={`w-full h-11 rounded-lg bg-[#1a1d26] border ${errors.fullName ? 'border-red-500/50' : 'border-[#2a2d3a]'} px-3 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-60`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value as MentorExperienceLevel)}
                  disabled={!isEditing}
                  className="w-full h-11 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] px-3 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (errors.title) setErrors((e) => ({ ...e, title: '' }));
                }}
                disabled={!isEditing}
                className={`w-full h-11 rounded-lg bg-[#1a1d26] border ${errors.title ? 'border-red-500/50' : 'border-[#2a2d3a]'} px-3 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-60`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(event) => {
                  setBio(event.target.value);
                  if (errors.bio) setErrors((e) => ({ ...e, bio: '' }));
                }}
                disabled={!isEditing}
                rows={6}
                className={`w-full rounded-lg bg-[#1a1d26] border ${errors.bio ? 'border-red-500/50' : 'border-[#2a2d3a]'} px-3 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] resize-y disabled:opacity-60`}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Expertise</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {expertise.length === 0 && (
                  <span className="text-sm text-gray-500">No skills added yet.</span>
                )}
                {expertise.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => isEditing && handleRemoveExpertise(skill)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] text-gray-300 transition-colors ${
                      isEditing ? 'hover:border-red-500/50 hover:text-red-300' : 'opacity-80 cursor-default'
                    }`}
                  >
                    {skill}
                    {isEditing && <span className="text-xs">x</span>}
                  </button>
                ))}
              </div>
              {errors.expertise && <p className="mt-1 mb-3 text-xs text-red-400">{errors.expertise}</p>}

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    value={expertiseInput}
                    onChange={(event) => setExpertiseInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddExpertise();
                      }
                    }}
                    placeholder="Add skill and press Enter"
                    className="flex-1 h-11 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] px-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="h-11 px-4 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-[#272b3a] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-11 px-6 rounded-lg border border-[#2a2d3a] hover:border-gray-500 text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                  className="h-11 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
