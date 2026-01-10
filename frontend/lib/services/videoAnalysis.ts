/**
 * Video Analysis API Service
 * 
 * Handles all API communication with the backend for video analysis.
 * All functions are typed with interfaces from @/types/index.ts
 */
import { API_BASE_URL } from '@/lib/config';
import type {
  UploadResponse,
  StatusResponse,
  AnalysisResult,
  ApiError,
  SampleVideoResponse,
} from '@/types';

// ========================
// Error Handling
// ========================

/**
 * Custom error class for API errors
 */
export class VideoAnalysisError extends Error {
  code: string;
  retryable: boolean;

  constructor(apiError: ApiError) {
    super(apiError.error);
    this.name = 'VideoAnalysisError';
    this.code = apiError.code;
    this.retryable = apiError.retryable;
  }
}

/**
 * Handle API response and extract JSON or throw error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let apiError: ApiError;
    
    try {
      const errorData = await response.json();
      apiError = errorData.detail || errorData;
    } catch {
      apiError = {
        error: `Request failed with status ${response.status}`,
        code: 'UNKNOWN_ERROR',
        retryable: response.status >= 500,
      };
    }
    
    throw new VideoAnalysisError(apiError);
  }
  
  return response.json();
}

// ========================
// API Functions
// ========================

/**
 * Upload a video file for analysis.
 * 
 * BACKEND_HOOK: Upload video file
 * ─────────────────────────────────────────
 * Endpoint: POST /api/videos/upload
 * Request:  FormData with 'video' field (MP4/MOV/WebM, max 500MB)
 * Response: UploadResponse { videoId, status, estimatedTime, durationSeconds }
 * Success:  Navigate to /processing/{videoId}
 * Error:    Show toast with error.message, allow retry if retryable
 * Status:   CONNECTED ✅
 * ─────────────────────────────────────────
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser sets it with boundary
  });

  return handleResponse<UploadResponse>(response);
}

/**
 * Poll the processing status of a video.
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
export async function pollStatus(videoId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/status`);
  return handleResponse<StatusResponse>(response);
}

/**
 * Fetch the complete analysis results for a video.
 * 
 * BACKEND_HOOK: Fetch analysis results
 * ─────────────────────────────────────────
 * Endpoint: GET /api/videos/{videoId}/results
 * Request:  None (videoId in URL path)
 * Response: AnalysisResult (see types/index.ts for full interface)
 * Success:  Display results dashboard
 * Error:    Show error page with retry option
 * Caching:  Results can be cached client-side by videoId
 * Status:   CONNECTED ✅
 * ─────────────────────────────────────────
 */
export async function fetchResults(videoId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/results`);
  return handleResponse<AnalysisResult>(response);
}

/**
 * Load a pre-analyzed sample video.
 * 
 * BACKEND_HOOK: Load sample video
 * ─────────────────────────────────────────
 * Endpoint: GET /api/videos/samples/{sampleId}
 * Request:  None (sampleId in URL path)
 * Response: SampleVideoResponse { videoId, status }
 * Success:  Navigate to /results/{videoId}
 * Error:    Show error toast
 * Status:   CONNECTED ✅
 * ─────────────────────────────────────────
 */
export async function loadSampleVideo(sampleId: string): Promise<SampleVideoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/videos/samples/${sampleId}`);
  return handleResponse<SampleVideoResponse>(response);
}

/**
 * Get the video streaming URL.
 * 
 * This returns a URL that can be used in a <video> element's src attribute.
 */
export function getVideoStreamUrl(videoId: string): string {
  return `${API_BASE_URL}/api/videos/${videoId}/stream`;
}

// ========================
// Utility Functions
// ========================

/**
 * Validate a video file before upload.
 * 
 * @returns Error message or null if valid
 */
export function validateVideoFile(file: File): string | null {
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid video format: ${file.type}. Please use MP4, MOV, or WebM.`;
  }

  if (file.size > MAX_SIZE) {
    return `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 500MB.`;
  }

  return null;
}

/**
 * Format timestamp as MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
