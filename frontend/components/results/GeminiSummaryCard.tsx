// Gemini Summary Card component

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
  // Split coaching advice to highlight key phrases
  const renderAdvice = () => {
    // Highlight "Your top priority:" or "Focus on:" phrases if present
    const priorityPatterns = ['Your top priority:', 'Focus on:', 'Key improvement:'];
    for (const pattern of priorityPatterns) {
      if (coachingAdvice.includes(pattern)) {
        const parts = coachingAdvice.split(pattern);
        return (
          <>
            {parts[0]}
            <span className="font-semibold text-cyan-400">{pattern}</span>
            {parts[1]}
          </>
        );
      }
    }
    return coachingAdvice;
  };

  return (
    <div
      className="
        w-[420px] h-[140px]
        bg-slate-800/40 backdrop-blur-md
        border border-white/8
        rounded-xl
        p-5
        shadow-lg shadow-black/20
        hover:border-white/12
        transition-all duration-300
        relative
        animate-slide-in-right
      "
      role="complementary"
      aria-label="AI-generated presentation summary by Gemini"
    >
      {/* Gemini Logo Badge */}
      <div
        className="
          absolute -top-2 -right-2
          w-7 h-7
          bg-gradient-to-br from-purple-500/20 to-cyan-500/20
          border border-purple-400/30
          rounded-full
          p-1.5
          flex items-center justify-center
          animate-pulse-subtle
          group
        "
        title="Powered by Gemini 1.5 Pro"
      >
        {/* Gemini Constellation Icon (♊) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-purple-400"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
            opacity="0.6"
          />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>

        {/* Tooltip on hover */}
        <div className="
          absolute -bottom-10 left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-nowrap
        ">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg border border-white/10">
            Powered by Gemini 1.5 Pro
          </div>
        </div>
      </div>

      {/* Headline (if available) */}
      {headline && (
        <p className="text-white font-semibold text-[15px] mb-2">
          {headline}
        </p>
      )}

      {/* AI Coaching Advice */}
      <p className="text-gray-300 text-[14px] leading-relaxed max-w-[380px] pr-8">
        {renderAdvice()}
      </p>

      {/* AI Indicator Label */}


      {/* Custom animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 600ms cubic-bezier(0.4, 0, 0.2, 1) 1.2s both;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        .animate-pulse-subtle:hover {
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in-right {
            animation: none;
            opacity: 1;
            transform: translateX(0);
          }

          .animate-pulse-subtle {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
