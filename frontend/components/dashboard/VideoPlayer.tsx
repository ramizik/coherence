'use client';

import { useState, useEffect, RefObject } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Link2 } from 'lucide-react';
import { DissonanceFlag, formatTimestamp } from '../../lib/mock-data';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoUrl: string;
  duration: number;
  currentTime: number;
  onTimeUpdate: () => void;
  onSeek: (timestamp: number, flagId?: string) => void;
  flags: DissonanceFlag[];
}

/**
 * VideoPlayer - Custom HTML5 video player with controls and key moments
 * 
 * Features:
 * - Custom playback controls
 * - Scrubber with progress bar
 * - Volume control
 * - Playback speed selector
 * - Key moments thumbnail grid
 * - Sync indicator with timeline
 */
export function VideoPlayer({
  videoRef,
  videoUrl,
  duration,
  currentTime,
  onTimeUpdate,
  onSeek,
  flags,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSyncPulse, setShowSyncPulse] = useState(false);

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Handle scrubber click
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  // Show sync pulse when seeking from timeline
  useEffect(() => {
    setShowSyncPulse(true);
    const timer = setTimeout(() => setShowSyncPulse(false), 2000);
    return () => clearTimeout(timer);
  }, [currentTime]);

  // Get key moments (HIGH and MEDIUM severity flags)
  const keyMoments = flags
    .filter(flag => flag.severity === 'HIGH' || flag.severity === 'MEDIUM')
    .slice(0, 3);

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
      {/* Video element container */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 mb-4 group">
        {/* Sync indicator */}
        {showSyncPulse && (
          <div className="absolute top-4 right-4 z-10 bg-cyan-500/20 border border-cyan-500 rounded-full px-3 py-1 flex items-center gap-1.5 animate-pulse">
            <Link2 className="w-3 h-3 text-cyan-300" strokeWidth={2} />
            <span className="text-[11px] font-medium text-cyan-300" style={{ fontWeight: 500 }}>
              Synced with Timeline
            </span>
          </div>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video bg-black"
          onTimeUpdate={onTimeUpdate}
          onClick={togglePlay}
        />

        {/* Play overlay (shows when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-purple-500/90 flex items-center justify-center hover:bg-purple-500 transition-colors">
              <Play className="w-10 h-10 text-white ml-1" fill="white" strokeWidth={0} />
            </div>
          </button>
        )}
      </div>

      {/* Custom Controls */}
      <div className="space-y-4">
        {/* Scrubber */}
        <div
          onClick={handleScrubberClick}
          className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all group"
        >
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          {/* Left group */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" strokeWidth={0} />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Volume2 className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Time display */}
            <span className="text-[14px] font-medium text-gray-300" style={{ fontWeight: 500 }}>
              {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
            </span>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-3">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
                style={{ fontWeight: 500 }}
              >
                {playbackRate}×
              </button>
              
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`block w-full px-4 py-2 text-left text-[13px] hover:bg-white/10 transition-colors ${
                        rate === playbackRate ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300'
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Maximize className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Key Moments */}
      {keyMoments.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/10">
          <h3 className="text-[14px] font-medium text-white mb-3" style={{ fontWeight: 500 }}>
            Key Moments
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {keyMoments.map((flag) => (
              <button
                key={flag.id}
                onClick={() => onSeek(flag.timestamp, flag.id)}
                className="relative rounded-lg border border-white/10 hover:border-purple-500 overflow-hidden bg-gradient-to-br from-purple-500/10 to-cyan-500/10 aspect-video group transition-all hover:scale-105"
              >
                {/* Severity badge */}
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  flag.severity === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'
                }`}>
                  <span className="text-white text-[10px] font-bold" style={{ fontWeight: 700 }}>!</span>
                </div>

                {/* Timestamp */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[11px] font-medium text-white" style={{ fontWeight: 500 }}>
                  {formatTimestamp(flag.timestamp)}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" fill="white" strokeWidth={0} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}