import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const valid = await authService.validateResetToken(token);
        setIsTokenValid(valid);
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.newPassword, data.confirmPassword);
      showSuccess('Password reset successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Failed to reset password';
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-white text-lg">Validating reset link...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isTokenValid) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-[420px] text-center">
            <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-white text-2xl font-bold mb-3">
                Link Expired
              </h1>
              <p className="text-gray-400 mb-6">
                This password reset link has expired or is invalid.
              </p>
              <Link
                    to="/forgot-password"
                    className="block w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all flex items-center justify-center px-4"
                    >
               Request New Link
               </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mt-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[420px]">
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-white text-3xl font-bold mb-3">
                Set New Password
              </h1>
              <p className="text-gray-400 text-sm">
                Enter and confirm your new password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                    {...register('newPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full rounded-lg bg-[#272b3a] border ${
                      errors.newPassword ? 'border-red-500' : 'border-transparent'
                    } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                  />
                </div>
                {errors.newPassword && (
                  <span className="text-red-500 text-sm">{errors.newPassword.message}</span>
                )}
              </div>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--color-border-dark)] text-center text-xs text-gray-500">
                Protected by ZenCode security protocols.
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;