import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { Socket } from 'socket.io-client';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeCollabPanel from './CodeCollabPanel';
import SessionChat from './SessionChat';
import SessionProblemPanel from './SessionProblemPanel';
import VideoGrid from './VideoGrid';
import { sessionWorkspaceService, type SessionWorkspace } from '../../services/sessionWorkspace.service';
import { showError } from '../../utils/toast.util';

interface SessionWorkspaceLayoutProps {
  roomId: string;
  currentUserId: string;
  role: 'mentor' | 'student';
  statusLabel: string;
  participantJoined: boolean;
  onEndSession: () => void;
  endLabel: string;
  webRTC: {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    mediaState: { audio: boolean; video: boolean };
    remoteMediaState: { audio: boolean; video: boolean };
    isScreenSharing: boolean;
    isRemoteScreenSharing: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    startScreenShare: () => void;
    stopScreenShare: () => void;
  };
  socketRef: RefObject<Socket | null>;
  offlineNotice?: string;
}

const SessionWorkspaceLayout = ({
  roomId,
  currentUserId,
  role,
  statusLabel,
  participantJoined,
  onEndSession,
  endLabel,
  webRTC,
  socketRef,
  offlineNotice,
}: SessionWorkspaceLayoutProps) => {
  const [workspace, setWorkspace] = useState<SessionWorkspace | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const canChangeProblem = role === 'mentor';
  const canSubmit = role === 'student';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await sessionWorkspaceService.getWorkspace(roomId);
        if (!cancelled) setWorkspace(data);
      } catch {
        if (!cancelled) showError('Unable to load session workspace');
      } finally {
        if (!cancelled) setIsLoadingWorkspace(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleProblemChanged = ({ workspace: nextWorkspace }: { workspace: SessionWorkspace }) => {
      setWorkspace(nextWorkspace);
    };

    socket.on('collab:problem-changed', handleProblemChanged);
    return () => {
      socket.off('collab:problem-changed', handleProblemChanged);
    };
  }, [socketRef]);

  const handleProblemSelected = (nextWorkspace: SessionWorkspace) => {
    setWorkspace(nextWorkspace);
    socketRef.current?.emit('collab:problem-changed', { roomId, workspace: nextWorkspace });
  };

  const videoPanel = (
    <VideoGrid
      localStream={webRTC.localStream}
      remoteStream={webRTC.remoteStream}
      mediaState={webRTC.mediaState}
      remoteMediaState={webRTC.remoteMediaState}
      isScreenSharing={webRTC.isScreenSharing}
      isRemoteScreenSharing={webRTC.isRemoteScreenSharing}
      onToggleAudio={webRTC.toggleAudio}
      onToggleVideo={webRTC.toggleVideo}
      onToggleScreenShare={webRTC.isScreenSharing ? webRTC.stopScreenShare : webRTC.startScreenShare}
      onEndSession={onEndSession}
      isExpanded={isVideoExpanded}
      onToggleExpanded={() => setIsVideoExpanded((value) => !value)}
      endSessionTitle={endLabel}
    />
  );

  const timerLabel = useMemo(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), []);

  return (
    <div className="h-screen bg-[var(--color-background-dark)] flex flex-col font-mono text-white overflow-hidden">
      <header className="h-16 border-b border-[#272b3a] bg-[#0b0b0b] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-bold text-xl text-[var(--color-primary)]">zenCode</span>
          <span className="text-sm text-white font-bold border-b-2 border-[var(--color-primary)] h-16 flex items-center">
            Mock Interview
          </span>
          <span className="hidden md:inline text-xs text-gray-500 uppercase tracking-widest">
            {workspace?.problem?.title || 'Shared Workspace'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-bold">
            <span className={`w-2 h-2 rounded-full ${participantJoined ? 'bg-emerald-400' : 'bg-yellow-300'}`} />
            {statusLabel}
          </div>
          <div className="hidden lg:block h-9 px-3 rounded border border-[#272b3a] bg-[#111111] text-sm text-gray-300 leading-9">
            {timerLabel}
          </div>
          <button
            onClick={onEndSession}
            className="h-9 px-4 rounded border border-red-500/60 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold text-xs transition-all"
          >
            {endLabel}
          </button>
        </div>
      </header>

      {offlineNotice && (
        <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-6 py-2 text-center text-xs text-yellow-300 shrink-0">
          {offlineNotice}
        </div>
      )}

      {isVideoExpanded ? (
        <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1fr)_360px] max-lg:grid-cols-1">
          <div className="min-h-0 bg-[#0a0a0a]">{videoPanel}</div>
          <div className="min-h-0 border-l border-[#272b3a] max-lg:hidden">
            <SessionChat roomId={roomId} socketRef={socketRef} currentUserId={currentUserId} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <Group orientation="horizontal">
            <Panel defaultSize={30} minSize={22}>
              <div className="flex flex-col h-full bg-[#111111]">
                <div className="flex-1 min-h-0 border-b border-[#272b3a]">
                  {isLoadingWorkspace ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading problem...</div>
                  ) : (
                    <SessionProblemPanel
                      roomId={roomId}
                      problem={workspace?.problem || null}
                      canChangeProblem={canChangeProblem}
                      onProblemSelected={handleProblemSelected}
                    />
                  )}
                </div>
                <div className="shrink-0 h-64 bg-[#0a0a0a]">{videoPanel}</div>
              </div>
            </Panel>

            <Separator className="w-1 bg-[#272b3a] hover:bg-[var(--color-primary)] transition-colors" />

            <Panel defaultSize={48} minSize={32}>
              <div className="h-full bg-[#1e1e1e] overflow-hidden">
                <CodeCollabPanel
                  roomId={roomId}
                  socketRef={socketRef}
                  initialCode={workspace?.editorState.code}
                  initialLanguage={workspace?.editorState.language}
                  problemId={workspace?.problem?._id}
                  canSubmit={canSubmit}
                  lastRunResult={workspace?.lastRunResult}
                  lastRunError={workspace?.lastRunError}
                />
              </div>
            </Panel>

            <Separator className="w-1 bg-[#272b3a] hover:bg-[var(--color-primary)] transition-colors" />

            <Panel defaultSize={22} minSize={18}>
              <div className="h-full overflow-hidden">
                <SessionChat roomId={roomId} socketRef={socketRef} currentUserId={currentUserId} />
              </div>
            </Panel>
          </Group>
        </div>
      )}
    </div>
  );
};

export default SessionWorkspaceLayout;
