/**
 * TypeScript types matching backend Pydantic schemas.
 *
 * These types mirror the FastAPI backend models in backend/app/models/schemas.py.
 * Use these for API communication.
 */

// ========================
// Enums
// ========================

export type ScoreTier = 'Needs Work' | 'Good Start' | 'Strong';

export type DissonanceType = 'EMOTIONAL_MISMATCH' | 'MISSING_GESTURE' | 'PACING_MISMATCH';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProcessingStatus = 'queued' | 'processing' | 'complete' | 'error';

// ========================
// Core Analysis Types (Backend Schema)
// ========================

export interface ApiAnalysisMetrics {
  eyeContact: number; // percentage 0-100
  fillerWords: number; // count
  fidgeting: number; // count
  speakingPace: number; // WPM
  speakingPaceTarget?: string; // e.g., "140-160"
}

export interface ApiDissonanceFlag {
  id: string;
  timestamp: number; // seconds from video start
  endTimestamp?: number; // end time for clip duration
  type: DissonanceType;
  severity: Severity;
  description: string;
  coaching: string;
  visualEvidence?: string; // What TwelveLabs detected
  verbalEvidence?: string; // What Deepgram transcribed
}

export interface ApiTimelinePoint {
  timestamp: number;
  severity: Severity;
}

export interface ApiTranscriptSegment {
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface ApiAnalysisResult {
  videoId: string;
  videoUrl: string;
  durationSeconds: number;
  coherenceScore: number; // 0-100
  scoreTier: ScoreTier;
  metrics: ApiAnalysisMetrics;
  dissonanceFlags: ApiDissonanceFlag[];
  timelineHeatmap: ApiTimelinePoint[];
  strengths: string[];
  priorities: string[];
  transcript?: ApiTranscriptSegment[];
}

// ========================
// API Request/Response Types
// ========================

export interface UploadResponse {
  videoId: string;
  status: string;
  estimatedTime: number; // seconds until complete
  durationSeconds: number;
}

export interface StatusResponse {
  videoId: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  stage: string; // Current processing step for UX
  etaSeconds?: number;
  error?: string;
}

export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

export interface SampleVideoResponse {
  videoId: string;
  status: string;
}
