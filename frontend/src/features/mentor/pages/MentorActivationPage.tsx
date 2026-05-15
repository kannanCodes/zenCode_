import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mentorService } from '../services/mentor.service';
import { showError } from '../../../shared/utils/toast.util';

const activationSchema = z.object({
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least 1 uppercase letter')
    .regex(/[0-9]/, 'At least 1 number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ActivationFormData = z.infer<typeof activationSchema>;

const MentorActivationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema),
  });

  const password = watch('password', '');

  // Password validation checks
  const validations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  useEffect(() => {
    if (!token) {
      showError('Invalid activation link');
      navigate('/mentor/login');
    }
  }, [token, navigate]);

  const onSubmit = async (data: ActivationFormData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await mentorService.activate({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate('/mentor/activation-success');
    } catch (error: any) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Activation failed';
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Logo */}
      <div className="fixed top-6 left-6">
        <span className="text-xl font-bold text-[var(--color-primary)]">ZenCode</span>
      </div>

      <div className="w-full max-w-[420px] px-4">
        <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">
              Set New Password
            </h1>
            <p className="text-gray-400 text-sm">
              For security, please set a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full rounded-lg bg-[#272b3a] border ${
                    errors.password ? 'border-red-500' : 'border-transparent'
                  } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                />
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full rounded-lg bg-[#272b3a] border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                  } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  validations.minLength ? 'bg-[var(--color-primary)]' : 'bg-gray-700'
                }`}>
                  {validations.minLength && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={validations.minLength ? 'text-white' : 'text-gray-500'}>
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  validations.hasUppercase ? 'bg-[var(--color-primary)]' : 'bg-gray-700'
                }`}>
                  {validations.hasUppercase && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={validations.hasUppercase ? 'text-white' : 'text-gray-500'}>
                  At least 1 uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  validations.hasNumber ? 'bg-[var(--color-primary)]' : 'bg-gray-700'
                }`}>
                  {validations.hasNumber && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={validations.hasNumber ? 'text-white' : 'text-gray-500'}>
                  At least 1 number
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wide"
            >
              {isLoading ? 'Setting Password...' : 'CHANGE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorActivationPage;