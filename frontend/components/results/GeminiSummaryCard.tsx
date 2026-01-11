import { Sparkles } from 'lucide-react';

interface GeminiSummaryCardProps {
  coachingAdvice: string;
  headline?: string;
}

/**
 * GeminiSummaryCard - Displays AI-generated coaching summary from Gemini
 *
 * Props match the GeminiReport type from backend:
 * - coachingAdvice: Natural language coaching advice
 * - headline: Optional short headline summarizing the assessment
 */
export function GeminiSummaryCard({ coachingAdvice, headline }: GeminiSummaryCardProps) {
  // Allow full content display - no truncation (backend handles length via max_output_tokens)
  const displayAdvice = coachingAdvice;

  return (
    <>
      <div
        style={{
          width: '620px',
          minHeight: '200px',
          maxHeight: '360px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="complementary"
        aria-label="AI-generated presentation summary by Gemini"
      >
        {/* Main content - scrollable */}
        <div
          className="gemini-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '8px',
            marginRight: '-4px',
          }}
        >
          <p style={{
            color: '#d1d5db',
            fontSize: '13px',
            lineHeight: '1.7',
            margin: 0,
          }}>
            {headline && (
              <span style={{ color: '#fff', fontWeight: 500 }}>{headline} </span>
            )}
            {displayAdvice.includes('Your top priority:') ? (
              <>
                {displayAdvice.split('Your top priority:')[0]}
                <span style={{ color: '#22d3ee', fontWeight: 600 }}>Your top priority:</span>
                {displayAdvice.split('Your top priority:')[1]}
              </>
            ) : (
              displayAdvice
            )}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '12px',
          marginTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
        }}>
          {/* Gemini icon */}
          <div style={{
            width: '18px',
            height: '18px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              style={{ width: '10px', height: '10px', color: '#a78bfa' }}
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
                opacity="0.6"
              />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <span style={{ fontSize: '10px', color: '#6b7280' }}>
            Powered by Gemini 1.5 Pro
          </span>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6 }}>
            <Sparkles style={{ width: '12px', height: '12px', color: '#a78bfa' }} />
            <span style={{ fontSize: '10px', color: '#6b7280' }}>AI Summary</span>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .gemini-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .gemini-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .gemini-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 3px;
        }
        .gemini-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </>
  );
}
