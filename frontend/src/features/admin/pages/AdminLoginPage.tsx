import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/admin.service';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, skip straight to admin dashboard
  useEffect(() => {
    if (tokenService.getAccessToken()) {
      navigate('/admin/dashboard', { replace: true });
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
      const response = await adminService.login(data);
      tokenService.setAccessToken(response.accessToken);
      showSuccess('Login successful');
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Login failed';
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        </div>
      )}
      <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="fixed top-6 left-6">
        <span className="text-xl font-bold text-[var(--color-primary)]">zenCode</span>
      </div>

      <div className="w-full max-w-[420px] px-4">
        <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">
              Admin Login
            </h1>
            <p className="text-gray-400 text-sm">
              Access your zenCode admin panel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@zencode.com"
                  className={`w-full rounded-lg bg-[#272b3a] border ${
                    errors.email ? 'border-red-500' : 'border-transparent'
                  } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-4`}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full rounded-lg bg-[#272b3a] border ${
                    errors.password ? 'border-red-500' : 'border-transparent'
                  } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 pl-12 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wide"
            >
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminLoginPage;