'use client';

import { AlertCircle, Loader2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

// API base URL
const API_BASE = 'http://localhost:8000';

interface SampleVideo {
  id: string;
  title: string;
  score: number;
  scoreTier: string;
  isCached: boolean;
  flagCount: number;
}

interface SampleVideosProps {
  /** Callback when a sample is selected - navigates to results */
  onSelectSample: (sampleId: string) => void;
}

/**
 * SampleVideos - Display sample video cards with real analysis data
 *
 * Fetches actual analysis results (scores, tiers) from backend.
 * Clicking a sample immediately loads the cached results page.
 */
export function SampleVideos({ onSelectSample }: SampleVideosProps) {
  const [samples, setSamples] = useState<SampleVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fetch sample videos data on mount
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/videos/samples`);
        if (!response.ok) {
          throw new Error('Failed to fetch samples');
        }
        const data = await response.json();
        setSamples(data.samples || []);
      } catch (err) {
        console.error('Failed to load sample videos:', err);
        setError('Could not load samples');
        // Fallback to placeholder data
        setSamples([
          { id: 'sample-1', title: 'Sample 1', score: 70, scoreTier: 'Good Start', isCached: false, flagCount: 0 },
          { id: 'sample-2', title: 'Sample 2', score: 70, scoreTier: 'Good Start', isCached: false, flagCount: 0 },
          { id: 'sample-3', title: 'Sample 3', score: 70, scoreTier: 'Good Start', isCached: false, flagCount: 0 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSamples();
  }, []);

  const handleSampleClick = (video: SampleVideo) => {
    // Prevent double-clicks
    if (loadingId) return;

    setLoadingId(video.id);
    console.log('Loading sample video:', video.title, '→ videoId:', video.id);

    // Navigate to results page with small delay for visual feedback
    // Cached results will load instantly on the results page
    setTimeout(() => {
      onSelectSample(video.id);
    }, 300);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <p className="text-[14px] font-medium text-[#9CA3AF] mb-4 text-center" style={{ fontWeight: 500 }}>
          Or try a sample:
        </p>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 max-w-[180px] h-[160px] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Section Header */}
      <p className="text-[14px] font-medium text-[#9CA3AF] mb-4 text-center" style={{ fontWeight: 500 }}>
        Or try a sample:
      </p>

      {/* Error indicator */}
      {error && (
        <div className="flex items-center justify-center gap-2 text-amber-400 text-xs mb-3">
          <AlertCircle className="w-3 h-3" />
          <span>Using placeholder data</span>
        </div>
      )}

      {/* Sample Cards */}
      <div className="flex gap-3 justify-center">
        {samples.map((video) => (
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
  isLoading,
  disabled,
}: {
  video: SampleVideo;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 76) return '#10B981'; // Green - Strong
    if (score >= 51) return '#F59E0B'; // Amber - Good Start
    return '#EF4444'; // Red - Needs Work
  };

  const scoreColor = getScoreColor(video.score);

  // Get tier label for display
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'Strong':
        return 'Strong';
      case 'Good Start':
        return 'Good';
      case 'Needs Work':
        return 'Needs Practice';
      default:
        return tier;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex-1 max-w-[180px]
        bg-white/5 backdrop-blur-md border border-white/10
        rounded-xl p-5
        transition-all duration-300
        ${disabled && !isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/8 hover:border-[#8B5CF6]/30'}
        ${isLoading ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/10' : ''}
      `}
    >
      {/* Play Icon / Loading Spinner */}
      <div className={`
        flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full
        border transition-all duration-300
        ${isLoading
          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50'
          : 'bg-white/5 border-white/10 group-hover:bg-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/50'
        }
      `}>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
        ) : (
          <Play className="w-5 h-5 text-white/60 group-hover:text-[#8B5CF6] transition-colors duration-300" />
        )}
      </div>

      {/* Title */}
      <p className="text-[14px] font-medium text-white/90 text-center mb-2 leading-tight" style={{ fontWeight: 500 }}>
        {video.title}
      </p>

      {/* Score Tier Badge */}
      <div
        className="text-[11px] font-medium text-center mb-2 px-2 py-0.5 rounded-full mx-auto w-fit"
        style={{
          backgroundColor: `${scoreColor}20`,
          color: scoreColor,
        }}
      >
        {getTierLabel(video.scoreTier)}
      </div>

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

      {/* Flag count indicator */}
      {video.flagCount > 0 && (
        <div className="text-[10px] text-white/40 text-center mt-2">
          {video.flagCount} insight{video.flagCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Not cached indicator */}
      {!video.isCached && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-amber-400/60" title="Not pre-processed" />
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <span className="text-xs text-white/70">Loading...</span>
        </div>
      )}
    </button>
  );
}
