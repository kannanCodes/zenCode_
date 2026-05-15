import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/admin.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import axios from 'axios';
import { addExpertiseOption, loadExpertiseOptions, DEFAULT_EXPERTISE_OPTIONS, removeExpertiseOption } from '../lib/expertise-options';

const createMentorSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  expertise: z.array(z.string()).min(1, 'Select at least one expertise'),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
});

type CreateMentorFormData = z.infer<typeof createMentorSchema>;

interface CreateMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Backwards/forwards compatibility if parent passes these
  expertiseOptions?: string[];
  onAddExpertiseOption?: (value: string) => void;
}

const CreateMentorModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateMentorModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [allExpertiseOptions, setAllExpertiseOptions] = useState<string[]>(() =>
    loadExpertiseOptions()
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateMentorFormData>({
    resolver: zodResolver(createMentorSchema),
    defaultValues: {
      experienceLevel: 'senior',
      expertise: [],
    },
  });

  const toggleExpertise = (item: string) => {
    const newExpertise = selectedExpertise.includes(item)
      ? selectedExpertise.filter((e) => e !== item)
      : [...selectedExpertise, item];
    
    setSelectedExpertise(newExpertise);
    setValue('expertise', newExpertise, { shouldValidate: true });
  };

  const handleAddExpertise = () => {
    const value = newExpertise.trim().replace(/\s+/g, ' ');

    if (!value) {
      setAddError('Enter an expertise to add');
      return;
    }
    if (value.length < 2) {
      setAddError('Expertise must be at least 2 characters');
      return;
    }
    if (value.length > 40) {
      setAddError('Keep it under 40 characters');
      return;
    }

    setAddError(null);
    const next = addExpertiseOption(value);
    setAllExpertiseOptions(next);
    setNewExpertise('');
    toggleExpertise(value);
  };

  const onSubmit = async (data: CreateMentorFormData) => {
    setIsLoading(true);
    try {
      await adminService.createMentor(data);
      showSuccess('Mentor invite sent successfully');
      reset();
      setSelectedExpertise([]);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status) {
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data as unknown;
          const message =
            typeof data === 'object' && data !== null && 'message' in data
              ? String((data as { message?: unknown }).message || '')
              : 'Failed to create mentor';
          showError(message || 'Failed to create mentor');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedExpertise([]);
    setNewExpertise('');
    setAddError(null);
    setAllExpertiseOptions(loadExpertiseOptions());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-2xl w-full max-w-[480px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2d3a]">
          <h2 className="text-white text-xl font-bold">Create Mentor</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium uppercase tracking-wide">
              Full Name
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="e.g. Jane Doe"
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.fullName ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-sm">{errors.fullName.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium uppercase tracking-wide">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="e.g. jane@zencode.io"
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.email ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          {/* Expertise */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-white text-sm font-medium uppercase tracking-wide">
                Expertise
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add expertise..."
                  className="h-9 w-44 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddExpertise}
                  className="h-9 px-3 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/10 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
            {addError && <span className="text-red-500 text-sm">{addError}</span>}
            <div className="grid grid-cols-2 gap-3">
              {allExpertiseOptions.map((item) => {
                const isDefault = DEFAULT_EXPERTISE_OPTIONS.includes(
                  item as (typeof DEFAULT_EXPERTISE_OPTIONS)[number]
                );
                const isSelected = selectedExpertise.includes(item);

                return (
                  <div key={item} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpertise(item)}
                      className={`flex-1 h-10 rounded-lg border transition-all text-sm font-medium text-left px-3 ${
                        isSelected
                          ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-white'
                          : 'bg-[#1a1a1a] border-[#2a2d3a] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {item}
                    </button>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = removeExpertiseOption(item);
                          setAllExpertiseOptions(next);
                          if (isSelected) {
                            const updated = selectedExpertise.filter((e) => e !== item);
                            setSelectedExpertise(updated);
                            setValue('expertise', updated, { shouldValidate: true });
                          }
                        }}
                        className="w-8 h-8 rounded-full border border-red-500 text-red-400 flex items-center justify-center text-xs hover:bg-red-500/10 transition-colors"
                        aria-label={`Remove ${item}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.expertise && (
              <span className="text-red-500 text-sm">{errors.expertise.message}</span>
            )}
          </div>

          {/* Experience Level */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium uppercase tracking-wide">
              Experience Level
            </label>
            <select
              {...register('experienceLevel')}
              className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4 appearance-none cursor-pointer"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
            <svg className="w-5 h-5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-300">
              An invitation link will be sent to the mentor's email to activate their account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-lg border border-[#2a2d3a] text-white font-medium hover:bg-[#1a1a1a] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMentorModal;