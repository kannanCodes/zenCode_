import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { aiHintService } from '../services/aiHint.service';
import type { AiHintResponse } from '../types/ai-hint.types';

interface AiHintPanelProps {
  problemId: string;
  onClose: () => void;
}

const MAX_PER_PROBLEM = 3;
const MAX_DAILY = 10;
const COOLDOWN_SECONDS = 10;

const AiHintPanel = ({ problemId, onClose }: AiHintPanelProps) => {
  const navigate = useNavigate();
  const [hints, setHints] = useState<string[]>([]);
  const [displayedHints, setDisplayedHints] = useState<string[]>([]);
  const [remainingProblem, setRemainingProblem] = useState<number>(MAX_PER_PROBLEM);
  const [remainingDaily, setRemainingDaily] = useState<number>(MAX_DAILY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Fetch initial status when panel opens
  useEffect(() => {
    let isMounted = true;
    
    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await aiHintService.getStatus(problemId);
        if (isMounted) {
          setHints(data.hints);
          setDisplayedHints(data.hints); // no typing animation on initial load
          setRemainingProblem(data.remainingProblemHints);
          setRemainingDaily(data.remainingDailyHints);
          setCooldown(data.cooldownRemainingSeconds);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          if (isMounted) setIsPremiumRequired(true);
        } else if (isMounted) {
          setError('Failed to load hint status.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStatus();

    return () => { isMounted = false; };
  }, [problemId]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Typing animation for the latest hint
  const animateHint = useCallback((hint: string, index: number) => {
    setDisplayedHints(prev => {
      const newHints = [...prev];
      newHints[index] = '';
      return newHints;
    });

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedHints(prev => {
        const newHints = [...prev];
        newHints[index] = hint.substring(0, i);
        return newHints;
      });
      if (i >= hint.length) clearInterval(interval);
    }, 12);
  }, []);

  const requestHint = async () => {
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const data: AiHintResponse = await aiHintService.getHint(problemId);
      const newHints = [...hints, data.hint];
      setHints(newHints);
      setDisplayedHints(prev => [...prev, '']); // placeholder
      setRemainingProblem(data.remainingProblemHints);
      setRemainingDaily(data.remainingDailyHints);
      // Start typing animation for the latest hint
      animateHint(data.hint, newHints.length - 1);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message ?? 'Something went wrong.';
        if (status === 403) {
          setIsPremiumRequired(true);
        } else if (status === 429) {
          setError(msg);
          setCooldown(COOLDOWN_SECONDS);
        } else {
          setError(msg);
        }
      } else {
        setError('AI service is temporarily unavailable. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hintsUsed = MAX_PER_PROBLEM - remainingProblem;
  const isExhausted = remainingProblem <= 0 && hints.length > 0;
  const canRequest = !isLoading && !isPremiumRequired && !isExhausted && cooldown === 0;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-[#0a0a0a] border-l border-[#1c1c1c] flex flex-col z-40 shadow-2xl"
      style={{ animation: 'slideInRight 0.2s ease-out' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2d5fff]/10 rounded-lg">
            <svg className="w-5 h-5 text-[#2d5fff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">AI Hints</h2>
            <p className="text-[11px] text-gray-500 font-mono">Smart mentor guidance</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Usage counters */}
      {!isPremiumRequired && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1c1c1c] bg-[#0d0d0d] flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-gray-500">Problem:</span>
            <div className="flex gap-1">
              {Array.from({ length: MAX_PER_PROBLEM }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < hintsUsed ? 'bg-[#2d5fff]' : 'bg-[#2a2a2a]'}`} />
              ))}
            </div>
            <span className="text-gray-400 font-mono">{hintsUsed}/{MAX_PER_PROBLEM}</span>
          </div>
          <div className="w-px h-4 bg-[#2a2a2a]" />
          <div className="text-[12px]">
            <span className="text-gray-500">Daily: </span>
            <span className="text-gray-400 font-mono">{MAX_DAILY - remainingDaily}/{MAX_DAILY}</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Premium lock state */}
        {isPremiumRequired ? (
          <div className="flex flex-col items-center text-center py-12 px-4">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Premium Required</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              AI Hints are available to premium subscribers only. Upgrade to unlock intelligent, mentor-style guidance.
            </p>
            <button
              onClick={() => navigate('/plans')}
              className="px-6 py-2.5 bg-[#2d5fff] hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Upgrade to Premium →
            </button>
          </div>
        ) : hints.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center text-center py-12 px-4">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#2d5fff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">Need a nudge?</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get up to 3 progressive hints that guide your thinking — without giving away the solution.
            </p>
          </div>
        ) : (
          /* Rendered hints */
          <div className="space-y-3">
            {displayedHints.map((hintText, index) => (
              <div key={index} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono text-[#2d5fff] bg-[#2d5fff]/10 px-2 py-0.5 rounded-full">
                    Hint {index + 1}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {hintText}
                  {/* Blinking cursor during typing */}
                  {hintText.length < (hints[index]?.length ?? 0) && (
                    <span className="inline-block w-0.5 h-4 bg-[#2d5fff] ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-14 bg-[#222] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-[#1e1e1e] rounded w-full" />
              <div className="h-3 bg-[#1e1e1e] rounded w-4/5" />
              <div className="h-3 bg-[#1e1e1e] rounded w-3/5" />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Exhausted state */}
        {isExhausted && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm">
              You've used all 3 hints for this problem. Try working through the approach on your own!
            </p>
          </div>
        )}
      </div>

      {/* Footer — Request hint button */}
      {!isPremiumRequired && (
        <div className="px-5 py-4 border-t border-[#1c1c1c] flex-shrink-0">
          <button
            onClick={requestHint}
            disabled={!canRequest}
            className={`w-full h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              canRequest
                ? 'bg-[#2d5fff] hover:bg-blue-500 text-white'
                : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-[#2a2a2a]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating hint...
              </>
            ) : cooldown > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next hint in {cooldown}s
              </>
            ) : isExhausted ? (
              'All hints used'
            ) : hints.length === 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get AI Hint
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Get Next Hint ({remainingProblem} left)
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AiHintPanel;
