import { useState, useCallback, useMemo, startTransition, memo, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';

// Memoized form component to prevent unnecessary re-renders
const AuthForm = memo(({
  mode,
  email,
  password,
  name,
  error,
  success,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onSubmit,
  onForgotPassword,
  onBackToSignIn,
}: {
  mode: 'signin' | 'signup' | 'forgot';
  email: string;
  password: string;
  name: string;
  error: string;
  success: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onBackToSignIn: () => void;
}) => {
  return (
    <form onSubmit={onSubmit} className="px-8 py-6 space-y-4" style={{ contain: 'layout style' }}>
      {/* Name Field (Sign Up Only) */}
      {mode === 'signup' && (
        <div>
          <label className="block text-[13px] font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={2} />
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-[13px] font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={2} />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Password Field (not for forgot password) */}
      {mode !== 'forgot' && (
        <div>
          <label className="block text-[13px] font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={2} />
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
            />
          </div>
          {mode === 'signup' && (
            <p className="mt-1.5 text-[12px] text-gray-500">
              Must be at least 6 characters
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-[13px] text-green-400">{success}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !!success}
        className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-colors duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>
              {mode === 'forgot' ? 'Sending...' : mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
            </span>
          </>
        ) : (
          <>
            <span>
              {mode === 'forgot' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </>
        )}
      </button>

      {/* Forgot Password Link (Sign In Only) */}
      {mode === 'signin' && (
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[13px] text-gray-400 hover:text-purple-400 transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      )}

      {/* Back to Sign In (Forgot Password) */}
      {mode === 'forgot' && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="text-[13px] text-gray-400 hover:text-purple-400 transition-colors"
          >
            ← Back to Sign In
          </button>
        </div>
      )}
    </form>
  );
});

AuthForm.displayName = 'AuthForm';

// Memoized header component to prevent unnecessary re-renders
const AuthHeader = memo(({ mode }: { mode: 'signin' | 'signup' | 'forgot' }) => {
  const title = mode === 'forgot' ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Welcome Back';
  const subtitle = mode === 'forgot' 
    ? 'Enter your email to reset your password' 
    : mode === 'signup' 
    ? 'Sign up to start analyzing presentations' 
    : 'Sign in to continue to Coherence';

  return (
    <div className="px-8 pt-8 pb-6 border-b border-white/5" style={{ contain: 'layout style' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-white">
            {title}
          </h2>
          <p className="text-[13px] text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
});

AuthHeader.displayName = 'AuthHeader';

interface AuthDialogProps {
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
}

/**
 * AuthDialog - Glassmorphic authentication modal
 * 
 * Features:
 * - Sign In / Sign Up tabs
 * - Forgot Password flow
 * - Dual-mode operation (mock in Figma Make, real in production)
 * - Coherence premium dark design system
 */
export function AuthDialog({ onClose, initialMode = 'signin' }: AuthDialogProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll when dialog is open
  useEffect(() => {
    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // Cleanup: restore original styles when dialog closes
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []); // Run once on mount/unmount

  // Memoized handlers to prevent unnecessary re-renders
  const handleModeChange = useCallback((newMode: 'signin' | 'signup' | 'forgot') => {
    // Use startTransition to mark this as non-urgent, allowing React to prioritize user input
    startTransition(() => {
      setMode(newMode);
      setError('');
      setSuccess('');
    });
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        // Password reset
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
        }
      } else if (mode === 'signup') {
        // Sign up
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Welcome to Coherence.');
          // Auto-close on success
          setTimeout(() => onClose?.(), 1500);
        }
      } else {
        // Sign in
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Welcome back!');
          // Auto-close on success
          setTimeout(() => onClose?.(), 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize backdrop click handler
  const handleBackdropClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Memoize dialog click handler
  const handleDialogClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Memoize button classNames to avoid recalculation
  const signInButtonClassName = useMemo(() => {
    return `flex-1 px-4 py-2.5 text-[14px] font-medium rounded-md transition-colors duration-150 ${
      mode === 'signin'
        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
        : 'text-gray-400 hover:text-white'
    }`;
  }, [mode]);

  const signUpButtonClassName = useMemo(() => {
    return `flex-1 px-4 py-2.5 text-[14px] font-medium rounded-md transition-colors duration-150 ${
      mode === 'signup'
        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
        : 'text-gray-400 hover:text-white'
    }`;
  }, [mode]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      style={{ willChange: 'opacity' }}
      onClick={handleBackdropClick}
    >
      {/* Dialog Container */}
      <div 
        className="relative w-full max-w-md bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 animate-scale-in"
        style={{ willChange: 'transform, opacity', contain: 'layout style paint', contentVisibility: 'auto' }}
        onClick={handleDialogClick}
      >
        {/* Gradient Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 rounded-2xl blur-xl opacity-60" />
        
        {/* Content */}
        <div className="relative bg-slate-900/95 rounded-2xl">
          
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          )}

          {/* Header - Memoized to prevent re-renders */}
          <AuthHeader mode={mode} />

          {/* Tab Switcher (only show for signin/signup) - Memoized */}
          {mode !== 'forgot' && (
            <div className="px-8 pt-6 pb-2" style={{ contain: 'layout style' }}>
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => handleModeChange('signin')}
                  className={signInButtonClassName}
                  style={{ willChange: 'background-color, color' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleModeChange('signup')}
                  className={signUpButtonClassName}
                  style={{ willChange: 'background-color, color' }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Form - Memoized to prevent unnecessary re-renders */}
          <AuthForm
            mode={mode}
            email={email}
            password={password}
            name={name}
            error={error}
            success={success}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onSubmit={handleSubmit}
            onForgotPassword={() => handleModeChange('forgot')}
            onBackToSignIn={() => handleModeChange('signin')}
          />


          {/* Footer Info */}
          <div className="px-8 pb-8 pt-4 border-t border-white/5">
            <p className="text-[12px] text-gray-500 text-center">
              {mode === 'signup' ? (
                <>
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                </>
              ) : (
                'Coherence - AI-powered presentation coaching'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Animations - moved to static stylesheet to avoid re-evaluation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 200ms ease-out;
        }

        .animate-scale-in {
          animation: scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
