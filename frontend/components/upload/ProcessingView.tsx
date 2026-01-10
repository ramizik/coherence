'use client';

import { useEffect, useState } from 'react';
import { Loader2, Video, Brain, Sparkles, X } from 'lucide-react';
import { FloatingHexagons } from './FloatingHexagons';

interface ProcessingViewProps {
  videoName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface StatusMessage {
  text: string;
  icon: typeof Video;
}

const statusMessages: StatusMessage[] = [
  {
    text: 'Analyzing speech patterns...',
    icon: Video
  },
  {
    text: 'Detecting body language...',
    icon: Brain
  },
  {
    text: 'Generating insights...',
    icon: Sparkles
  }
];

/**
 * ProcessingView - Loading animation shown while video is being analyzed
 * 
 * Features:
 * - Animated progress bar with gradient
 * - Rotating status messages
 * - Glassmorphic design matching brand aesthetic
 * - Auto-completes after 30 seconds (mock)
 * 
 * BACKEND_HOOK: Poll processing status
 * API: GET /api/videos/{videoId}/status
 * Response: { status: 'processing' | 'complete', progress: 0-100 }
 * Redirect to /results when status === 'complete'
 */
export function ProcessingView({ videoName, onComplete, onCancel }: ProcessingViewProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Progress bar animation
  useEffect(() => {
    const duration = 30000; // 30 seconds total
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Delay slightly before completing to show 100%
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Rotate status messages every 10 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 10000);

    return () => clearInterval(messageInterval);
  }, []);

  const CurrentIcon = statusMessages[currentMessageIndex].icon;

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      {/* Floating hexagons with facts */}
      <FloatingHexagons />
      
      <div className="max-w-2xl w-full px-8">
        {/* Processing Card */}
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12">
          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#EF4444]/50 text-white/60 hover:text-[#EF4444] transition-all duration-200 group"
            aria-label="Cancel upload"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            {/* Animated spinner icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] opacity-20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-[32px] font-bold text-white mb-3" style={{ fontWeight: 700 }}>
              Analyzing Your Presentation
            </h2>

            {/* Video name */}
            <p className="text-[14px] text-white/60">
              {videoName}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            {/* Progress background */}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              {/* Progress fill with gradient */}
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#06B6D4] rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Progress percentage */}
            <div className="flex justify-between items-center mt-3">
              <p className="text-[13px] text-white/40">
                {Math.round(progress)}%
              </p>
              <p className="text-[13px] text-white/40">
                {progress < 100 ? 'Processing...' : 'Complete!'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-center gap-3 py-6 px-8 bg-white/5 rounded-xl border border-white/10">
            <CurrentIcon className="w-5 h-5 text-[#06B6D4]" strokeWidth={2} />
            <p className="text-[15px] text-white/80 font-medium" style={{ fontWeight: 500 }}>
              {statusMessages[currentMessageIndex].text}
            </p>
          </div>

          {/* Info text */}
          <p className="text-[13px] text-white/40 text-center mt-8">
            This usually takes 20-30 seconds. We're analyzing both your speech and body language.
          </p>
        </div>
      </div>
    </div>
  );
}