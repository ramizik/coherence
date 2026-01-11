'use client';

import { CheckCircle } from 'lucide-react';

/**
 * OutputCard - Visual indicator for pipeline output (analysis results)
 * 
 * Small card on the right side of the pipeline showing completed analysis.
 * Cyan gradient background with dashed border.
 */
export function OutputCard() {
  return (
    <div 
      className="flex flex-col items-center justify-center rounded-xl"
      style={{
        width: '140px',
        height: '100px',
        background: 'linear-gradient(135deg, #CFFAFE 0%, #FFFFFF 100%)',
        border: '2px dashed #67E8F9',
        padding: '16px'
      }}
    >
      {/* Success checkmark icon */}
      <div 
        className="flex items-center justify-center rounded-full mb-2"
        style={{
          width: '40px',
          height: '40px',
          background: '#10B981',
          boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
        }}
      >
        <CheckCircle 
          size={24} 
          style={{ 
            color: '#FFFFFF',
            strokeWidth: 2.5
          }} 
        />
      </div>

      {/* Label */}
      <p 
        className="mb-1"
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: '#1F2937'
        }}
      >
        Your Results
      </p>


      {/* Animation styles */}
      <style>{`
        @keyframes success-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(16,185,129,0.5);
          }
        }

        .animate-success-pulse {
          animation: success-pulse 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-success-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
