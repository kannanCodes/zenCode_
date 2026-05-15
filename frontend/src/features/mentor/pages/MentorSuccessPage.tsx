import { useNavigate } from 'react-router-dom';

const MentorSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Blue glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[420px] px-4 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#1a1d26] border-2 border-[var(--color-primary)] flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-white text-4xl font-bold mb-4">
          Password Updated!
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-3">
          Your password has been successfully changed.
        </p>
        <p className="text-gray-500 text-base mb-10">
          You can now proceed to your dashboard.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/mentor/login')}
          className="inline-flex items-center gap-2 h-14 px-10 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white text-lg font-bold transition-all shadow-[0_0_30px_rgba(45,95,255,0.4)]"
        >
          Go to Dashboard
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-600 mt-12">
          ZenCode Systems // Secure
        </p>
      </div>
    </div>
  );
};

export default MentorSuccessPage;