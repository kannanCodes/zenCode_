import { io, type Socket } from 'socket.io-client';
import { tokenService } from './token';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

/**
 * Global singleton Socket.IO connection for application-level events (notifications, unread counts).
 * This is SEPARATE from the session-scoped socket used in useSocket.ts.
 *
 * Design decisions:
 * - Singleton: one connection per authenticated session, survives component unmounts
 * - Created lazily: only connects when the user is authenticated
 * - Decoupled from session rooms: does NOT join any room on connect
 * - The server emits directly to socket IDs tracked via presenceStore
 */
class NotificationSocketManager {
  private socket: Socket | null = null;

  connect(): Socket | null {
    const token = tokenService.getAccessToken();
    if (!token) return null;

    // Reuse existing connection if already alive
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[NotificationSocket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[NotificationSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.warn('[NotificationSocket] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const notificationSocketManager = new NotificationSocketManager();
