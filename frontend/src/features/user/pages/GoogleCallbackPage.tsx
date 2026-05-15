import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess,showError } from '../../../shared/utils/toast.util';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isProcessedKey = useRef(false);

  useEffect(() => {
    if (isProcessedKey.current) return;
    isProcessedKey.current = true;

    const token = searchParams.get('token');

    if (token) {
      tokenService.setAccessToken(token);
      showSuccess('Login successful');
      navigate('/dashboard', { replace: true });
    } else {
      showError('Google authentication failed');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google Sign In...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;