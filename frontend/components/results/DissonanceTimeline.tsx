import { useRef, useState } from 'react';
import { cn } from '../ui/utils';
import { formatTimestamp, type DissonanceFlag } from '../../lib/mock-data';

interface TimelineProps {
  flags: DissonanceFlag[];
  duration: number;
  currentTime?: number;
  onSeek: (timestamp: number) => void;
}

/**
 * DissonanceTimeline - Interactive timeline showing key moments and dissonance flags
 *
 * Visual: Shows markers for each flag with severity-colored dots
 * Interaction: Click anywhere to seek video to that timestamp
 * Features: Hover tooltip, current time indicator, severity badges
 *
 * @param flags - Dissonance flags with timestamps
 * @param duration - Total video duration in seconds
 * @param currentTime - Current playhead position (for indicator)
 * @param onSeek - Callback when user clicks to seek
 */
export function DissonanceTimeline({
  flags,
  duration,
  currentTime = 0,
  onSeek,
}: TimelineProps) {
  const [hoveredFlag, setHoveredFlag] = useState<DissonanceFlag | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    onSeek(Math.max(0, Math.min(duration, time)));
  };

  const handleFlagHover = (flag: DissonanceFlag, e: React.MouseEvent) => {
    setHoveredFlag(flag);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Key Moments</h3>
        <span className="text-xs text-gray-400">
          {flags.length} issue{flags.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      {/* Timeline Container */}
      <div
        ref={timelineRef}
        className="relative h-20 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 cursor-pointer group overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Background gradient (intensity based on flag density) */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        </div>

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 transition-all"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50" />
        </div>

        {/* Progress fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/5 transition-all"
          style={{ width: `${progress}%` }}
        />

        {/* Flag markers */}
        {flags.map((flag) => {
          const position = (flag.timestamp / duration) * 100;
          return (
            <div
              key={flag.id}
              className="absolute top-0 bottom-0 group/flag"
              style={{ left: `${position}%` }}
              onMouseEnter={(e) => handleFlagHover(flag, e)}
              onMouseLeave={() => setHoveredFlag(null)}
            >
              {/* Vertical line */}
              <div
                className={cn(
                  'absolute top-0 bottom-0 w-1 opacity-50 group-hover/flag:opacity-100 transition-opacity',
                  getSeverityColor(flag.severity)
                )}
              />

              {/* Marker dot */}
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-slate-900 transition-transform group-hover/flag:scale-125',
                  getSeverityColor(flag.severity)
                )}
              />

              {/* Timestamp label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/flag:opacity-100 transition-opacity">
                <div className="bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                  {formatTimestamp(flag.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hover overlay */}
        <div className="absolute inset-0 border-2 border-purple-500/0 group-hover:border-purple-500/30 rounded-xl transition-colors pointer-events-none" />
      </div>

      {/* Time markers at bottom */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-gray-500 font-mono">0:00</span>
        <span className="text-xs text-gray-500 font-mono">{formatTimestamp(duration)}</span>
      </div>

      {/* Tooltip (portal-style, fixed position) */}
      {hoveredFlag && (
        <div
          className="fixed z-50 max-w-xs p-3 bg-slate-900 border border-white/20 rounded-lg shadow-2xl pointer-events-none"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y - 60}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('w-2 h-2 rounded-full', getSeverityColor(hoveredFlag.severity))} />
            <span className="text-xs font-bold text-white uppercase">{hoveredFlag.severity}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{formatTimestamp(hoveredFlag.timestamp)}</span>
          </div>
          <p className="text-xs text-gray-300 line-clamp-2">{hoveredFlag.description}</p>
        </div>
      )}
    </div>
  );
}