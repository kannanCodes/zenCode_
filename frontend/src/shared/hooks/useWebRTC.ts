import { useEffect, useRef, useCallback, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface MediaState {
  audio: boolean;
  video: boolean;
}

interface UseWebRTCOptions {
  roomId: string;
  socketRef: React.RefObject<Socket | null>;
  currentUserId: string;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC({ roomId, socketRef, currentUserId }: UseWebRTCOptions) {
  // Refs — always current, no stale closure issues
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const mediaStateRef = useRef<MediaState>({ audio: true, video: true });
  const isScreenSharingRef = useRef(false);
  // Guard: prevents onnegotiationneeded from firing before connection is stable
  const isNegotiatingRef = useRef(false);

  // State — drives UI re-renders only
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>({ audio: true, video: true });
  const [remoteMediaState, setRemoteMediaState] = useState<MediaState>({ audio: true, video: true });
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);

  // ─── Helper: update media state in both ref and React state ────────────────
  const applyMediaState = useCallback((next: MediaState) => {
    mediaStateRef.current = next;
    setMediaState(next);
  }, []);

  // ─── Create / reset peer connection ────────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId: string) => {
    // Clean up any existing connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onnegotiationneeded = null;
      peerConnectionRef.current.close();
    }
    isNegotiatingRef.current = false;
    remoteUserIdRef.current = targetUserId;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Attach ALL local tracks to the new connection
    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Remote tracks → remote stream (handle adding new tracks e.g. screen share)
    const remote = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach(track => {
        // Avoid duplicate tracks
        if (!remote.getTrackById(track.id)) {
          remote.addTrack(track);
        }
      });
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    // ICE candidates → relay through Socket.IO (signaling only)
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', {
          roomId,
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Renegotiation — only fire after initial connection is established
    pc.onnegotiationneeded = async () => {
      // Don't fire during initial setup (createOffer is called manually then)
      if (isNegotiatingRef.current) return;
      if (pc.signalingState !== 'stable') return;
      try {
        isNegotiatingRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc:offer', {
          roomId,
          targetUserId,
          offer: pc.localDescription,
        });
      } catch (err) {
        console.error('[WebRTC] Renegotiation failed:', err);
      } finally {
        isNegotiatingRef.current = false;
      }
    };

    return pc;
  }, [roomId, socketRef]);

  // ─── Socket signaling listeners ─────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Another participant joined — initiate offer as the caller
    const handleUserJoined = async ({ userId: targetUserId }: { userId: string }) => {
      if (targetUserId === currentUserId) return;
      const pc = createPeerConnection(targetUserId);

      try {
        isNegotiatingRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { roomId, targetUserId, offer: pc.localDescription });
      } catch (err) {
        console.error('[WebRTC] Offer creation failed:', err);
      } finally {
        isNegotiatingRef.current = false;
      }
    };

    const handleOffer = async ({
      fromUserId,
      offer,
    }: {
      fromUserId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const pc = createPeerConnection(fromUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', {
        roomId,
        targetUserId: fromUserId,
        answer: pc.localDescription,
      });
    };

    const handleAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState === 'stable') return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC] ICE candidate error:', err);
      }
    };

    const handleMediaStateChanged = ({
      userId,
      audio,
      video,
    }: {
      userId: string;
      audio: boolean;
      video: boolean;
    }) => {
      if (userId === currentUserId) return;
      setRemoteMediaState({ audio, video });
    };

    const handleScreenShareStarted = ({ userId }: { userId: string }) => {
      if (userId === currentUserId) return;
      setIsRemoteScreenSharing(true);
    };

    const handleScreenShareStopped = ({ userId }: { userId: string }) => {
      if (userId === currentUserId) return;
      setIsRemoteScreenSharing(false);
    };

    socket.on('session:user-joined', handleUserJoined);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('media:state-changed', handleMediaStateChanged);
    socket.on('screen-share:started', handleScreenShareStarted);
    socket.on('screen-share:stopped', handleScreenShareStopped);

    return () => {
      socket.off('session:user-joined', handleUserJoined);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('media:state-changed', handleMediaStateChanged);
      socket.off('screen-share:started', handleScreenShareStarted);
      socket.off('screen-share:stopped', handleScreenShareStopped);
    };
  }, [socketRef, roomId, currentUserId, createPeerConnection]);

  // ─── Acquire media on mount and clean up on unmount ────────────────────────
  useEffect(() => {
    let cancelled = false;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        console.error('[WebRTC] getUserMedia failed:', err);
      }
    };

    initMedia();

    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
    };
  }, []);

  // ─── Controls ───────────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const next = { ...mediaStateRef.current, audio: track.enabled };
    applyMediaState(next);
    socketRef.current?.emit('media:state-changed', { roomId, ...next });
  }, [roomId, socketRef, applyMediaState]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const next = { ...mediaStateRef.current, video: track.enabled };
    applyMediaState(next);
    socketRef.current?.emit('media:state-changed', { roomId, ...next });
  }, [roomId, socketRef, applyMediaState]);

  const stopScreenShare = useCallback(async () => {
    if (!isScreenSharingRef.current) return;
    try {
      // Stop current screen tracks
      localStreamRef.current?.getVideoTracks().forEach(t => t.stop());

      // Re-acquire camera only (keep existing audio tracks from the original stream)
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      // Replace on peer connection
      const pc = peerConnectionRef.current;
      const sender = pc?.getSenders().find(s => s.track?.kind === 'video');
      if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);

      // Rebuild local stream: new camera video + preserved audio tracks
      const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
      const newStream = new MediaStream([cameraTrack, ...audioTracks]);

      // Apply current enabled state to the new video track
      cameraTrack.enabled = mediaStateRef.current.video;

      localStreamRef.current = newStream;
      setLocalStream(new MediaStream(newStream.getTracks()));

      isScreenSharingRef.current = false;
      setIsScreenSharing(false);
      socketRef.current?.emit('screen-share:stopped', { roomId });
    } catch (err) {
      console.error('[WebRTC] Stop screen share failed:', err);
    }
  }, [roomId, socketRef]);

  const startScreenShare = useCallback(async () => {
    if (isScreenSharingRef.current) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = screenStream.getVideoTracks()[0];
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // Replace video sender track with screen track (no renegotiation needed)
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenTrack);
      } else {
        // No existing video sender — add the track
        pc.addTrack(screenTrack, screenStream);
      }

      // Preserve audio tracks when building preview stream
      const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
      const previewStream = new MediaStream([screenTrack, ...audioTracks]);

      // Stop old camera video track (NOT audio)
      localStreamRef.current?.getVideoTracks().forEach(t => t.stop());
      localStreamRef.current = previewStream;
      setLocalStream(new MediaStream(previewStream.getTracks()));

      isScreenSharingRef.current = true;
      setIsScreenSharing(true);
      socketRef.current?.emit('screen-share:started', { roomId });

      // Auto-stop when user clicks browser's "Stop sharing"
      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error('[WebRTC] Screen share failed:', err);
    }
  }, [roomId, socketRef, stopScreenShare]);

  return {
    localStream,
    remoteStream,
    mediaState,
    remoteMediaState,
    isScreenSharing,
    isRemoteScreenSharing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
