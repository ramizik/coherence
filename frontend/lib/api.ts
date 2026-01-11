/**
 * API Service Layer for Coherence Backend
 *
 * Handles all communication with FastAPI backend.
 * Includes error handling, type conversion, and response transformation.
 */

import type {
  UploadResponse,
  StatusResponse,
  ApiAnalysisResult,
  ApiError,
  SampleVideoResponse,
} from '../types/api';
import type { AnalysisResult, DissonanceFlag, Metrics, TranscriptSegment } from './mock-data';

// ========================
// Configuration
// ========================

// API base URL - use Vite env var or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Polling interval for status checks (ms)
export const STATUS_POLL_INTERVAL = 3000;

// File constraints
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_VIDEO_DURATION = 5 * 60; // 5 minutes
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

// ========================
// Custom Error Class
// ========================

export class VideoAnalysisError extends Error {
  code: string;
  retryable: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', retryable: boolean = false) {
    super(message);
    this.name = 'VideoAnalysisError';
    this.code = code;
    this.retryable = retryable;
  }
}

// ========================
// Helper Functions
// ========================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      throw new VideoAnalysisError(
        `Request failed with status ${response.status}`,
        'HTTP_ERROR',
        response.status >= 500
      );
    }
    throw new VideoAnalysisError(
      errorData.error || 'Request failed',
      errorData.code || 'API_ERROR',
      errorData.retryable || false
    );
  }
  return response.json();
}

/**
 * Validate video file before upload
 */
export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload MP4, MOV, or WebM.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
  }
  return null;
}

// ========================
// API Functions
// ========================

/**
 * Upload a video file for analysis
 *
 * @param file - Video file to upload
 * @returns Upload response with videoId
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new VideoAnalysisError(validationError, 'VALIDATION_ERROR', false);
  }

  const formData = new FormData();
  formData.append('video', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<UploadResponse>(response);
  } catch (error) {
    if (error instanceof VideoAnalysisError) {
      throw error;
    }
    throw new VideoAnalysisError(
      'Failed to upload video. Please check your connection and try again.',
      'NETWORK_ERROR',
      true
    );
  }
}

/**
 * Poll processing status for a video
 *
 * @param videoId - Video ID to check status for
 * @returns Current status response
 */
export async function pollStatus(videoId: string): Promise<StatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/status`);
    return handleResponse<StatusResponse>(response);
  } catch (error) {
    if (error instanceof VideoAnalysisError) {
      throw error;
    }
    throw new VideoAnalysisError(
      'Failed to check processing status.',
      'NETWORK_ERROR',
      true
    );
  }
}

/**
 * Fetch analysis results for a video
 *
 * @param videoId - Video ID to fetch results for
 * @returns Analysis results (transformed to frontend format)
 */
export async function fetchResults(videoId: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/results`);
    const apiResult = await handleResponse<ApiAnalysisResult>(response);

    // Transform backend response to frontend format
    return transformApiResultToFrontend(apiResult);
  } catch (error) {
    if (error instanceof VideoAnalysisError) {
      throw error;
    }
    throw new VideoAnalysisError(
      'Failed to fetch analysis results.',
      'NETWORK_ERROR',
      true
    );
  }
}

/**
 * Load a pre-analyzed sample video
 *
 * @param sampleId - Sample video ID
 * @returns Sample video response
 */
