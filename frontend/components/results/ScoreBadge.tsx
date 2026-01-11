import { useEffect, useRef, useState } from 'react';
import { cn } from '../ui/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

// Get colors based on score
function getScoreColor(score: number) {
  if (score >= 76) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400'
    };
  }
  if (score >= 51) {
    return {
      border: 'border-amber-500',
      bg: 'bg-amber-500/10',
      color: 'text-amber-400'
    };
  }
  return {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    color: 'text-red-400'
  };
}

/**
 * ScoreBadge - Displays coherence score with circular progress indicator
 *
 * Styling: Color-coded by score range (green 76+, amber 51-75, red 0-50)
 * Sizes: sm (80px), md (100px), lg (140px)
 * Animation: Score counts up from 0 to actual value over 1.5 seconds on mount
 */
export function ScoreBadge({ score, size = 'lg' }: ScoreBadgeProps) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const hasAnimated = useRef(false);

  // Animate score count-up on initial mount
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * score);

      setDisplayedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Use actual score for colors (so color is correct from start)
  const colors = getScoreColor(score);
  const sizeClasses = {
    sm: 'w-[80px] h-[80px]',
    md: 'w-[100px] h-[100px]',
    lg: 'w-[140px] h-[140px]',
  };

  const textSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-[52px]',
  };

  const labelText = score >= 76 ? 'Excellent!' : score >= 51 ? 'Good Start' : 'Needs Work';
  const labelColor = score >= 76 ? 'text-emerald-400' : score >= 51 ? 'text-amber-400' : 'text-red-400';

  // Calculate stroke dasharray for progress circle using displayedScore for animation
  const circumference = 2 * Math.PI * 64; // radius = 64 for 140px circle
  const progressValue = (displayedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        {/* Background circle */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={size === 'lg' ? 140 : size === 'md' ? 100 : 80}
          height={size === 'lg' ? 140 : size === 'md' ? 100 : 80}
        >
          <circle
            cx={size === 'lg' ? 70 : size === 'md' ? 50 : 40}
            cy={size === 'lg' ? 70 : size === 'md' ? 50 : 40}
            r={size === 'lg' ? 64 : size === 'md' ? 44 : 34}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle with gradient */}
          <circle
            cx={size === 'lg' ? 70 : size === 'md' ? 50 : 40}
            cy={size === 'lg' ? 70 : size === 'md' ? 50 : 40}
            r={size === 'lg' ? 64 : size === 'md' ? 44 : 34}
            stroke={score >= 76 ? '#10B981' : score >= 51 ? '#F59E0B' : '#EF4444'}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${progressValue} ${circumference}`}
            className="transition-none"
          />
        </svg>

        {/* Score text */}
        <div className="flex flex-col items-center gap-1">
          <span className={cn('font-black leading-none text-white', textSizes[size])}>
            {displayedScore}
          </span>
          <span className="text-[13px] text-gray-400">/100</span>
        </div>
      </div>

      {/* Label */}
      {size === 'lg' && (
        <div
          className={cn(
            'px-4 py-1 rounded-full border text-[13px] font-bold',
            colors.border,
            colors.bg,
            labelColor
          )}
        >
          {labelText}
        </div>
      )}
    </div>
  );
}