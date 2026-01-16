/**
 * Configuration and Environment Detection
 * 
 * Provides safe access to environment variables with Figma Make fallbacks.
 * Detects whether we're in Figma Make dev mode and disables all external integrations.
 */

// ========================
// Environment Detection
// ========================

/**
 * Check if import.meta.env is available (not in Figma Make)
 */
function hasImportMeta(): boolean {
  try {
    return typeof import.meta !== 'undefined' && typeof import.meta.env === 'object';
  } catch {
    return false;
  }
}

/**
 * Safely get environment variable with fallback
 */
function getEnv(key: string, fallback: string = ''): string {
  if (!hasImportMeta()) {
    return fallback;
  }
  try {
    return import.meta.env[key] || fallback;
  } catch {
    return fallback;
  }
}

/**
 * FIGMA MAKE DEV MODE
 * 
 * Returns true if:
 * - import.meta.env is not available (Figma Make environment)
 * - Supabase URL is not configured or is using mock values
 * 
 * In dev mode:
 * - All auth is bypassed
 * - All API calls return mock data
 * - No external services are called
 */
export const IS_FIGMA_MAKE_MODE = !hasImportMeta() || 
  !getEnv('VITE_SUPABASE_URL') || 
  getEnv('VITE_SUPABASE_URL') === 'https://mock-supabase-url.supabase.co';

// ========================
// Configuration Constants
// ========================

/**
 * Supabase Configuration
 * Safe fallbacks for Figma Make mode
 */
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://mock-supabase-url.supabase.co');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key-for-figma-make-development');

/**
 * API Configuration
 * Safe fallbacks for Figma Make mode
 */
export const API_BASE_URL = getEnv('VITE_API_URL', 'http://localhost:8000');

/**
 * Feature Flags
 */
export const ENABLE_AUTH = !IS_FIGMA_MAKE_MODE;
export const ENABLE_API_CALLS = !IS_FIGMA_MAKE_MODE;
export const ENABLE_ANALYTICS = !IS_FIGMA_MAKE_MODE;

/**
 * Development Info
 */
export const CONFIG_INFO = {
  isFigmaMakeMode: IS_FIGMA_MAKE_MODE,
  hasImportMeta: hasImportMeta(),
  supabaseUrl: SUPABASE_URL,
  apiBaseUrl: API_BASE_URL,
  authEnabled: ENABLE_AUTH,
  apiEnabled: ENABLE_API_CALLS,
} as const;

/**
 * Log configuration on startup (for debugging)
 */
if (IS_FIGMA_MAKE_MODE) {
  console.log('🎨 FIGMA MAKE DEV MODE ENABLED');
  console.log('- Auth: BYPASSED (all users authenticated)');
  console.log('- API: MOCKED (no external calls)');
  console.log('- All screens accessible for UI preview');
} else {
  console.log('🚀 Production Mode');
  console.log('- Auth: ENABLED');
  console.log('- API:', API_BASE_URL);
}
