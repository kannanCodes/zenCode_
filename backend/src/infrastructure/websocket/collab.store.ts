interface RoomState {
  code: string;
  language: string;
  version: number;
}

class CollaborationStore {
  private rooms = new Map<string, RoomState>();

  get(roomId: string) {
    return this.rooms.get(roomId);
  }

  set(roomId: string, state: RoomState) {
    this.rooms.set(roomId, state);
  }
}

export const collaborationStore = new CollaborationStore();
