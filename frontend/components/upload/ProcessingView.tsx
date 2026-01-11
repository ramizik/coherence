'use client';

import { AlertCircle, Brain, Loader2, Sparkles, Video, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { pollStatus, STATUS_POLL_INTERVAL, VideoAnalysisError } from '../../lib/api';
import type { StatusResponse } from '../../types/api';
import { FloatingHexagons } from './FloatingHexagons';

interface ProcessingViewProps {
  videoId: string;
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
 * - Real-time status from backend API
 * - Glassmorphic card design matching brand aesthetic
 * - Auto-redirects when processing completes
 *
 * BACKEND_HOOK: Poll processing status
 * ─────────────────────────────────────────
 * Endpoint: GET /api/videos/{videoId}/status
 * Request:  None (videoId in URL path)
 * Response: StatusResponse { videoId, status, progress, stage, etaSeconds, error }
 * Success:  Update UI with progress; navigate to /results when complete
 * Error:    Show error state, offer retry
 * Polling:  Every 3 seconds until status !== 'processing'
 * Status:   CONNECTED ✅
 * ─────────────────────────────────────────
 */
export function ProcessingView({ videoId, videoName, onComplete, onCancel }: ProcessingViewProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Queued for processing...');
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Poll status from backend
  const checkStatus = useCallback(async () => {
    try {
      const status: StatusResponse = await pollStatus(videoId);

      setProgress(status.progress);
      setStatusMessage(status.stage);
      setError(null);

      // Update message index based on progress
      if (status.progress < 33) setCurrentMessageIndex(0);
      else if (status.progress < 66) setCurrentMessageIndex(1);
      else setCurrentMessageIndex(2);

      if (status.status === 'complete') {
        setTimeout(() => onComplete(), 500);
        return true; // Stop polling
      }

      if (status.status === 'error') {
        setError(status.error || 'Processing failed');
        return true; // Stop polling
      }

      return false; // Continue polling
    } catch (err) {
      console.error('Status poll failed:', err);
      if (err instanceof VideoAnalysisError) {
        setError(err.message);
      } else {
        setError('Failed to check status. Please check if the backend is running.');
      }
      return true; // Stop polling on error
    }
  }, [videoId, onComplete]);

  // Status polling effect
  useEffect(() => {
    let isMounted = true;
    let pollTimeout: NodeJS.Timeout;

    const poll = async () => {
      if (!isMounted) return;

      const shouldStop = await checkStatus();

      if (!shouldStop && isMounted) {
        pollTimeout = setTimeout(poll, STATUS_POLL_INTERVAL);
      }
    };

    // Start polling
    poll();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [checkStatus]);

  const CurrentIcon = error ? AlertCircle : statusMessages[currentMessageIndex].icon;
  const displayMessage = error || statusMessage || statusMessages[currentMessageIndex].text;

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
                {progress >= 100 ? 'Complete!' : 'Processing...'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          <div className={`flex items-center justify-center gap-3 py-6 px-8 rounded-xl border ${
            error
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-white/5 border-white/10'
          }`}>
            <CurrentIcon
              className={`w-5 h-5 ${error ? 'text-[#EF4444]' : 'text-[#06B6D4]'}`}
              strokeWidth={2}
            />
            <p
              className={`text-[15px] font-medium ${error ? 'text-[#EF4444]' : 'text-white/80'}`}
              style={{ fontWeight: 500 }}
            >
              {displayMessage}
            </p>
          </div>

          {/* Info text */}
          <p className="text-[13px] text-white/40 text-center mt-8">
            {error
              ? 'Please try again or contact support if the issue persists.'
              : "This usually takes a few seconds. We're analyzing both your speech and body language."}
          </p>
        </div>
      </div>

      {/* Custom animation for shimmer effect */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
