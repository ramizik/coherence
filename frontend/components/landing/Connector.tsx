'use client';

import { ChevronRight } from 'lucide-react';

interface ConnectorProps {
  delay: number; // milliseconds for animation stagger
}

/**
 * Connector - Animated data flow line between pipeline nodes
 * 
 * Features:
 * - Base gray line
 * - Traveling gradient pulse (purple to cyan)
 * - Direction arrow in center
 * - Data packet orb animation
 */
export function Connector({ delay }: ConnectorProps) {
  return (
    <div className="relative flex items-center justify-center mx-4" style={{ width: '120px', height: '40px' }}>
      {/* Base connector line */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '120px',
          height: '3px',
          background: '#E5E7EB',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />

      {/* Animated pulse gradient line */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '120px',
          height: '3px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <div 
          className="animate-flow-pulse"
          style={{
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #8B5CF6, #06B6D4, transparent)',
            animationDelay: `${delay}ms`
          }}
        />
      </div>

      {/* Glowing data packet orb */}
      <div 
        className="absolute animate-data-packet"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          boxShadow: '0 0 12px rgba(139,92,246,0.6)',
          top: '50%',
          left: '-12px',
          transform: 'translateY(-50%)',
          animationDelay: `${delay}ms`
        }}
      />

      {/* Direction arrow (center) */}
      <div 
        className="relative z-10 flex items-center justify-center rounded-full animate-pulse-arrow"
        style={{
          width: '24px',
          height: '24px',
          background: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animationDelay: `${delay}ms`
        }}
      >
        <ChevronRight 
          size={16} 
          style={{ 
            color: '#8B5CF6',
            strokeWidth: 3
          }} 
        />
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes flow-pulse {
          0% {
            transform: translateX(-60px);
          }
          100% {
            transform: translateX(120px);
          }
        }

        @keyframes data-packet {
          0% {
            transform: translate(0, -50%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(132px, -50%);
            opacity: 0;
          }
        }

        @keyframes pulse-arrow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .animate-flow-pulse {
          animation: flow-pulse 2s ease-in-out infinite;
        }

        .animate-data-packet {
          animation: data-packet 2.5s ease-in-out infinite;
        }

        .animate-pulse-arrow {
          animation: pulse-arrow 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-flow-pulse,
          .animate-data-packet,
          .animate-pulse-arrow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
