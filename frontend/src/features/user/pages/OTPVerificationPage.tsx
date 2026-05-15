import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const RESEND_COOLDOWN = 60;   // seconds

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registrationEmail');
    if (!storedEmail) {
      navigate('/register');
      return;
    }
    setEmail(storedEmail);

    // Resend cooldown
    const storedCooldown = sessionStorage.getItem('otpResendCooldown');
    if (storedCooldown) {
      const remainingTime = Math.max(0, parseInt(storedCooldown) - Date.now());
      if (remainingTime > 0) {
        setCountdown(Math.ceil(remainingTime / 1000));
      }
    }
  }, [navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Resend cooldown timer

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '');

    if (digit.length > 1) {
      const digits = digit.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit;
      }
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const otpValue = otp.join('');
  if (otpValue.length !== 6) {
    showError('Please enter complete OTP');
    return;
  }

  if (!email) {
    showError('Email not found. Please register again.');
    navigate('/register');
    return;
  }

  setIsLoading(true);
  try {
    await authService.verifyOTP({ email, otp: otpValue });
    showSuccess('Registration successful! Please login.');
    sessionStorage.removeItem('registrationEmail');
    sessionStorage.removeItem('otpResendCooldown');
    navigate('/login', { replace: true });
  } catch (error: any) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const message = error.response?.data?.message || 'Verification failed';
      showError(message);
    }
  } finally {
    setIsLoading(false);
  }
};

const handleResendOTP = async () => {
  if (!email || countdown > 0 || isResending) return;

  setIsResending(true);
  try {
    await authService.resendOTP(email);
    showSuccess('OTP resent successfully');
    
    const cooldownEnd = Date.now() + RESEND_COOLDOWN * 1000;
    sessionStorage.setItem('otpResendCooldown', cooldownEnd.toString());
    setCountdown(RESEND_COOLDOWN);
    
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } catch (error: any) {
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      showError(message);
    }
  } finally {
    setIsResending(false);
  }
};

  if (!email) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen w-full flex-col pt-16">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
          <div className="w-full max-w-[540px] flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-[-0.02em]">
                Verify Your Email
              </h1>
              <p className="text-gray-400 text-base font-normal">
                We have sent a 6-digit code to {email}. Enter it below to continue.
              </p>
            </div>

            <div className="bg-[var(--color-card-dark)] border border-[var(--color-border-dark)] rounded-xl p-6 md:p-8 shadow-2xl">

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex justify-between gap-2 md:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-full aspect-square text-center text-2xl font-bold bg-[var(--color-background-dark)] border border-[var(--color-border-dark)] text-white rounded-md focus:border-[var(--color-primary)] focus:ring-0 focus:shadow-[0_0_10px_rgba(45,95,255,0.3)] outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center rounded-lg h-12 px-6 font-bold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)] hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(46,95,255,0.4)] hover:shadow-[0_0_30px_rgba(46,95,255,0.5)]"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="text-center text-sm text-gray-400">
                  {countdown > 0 ? (
                    <span>Resend code in 00:{countdown.toString().padStart(2, '0')}</span>
                  ) : (
                    <>
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="text-[var(--color-primary)] hover:underline disabled:opacity-50"
                      >
                        {isResending ? 'Resending...' : 'Resend Code'}
                      </button>
                    </>
                  )}
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--color-border-dark)] text-center text-xs text-gray-500">
                Protected by ZenCode security protocols.
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OTPVerificationPage;