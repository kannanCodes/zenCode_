import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/lib/axios';
import { showError } from '../../../shared/utils/toast.util';
import { useSocket } from '../../../shared/hooks/useSocket';
import { useWebRTC } from '../../../shared/hooks/useWebRTC';
import { tokenService } from '../../../shared/lib/token';
import SessionWorkspaceLayout from '../../../shared/components/session/SessionWorkspaceLayout';

const getCurrentUserId = () => {
  const payload = tokenService.getTokenPayload();
  return (payload?.id as string) || (payload?.sub as string) || '';
};

const StudentSessionRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  // Realtime States
  const [isJoined, setIsJoined] = useState(false);
  const [participantJoined, setParticipantJoined] = useState(false);

  // We decode the JWT to pass the userId to chat & webrtc
  const currentUserId = getCurrentUserId();

  // --- Session Validation ---
  useEffect(() => {
    if (!roomId) { navigate('/candidate/bookings'); return; }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/mentor-sessions/${roomId}/validate`);
        if (!cancelled) setSession(res.data.data);
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
    setSession((prev: any) => prev ? { ...prev, status: prev.status === 'SCHEDULED' && payload.participants.length > 1 ? 'ACTIVE' : prev.status } : prev);
  }, []);

  const handleSessionError = useCallback(({ message }: { message: string }) => {
    showError(message);
    setAccessError(message);
  }, []);

  const handlePeerJoined = useCallback(({ userId }: { userId: string }) => {
    if (userId === currentUserId) return;
    setParticipantJoined(true);
    setSession((prev: any) => prev ? { ...prev, status: 'ACTIVE' } : prev);
  }, [currentUserId]);

  const handlePeerLeft = useCallback(({ userId }: { userId: string }) => {
    if (userId === currentUserId) return;
    setParticipantJoined(false);
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

  // --- Leave Session ---
  const handleLeaveSession = () => {
    if (session && session.bookingId) {
      navigate(`/candidate/bookings?reviewBookingId=${session.bookingId}`);
    } else {
      navigate('/candidate/bookings');
    }
  };

  if (accessError) {
    if (accessError.toLowerCase().includes('unavailable') || accessError.toLowerCase().includes('expired')) {
      return (
        <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-6 text-center font-mono">
          <div className="max-w-md w-full bg-[#111111] border border-[#272b3a] rounded-xl p-8">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Session Finished</h1>
            <p className="text-gray-400 mb-8">This session has ended or is unavailable.</p>
            <button onClick={() => navigate('/candidate/bookings')} className="w-full py-3 bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-lg font-bold transition-colors">
              Return to Bookings
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-4 text-center font-mono">
        <div className="max-w-md w-full bg-[#111111] border border-red-500/30 rounded-xl p-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-8">{accessError}</p>
          <button 
            onClick={() => navigate('/candidate/bookings')}
            className="w-full py-3 rounded bg-[#1a1d26] hover:bg-[#272b3a] font-bold transition-colors text-white"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!session || !isJoined) {
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111111] border border-[var(--color-primary)]/30 rounded-xl p-10 shadow-[0_0_40px_rgba(45,95,255,0.08)]">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#272b3a] border-t-[var(--color-primary)] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Joining Session...</h1>
        </div>
      </div>
    );
  }

  if (!participantJoined && session.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-[var(--color-background-dark)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111111] border border-[var(--color-primary)]/30 rounded-xl p-10 shadow-[0_0_40px_rgba(45,95,255,0.08)]">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#272b3a] border-t-[var(--color-primary)] animate-spin" />
            <div className="absolute inset-2 rounded-full bg-[#1a1d26] flex items-center justify-center text-[var(--color-primary)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Waiting Room</h1>
          <p className="text-gray-400 mb-2 text-center">Waiting for your mentor to join...</p>
          <div className="mt-8 pt-6 border-t border-[#272b3a] text-center">
            <button onClick={() => navigate('/candidate/bookings')} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              ← Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionWorkspaceLayout
      roomId={roomId!}
      currentUserId={currentUserId}
      role="student"
      statusLabel={participantJoined ? 'ACTIVE' : 'MENTOR RECONNECTING'}
      participantJoined={participantJoined}
      onEndSession={handleLeaveSession}
      endLabel="LEAVE SESSION"
      webRTC={webRTC}
      socketRef={socketRef}
      offlineNotice={!participantJoined ? 'Mentor is offline. The session is still active, and your problem, editor, and chat state remain available while they reconnect.' : undefined}
    />
  );
};

export default StudentSessionRoomPage;
