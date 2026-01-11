'use client';

import { useEffect, useState } from 'react';
import { getPerformanceLevel, getScoreGradient } from '../../lib/mock-data';

interface ScoreRingProps {
  score: number; // 0-100
}

/**
 * ScoreRing - Animated circular progress indicator showing coherence score
 * 
 * Features:
 * - SVG-based circular progress ring
 * - Gradient fill based on score level
 * - Animates from 0 to target score on mount
 * - Color-coded performance label
 */
export function ScoreRing({ score }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const performance = getPerformanceLevel(score);
  const gradient = getScoreGradient(score);

  // Animate score on mount
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedScore(Math.min(currentStep * increment, score));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score]);

  // SVG circle calculations
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular Progress Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Define gradient */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
            
            {/* Shimmer effect */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 0"
                to="1 0"
                dur="3s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />

          {/* Shimmer overlay on progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#shimmer)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity="0.5"
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[56px] font-black text-white leading-none" style={{ fontWeight: 900 }}>
            {Math.round(animatedScore)}
          </span>
          <span className="text-[14px] font-medium text-gray-400 mt-1" style={{ fontWeight: 500 }}>
            Coherence Score
          </span>
        </div>
      </div>

      {/* Performance label */}
      <div className={`px-4 py-1 rounded-full ${performance.bgColor} ${performance.color} text-[13px] font-semibold`} style={{ fontWeight: 600 }}>
        {performance.label}
      </div>
    </div>
  );
}