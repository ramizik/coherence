'use client';

import { useEffect, useRef, useState } from 'react';
import { DissonanceFlag, formatTimestamp } from '../../lib/mock-data';

interface DissonanceTimelineProps {
  flags: DissonanceFlag[];
  duration: number;
  currentTime: number;
  onSeek: (timestamp: number, flagId?: string) => void;
}

interface TooltipData {
  x: number;
  timestamp: number;
  flag?: DissonanceFlag;
}

/**
 * DissonanceTimeline - Interactive canvas-based heatmap showing presentation coherence
 * 
 * Features:
 * - Green base layer representing coherent moments
 * - Red/amber overlays for dissonance flags
 * - White playhead indicator following video
 * - Hover tooltips showing flag details
 * - Click-to-seek functionality
 * - Ripple effect on click
 */
export function DissonanceTimeline({ flags, duration, currentTime, onSeek }: DissonanceTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; timestamp: number }>>([]);

  // Draw timeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = 120;

    // Set canvas size (double for retina)
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw base green gradient (coherent background)
    const greenGradient = ctx.createLinearGradient(0, 0, width, 0);
    greenGradient.addColorStop(0, '#10B981'); // Green
    greenGradient.addColorStop(1, '#34D399'); // Emerald
    ctx.fillStyle = greenGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw dissonance overlays
    flags.forEach(flag => {
      if (flag.type === 'POSITIVE_MOMENT') return; // Skip positive moments

      const x = (flag.timestamp / duration) * width;
      const flagDuration = flag.duration || 10; // Default 10 seconds
      const flagWidth = (flagDuration / duration) * width;

      // Color based on severity
      let color = '';
      let alpha = 0.6;
      
      if (flag.severity === 'HIGH') {
        color = '#EF4444'; // Red
      } else if (flag.severity === 'MEDIUM') {
        color = '#F59E0B'; // Amber
      } else {
        color = '#FCD34D'; // Yellow
        alpha = 0.3;
      }

      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fillRect(x, 0, flagWidth, height);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    
    // Playhead line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(playheadX - 1.5, 0, 3, height);

    // Playhead handle (top)
    ctx.beginPath();
    ctx.arc(playheadX, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

  }, [flags, duration, currentTime]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timestamp = (x / rect.width) * duration;

    // Find flag at this position
    const flag = flags.find(f => {
      const flagDuration = f.duration || 10;
      return timestamp >= f.timestamp && timestamp <= f.timestamp + flagDuration;
    });

    setTooltip({ x: e.clientX, timestamp, flag });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Handle click to seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timestamp = (x / rect.width) * duration;

    // Find flag at this position
    const flag = flags.find(f => {
      const flagDuration = f.duration || 10;
      return timestamp >= f.timestamp && timestamp <= f.timestamp + flagDuration;
    });

    // Add ripple effect
    setRipples(prev => [...prev, { x, timestamp }]);
    setTimeout(() => {
      setRipples(prev => prev.slice(1));
    }, 500);

    onSeek(timestamp, flag?.id);
  };

  // Generate time markers (every 30 seconds)
  const timeMarkers = [];
  for (let i = 0; i <= duration; i += 30) {
    timeMarkers.push(i);
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-[18px] font-semibold text-white mb-1" style={{ fontWeight: 600 }}>
          Presentation Timeline
        </h2>
        <p className="text-[13px] text-gray-400">
          Red zones indicate body-language contradictions
        </p>
      </div>

      {/* Timeline container */}
      <div ref={containerRef} className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="w-full rounded-lg cursor-pointer"
          style={{ display: 'block' }}
        />

        {/* Ripple effects */}
        {ripples.map((ripple, index) => (
          <div
            key={index}
            className="absolute top-0 pointer-events-none"
            style={{
              left: `${(ripple.x / (containerRef.current?.offsetWidth || 1)) * 100}%`,
              transform: 'translate(-50%, 0)',
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-white animate-ping" />
          </div>
        ))}

        {/* Time markers */}
        <div className="flex justify-between mt-2 px-1">
          {timeMarkers.map(time => (
            <div key={time} className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-600 mb-1" />
              <span className="text-[11px] text-gray-400">
                {formatTimestamp(time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: containerRef.current ? containerRef.current.getBoundingClientRect().top - 10 : 0,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-xl">
            <div className="text-[13px] font-semibold text-white mb-1" style={{ fontWeight: 600 }}>
              {formatTimestamp(tooltip.timestamp)}
            </div>
            
            {tooltip.flag ? (
              <>
                <div className="text-[12px] text-gray-300 mb-1">
                  {tooltip.flag.severity === 'HIGH' && '❌ '}
                  {tooltip.flag.severity === 'MEDIUM' && '⚠️ '}
                  {tooltip.flag.severity === 'LOW' && '✓ '}
                  {tooltip.flag.type.replace(/_/g, ' ')}
                </div>
                <div className="text-[11px] text-gray-400 max-w-xs line-clamp-2">
                  {tooltip.flag.description}
                </div>
              </>
            ) : (
              <div className="text-[12px] text-green-300">
                🟢 Coherent
              </div>
            )}

            {/* Arrow pointing down */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <span className="text-[12px] text-gray-400">Coherent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-[12px] text-gray-400">Critical Issues</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500 rounded-sm" />
          <span className="text-[12px] text-gray-400">Warnings</span>
        </div>
      </div>
    </div>
  );
}