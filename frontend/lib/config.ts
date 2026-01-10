/**
 * Application configuration.
 * 
 * Environment variables are loaded from .env.local (Vite format).
 */

/**
 * Backend API base URL.
 * 
 * In development: http://localhost:8000
 * In production: Set via VITE_API_URL environment variable
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Status polling interval in milliseconds.
 */
export const STATUS_POLL_INTERVAL = 3000; // 3 seconds

/**
 * Maximum file size for video upload (500MB).
 */
export const MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Allowed video MIME types.
 */
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',  // .mov
  'video/webm',
];

/**
 * Maximum video duration in seconds (3 minutes).
 */
export const MAX_VIDEO_DURATION = 180;
