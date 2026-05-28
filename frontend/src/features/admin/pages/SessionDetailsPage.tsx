import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminSessionApi } from '../services/adminSessionApi';
import type { AdminSessionDetailsDto } from '../types/session';

const SessionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSessionDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminSessionApi.getSessionDetails(id);
      setSession(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load session details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 font-mono flex flex-col gap-4">
          <p>⚠ Error: {error || 'Session not found'}</p>
          <button onClick={() => navigate('/admin/sessions')} className="text-blue-400 hover:underline self-start">Back to sessions</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] px-6 py-5 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Session Details <span className="text-gray-600 font-mono text-lg font-normal ml-2">#{session.roomId}</span></h1>
        </div>
        <button
          onClick={() => navigate('/admin/sessions')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-blue-500 text-xs font-mono transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Session Monitoring
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Overview Card */}
        <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-6">
          <h2 className="text-white text-lg font-bold mb-6">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-x divide-[#1c1c1c]">
            {/* Candidate */}
            <div className="pl-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Candidate</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold font-mono shrink-0">
                  {session.candidate.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-200 font-mono text-sm truncate">{session.candidate.name}</p>
                  <p className="text-gray-600 font-mono text-xs truncate">{session.candidate.email}</p>
                </div>
              </div>
            </div>

            {/* Mentor */}
            <div className="pl-8">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Mentor</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700/50 text-gray-300 flex items-center justify-center text-sm font-bold font-mono shrink-0">
                  {session.mentor.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-200 font-mono text-sm truncate">{session.mentor.name}</p>
                  <p className="text-gray-600 font-mono text-xs truncate">{session.mentor.email}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="pl-8">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Details</p>
              <div className="flex items-center gap-2 mb-2 text-gray-300 font-mono text-sm">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                {session.problem?.title || 'No problem selected'}
              </div>
              {session.status === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Session
                </span>
              ) : (
                <span className="inline-block px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs font-mono">
                  {session.status}
                </span>
              )}
            </div>

            {/* Timing */}
            <div className="pl-8">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Timing</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-mono">Start:</span>
                  <span className="text-gray-300 text-xs font-mono">{formatTime(session.timing.scheduledStart)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-mono">End:</span>
                  <span className="text-gray-300 text-xs font-mono">{formatTime(session.timing.scheduledEnd)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1c1c1c]">
                  <span className="text-gray-500 text-xs font-mono">Duration:</span>
                  <span className="text-gray-300 text-xs font-mono">{session.timing.actualDurationMinutes !== null ? `${session.timing.actualDurationMinutes}m` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Log */}
        <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-6">
          <h2 className="text-white text-lg font-bold mb-6">Session Log</h2>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#2a2d3a]"></div>

            <div className="space-y-6">
              {session.timeline.length === 0 ? (
                <p className="text-gray-500 text-sm font-mono pl-8">No log events.</p>
              ) : (
                session.timeline.map((event) => {
                  let circleColor = 'bg-gray-600';
                  if (event.type === 'started' || event.type === 'candidate_joined' || event.type === 'mentor_joined' || event.type === 'reconnected') {
                    circleColor = 'bg-blue-500';
                  } else if (event.type === 'disconnected' || event.type === 'ended') {
                    circleColor = 'bg-gray-500';
                  }

                  return (
                    <div key={event.id} className="relative pl-8">
                      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${circleColor} border-4 border-[#0f0f0f]`}></div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-xs font-mono">{formatTime(event.timestamp)}</span>
                        <span className="text-gray-200 text-sm font-bold">{event.description}</span>
                        {event.actor && event.actor !== 'System' && (
                          <span className="text-gray-500 text-xs font-mono">{event.actor} performed this action.</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;
