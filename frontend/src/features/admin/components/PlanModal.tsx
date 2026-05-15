import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { planService, type Plan, type CreatePlanInput, type UpdatePlanInput } from '../services/plan.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';

const featureSchema = z.object({
  name: z.string().min(1, 'Feature name is required'),
  description: z.string().optional(),
  enabled: z.boolean(),
});

const planSchema = z.object({
  name: z.string().min(3, 'Plan name must be at least 3 characters'),
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)), { message: 'Price must be a valid number' })
    .refine((val) => Number(val) >= 0, { message: 'Price must be non-negative' }),
  billingCycle: z.enum(['monthly', 'yearly']),
  intervalCount: z.string()
    .min(1, 'Interval count is required')
    .refine((val) => !isNaN(Number(val)), { message: 'Interval count must be a valid number' })
    .refine((val) => Number(val) >= 1, { message: 'Interval count must be at least 1' }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  features: z.array(featureSchema).min(1, 'At least one feature required'),
});

type FormData = z.infer<typeof planSchema>;

interface PlanModalProps {
  plan?: Plan; // if provided → edit mode; otherwise → create mode
  onClose: () => void;
  onSave: () => void;
}

const PlanModal = ({ plan, onClose, onSave }: PlanModalProps) => {
  const isEditing = !!plan;
  const [isSaving, setIsSaving] = useState(false);
  const [access, setAccess] = useState({
    mentorBooking: plan?.access?.mentorBooking ?? false,
    premiumProblems: plan?.access?.premiumProblems ?? false,
    aiHints: plan?.access?.aiHints ?? false,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name ?? '',
      price: plan ? String(plan.price) : '',
      billingCycle: plan?.billingCycle ?? 'monthly',
      intervalCount: plan ? String(plan.intervalCount ?? 1) : '1',
      description: plan?.description ?? '',
      features: plan?.features?.length
        ? plan.features.map((f) => ({ name: f.name, description: f.description ?? '', enabled: f.enabled }))
        : [{ name: '', description: '', enabled: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const handleAccessToggle = (key: keyof typeof access) => {
    setAccess((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      if (isEditing) {
        const updateData: UpdatePlanInput = {
          name: data.name,
          price: Number(data.price),
          billingCycle: data.billingCycle,
          intervalCount: Number(data.intervalCount),
          description: data.description,
          features: data.features as UpdatePlanInput['features'],
          access,
        };
        await planService.updatePlan(plan!._id, updateData);
        showSuccess('Plan updated successfully!');
      } else {
        const createData: CreatePlanInput = {
          ...data,
          price: Number(data.price),
          intervalCount: Number(data.intervalCount),
          access,
          stripeProductId: '',
          stripePriceId: '',
        };
        await planService.createPlan(createData);
        showSuccess('Plan created successfully! Stripe product and price have been configured.');
      }
      onSave();
    } catch (error: any) {
      const message = error.response?.data?.message || (isEditing ? 'Failed to update plan' : 'Failed to create plan');
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2d3a] p-6 flex items-center justify-between z-10">
          <h2 className="text-white text-xl font-bold">
            {isEditing ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g. ZenCode Premium"
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.name ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
            )}
          </div>

          {/* Price, Billing Cycle, Interval Count */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                Price (INR) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('price')}
                type="number"
                placeholder="899"
                className={`w-full rounded-lg bg-[#1a1a1a] border ${
                  errors.price ? 'border-red-500' : 'border-[#2a2d3a]'
                } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
              />
              {errors.price && (
                <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
              )}
            </div>

            <div>
              <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                Billing Cycle <span className="text-red-500">*</span>
              </label>
              <select
                {...register('billingCycle')}
                className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {isEditing && (
                <span className="text-gray-500 text-xs mt-1 block">
                  ⚠ Changing billing cycle requires a new Stripe price ID.
                </span>
              )}
            </div>

            <div>
              <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
                Interval Count
              </label>
              <input
                {...register('intervalCount')}
                type="number"
                min="1"
                className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4"
              />
              <span className="text-gray-500 text-xs mt-1 block">
                1 = standard, 3 = quarterly, etc.
              </span>
              {errors.intervalCount && (
                <span className="text-red-500 text-sm mt-1">{errors.intervalCount.message}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Unlock full access to premium coding problems, AI-powered hints, and advanced analytics..."
              className={`w-full rounded-lg bg-[#1a1a1a] border ${
                errors.description ? 'border-red-500' : 'border-[#2a2d3a]'
              } text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all p-4`}
            />
            {errors.description && (
              <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
            )}
          </div>

          {/* Marketing Features */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-white text-sm font-medium uppercase tracking-wide">
                Marketing Features <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => append({ name: '', description: '', enabled: true })}
                className="px-3 py-1 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white text-sm font-medium transition-all"
              >
                + Add Feature
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-3">
              These items are displayed as bullet points on the pricing card.
            </p>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
                  <div className="flex gap-3 mb-2">
                    <input
                      {...register(`features.${index}.name`)}
                      placeholder="Feature name (e.g. 24/7 Support)"
                      className="flex-1 rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none h-10 px-3"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <input
                    {...register(`features.${index}.description`)}
                    placeholder="Short description (optional)"
                    className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2d3a] text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none h-10 px-3 text-sm"
                  />
                </div>
              ))}
            </div>
            {errors.features && typeof errors.features.message === 'string' && (
              <span className="text-red-500 text-sm mt-1">{errors.features.message}</span>
            )}
          </div>

          {/* Platform Access Configuration */}
          <div>
            <label className="text-white text-sm font-medium uppercase tracking-wide block mb-1">
              Platform Access Configuration
            </label>
            <p className="text-gray-500 text-xs mb-3">
              Enable or disable actual application features for this plan.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4 space-y-4">
              {/* Premium Problems */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Access to Premium Problems</div>
                  <div className="text-gray-500 text-xs">Full library of 2000+ curated algorithmic challenges</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccessToggle('premiumProblems')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    access.premiumProblems ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      access.premiumProblems ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* AI Hints */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">AI Hints for Premium Problems</div>
                  <div className="text-gray-500 text-xs">Intelligent contextual hints powered by GPT-4 models</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccessToggle('aiHints')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    access.aiHints ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      access.aiHints ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Mentor Booking */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Mentor Booking Access</div>
                  <div className="text-gray-500 text-xs">Schedule 1-on-1 sessions with industry mentors</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccessToggle('mentorBooking')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    access.mentorBooking ? 'bg-[var(--color-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      access.mentorBooking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#2a2d3a]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-11 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? (isEditing ? 'Saving...' : 'Creating...')
                : (isEditing ? 'Save Changes' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
