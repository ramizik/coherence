'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { loadSampleVideo, VideoAnalysisError } from '@/lib/services/videoAnalysis';

interface SampleVideo {
  id: string;
  title: string;
  score: number;
  thumbnail: string;
}

const sampleVideos: SampleVideo[] = [
  {
    id: 'sample-1',
    title: 'Nervous Student',
    score: 42,
    thumbnail: 'nervous'
  },
  {
    id: 'sample-2',
    title: 'Confident Pitch',
    score: 89,
    thumbnail: 'confident'
  },
  {
    id: 'sample-3',
    title: 'Mixed Signals',
    score: 61,
    thumbnail: 'mixed'
  }
];

/**
 * SampleVideos - Display sample video cards for quick testing
 * 
 * Shows three pre-analyzed videos with different coherence scores
 */
export function SampleVideos() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSampleClick = async (video: SampleVideo) => {
    // BACKEND_HOOK: Load sample video analysis
    // ─────────────────────────────────────────
    // Endpoint: GET /api/videos/samples/{sampleId}
    // Request:  None (sampleId in URL path)
    // Response: SampleVideoResponse { videoId, status }
    // Success:  Navigate to /results/{videoId}
    // Error:    Show error toast
    // Status:   CONNECTED ✅
    // ─────────────────────────────────────────
    
    setLoadingId(video.id);
    setError(null);
    
    try {
      const response = await loadSampleVideo(video.id);
      console.log('Sample video loaded:', response);
      // In real implementation with routing: router.push(`/results/${response.videoId}`);
      // For now, just log and show success
      alert(`Sample "${video.title}" loaded! In production, this would navigate to /results/${response.videoId}`);
    } catch (err) {
      console.error('Failed to load sample:', err);
      if (err instanceof VideoAnalysisError) {
        setError(err.message);
      } else {
        setError('Failed to load sample. Please check if the backend is running.');
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Section Header */}
      <p className="text-[14px] font-medium text-[#9CA3AF] mb-4 text-center" style={{ fontWeight: 500 }}>
        Or try a sample:
      </p>

      {/* Error Message */}
      {error && (
        <p className="text-[13px] text-[#EF4444] text-center mb-3">
          {error}
        </p>
      )}

      {/* Sample Cards */}
      <div className="flex gap-3 justify-center">
        {sampleVideos.map((video) => (
          <SampleVideoCard 
            key={video.id}
            video={video}
            onClick={() => handleSampleClick(video)}
            isLoading={loadingId === video.id}
            disabled={loadingId !== null}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SampleVideoCard - Minimal sample video card with glassmorphic design
 */
function SampleVideoCard({ 
  video, 
  onClick,
  isLoading = false,
  disabled = false,
}: { 
  video: SampleVideo;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 76) return '#10B981'; // Green - Success
    if (score >= 51) return '#F59E0B'; // Amber - Warning
    return '#EF4444'; // Red - Danger
  };

  const scoreColor = getScoreColor(video.score);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex-1 max-w-[180px]
        bg-white/5 backdrop-blur-md border border-white/10
        rounded-xl p-5
        hover:bg-white/8 hover:border-[#8B5CF6]/30
        transition-all duration-300 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10
      `}
    >
      {/* Play Icon */}
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/50 transition-all duration-300">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
        ) : (
          <Play className="w-5 h-5 text-white/60 group-hover:text-[#8B5CF6] transition-colors duration-300" />
        )}
      </div>

      {/* Title */}
      <p className="text-[14px] font-medium text-white/90 text-center mb-3 leading-tight" style={{ fontWeight: 500 }}>
        {video.title}
      </p>

      {/* Score */}
      <div className="flex items-center justify-center gap-1.5">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: scoreColor }}
        />
        <span className="text-[13px] text-white/70">
          {video.score}/100
        </span>
      </div>
    </button>
  );
}