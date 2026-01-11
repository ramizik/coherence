'use client';

import { Play } from 'lucide-react';

/**
 * InputCard - Visual indicator for pipeline input (user's video)
 * 
 * Small card on the left side of the pipeline showing video upload.
 * Purple gradient background with dashed border.
 */
export function InputCard() {
  return (
    <div 
      className="flex flex-col items-center justify-center rounded-xl"
      style={{
        width: '155px',
        height: '100px',
        background: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)',
        border: '2px dashed #D8B4FE',
        padding: '16px'
      }}
    >
      {/* Video icon */}
      <div 
        className="flex items-center justify-center rounded-full mb-2"
        style={{
          width: '40px',
          height: '40px',
          background: '#8B5CF6',
          boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
        }}
      >
        <Play 
          size={20} 
          fill="#FFFFFF"
          style={{ 
            color: '#FFFFFF',
            marginLeft: '2px' // Center play icon optically
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
        Your Presentation
      </p>

      {/* File info badge */}
      

      {/* Animation styles */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-bounce-subtle {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
