import { Eye, MessageSquare, Zap, Hand } from 'lucide-react';
import { cn } from '../ui/utils';
import type { Metrics } from '../../lib/mock-data';

interface MetricsRowProps {
  metrics: Metrics;
}

/**
 * MetricsRow - Displays key performance metrics in a grid
 *
 * Simplified color palette: Uses red/amber/green for functional status only
 * - Eye Contact: Percentage (green if >75%, amber if 50-75%, red if <50%)
 * - Filler Words: Count (green if <5, amber if 5-10, red if >10)
 * - Speaking Pace: WPM (green if 120-160, amber if 100-180, red otherwise)
 * - Nervous Gestures: Count (uses same color logic as filler words)
 */
export function MetricsRow({ metrics }: MetricsRowProps) {
  const getEyeContactColor = (value: number) => {
    if (value > 75) return { text: 'text-emerald-400', badge: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (value >= 50) return { text: 'text-amber-400', badge: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-red-400', badge: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const getFillerWordsColor = (value: number) => {
    if (value < 5) return { text: 'text-emerald-400', badge: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (value <= 10) return { text: 'text-amber-400', badge: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-red-400', badge: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const getPaceColor = (value: number) => {
    if (value >= 120 && value <= 160) return { text: 'text-emerald-400', badge: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (value >= 100 && value <= 180) return { text: 'text-amber-400', badge: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-red-400', badge: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  // Apply same logic to nervous gestures (green if <5, amber if 5-10, red if >10)
  const getNervousGesturesColor = (value: number) => {
    if (value < 5) return { text: 'text-emerald-400', badge: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (value <= 10) return { text: 'text-amber-400', badge: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-red-400', badge: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const eyeContactColors = getEyeContactColor(metrics.eyeContact);
  const fillerWordsColors = getFillerWordsColor(metrics.fillerWords);
  const paceColors = getPaceColor(metrics.speakingPace);
  const nervousGesturesColors = getNervousGesturesColor(metrics.fidgeting);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Eye Contact */}
      <div className={cn(
        'relative rounded-xl p-5 border backdrop-blur-md',
        'bg-white/5',
        eyeContactColors.border
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', eyeContactColors.bg)}>
            <Eye className={cn('w-5 h-5', eyeContactColors.text)} />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">+3</span>
          </div>
        </div>
        <div className={cn('text-3xl font-black mb-1', eyeContactColors.text)}>
          {metrics.eyeContact}%
        </div>
        <div className="text-xs text-gray-400 mb-2">Eye Contact</div>
        <div className="flex items-center gap-2 text-[11px] mb-3">
          <div className={cn('w-1.5 h-1.5 rounded-full', eyeContactColors.text.replace('text-', 'bg-'))} />
          <span className="text-gray-500">Great job! Above average</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', eyeContactColors.text.replace('text-', 'bg-'))}
            style={{ width: `${metrics.eyeContact}%` }}
          />
        </div>
      </div>

      {/* Filler Words */}
      <div className={cn(
        'relative rounded-xl p-5 border backdrop-blur-md',
        'bg-white/5',
        fillerWordsColors.border
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', fillerWordsColors.bg)}>
            <MessageSquare className={cn('w-5 h-5', fillerWordsColors.text)} />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">+5</span>
          </div>
        </div>
        <div className={cn('text-3xl font-black mb-1', fillerWordsColors.text)}>
          {metrics.fillerWords}
        </div>
        <div className="text-xs text-gray-400 mb-2">Filler Words</div>
        <div className="flex items-center gap-2 text-[11px]">
          <div className={cn('w-1.5 h-1.5 rounded-full', fillerWordsColors.text.replace('text-', 'bg-'))} />
          <span className="text-gray-500">Acceptable - Room for improvement</span>
        </div>
      </div>

      {/* Speaking Pace */}
      <div className={cn(
        'relative rounded-xl p-5 border backdrop-blur-md',
        'bg-white/5',
        paceColors.border
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', paceColors.bg)}>
            <Zap className={cn('w-5 h-5', paceColors.text)} />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">+8</span>
          </div>
        </div>
        <div className={cn('text-3xl font-black mb-1', paceColors.text)}>
          {metrics.speakingPace} <span className="text-lg">WPM</span>
        </div>
        <div className="text-xs text-gray-400 mb-2">Speaking Pace</div>
        <div className="flex items-center gap-2 text-[11px]">
          <div className={cn('w-1.5 h-1.5 rounded-full', paceColors.text.replace('text-', 'bg-'))} />
          <span className="text-gray-500">Perfect pace - Easy to follow</span>
        </div>
      </div>

      {/* Nervous Gestures */}
      <div className={cn(
        'relative rounded-xl p-5 border backdrop-blur-md',
        'bg-white/5',
        nervousGesturesColors.border
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', nervousGesturesColors.bg)}>
            <Hand className={cn('w-5 h-5', nervousGesturesColors.text)} />
          </div>
          <div className="flex items-center gap-1">
            <div className={cn('w-1 h-1 rounded-full', nervousGesturesColors.text.replace('text-', 'bg-'))} />
            <span className={cn('text-[10px] uppercase tracking-wider font-bold', nervousGesturesColors.text)}>+1</span>
          </div>
        </div>
        <div className={cn('text-3xl font-black mb-1', nervousGesturesColors.text)}>
          {metrics.fidgeting}
        </div>
        <div className="text-xs text-gray-400 mb-2">Nervous Gestures</div>
        <div className="flex items-center gap-2 text-[11px]">
          <div className={cn('w-1.5 h-1.5 rounded-full', nervousGesturesColors.text.replace('text-', 'bg-'))} />
          <span className="text-gray-500">Try avoiding still in 14 seconds</span>
        </div>
      </div>
    </div>
  );
}