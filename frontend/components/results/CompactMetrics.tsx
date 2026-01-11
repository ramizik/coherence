import { Eye, MessageSquare, Zap, Hand } from 'lucide-react';
import { cn } from '../ui/utils';
import type { Metrics } from '../../lib/mock-data';

interface CompactMetricsProps {
  metrics: Metrics;
}

export function CompactMetrics({ metrics }: CompactMetricsProps) {
  // Color coding based on metric values
  const getEyeContactColors = (value: number) => {
    if (value >= 75) return { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    if (value >= 50) return { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const getFillerWordsColors = (value: number) => {
    if (value <= 5) return { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    if (value <= 10) return { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const getPaceColors = (value: number) => {
    if (value >= 130 && value <= 170) return { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    if (value >= 110 && value <= 190) return { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const getNervousGesturesColors = (value: number) => {
    if (value <= 5) return { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    if (value <= 10) return { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10' };
    return { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const eyeContactColors = getEyeContactColors(metrics.eyeContact);
  const fillerWordsColors = getFillerWordsColors(metrics.fillerWords);
  const paceColors = getPaceColors(metrics.speakingPace);
  const nervousGesturesColors = getNervousGesturesColors(metrics.fidgeting);

  return (
    <div className="flex items-center gap-6">
      {/* Eye Contact */}
      <div className="flex items-center gap-2.5 group relative">
        <div className={cn('p-2 rounded-lg transition-all', eyeContactColors.bg)}>
          <Eye className={cn('w-4 h-4', eyeContactColors.text)} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[16px] font-bold', eyeContactColors.text)}>
              {metrics.eyeContact}%
            </span>
            <div className={cn('w-1.5 h-1.5 rounded-full', eyeContactColors.dot)} />
          </div>
          <span className="text-[11px] text-gray-500">Eye Contact</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap border border-white/10">
            Great job! Above average
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-white/10" />

      {/* Filler Words */}
      <div className="flex items-center gap-2.5 group relative">
        <div className={cn('p-2 rounded-lg transition-all', fillerWordsColors.bg)}>
          <MessageSquare className={cn('w-4 h-4', fillerWordsColors.text)} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[16px] font-bold', fillerWordsColors.text)}>
              {metrics.fillerWords}
            </span>
            <div className={cn('w-1.5 h-1.5 rounded-full', fillerWordsColors.dot)} />
          </div>
          <span className="text-[11px] text-gray-500">Filler Words</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap border border-white/10">
            Acceptable - Room for improvement
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-white/10" />

      {/* Speaking Pace */}
      <div className="flex items-center gap-2.5 group relative">
        <div className={cn('p-2 rounded-lg transition-all', paceColors.bg)}>
          <Zap className={cn('w-4 h-4', paceColors.text)} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[16px] font-bold', paceColors.text)}>
              {metrics.speakingPace}
            </span>
            <span className="text-[11px] text-gray-500">WPM</span>
            <div className={cn('w-1.5 h-1.5 rounded-full', paceColors.dot)} />
          </div>
          <span className="text-[11px] text-gray-500">Speaking Pace</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap border border-white/10">
            Perfect pace - Easy to follow
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-white/10" />

      {/* Nervous Gestures */}
      <div className="flex items-center gap-2.5 group relative">
        <div className={cn('p-2 rounded-lg transition-all', nervousGesturesColors.bg)}>
          <Hand className={cn('w-4 h-4', nervousGesturesColors.text)} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[16px] font-bold', nervousGesturesColors.text)}>
              {metrics.fidgeting}
            </span>
            <div className={cn('w-1.5 h-1.5 rounded-full', nervousGesturesColors.dot)} />
          </div>
          <span className="text-[11px] text-gray-500">Nervous Gestures</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap border border-white/10">
            Try reducing fidgeting
          </div>
        </div>
      </div>
    </div>
  );
}
