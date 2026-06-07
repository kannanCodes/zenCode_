import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mentorService } from '../services/mentor.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const RequirementRow = ({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-400' : 'text-gray-500'}`}>
    {met ? (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
    <span>{label}</span>
  </div>
);

const MentorResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const newPasswordValue = watch('newPassword') ?? '';
  const confirmPasswordValue = watch('confirmPassword') ?? '';

  // Password requirement checks
  const reqs = {
    length: newPasswordValue.length >= 8,
    uppercase: /[A-Z]/.test(newPasswordValue),
    number: /[0-9]/.test(newPasswordValue),
    match:
      newPasswordValue.length > 0 &&
      confirmPasswordValue.length > 0 &&
      newPasswordValue === confirmPasswordValue,
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }
      try {
        const valid = await mentorService.validateResetToken(token);
        setIsTokenValid(valid);
      } catch {
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
      await mentorService.resetPassword({
        token,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showSuccess('Password reset successful! Please login.');
      navigate('/mentor/login');
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Failed to reset password';
      if (status >= 400 && status < 500) {
        showError(message);
      } else {
        showError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading / Validating State ────────────────────────────────────────────────
  if (isValidating) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#2a2d3a]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin" />
            </div>
            <p className="text-white text-base font-medium">Validating reset link...</p>
            <p className="text-gray-500 text-sm mt-1">This will only take a moment</p>
          </div>
        </div>
      </>
    );
  }

  // ── Invalid / Expired Token ───────────────────────────────────────────────────
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
              <h1 className="text-white text-2xl font-bold mb-3">Link Expired</h1>
              <p className="text-gray-400 mb-6">
                This password reset link has expired or is invalid. Please request a new one.
              </p>
              <Link
                to="/mentor/forgot-password"
                className="block w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all flex items-center justify-center px-4"
              >
                Request New Link
              </Link>
              <Link
                to="/mentor/login"
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

  // ── Reset Form ────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[420px]">
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-white text-2xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-400 text-sm">Create a strong new password for your mentor account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

              {/* ── New Password ────────────────────────────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white text-sm font-medium">
                  New Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    {...register('newPassword')}
                    id="mentor-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full rounded-lg bg-[#272b3a] border ${
                      errors.newPassword
                        ? 'border-red-500'
                        : touchedFields.newPassword && !errors.newPassword
                        ? 'border-green-500/50'
                        : 'border-transparent'
                    } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-12`}
                  />
                  {/* Show / Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password requirements checklist — shows as you type */}
                {newPasswordValue.length > 0 && (
                  <div className="mt-2 p-3 bg-[#1f2233] rounded-lg border border-[#2a2d3a] flex flex-col gap-1.5">
                    <RequirementRow met={reqs.length} label="At least 8 characters" />
                    <RequirementRow met={reqs.uppercase} label="At least one uppercase letter (A–Z)" />
                    <RequirementRow met={reqs.number} label="At least one number (0–9)" />
                  </div>
                )}

                {/* Error message only when all rules violated and field is touched */}
                {errors.newPassword && touchedFields.newPassword && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mt-0.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.newPassword.message}</span>
                  </div>
                )}
              </div>

              {/* ── Confirm Password ────────────────────────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white text-sm font-medium">
                  Confirm New Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <input
                    {...register('confirmPassword')}
                    id="mentor-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full rounded-lg bg-[#272b3a] border ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : reqs.match
                        ? 'border-green-500/50'
                        : 'border-transparent'
                    } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-12`}
                  />
                  {/* Show / Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Passwords match indicator */}
                {confirmPasswordValue.length > 0 && (
                  <div className={`flex items-center gap-1.5 text-xs mt-0.5 transition-colors ${reqs.match ? 'text-green-400' : 'text-red-400'}`}>
                    {reqs.match ? (
                      <>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && !confirmPasswordValue && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mt-0.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.confirmPassword.message}</span>
                  </div>
                )}
              </div>

              {/* ── Submit ─────────────────────────────────────────────── */}
              <button
                type="submit"
                id="mentor-reset-submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <Link
                to="/mentor/login"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </form>

            <div className="mt-6 pt-6 border-t border-[#2a2d3a] text-center text-xs text-gray-500">
              Protected by zenCode security protocols.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorResetPasswordPage;
