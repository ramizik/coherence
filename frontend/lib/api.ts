/**
 * API Layer for Coherence
 * 
 * Provides dual-mode operation:
 * 1. Figma Make Mode: Returns mock data immediately
 * 2. Production Mode: Makes real API calls to FastAPI backend
 * 
 * All functions check IS_FIGMA_MAKE_MODE before making real API calls.
 */

import { IS_FIGMA_MAKE_MODE, API_BASE_URL } from './config';
import { mockAnalysisResult, type AnalysisResult } from './mock-data';

// ========================
// Constants
// ========================

/**
 * Polling interval for status checks (milliseconds)
 */
export const STATUS_POLL_INTERVAL = 3000; // 3 seconds

// ========================
// Type Definitions
// ========================

/**
 * Response from video upload
 * Endpoint: POST /api/videos/upload
 */
export interface UploadResponse {
  videoId: string;
  status: 'processing';
  estimatedTime: number; // Seconds
  durationSeconds: number;
}

/**
 * Response from status check
 * Endpoint: GET /api/videos/{videoId}/status
 */
export interface StatusResponse {
  videoId: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  stage: string;
  etaSeconds?: number;
  error?: string;
}

/**
 * Standard error response from backend
 */
export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

/**
 * Custom error class for video analysis errors
 */
export class VideoAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
    this.name = 'VideoAnalysisError';
  }
}

// ========================
// Validation Functions
// ========================

/**
 * Validate video file before upload
 * Returns error message or null if valid
 */
export function validateVideoFile(file: File): string | null {
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please upload a video file (MP4 or MOV format)';
  }
  
  if (file.size > MAX_SIZE) {
    return 'File size must be less than 500MB';
  }
  
  return null;
}

// ========================
// Helper Functions
// ========================

/**
 * Get auth token from storage
 * In Figma Make mode, returns null (no auth needed)
 * In production, retrieves token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  if (IS_FIGMA_MAKE_MODE) {
    return null;
  }
  
  // BACKEND_HOOK: Get auth token from Supabase session
  // ─────────────────────────────────────────
  // Retrieve token from Supabase auth session
  // Returns null if no session exists (allows unauthenticated API calls)
  // Status: CONNECTED ✅
  // ─────────────────────────────────────────
  try {
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null; // Fail gracefully - allow unauthenticated requests
  }
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      retryable: false,
    }));
    
    throw new VideoAnalysisError(
      errorData.error,
      errorData.code,
      errorData.retryable
    );
  }
  
  return response.json();
}

// ========================
// API Functions
// ========================

/**
 * Upload a video file for analysis
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  // Validate file (works in both modes)
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new VideoAnalysisError(validationError, 'VALIDATION_ERROR', false);
  }

  // FIGMA MAKE MODE: Return mock data immediately
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock upload:', file.name);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return {
      videoId: 'demo-video-abc123',
      status: 'processing' as const,
      estimatedTime: 60,
      durationSeconds: 222,
    };
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: Upload video file for analysis
  // ─────────────────────────────────────────
  // Endpoint: POST /api/videos/upload
  // Request:  FormData with 'video' field (MP4/MOV, max 500MB)
  // Response: UploadResponse { videoId, status, estimatedTime }
  // Success:  Navigate to processing view
  // Error:    Show error message, allow retry if retryable
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const formData = new FormData();
  formData.append('video', file);

  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

/**
 * Poll processing status for a video
 */
export async function pollStatus(videoId: string): Promise<StatusResponse> {
  // FIGMA MAKE MODE: Return mock status with incremental progress
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock poll status for:', videoId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate progress that eventually completes
    const mockProgress = Math.min(100, Math.floor(Math.random() * 30) + 70); // 70-100%
    return {
      videoId,
      status: mockProgress >= 100 ? 'complete' : 'processing',
      progress: mockProgress,
      stage: mockProgress >= 100 ? 'Analysis complete!' : 'Analyzing emotional alignment...',
      etaSeconds: mockProgress >= 100 ? 0 : 15,
    };
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: Poll processing status
  // ─────────────────────────────────────────
  // Endpoint: GET /api/videos/{videoId}/status
  // Request:  None (videoId in URL path)
  // Response: StatusResponse { status, progress, stage, etaSeconds }
  // Success:  Update UI with progress; navigate to /results when complete
  // Error:    Show error state, offer retry
  // Polling:  Every 3 seconds until status !== 'processing'
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/status`, {
    headers,
  });
  return handleResponse<StatusResponse>(response);
}

/**
 * Fetch analysis results for a video
 */
export async function fetchResults(videoId: string): Promise<AnalysisResult> {
  // FIGMA MAKE MODE: Return mock results immediately
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock fetch results for:', videoId);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockAnalysisResult;
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: Fetch analysis results
  // ─────────────────────────────────────────
  // Endpoint: GET /api/videos/{videoId}/results
  // Request:  None (videoId in URL path)
  // Response: AnalysisResult (see types in mock-data.ts)
  // Success:  Display results dashboard
  // Error:    Show error page with retry option
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/results`, {
    headers,
  });

  return handleResponse<AnalysisResult>(response);
}

