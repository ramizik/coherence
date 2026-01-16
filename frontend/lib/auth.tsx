/**
 * Authentication Context for Coherence
 * 
 * Provides dual-mode authentication:
 * 1. Figma Make Mode: All users are automatically authenticated (bypassed)
 * 2. Production Mode: Real Supabase authentication
 * 
 * In Figma Make mode, all auth checks are bypassed to allow UI preview.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { IS_FIGMA_MAKE_MODE } from './config';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// ========================
// Type Definitions
// ========================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// ========================
// Context Creation
// ========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================
// Mock User (Figma Make Mode)
// ========================

const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'demo@coherence.ai',
  name: 'Demo User',
  avatarUrl: undefined,
};

// ========================
// Auth Provider
// ========================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIGMA MAKE MODE: Skip all auth checks, auto-authenticate
    if (IS_FIGMA_MAKE_MODE) {
      console.log('🎨 [Figma Make Mode] Auth bypassed - using mock user');
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    // PRODUCTION MODE: Initialize Supabase auth
    // BACKEND_HOOK: Initialize authentication
    // ─────────────────────────────────────────
    // Setup: Supabase client configured
    // Action: Check for existing session on mount
    // Action: Subscribe to auth state changes
    // Status: CONNECTED ✅
    // ─────────────────────────────────────────
    
    // Transform Supabase user to our User type
    const transformUser = (supabaseUser: SupabaseUser): User => ({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? transformUser(session.user) : null);
      setLoading(false);
    }).catch((error) => {
      console.warn('Auth error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? transformUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    // FIGMA MAKE MODE: Mock sign in (always succeeds)
    if (IS_FIGMA_MAKE_MODE) {
      console.log('🎨 [Figma Make Mode] Mock sign in:', email);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setUser(MOCK_USER);
      return { error: null };
    }

    // PRODUCTION MODE: Real Supabase sign in
    // BACKEND_HOOK: Sign in user
    // ─────────────────────────────────────────
    // Action: Call supabase.auth.signInWithPassword()
    // Success: User state updated automatically via onAuthStateChange
    // Error: Return error message
    // Status: CONNECTED ✅
    // ─────────────────────────────────────────
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ error: Error | null }> => {
    // FIGMA MAKE MODE: Mock sign up (always succeeds)
    if (IS_FIGMA_MAKE_MODE) {
      console.log('🎨 [Figma Make Mode] Mock sign up:', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({ ...MOCK_USER, email, name });
      return { error: null };
    }

    // PRODUCTION MODE: Real Supabase sign up
    // BACKEND_HOOK: Sign up user
    // ─────────────────────────────────────────
    // Action: Call supabase.auth.signUp()
    // Success: User created, may need email verification
    // Error: Return error message
    // Status: CONNECTED ✅
    // ─────────────────────────────────────────
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            full_name: name,
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    // FIGMA MAKE MODE: Mock sign out
    if (IS_FIGMA_MAKE_MODE) {
      console.log('🎨 [Figma Make Mode] Mock sign out');
      await new Promise(resolve => setTimeout(resolve, 300));
      // Don't actually sign out in Figma Make mode to keep UI accessible
      return;
    }

    // PRODUCTION MODE: Real Supabase sign out
    // BACKEND_HOOK: Sign out user
    // ─────────────────────────────────────────
    // Action: Call supabase.auth.signOut()
    // Success: User state cleared automatically
    // Status: CONNECTED ✅
    // ─────────────────────────────────────────
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    // FIGMA MAKE MODE: Mock password reset
    if (IS_FIGMA_MAKE_MODE) {
      console.log('🎨 [Figma Make Mode] Mock password reset:', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { error: null };
    }

    // PRODUCTION MODE: Real Supabase password reset
    // BACKEND_HOOK: Reset password
    // ─────────────────────────────────────────
    // Action: Call supabase.auth.resetPasswordForEmail()
    // Success: Email sent with reset link
    // Error: Return error message
    // Status: CONNECTED ✅
    // ─────────────────────────────────────────
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========================
// Hook
// ========================

/**
 * Access authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
