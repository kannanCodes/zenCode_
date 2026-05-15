import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';


const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      const cooldownEnd = Date.now() + 60 * 1000; // 60 seconds initial cooldown
      sessionStorage.setItem('otpResendCooldown', cooldownEnd.toString());
      sessionStorage.setItem('registrationEmail', data.email);
      showSuccess('OTP sent to your email');
      navigate('/verify-otp');
    } catch (error: any) {
      // Handle 4xx errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const message = error.response?.data?.message || 'Registration failed';
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen w-full flex-col pt-16">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
          <div className="w-full max-w-[520px] flex flex-col gap-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-white text-4xl font-bold mb-3">
                Create Your ZenCode Account
              </h1>
              <p className="text-gray-400 text-base">
                Join developers mastering real-time interview practice.
              </p>
            </div>

            {/* Card */}
            <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Jane Doe"
                    className={`w-full rounded-lg bg-[#272b3a] border ${errors.fullName ? 'border-red-500' : 'border-transparent'
                      } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
                  />
                  {errors.fullName && (
                    <span className="text-red-500 text-sm">{errors.fullName.message}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="jane@example.com"
                    className={`w-full rounded-lg bg-[#272b3a] border ${errors.email ? 'border-red-500' : 'border-transparent'
                      } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-medium">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full rounded-lg bg-[#272b3a] border ${errors.password ? 'border-red-500' : 'border-transparent'
                      } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-sm">{errors.password.message}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full rounded-lg bg-[#272b3a] border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                      } text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none transition-all h-12 px-4`}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Google Sign In */}
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

                {/* Already have account */}
                <div className="text-center text-sm text-gray-400 mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[var(--color-primary)] hover:underline">
                    Login
                  </Link>
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-2">
                  By clicking "Create Account", you agree to our{' '}
                  <a href="#" className="text-gray-400 hover:underline">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-400 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RegisterPage;