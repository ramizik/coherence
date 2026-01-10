/**
 * Domain Types - Backend Contract
 * 
 * These interfaces define the exact shape of data exchanged with the FastAPI backend.
 * Keep in sync with backend/app/models/schemas.py
 */

// ========================
// Core Analysis Types
// ========================

/**
 * Complete analysis result returned by backend
 * Endpoint: GET /api/videos/{videoId}/results
 */
export interface AnalysisResult {
  videoId: string;
  videoUrl: string;           // URL to serve video: /videos/{videoId}.mp4
  durationSeconds: number;    // Video duration
  coherenceScore: number;     // 0-100, calculated by backend
  scoreTier: ScoreTier;       // Human-readable tier
  metrics: AnalysisMetrics;
  dissonanceFlags: DissonanceFlag[];
  timelineHeatmap: TimelinePoint[];  // For timeline visualization
  strengths: string[];        // What presenter did well
  priorities: string[];       // Top 3 improvement areas
  transcript?: TranscriptSegment[];  // Optional, for transcript view
}

export type ScoreTier = 'Needs Work' | 'Good Start' | 'Strong';

/**
 * Metrics extracted from video analysis
 */
export interface AnalysisMetrics {
  eyeContact: number;         // Percentage (0-100)
  fillerWords: number;        // Count of "um", "uh", "like", etc.
  fidgeting: number;          // Count of fidgeting instances
  speakingPace: number;       // Words per minute (WPM)
  speakingPaceTarget?: string; // e.g., "140-160" WPM
}

/**
 * A single dissonance flag (visual-verbal mismatch)
 */
export interface DissonanceFlag {
  id: string;                 // Unique identifier
  timestamp: number;          // Seconds from video start
  endTimestamp?: number;      // End time for clip duration
  type: DissonanceType;
  severity: Severity;
  description: string;        // What was detected
  coaching: string;           // Actionable fix advice
  visualEvidence?: string;    // What TwelveLabs detected
  verbalEvidence?: string;    // What Deepgram transcribed
}

export type DissonanceType =
  | 'EMOTIONAL_MISMATCH'      // Happy words + anxious face
  | 'MISSING_GESTURE'         // "Look at this" without pointing
  | 'PACING_MISMATCH';        // Dense slide shown too briefly

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Point on the timeline heatmap
 */
export interface TimelinePoint {
  timestamp: number;          // Seconds
  severity: Severity;         // Color coding
}

/**
 * Optional transcript segment for detailed view
 */
export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

// ========================
// API Request/Response Types
// ========================

/**
 * Response from video upload
 * Endpoint: POST /api/videos/upload
 */
export interface UploadResponse {
  videoId: string;
  status: 'processing';
  estimatedTime: number;      // Seconds until complete
  durationSeconds: number;    // Video duration
}

/**
 * Response from status check
 * Endpoint: GET /api/videos/{videoId}/status
 */
export interface StatusResponse {
  videoId: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;           // 0-100
  stage: string;              // Current processing step (for UX)
  etaSeconds?: number;        // Estimated time remaining
  error?: string;             // Error message if status === 'error'
}

/**
 * Standard error response from backend
 */
export interface ApiError {
  error: string;              // User-friendly message
  code: string;               // Error code (e.g., 'VIDEO_TOO_LARGE')
  retryable: boolean;         // Show retry button if true
}

/**
 * Response for sample video
 */
export interface SampleVideoResponse {
  videoId: string;
  status: 'complete';
}

// ========================
// Component Props Types
// ========================

export interface VideoPlayerProps {
  videoUrl: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
}

export interface TimelineProps {
  flags: DissonanceFlag[];
  duration: number;        // Total video duration in seconds
  currentTime?: number;    // Current playhead position
  onSeek: (timestamp: number) => void;
}

export interface CoachingCardProps {
  flag: DissonanceFlag;
  onJumpTo?: (timestamp: number) => void;
}

export interface ScoreBadgeProps {
  score: number;           // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export interface MetricsRowProps {
  metrics: AnalysisMetrics;
}