export async function loadSampleVideo(sampleId: string): Promise<SampleVideoResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/samples/${sampleId}`);
    return handleResponse<SampleVideoResponse>(response);
  } catch (error) {
    if (error instanceof VideoAnalysisError) {
      throw error;
    }
    throw new VideoAnalysisError(
      'Failed to load sample video.',
      'NETWORK_ERROR',
      true
    );
  }
}

/**
 * Get video stream URL
 *
 * @param videoId - Video ID
 * @returns Full URL for video streaming
 */
export function getVideoStreamUrl(videoId: string): string {
  return `${API_BASE_URL}/api/videos/${videoId}/stream`;
}

// ========================
// Data Transformation
// ========================

/**
 * Transform backend API response to frontend AnalysisResult format.
 * Maps fields and adds computed/default values for frontend display.
 */
function transformApiResultToFrontend(apiResult: ApiAnalysisResult): AnalysisResult {
  // Transform dissonance flags
  const dissonanceFlags: DissonanceFlag[] = apiResult.dissonanceFlags.map((flag) => ({
    id: flag.id,
    timestamp: flag.timestamp,
    type: mapDissonanceType(flag.type),
    severity: flag.severity,
    description: flag.description,
    quote: flag.verbalEvidence || undefined,
    coaching: flag.coaching,
    confidence: 85, // Default confidence since backend doesn't provide it
    duration: flag.endTimestamp ? flag.endTimestamp - flag.timestamp : undefined,
  }));

  // Transform metrics with default trends (backend doesn't track history)
  const metrics: Metrics = {
    eyeContact: apiResult.metrics.eyeContact,
    fillerWords: apiResult.metrics.fillerWords,
    speakingPace: apiResult.metrics.speakingPace,
    fidgeting: apiResult.metrics.fidgeting,
    // Default trends (no historical data yet)
    eyeContactTrend: 0,
    fillerWordsTrend: 0,
    speakingPaceTrend: 0,
    fidgetingTrend: 0,
  };

  // Transform transcript if present
  const transcript: TranscriptSegment[] = apiResult.transcript
    ? apiResult.transcript.map((seg, idx) => ({
        id: `seg-${idx + 1}`,
        timestamp: seg.start,
        text: seg.text,
        highlight: null,
      }))
    : generateBasicTranscript(apiResult);

  // Build frontend result
  return {
    videoId: apiResult.videoId,
    videoTitle: 'Presentation Analysis', // Backend doesn't store title
    uploadDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    duration: apiResult.durationSeconds,
    fileSize: 'Unknown', // Backend doesn't return file size in results
    resolution: '1080p', // Default
    coherenceScore: apiResult.coherenceScore,
    metrics,
    dissonanceFlags,
    transcript,
    videoUrl: apiResult.videoUrl.startsWith('http')
      ? apiResult.videoUrl
      : `${API_BASE_URL}${apiResult.videoUrl}`,
    // Pass through Gemini comprehensive report if available
    geminiReport: apiResult.geminiReport,
  };
}

/**
 * Map backend dissonance type to frontend type
 * (Frontend has additional types for UI purposes)
 */
function mapDissonanceType(
  type: string
): 'EMOTIONAL_MISMATCH' | 'MISSING_GESTURE' | 'PACING_MISMATCH' | 'EYE_CONTACT_LOSS' | 'FILLER_WORDS' | 'POSITIVE_MOMENT' {
  switch (type) {
    case 'EMOTIONAL_MISMATCH':
      return 'EMOTIONAL_MISMATCH';
    case 'MISSING_GESTURE':
      return 'MISSING_GESTURE';
    case 'PACING_MISMATCH':
      return 'PACING_MISMATCH';
    default:
      return 'EMOTIONAL_MISMATCH';
  }
}

/**
 * Generate basic transcript segments from dissonance flags
 * when backend doesn't provide transcript data.
 */
function generateBasicTranscript(apiResult: ApiAnalysisResult): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  // Add intro segment
  segments.push({
    id: 'seg-intro',
    timestamp: 0,
    text: 'Presentation analysis started...',
    highlight: null,
  });

  // Add segments for each dissonance flag
  apiResult.dissonanceFlags.forEach((flag, idx) => {
    segments.push({
      id: `seg-flag-${idx + 1}`,
      timestamp: flag.timestamp,
      text: flag.verbalEvidence || flag.description,
      highlight: flag.severity === 'HIGH' ? 'mismatch' : null,
      flagId: flag.id,
    });
  });

  // Sort by timestamp
  segments.sort((a, b) => a.timestamp - b.timestamp);

  return segments;
}

// ========================
// PDF Report Generation
// ========================

/**
 * Generate a comprehensive PDF report for a video analysis
 *
 * @param videoId - Video ID to generate report for
 * @returns PDF file as Blob
 */
export async function generateReport(videoId: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/report`, {
      method: 'POST',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate report';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      throw new VideoAnalysisError(errorMessage, 'REPORT_GENERATION_FAILED', true);
    }

    return response.blob();
  } catch (error) {
    if (error instanceof VideoAnalysisError) {
      throw error;
    }
    throw new VideoAnalysisError(
      'Failed to generate PDF report. Please try again.',
      'NETWORK_ERROR',
      true
    );
  }
}

// ========================
// Export API Base URL for components
// ========================

export { API_BASE_URL };
