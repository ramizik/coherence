'use client';

import { useState } from 'react';
import { Activity, Video, Sparkles } from 'lucide-react';

interface PipelineNodeProps {
  step: number;
  company: string;
  subtitle: string;
  icon: 'waveform' | 'video' | 'gemini';
  features: string[];
  tooltipTitle: string;
  tooltipContent: string;
}

/**
 * PipelineNode - Circular card representing one AI model in the pipeline
 * 
 * Features animated gradient border, hover effects, floating icon, and tooltip.
 * Each node represents: Deepgram (audio), TwelveLabs (video), or Gemini (synthesis).
 */
export function PipelineNode({
  step,
  company,
  subtitle,
  icon,
  features,
  tooltipTitle,
  tooltipContent
}: PipelineNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderIcon = () => {
    const iconProps = {
      size: 48,
      className: 'animate-float',
      style: { 
        stroke: 'url(#icon-gradient)',
        strokeWidth: 2
      }
    };

    switch (icon) {
      case 'waveform':
        return <Activity {...iconProps} />;
      case 'video':
        return <Video {...iconProps} />;
      case 'gemini':
        return <Sparkles {...iconProps} />;
    }
  };

  return (
    <div className="relative">
      {/* Hover Tooltip */}
      {isHovered && (
        <div 
          className="absolute -top-[140px] left-1/2 transform -translate-x-1/2 z-20 animate-tooltip-appear"
          style={{
            width: '240px'
          }}
        >
          <div 
            className="bg-white rounded-lg p-4"
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <h4 
              className="mb-2"
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#1F2937'
              }}
            >
              {tooltipTitle}
            </h4>
            <p 
              style={{
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#6B7280'
              }}
            >
              {tooltipContent}
            </p>
            {/* Arrow pointing down */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"
            />
          </div>
        </div>
      )}

      {/* Main Node Container */}
      <div
        className="relative flex flex-col items-center justify-center transition-all duration-500 cursor-pointer"
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: '#FFFFFF',
          transform: isHovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
          boxShadow: isHovered 
            ? '0 20px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(139,92,246,0.25)'
            : '0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(139,92,246,0.15)',
          willChange: 'transform'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`AI Pipeline Step ${step}: ${company} - ${subtitle}`}
      >
        {/* Animated gradient border */}
        <div 
          className="absolute inset-0 rounded-full animate-spin-slow"
          style={{
            background: 'conic-gradient(from 0deg, #8B5CF6, #06B6D4, #8B5CF6)',
            padding: '3px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animationDuration: isHovered ? '2s' : '4s'
          }}
        />

        {/* Inner content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-3">
            <svg width="0" height="0">
              <defs>
                <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            {renderIcon()}
          </div>

          {/* Step label */}
          <div 
            className="px-3 py-1 rounded-full mb-2 animate-pulse-badge"
            style={{
              background: '#F3E8FF',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.15em',
              color: '#8B5CF6'
            }}
          >
            STEP {step}
          </div>

          {/* Company name */}
          <h3 
            className="mb-1"
            style={{
              fontWeight: 700,
              fontSize: '20px',
              letterSpacing: '-0.01em',
              color: '#1F2937'
            }}
          >
            {company}
          </h3>

          {/* Subtitle */}
          <p 
            className="mb-4"
            style={{
              fontWeight: 500,
              fontSize: '14px',
              color: '#6B7280'
            }}
          >
            {subtitle}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center max-w-[160px]">
            {features.map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 rounded-md transition-colors duration-200"
                style={{
                  background: isHovered ? '#F3E8FF' : '#F3F4F6',
                  color: isHovered ? '#8B5CF6' : '#374151',
                  fontWeight: 400,
                  fontSize: '10px'
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes tooltip-appear {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .animate-pulse-badge {
          animation: pulse-badge 2s ease-in-out infinite;
        }

        .animate-tooltip-appear {
          animation: tooltip-appear 300ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-spin-slow,
          .animate-pulse-badge,
          .animate-tooltip-appear {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
