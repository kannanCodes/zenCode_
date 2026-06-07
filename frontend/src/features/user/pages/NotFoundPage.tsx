import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Navbar />

      {/* Background decorative braces */}
      <span className="absolute top-28 left-10 text-[10rem] font-bold text-[#1a1d2e] select-none pointer-events-none leading-none hidden lg:block">
        {'{}'}
      </span>
      <span className="absolute bottom-20 right-8 text-[6rem] font-bold text-[#1a1d2e] select-none pointer-events-none leading-none hidden lg:block">
        {';'}
      </span>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16 pb-12 text-center relative z-10">

        {/* 404 number */}
        <h1
          className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter select-none"
          style={{
            background: 'linear-gradient(135deg, #2D5FFF 30%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 60px rgba(45, 95, 255, 0.3))',
          }}
        >
          404
        </h1>

        {/* Error type */}
        <p className="font-mono text-lg md:text-xl mb-4 -mt-4">
          <span className="text-gray-400">Error: </span>
          <span className="text-[var(--color-primary)]">PageNotFound</span>
        </p>

        {/* Description */}
        <p className="text-gray-500 max-w-md font-mono text-sm leading-relaxed mb-10">
          The route you are looking for has been garbage<br />
          collected or never existed in this namespace.
        </p>

        {/* Fake code block */}
        <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#1e2130] rounded-xl overflow-hidden shadow-2xl mb-10 text-left">
          {/* Window bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111217] border-b border-[#1e2130]">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-gray-500 font-mono">router.ts</span>
          </div>

          {/* Code lines */}
          <div className="px-5 py-4 font-mono text-sm space-y-1 text-gray-400">
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">1</span>
              <span>
                <span className="text-purple-400">function </span>
                <span className="text-yellow-300">resolveRoute</span>
                <span className="text-gray-300">(path: </span>
                <span className="text-blue-300">string</span>
                <span className="text-gray-300">):</span>
                <span className="text-blue-300"> Route</span>
                <span className="text-gray-300"> {'{'}</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">2</span>
              <span className="pl-4">
                <span className="text-purple-400">try </span>
                <span className="text-gray-300">{'{'}</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">3</span>
              <span className="pl-8">
                <span className="text-purple-400">return </span>
                <span className="text-yellow-300">router</span>
                <span className="text-gray-300">.</span>
                <span className="text-blue-300">match</span>
                <span className="text-gray-300">(path);</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">4</span>
              <span className="pl-4">
                <span className="text-gray-300">{'}'} </span>
                <span className="text-purple-400">catch </span>
                <span className="text-gray-300">(e: </span>
                <span className="text-blue-300">PageNotFound</span>
                <span className="text-gray-300">) {'{'}</span>
              </span>
            </div>
            <div className="flex gap-4 bg-[var(--color-primary)]/10 rounded -mx-1 px-1">
              <span className="text-gray-700 select-none">5</span>
              <span className="pl-8">
                <span className="text-purple-400">return </span>
                <span className="text-red-400">404</span>
                <span className="text-gray-500">; </span>
                <span className="text-gray-600">{'// ← you are here'}</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">6</span>
              <span className="pl-4 text-gray-300">{'}'}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-700 select-none">7</span>
              <span className="text-gray-300">{'}'}</span>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-7 py-3 bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(45,95,255,0.35)] hover:shadow-[0_0_30px_rgba(45,95,255,0.5)] hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Dashboard
          </button>

          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-2 px-7 py-3 bg-transparent border border-[#2a2d3a] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 text-white font-bold rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Problems
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-16 font-mono text-xs text-gray-700">
          © 2026 zenCode Inc. All rights reserved.{' '}
          System Status:{' '}
          <span className="text-green-500">Nominal</span>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
