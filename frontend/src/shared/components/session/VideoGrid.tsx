import { useCallback, useState } from 'react';

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  isVideoOff?: boolean;
  isAudioOff?: boolean;
}

const VideoTile = ({ stream, label, muted = false, isVideoOff = false, isAudioOff = false }: VideoTileProps) => {
  const [playFailed, setPlayFailed] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  // Callback ref: fires every time the <video> element MOUNTS (not just when stream changes).
  // This is the fix for "needs refresh to see face" — when isVideoOff toggles, the <video>
  // element is unmounted then remounted. useEffect+useRef would miss this because `stream`
  // hasn't changed. A callback ref fires on every mount.
  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    setVideoElement(el);
    if (el && stream) {
      el.srcObject = stream;
      el.muted = muted; // explicit assignment for Safari
      el.play().catch((err) => {
        if (err.name === 'NotAllowedError') {
          setPlayFailed(true);
        }
      });
    }
  }, [stream, muted]);

  const handleManualPlay = () => {
    if (videoElement) {
      videoElement.play().then(() => setPlayFailed(false)).catch(console.error);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1a1d26] border border-[#272b3a] flex-1 min-w-0 aspect-video">
      {/* ALWAYS render the video element if stream exists so audio keeps playing */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Safari Autoplay blocked overlay */}
      {playFailed && stream && !isVideoOff && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
          <button
            onClick={handleManualPlay}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click to Play Video
          </button>
        </div>
      )}

      {/* Avatar overlay when video is off or stream is missing */}
      {(!stream || isVideoOff) && !playFailed && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#1a1d26] z-0">
          <div className="w-16 h-16 rounded-full bg-[#272b3a] flex items-center justify-center text-2xl font-bold text-gray-400">
            {label.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Label + indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-xs text-white bg-black/60 rounded px-2 py-0.5 backdrop-blur-sm">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {isAudioOff && (
            <span className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </span>
          )}
          {isVideoOff && (
            <span className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  mediaState: { audio: boolean; video: boolean };
  remoteMediaState: { audio: boolean; video: boolean };
  isScreenSharing: boolean;
  isRemoteScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndSession: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  endSessionTitle?: string;
}

const VideoGrid = ({
  localStream,
  remoteStream,
  mediaState,
  remoteMediaState,
  isScreenSharing,
  isRemoteScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndSession,
  isExpanded = false,
  onToggleExpanded,
  endSessionTitle = 'Leave session',
}: VideoGridProps) => {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] p-3 gap-3">
      {/* Video tiles */}
      <div className="flex gap-3 flex-1 min-h-0">
        <VideoTile
          stream={remoteStream}
          label={isRemoteScreenSharing ? 'Participant sharing screen' : 'Participant'}
          muted={false}
          isVideoOff={!remoteMediaState.video}
          isAudioOff={!remoteMediaState.audio}
        />
        <VideoTile
          stream={localStream}
          label="You"
          muted
          isVideoOff={!mediaState.video}
          isAudioOff={!mediaState.audio}
        />
      </div>

      {/* Screen Share Active Banner */}
      {isScreenSharing && (
        <div className="shrink-0 mx-3 mb-1 flex items-center justify-between bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/40 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Sharing your screen
          </div>
          <button
            onClick={onToggleScreenShare}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            Stop Sharing
          </button>
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 shrink-0 py-1">
        {onToggleExpanded && (
          <button
            onClick={onToggleExpanded}
            title={isExpanded ? 'Collapse video' : 'Expand video'}
            className="w-11 h-11 rounded-full bg-[#1a1d26] hover:bg-[#272b3a] flex items-center justify-center text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9H5V5m0 0l5 5M15 9h4V5m0 0l-5 5M9 15H5v4m0 0l5-5M15 15h4v4m0 0l-5-5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M4 4l6 6m10-2V4h-4m4 0l-6 6M4 16v4h4m-4 0l6-6m10 2v4h-4m4 0l-6-6" />
              )}
            </svg>
          </button>
        )}

        {/* Mic */}
        <button
          onClick={onToggleAudio}
          title={mediaState.audio ? 'Mute mic' : 'Unmute mic'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            mediaState.audio
              ? 'bg-[#1a1d26] hover:bg-[#272b3a] text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mediaState.audio ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </>
            )}
          </svg>
        </button>

        {/* Camera */}
        <button
          onClick={onToggleVideo}
          title={mediaState.video ? 'Turn off camera' : 'Turn on camera'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            mediaState.video
              ? 'bg-[#1a1d26] hover:bg-[#272b3a] text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mediaState.video ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </>
            )}
          </svg>
        </button>

        {/* Screen share toggle */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isScreenSharing
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[#1a1d26] hover:bg-[#272b3a] text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        {/* End call */}
        <button
          onClick={onEndSession}
          title={endSessionTitle}
          className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all ml-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoGrid;
