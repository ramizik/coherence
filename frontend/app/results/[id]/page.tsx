'use client';

import { Calendar, Clock, Video } from 'lucide-react';
import { mockAnalysisResult } from '@/lib/mock-data';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { VideoPlayer } from '@/components/dashboard/VideoPlayer';
import { CoachingCards } from '@/components/dashboard/CoachingCards';
import { DissonanceTimeline } from '@/components/dashboard/DissonanceTimeline';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { TranscriptPanel } from '@/components/dashboard/TranscriptPanel';
import { useState, useRef } from 'react';

/**
 * Results Dashboard Page
 * 
 * The most important page in Coherence - displays comprehensive presentation analysis
 * including coherence score, video playback, coaching insights, timeline, and metrics.
 * 
 * BACKEND_HOOK: Fetch analysis results on page load
 * GET /api/videos/{videoId}/results
 * Returns: AnalysisResult object
 */
export default function ResultsPage({ params }: { params: { id: string } }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // BACKEND_HOOK: In production, fetch data based on params.id
  // const { data: analysisResult } = useAnalysisResult(params.id);
  const analysisResult = mockAnalysisResult;

  // Handle seeking video from timeline or coaching cards
  const handleSeek = (timestamp: number, flagId?: string) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
      
      if (flagId) {
        setSelectedFlagId(flagId);
        // Clear selection after 2 seconds
        setTimeout(() => setSelectedFlagId(null), 2000);
      }
    }
  };

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-x-hidden">
      {/* Subtle noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Main container */}
      <div className="relative max-w-[1600px] mx-auto px-10 py-10">
        
        {/* SECTION 1: HEADER */}
        <header className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between gap-8">
            
            {/* Left: Score Ring */}
            <div className="flex-shrink-0">
              <ScoreRing score={analysisResult.coherenceScore} />
            </div>

            {/* Center: Video Title & Metadata */}
            <div className="flex-1 min-w-0 px-6">
              <h1 className="text-[20px] font-semibold text-white mb-3 truncate" style={{ fontWeight: 600 }}>
                {analysisResult.videoTitle}
              </h1>
              
              <div className="flex items-center gap-4 text-[13px] text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>Analyzed {analysisResult.uploadDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span>Duration: {Math.floor(analysisResult.duration / 60)}:{(analysisResult.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4" strokeWidth={2} />
                  <span>{analysisResult.resolution} • {analysisResult.fileSize}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex-shrink-0">
              <QuickStats metrics={analysisResult.metrics} />
            </div>
          </div>
        </header>

        {/* SECTION 2: MAIN CONTENT GRID */}
        <div className="grid grid-cols-[40%_60%] gap-8 mb-8">
          
          {/* Left: Video Player */}
          <div>
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={analysisResult.videoUrl}
              duration={analysisResult.duration}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onSeek={handleSeek}
              flags={analysisResult.dissonanceFlags}
            />
          </div>

          {/* Right: Coaching Cards */}
          <div>
            <CoachingCards
              flags={analysisResult.dissonanceFlags}
              onSeek={handleSeek}
              selectedFlagId={selectedFlagId}
            />
          </div>
        </div>

        {/* SECTION 3: DISSONANCE TIMELINE */}
        <div className="mb-8">
          <DissonanceTimeline
            flags={analysisResult.dissonanceFlags}
            duration={analysisResult.duration}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>

        {/* SECTION 4: DETAILED METRICS GRID */}
        <div className="mb-8">
          <MetricsGrid metrics={analysisResult.metrics} />
        </div>

        {/* SECTION 5: TRANSCRIPT PANEL */}
        <div>
          <TranscriptPanel
            transcript={analysisResult.transcript}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  );
}
