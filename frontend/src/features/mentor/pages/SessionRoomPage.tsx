import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mentorBookingApi } from '../services/mentorBookingApi';
import type { MentorSession } from '../types/booking';
import { showError } from '../../../shared/utils/toast.util';
import { useSocket } from '../../../shared/hooks/useSocket';
import { useWebRTC } from '../../../shared/hooks/useWebRTC';
import { tokenService } from '../../../shared/lib/token';
import SessionWorkspaceLayout from '../../../shared/components/session/SessionWorkspaceLayout';

const SessionRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Decode userId from JWT token (no Redux auth slice present)
  const currentUserId = useMemo(() => {
    const payload = tokenService.getTokenPayload();
    return (payload?.id as string) || (payload?.sub as string) || '';
  }, []);

  const [session, setSession] = useState<MentorSession | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [participantJoined, setParticipantJoined] = useState(false);

  // --- Session Validation ---
  useEffect(() => {
    if (!roomId) { navigate('/mentor/dashboard'); return; }

    let cancelled = false;
    (async () => {
      try {
        const res = await mentorBookingApi.validateSession(roomId);
        if (!cancelled) setSession(res.data);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Object && 'response' in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          setAccessError(msg || 'Unauthorized or session expired.');
          showError('Unable to join session.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [roomId, navigate]);

  // --- Socket ---
  const handleJoinSuccess = useCallback((payload: {
    roomId: string;
    sessionId: string;
    participants: string[];
    editorState: unknown;
  }) => {
    setIsJoined(true);
    setParticipantJoined(payload.participants.length > 1);
    // Transition session status to ACTIVE (optimistic UI)
    setSession(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
  }, []);

  const handleSessionError = useCallback(({ message }: { message: string }) => {
    setAccessError(message);
  }, []);

  const handlePeerJoined = useCallback(({ userId }: { userId: string }) => {
    if (userId !== currentUserId) setParticipantJoined(true);
  }, [currentUserId]);

  const handlePeerLeft = useCallback(({ userId }: { userId: string }) => {
    if (userId !== currentUserId) setParticipantJoined(false);
  }, [currentUserId]);

  const socketRef = useSocket({
    roomId: roomId!,
    onJoinSuccess: handleJoinSuccess,
    onSessionError: handleSessionError,
    onUserJoined: handlePeerJoined,
    onUserLeft: handlePeerLeft,
    onParticipantOnline: handlePeerJoined,
    onParticipantOffline: handlePeerLeft,
  });

  // --- WebRTC ---
  const webRTC = useWebRTC({
    roomId: roomId!,
    socketRef,
    currentUserId,
  });

  // --- Leave Room ---
  const handleLeaveSession = async () => {
    if (!roomId) return;
    socketRef.current?.emit('session:leave');
    navigate('/mentor/bookings');
  };

  // ─── Error Screen ────────────────────────────────────────────────────────────
  if (accessError) {
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-6 text-center font-mono">
        <div className="max-w-md w-full bg-[#111111] border border-[#272b3a] rounded-xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-8">{accessError}</p>
          <button onClick={() => navigate('/mentor/bookings')} className="w-full py-3 bg-[#1a1d26] hover:bg-[#272b3a] text-white rounded-lg font-bold transition-colors">
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading Screen ───────────────────────────────────────────────────────────
  if (!session || !isJoined) {
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#272b3a] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-gray-400">Verifying session access...</p>
        </div>
      </div>
    );
  }

  // ─── Ended / Cancelled Screens ────────────────────────────────────────────────
  const ENDED_STATUSES = ['ENDED', 'NO_SHOW', 'ABANDONED', 'EXPIRED', 'CANCELLED'];
  if (ENDED_STATUSES.includes(session.status)) {
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-6 text-center font-mono">
        <div className="max-w-md w-full bg-[#111111] border border-[#272b3a] rounded-xl p-8">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Finished</h1>
          <p className="text-gray-400 mb-2">This session has ended.</p>
          <p className="text-xs text-gray-600 mb-8 uppercase tracking-wider">{session.status}</p>
          <button onClick={() => navigate('/mentor/bookings')} className="w-full py-3 bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-lg font-bold transition-colors">
            Return to Bookings
          </button>
        </div>
      </div>
    );
  }

  // ─── Waiting Room ─────────────────────────────────────────────────────────────
  return (
    <SessionWorkspaceLayout
      roomId={roomId!}
      currentUserId={currentUserId}
      role="mentor"
      statusLabel={participantJoined ? 'ACTIVE' : 'WAITING FOR STUDENT'}
      participantJoined={participantJoined}
      onEndSession={handleLeaveSession}
      endLabel="LEAVE SESSION"
      webRTC={webRTC}
      socketRef={socketRef}
      offlineNotice={!participantJoined ? 'Student is not in the room yet. The workspace is ready and will connect video when they join.' : undefined}
    />
  );
};

export default SessionRoomPage;
