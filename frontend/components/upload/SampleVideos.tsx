'use client';

import { Play } from 'lucide-react';

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
  const handleSampleClick = (video: SampleVideo) => {
    // BACKEND_HOOK: Load sample video analysis
    // API: GET /api/videos/samples/{sampleId}
    // Response: { videoId: string, status: 'complete' }
    // Success: Redirect to /results/{videoId}
    
    console.log('Loading sample video:', video.title, '→ videoId:', video.id);
    // In real implementation: router.push(`/results/${video.id}`);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Section Header */}
      <p className="text-[14px] font-medium text-[#9CA3AF] mb-4 text-center" style={{ fontWeight: 500 }}>
        Or try a sample:
      </p>

      {/* Sample Cards */}
      <div className="flex gap-3 justify-center">
        {sampleVideos.map((video) => (
          <SampleVideoCard 
            key={video.id}
            video={video}
            onClick={() => handleSampleClick(video)}
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
  onClick 
}: { 
  video: SampleVideo;
  onClick: () => void;
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
      className="
        group relative flex-1 max-w-[180px]
        bg-white/5 backdrop-blur-md border border-white/10
        rounded-xl p-5
        hover:bg-white/8 hover:border-[#8B5CF6]/30
        transition-all duration-300 cursor-pointer
      "
    >
      {/* Play Icon */}
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/50 transition-all duration-300">
        <Play className="w-5 h-5 text-white/60 group-hover:text-[#8B5CF6] transition-colors duration-300" />
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