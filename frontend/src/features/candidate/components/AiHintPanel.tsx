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
  const [isAiUnavailable, setIsAiUnavailable] = useState(false); // retriable 503/network failure
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<string | null>(null);
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
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 403) {
            // No subscription, expired subscription, or feature not in plan
            if (isMounted) {
              setIsPremiumRequired(true);
              setPremiumMessage(err.response?.data?.message ?? null);
            }
          } else if (status === 401) {
            // Session expired — let global interceptor handle it
          } else if (isMounted) {
            setError('Failed to load hint status. Please try again.');
          }
        } else if (isMounted) {
          setError('Failed to load hint status. Please try again.');
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
    setIsAiUnavailable(false);

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
        const msg = err.response?.data?.message;
        if (status === 403) {
          // Subscription required, expired, or feature not in plan — show upgrade gate
          setIsPremiumRequired(true);
          setPremiumMessage(msg ?? null);
          setError(null);
        } else if (status === 429) {
          setError(msg ?? 'Too many requests. Please wait before requesting another hint.');
          setCooldown(COOLDOWN_SECONDS);
        } else if (status === 400) {
          setError(msg ?? 'Unable to generate hint for this problem.');
        } else if (!status || status >= 500) {
          // 503 from backend (AI downstream failure) or network error — retriable
          setIsAiUnavailable(true);
        } else {
          setError(msg ?? 'Something went wrong. Please try again.');
        }
      } else {
        // Network error / no response — retriable
        setIsAiUnavailable(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hintsUsed = MAX_PER_PROBLEM - remainingProblem;
  const isExhausted = remainingProblem <= 0 && hints.length > 0;
  // Allow requesting when AI was unavailable (user can retry)
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
            {/* Icon — amber for expired, yellow for no sub / feature denied */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
              premiumMessage?.toLowerCase().includes('expired')
                ? 'bg-orange-500/10'
                : 'bg-yellow-500/10'
            }`}>
              {premiumMessage?.toLowerCase().includes('expired') ? (
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>

            {/* Title — contextual based on reason */}
            <h3 className="text-white font-semibold text-lg mb-2">
              {premiumMessage?.toLowerCase().includes('expired')
                ? 'Subscription Expired'
                : premiumMessage?.toLowerCase().includes('plan')
                ? 'Feature Not in Your Plan'
                : 'Subscription Required'}
            </h3>

            {/* Backend message — shown verbatim so user knows exactly why */}
            <p className="text-gray-400 text-sm mb-2 leading-relaxed">
              {premiumMessage ?? 'AI Hints are available to premium subscribers only.'}
            </p>
            <p className="text-gray-600 text-xs mb-6 leading-relaxed">
              {premiumMessage?.toLowerCase().includes('expired')
                ? 'Renew your subscription to continue using AI-powered hints.'
                : premiumMessage?.toLowerCase().includes('plan')
                ? 'Upgrade your plan to unlock intelligent, mentor-style guidance.'
                : 'Subscribe to a premium plan to unlock intelligent, mentor-style guidance.'}
            </p>

            <button
              onClick={() => navigate('/plans')}
              className="px-6 py-2.5 bg-[#2d5fff] hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {premiumMessage?.toLowerCase().includes('expired') ? 'Renew Subscription →' : 'View Plans →'}
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

        {/* AI unavailable — retriable (503 / network error) */}
        {isAiUnavailable && !isPremiumRequired && (
          <div className="bg-[#111] border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-orange-300 text-sm font-medium">AI is temporarily unavailable</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  Gemini couldn't generate a hint right now. This is usually transient — try again in a moment.
                </p>
              </div>
            </div>
            <button
              onClick={requestHint}
              disabled={isLoading}
              className="w-full h-8 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-orange-300/30 border-t-orange-300 rounded-full animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </>
              )}
            </button>
          </div>
        )}

        {/* Other errors — non-retriable (e.g. 400 bad request) */}
        {error && !isPremiumRequired && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
                {isAiUnavailable ? 'Retrying...' : 'Generating hint...'}
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
            ) : isAiUnavailable ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </>
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
