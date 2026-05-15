import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { tokenService } from '../../../shared/lib/token';
import { showError, showSuccess } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';


const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'account_blocked') {
      showError('Your account has been blocked. Contact support.');
      navigate('/login', { replace: true });
    } else if (error === 'google_auth_failed') {
      showError('Google authentication failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (tokenService.getAccessToken()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      // Store tokens
      tokenService.setAccessToken(response.accessToken);


      showSuccess('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      // Handle 4xx errors (validation, invalid credentials)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Login failed';
        showError(message);
      }
      // 5xx errors are already handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen w-full flex-col pt-16">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-[420px] flex flex-col gap-8">
            <div className="text-center">
              <h1 className="text-white text-4xl font-bold mb-3">
                Welcome back
              </h1>
              <p className="text-gray-400 text-base">
                Enter your credentials to access your workspace
              </p>
            </div>

            <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="name@zencode.dev"
                      className={`w-full rounded-lg bg-[#272b3a] border ${errors.email ? 'border-red-500' : 'border-transparent'
                        } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm font-medium">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[var(--color-primary)] text-sm hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
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
                      className={`w-full rounded-lg bg-[#272b3a] border ${errors.password ? 'border-red-500' : 'border-transparent'
                        } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm">{errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2a2d3a]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1a1d26] text-gray-500">OR</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="w-full h-12 rounded-lg bg-transparent border border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold transition-all flex items-center justify-center gap-2"
                >
                  Sign Up
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = 'http://localhost:5001/api/auth/google';
                  }}
                  className="w-full h-12 rounded-lg bg-[#1e2230] hover:bg-[#252938] text-white font-medium transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Login with Google
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;