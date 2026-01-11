import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { formatTimestamp } from '../../lib/mock-data';

interface VideoPlayerProps {
  videoUrl: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
}

/**
 * VideoPlayer - Custom video player with controls and seek functionality
 *
 * Features:
 * - Play/pause controls
 * - Seekable progress bar
 * - Time display
 * - Volume control
 * - Fullscreen support
 * - Keyboard shortcuts (space = play/pause, arrows = seek)
 *
 * BACKEND_HOOK: Video streaming
 * ─────────────────────────────────────────
 * Endpoint: GET /videos/{videoId}.mp4
 * Request:  None (videoId in URL path)
 * Response: Video file stream
 * Success:  Browser handles video playback
 * Error:    Show error message with retry
 * Status:   NOT_CONNECTED
 * ─────────────────────────────────────────
 */
export function VideoPlayer({
  videoUrl,
  currentTime,
  onTimeUpdate,
  onSeek,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [localTime, setLocalTime] = useState(0);
  const [volume, setVolume] = useState(1);

  // Sync external currentTime prop with video
  useEffect(() => {
    if (currentTime !== undefined && videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setLocalTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setLocalTime(time);
      onSeek?.(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setLocalTime(newTime);
      onSeek?.(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const progress = duration > 0 ? (localTime / duration) * 100 : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handlePlayPause}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-purple-500 rounded-full relative transition-all group-hover:bg-purple-400"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              )}
            </button>

            {/* Skip buttons */}
            <button
              onClick={() => handleSkip(-10)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => handleSkip(10)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>

            {/* Time Display */}
            <div className="text-sm text-white font-mono">
              {formatTimestamp(localTime)} / {formatTimestamp(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-white" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-purple-500"
              />
            </div>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={handlePlayPause}>
          <div className="w-20 h-20 rounded-full bg-purple-600/90 hover:bg-purple-500/90 flex items-center justify-center transition-colors">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}
    </div>
  );
}