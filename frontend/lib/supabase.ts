/**
 * Supabase Client Configuration
 * 
 * Provides safe Supabase client initialization with Figma Make mode fallbacks.
 * In Figma Make mode, uses mock configuration to prevent errors.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_FIGMA_MAKE_MODE } from './config';

/**
 * Initialize Supabase client with safe configuration
 * 
 * BACKEND_HOOK: Supabase client initialization
 * ─────────────────────────────────────────
 * Setup: Configure with real Supabase project credentials
 * Config: Add auth settings, realtime options, etc.
 * Status: CONNECTED ✅
 * 
 * To connect:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key
 * 3. Set environment variables:
 *    - VITE_SUPABASE_URL=your-project-url
 *    - VITE_SUPABASE_ANON_KEY=your-anon-key
 * 4. The app will automatically switch to production mode
 * ─────────────────────────────────────────
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: !IS_FIGMA_MAKE_MODE,
    persistSession: !IS_FIGMA_MAKE_MODE,
    detectSessionInUrl: !IS_FIGMA_MAKE_MODE,
  },
});

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !IS_FIGMA_MAKE_MODE && 
    SUPABASE_URL !== 'https://mock-supabase-url.supabase.co';
}

if (IS_FIGMA_MAKE_MODE) {
  console.log('🎨 [Figma Make Mode] Supabase client initialized with mock config');
} else {
  console.log('🚀 Supabase client initialized:', SUPABASE_URL);
}
