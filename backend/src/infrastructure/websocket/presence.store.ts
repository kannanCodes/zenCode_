class PresenceStore {
  private users = new Map<string, Set<string>>();

  add(userId: string, socketId: string) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }

    this.users.get(userId)?.add(socketId);
  }

  remove(userId: string, socketId: string) {
    const sockets = this.users.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.users.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return this.users.has(userId);
  }

  getUserSocketCount(userId: string): number {
    return this.users.get(userId)?.size || 0;
  }

  getUserSockets(userId: string): string[] {
    return Array.from(this.users.get(userId) || []);
  }
}

export const presenceStore = new PresenceStore();
