import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      showSuccess('Password reset link sent to your email');
    } catch (error: any) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Failed to send reset link';
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-[420px] text-center">
            <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-white text-2xl font-bold mb-3">
                Check Your Email
              </h1>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <span className="text-white">{getValues('email')}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The link will expire in 15 minutes.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline text-sm"
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
                Forgot Your Password?
              </h1>
              <p className="text-gray-400 text-sm">
                Enter your email to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className={`w-full rounded-lg bg-[#272b3a] border ${
                      errors.email ? 'border-red-500' : 'border-transparent'
                    } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;