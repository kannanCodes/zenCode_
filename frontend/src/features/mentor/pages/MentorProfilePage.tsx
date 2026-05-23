import { useEffect, useMemo, useState } from 'react';
import { mentorProfileApi } from '../services/mentorProfileApi';
import type { MentorExperienceLevel, MentorProfile } from '../types/profile';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const MAX_EXPERTISE_ITEMS = 20;

const MentorProfilePage = () => {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<MentorExperienceLevel>('senior');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await mentorProfileApi.getMyProfile();
        if (cancelled) return;

        const data = response.data;
        setProfile(data);
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
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={!isEditing}
                  className="w-full h-11 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] px-3 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                />
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
                onChange={(event) => setTitle(event.target.value)}
                disabled={!isEditing}
                className="w-full h-11 rounded-lg bg-[#1a1d26] border border-[#2a2d3a] px-3 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                disabled={!isEditing}
                rows={6}
                className="w-full rounded-lg bg-[#1a1d26] border border-[#2a2d3a] px-3 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] resize-y disabled:opacity-60"
              />
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
