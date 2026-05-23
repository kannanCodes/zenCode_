export const SESSION_EVENTS = {
  JOIN_SESSION: 'session:join',
  LEAVE_SESSION: 'session:leave',
  USER_JOINED: 'session:user-joined',
  USER_LEFT: 'session:user-left',
  PARTICIPANT_ONLINE: 'session:participant-online',
  PARTICIPANT_OFFLINE: 'session:participant-offline',
  SESSION_ENDED: 'session:ended',
  SESSION_JOINED_SUCCESS: 'session:joined',
  SESSION_ERROR: 'session:error',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc:ice-candidate',
  MEDIA_STATE_CHANGED: 'media:state-changed',
  SCREEN_SHARE_STARTED: 'screen-share:started',
  SCREEN_SHARE_STOPPED: 'screen-share:stopped',
  HEARTBEAT: 'session:heartbeat',
} as const;

export const CHAT_EVENTS = {
  SEND_MESSAGE: 'chat:send-message',
  NEW_MESSAGE: 'chat:new-message',
  TYPING_START: 'chat:typing-start',
  TYPING_STOP: 'chat:typing-stop',
  MESSAGE_READ: 'chat:message-read',
} as const;

export const COLLAB_EVENTS = {
  CODE_CHANGED: 'collab:code-changed',
  CODE_SYNC: 'collab:code-sync',
  LANGUAGE_CHANGED: 'collab:language-changed',
  RUN_RESULT: 'collab:run-result',
} as const;
