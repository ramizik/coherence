import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchResults, getVideoStreamUrl, VideoAnalysisError } from '../../lib/api';
import { mockAnalysisResult, type AnalysisResult } from '../../lib/mock-data';
import { CoachingCard } from './CoachingCard';
import { CompactMetrics } from './CompactMetrics';
import { DissonanceTimeline } from './DissonanceTimeline';
import { GeminiSummaryCard } from './GeminiSummaryCard';
import { ScoreBadge } from './ScoreBadge';
import { TranscriptPanel } from './TranscriptPanel';
import { VideoPlayer } from './VideoPlayer';

interface ResultsPageProps {
  videoId: string;
  onBackToUpload?: () => void;
}

/**
 * ResultsPage - Comprehensive presentation analysis dashboard
 *
 * Main results page showing video analysis with coaching insights
 *
 * BACKEND_HOOK: Fetch analysis results on page load
 * ─────────────────────────────────────────
 * Endpoint: GET /api/videos/{videoId}/results
 * Request:  None (videoId in URL path)
 * Response: AnalysisResult (see mock-data.ts)
 * Success:  Display results dashboard
 * Error:    Show error page with retry option
 * Status:   CONNECTED ✅
 * ─────────────────────────────────────────
 */
export function ResultsPage({ videoId, onBackToUpload }: ResultsPageProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [dismissedFlags, setDismissedFlags] = useState<Set<string>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis results from backend
  useEffect(() => {
    let isMounted = true;

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching results for videoId:', videoId);
        const result = await fetchResults(videoId);
        if (isMounted) {
          // Update video URL to use streaming endpoint
          result.videoUrl = getVideoStreamUrl(videoId);
          setAnalysisResult(result);
          console.log('Results loaded:', result);
        }
      } catch (err) {
        console.error('Failed to fetch results:', err);
        if (isMounted) {
          if (err instanceof VideoAnalysisError) {
            setError(err.message);
          } else {
            setError('Failed to load analysis results. Please try again.');
          }
          // Fall back to mock data for demo reliability
          console.log('Using mock data as fallback');
          setAnalysisResult(mockAnalysisResult);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchResults(videoId)
      .then((result) => {
        result.videoUrl = getVideoStreamUrl(videoId);
        setAnalysisResult(result);
      })
      .catch((err) => {
        setError(err.message);
        setAnalysisResult(mockAnalysisResult);
      })
      .finally(() => setIsLoading(false));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Error state (without fallback data)
  if (error && !analysisResult) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Failed to Load Results</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            {onBackToUpload && (
              <button
                onClick={onBackToUpload}
                className="px-6 py-2.5 rounded-lg font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Back to Upload
              </button>
            )}
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use result (or fallback to mock)
  const result = analysisResult || mockAnalysisResult;

  // Filter out dismissed flags
  const activeFlags = result.dissonanceFlags.filter(
    flag => !dismissedFlags.has(flag.id)
  );

  const handleSeek = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDismissFlag = (flagId: string) => {
    setDismissedFlags(prev => new Set(prev).add(flagId));
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-[1600px] mx-auto px-10 py-10">

        {/* Back Button */}
        {onBackToUpload && (
          <button
            onClick={onBackToUpload}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span className="text-[14px]">Back to Upload</span>
          </button>
        )}

        {/* Error banner if using fallback data */}
        {error && result && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-200 text-sm">
              Could not load real results. Showing demo data. {error}
            </p>
          </div>
        )}

        {/* Header with Score and Video Info */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between gap-8 mb-6">

            {/* Left: Score Badge + Video Info */}
            <div className="flex items-center gap-8 flex-1 min-w-0">
              {/* Score Badge */}
              <div className="flex-shrink-0">
                <ScoreBadge score={result.coherenceScore} size="lg" />
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] font-bold text-white mb-3 truncate">
                  {result.videoTitle}
                </h1>
                <div className="flex items-center gap-4 text-[13px] text-gray-400">
                  <span>Analyzed {result.uploadDate}</span>
                  <span>•</span>
                  <span>Duration: {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Right: Gemini AI Summary Card */}
            {result.geminiReport && (
              <div className="flex-shrink-0">
                <GeminiSummaryCard
                  coachingAdvice={result.geminiReport.coachingAdvice}
                  headline={result.geminiReport.headline}
                />
              </div>
            )}
          </div>

          {/* Compact Metrics Bar */}
          <div className="pt-6 border-t border-white/[0.08]">
            <CompactMetrics metrics={result.metrics} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-8">

          {/* LEFT: Video Player */}
          <div className="space-y-6">
            <VideoPlayer
              videoUrl={result.videoUrl}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onSeek={handleSeek}
            />

            {/* Timeline below video */}
            <DissonanceTimeline
              flags={result.dissonanceFlags}
              duration={result.duration}
              currentTime={currentTime}
              onSeek={handleSeek}
            />

            {/* Transcript Panel - convert transcript segments to word-level format */}
            {result.transcript && result.transcript.length > 0 && (
              <TranscriptPanel
                transcript={result.transcript.flatMap(seg =>
                  seg.text.split(' ').map((word, idx) => ({
                    text: word,
                    startTime: seg.timestamp + (idx * 0.3),
                    endTime: seg.timestamp + ((idx + 1) * 0.3),
                    isFiller: ['um', 'uh', 'like', 'you know'].some(f =>
                      word.toLowerCase().includes(f)
                    ),
                  }))
                )}
                currentTime={currentTime}
                onWordClick={handleSeek}
              />
            )}
          </div>

          {/* RIGHT: Coaching Cards */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-white">
                Coaching Insights
                <span className="ml-2 text-[14px] text-gray-400">
                  ({activeFlags.length} issues detected)
                </span>
              </h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {activeFlags.length > 0 ? (
                activeFlags.map((flag) => (
                  <CoachingCard
                    key={flag.id}
                    flag={flag}
                    onSeek={handleSeek}
                    onDismiss={handleDismissFlag}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nothing to see here!</h3>
                  <p className="text-gray-400 text-sm">All coaching insights have been dismissed.</p>
                </div>
              )}
            </div>

            {/* Gradient fade-out overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none bg-gradient-to-t from-[#0F172A] to-transparent" />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(173, 70, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(173, 70, 255, 0.5);
        }

        /* Smooth transitions for card dismissal */
        .space-y-4 > * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}