/**
 * Delete a video and its analysis
 */
export async function deleteVideo(videoId: string): Promise<void> {
  // FIGMA MAKE MODE: Mock deletion
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock delete video:', videoId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: Delete video
  // ─────────────────────────────────────────
  // Endpoint: DELETE /api/videos/{videoId}
  // Request:  None (videoId in URL path)
  // Response: Empty (204 No Content)
  // Success:  Navigate back to upload page
  // Error:    Show error message
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Failed to delete video',
      code: 'DELETE_ERROR',
      retryable: true,
    }));
    
    throw new VideoAnalysisError(
      errorData.error,
      errorData.code,
      errorData.retryable
    );
  }
}

/**
 * List all videos for current user
 */
export async function listVideos(): Promise<Array<{
  videoId: string;
  videoTitle: string;
  uploadDate: string;
  duration: number;
  coherenceScore?: number;
  thumbnailUrl?: string;
}>> {
  // FIGMA MAKE MODE: Return mock video list
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock list videos');
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        videoId: 'demo-video-abc123',
        videoTitle: 'MBA Product Pitch - Final Presentation',
        uploadDate: 'Jan 10, 2026',
        duration: 222,
        coherenceScore: 67,
        thumbnailUrl: '/mock-thumbnails/presentation-frame.jpg',
      },
      {
        videoId: 'demo-video-xyz789',
        videoTitle: 'Q4 Sales Review',
        uploadDate: 'Jan 8, 2026',
        duration: 180,
        coherenceScore: 82,
      },
    ];
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: List videos
  // ─────────────────────────────────────────
  // Endpoint: GET /api/videos
  // Request:  None
  // Response: Array of video metadata objects
  // Success:  Display video library
  // Error:    Show error message
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos`, {
    headers,
  });

  return handleResponse(response);
}

/**
 * Generate PDF report for a video analysis
 */
export async function generateReport(videoId: string): Promise<Blob> {
  // FIGMA MAKE MODE: Return mock PDF blob
  if (IS_FIGMA_MAKE_MODE) {
    console.log('🎨 [Figma Make Mode] Mock generate report for:', videoId);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate PDF generation delay
    
    // Create a simple mock PDF blob (minimal valid PDF)
    const mockPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF';
    return new Blob([mockPdfContent], { type: 'application/pdf' });
  }

  // PRODUCTION MODE: Real API call
  // BACKEND_HOOK: Generate PDF report
  // ─────────────────────────────────────────
  // Endpoint: POST /api/videos/{videoId}/report
  // Request:  None (videoId in URL path)
  // Response: Blob (application/pdf)
  // Success:  Download PDF file
  // Error:    Show error message, allow retry
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/report`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Failed to generate PDF report',
      code: 'PDF_GENERATION_FAILED',
      retryable: true,
    }));
    
    throw new VideoAnalysisError(
      errorData.error,
      errorData.code,
      errorData.retryable
    );
  }

  return response.blob();
}

/**
 * Get video stream URL for playback
 */
export function getVideoStreamUrl(videoId: string): string {
  // FIGMA MAKE MODE: Return mock video URL
  if (IS_FIGMA_MAKE_MODE) {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }

  // PRODUCTION MODE: Return actual video stream URL
  // BACKEND_HOOK: Get video stream URL
  // ─────────────────────────────────────────
  // Endpoint: GET /api/videos/{videoId}/stream
  // Request:  None (videoId in URL path)
  // Response: Video stream (video/mp4)
  // Usage:    Use as src for <video> element
  // Status:   NOT_CONNECTED (ready for backend integration)
  // ─────────────────────────────────────────
  return `${API_BASE_URL}/api/videos/${videoId}/stream`;
}
