import { Badge } from '../ui/badge';
import { Clock, Lightbulb, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatTimestamp, type DissonanceFlag } from '../../lib/mock-data';
import { useState } from 'react';

interface CoachingCardProps {
  flag: DissonanceFlag;
  onSeek?: (timestamp: number) => void;
  onDismiss?: (flagId: string) => void;
}

// Format dissonance type for display
function formatDissonanceType(type: string): string {
  return type.replace(/_/g, ' ');
}

/**
 * CoachingCard - Displays a single dissonance flag with coaching advice
 *
 * Styling: Glassmorphic with severity-colored border
 * - HIGH: border-red-500 border-2
 * - MEDIUM: border-amber-500 border
 * - LOW: border-emerald-500 border
 * 
 * Features:
 * - Dismissible with smooth fade-out animation
 * - Click timestamp to jump to video moment
 */
export function CoachingCard({ flag, onSeek, onDismiss }: CoachingCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = () => {
    setIsDismissing(true);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      onDismiss?.(flag.id);
    }, 300);
  };

  const getSeverityStyles = () => {
    switch (flag.severity) {
      case 'HIGH':
        return {
          border: 'border-2 border-red-500',
          badge: 'bg-red-500/20 text-red-400 border-red-500',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case 'MEDIUM':
        return {
          border: 'border border-amber-500',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'LOW':
        return {
          border: 'border border-emerald-500',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
          icon: <Info className="w-4 h-4" />,
        };
    }
  };

  const severityStyles = getSeverityStyles();

  return (
    <div
      className={cn(
        'relative p-6 rounded-xl bg-white/5 backdrop-blur-md transition-all hover:bg-white/8',
        severityStyles.border,
        isDismissing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all z-10"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Header: Type badge only */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            'px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2',
            severityStyles.badge
          )}
        >
          {severityStyles.icon}
          {flag.severity}
        </div>
      </div>

      {/* Type label */}
      <div className="mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
          {formatDissonanceType(flag.type)}
        </span>
      </div>

      {/* Description */}
      <p className="text-white text-sm mb-4 leading-relaxed">{flag.description}</p>

      {/* Coaching advice */}
      <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
          <span className="text-xs text-white font-bold uppercase tracking-wider">
            How to fix:
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{flag.coaching}</p>
      </div>

      {/* Evidence (if available) */}
      {(flag.visualEvidence || flag.verbalEvidence) && (
        <div className="mb-4 space-y-2">
          {flag.verbalEvidence && (
            <div className="text-xs text-gray-400">
              <span className="text-gray-500">You said:</span>{' '}
              <span className="text-gray-300 italic">"{flag.verbalEvidence.split('"')[1] || flag.verbalEvidence}"</span>
            </div>
          )}
        </div>
      )}

      {/* Jump to moment button with timestamp */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">{formatTimestamp(flag.timestamp)}</span>
        </div>
        <button
          onClick={() => onSeek?.(flag.timestamp)}
          className="flex-1 py-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:text-purple-200 text-sm font-medium transition-all"
        >
          Jump to Moment →
        </button>
      </div>
    </div>
  );
}