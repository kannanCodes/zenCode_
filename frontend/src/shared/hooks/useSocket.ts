import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { tokenService } from '../lib/token';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
const HEARTBEAT_INTERVAL_MS = 30_000;

interface UseSocketOptions {
  roomId: string;
  onJoinSuccess?: (payload: {
    roomId: string;
    sessionId: string;
    participants: string[];
    editorState: { code: string; language: string; version: number } | null;
  }) => void;
  onSessionError?: (payload: { message: string }) => void;
  onUserJoined?: (payload: { userId: string }) => void;
  onUserLeft?: (payload: { userId: string }) => void;
  onParticipantOnline?: (payload: { userId: string }) => void;
  onParticipantOffline?: (payload: { userId: string }) => void;
}

export function useSocket(options: UseSocketOptions) {
  const {
    roomId,
    onJoinSuccess,
    onSessionError,
    onUserJoined,
    onUserLeft,
    onParticipantOnline,
    onParticipantOffline,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store callbacks in refs so they don't cause effect re-runs
  const onJoinSuccessRef = useRef(onJoinSuccess);
  const onSessionErrorRef = useRef(onSessionError);
  const onUserJoinedRef = useRef(onUserJoined);
  const onUserLeftRef = useRef(onUserLeft);
  const onParticipantOnlineRef = useRef(onParticipantOnline);
  const onParticipantOfflineRef = useRef(onParticipantOffline);

  useEffect(() => { onJoinSuccessRef.current = onJoinSuccess; }, [onJoinSuccess]);
  useEffect(() => { onSessionErrorRef.current = onSessionError; }, [onSessionError]);
  useEffect(() => { onUserJoinedRef.current = onUserJoined; }, [onUserJoined]);
  useEffect(() => { onUserLeftRef.current = onUserLeft; }, [onUserLeft]);
  useEffect(() => { onParticipantOnlineRef.current = onParticipantOnline; }, [onParticipantOnline]);
  useEffect(() => { onParticipantOfflineRef.current = onParticipantOffline; }, [onParticipantOffline]);

  const joinRoom = useCallback((socket: Socket, currentRoomId: string) => {
    socket.emit('session:join', { roomId: currentRoomId });
  }, []);

  const startHeartbeat = useCallback((socket: Socket, currentRoomId: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('session:heartbeat', { roomId: currentRoomId });
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  useEffect(() => {
    const token = tokenService.getAccessToken();
    if (!token || !roomId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
      // Socket.IO built-in reconnection
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // --- Connection events ---
    socket.on('connect', () => {
      if (import.meta.env.DEV) console.log('[Socket] Connected:', socket.id);
      joinRoom(socket, roomId);
      startHeartbeat(socket, roomId);
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) console.log('[Socket] Disconnected:', reason);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    });

    socket.on('reconnect', () => {
      if (import.meta.env.DEV) console.log('[Socket] Reconnected — rejoining room:', roomId);
      // Auto-rejoin on reconnect restores room membership + gets latest editor state
      joinRoom(socket, roomId);
      startHeartbeat(socket, roomId);
    });

    // --- Session events ---
    socket.on('session:joined', (payload) => {
      onJoinSuccessRef.current?.(payload);
    });

    socket.on('session:error', (payload) => {
      console.error('[Socket] Session error:', payload.message);
      onSessionErrorRef.current?.(payload);
    });

    socket.on('session:user-joined', (payload) => {
      onUserJoinedRef.current?.(payload);
    });

    socket.on('session:user-left', (payload) => {
      onUserLeftRef.current?.(payload);
    });

    socket.on('session:participant-online', (payload) => {
      onParticipantOnlineRef.current?.(payload);
    });

    socket.on('session:participant-offline', (payload) => {
      onParticipantOfflineRef.current?.(payload);
    });

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      socket.emit('session:leave');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, joinRoom, startHeartbeat]);

  return socketRef;
}
