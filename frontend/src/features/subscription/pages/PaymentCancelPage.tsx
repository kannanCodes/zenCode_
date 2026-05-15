import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-6 max-w-md w-full p-8 rounded-2xl bg-[#111111] border border-[#272b3a] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-gray-400">
              Your checkout process was cancelled. No charges were made.
            </p>
          </div>

          <div className="w-full flex gap-4 mt-2">
            <button
              onClick={() => navigate('/problems')}
              className="flex-1 h-12 rounded-lg border border-[#272b3a] text-white hover:bg-[#1a1a1a] transition-all font-semibold"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="flex-1 h-12 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white transition-all font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancelPage;
