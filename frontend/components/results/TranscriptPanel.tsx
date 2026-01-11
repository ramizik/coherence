import { FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TranscriptWord {
  text: string;
  startTime: number;
  endTime: number;
  isFiller: boolean;
}

interface TranscriptPanelProps {
  transcript: TranscriptWord[];
  currentTime: number;
  onWordClick: (time: number) => void;
}

export function TranscriptPanel({ transcript, currentTime, onWordClick }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to keep current word visible
  useEffect(() => {
    if (currentWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = currentWordRef.current;

      const containerRect = container.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();

      // Check if word is outside visible area
      if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
        word.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime]);

  // Find the current word based on video time
  const getCurrentWordIndex = () => {
    return transcript.findIndex(
      (word) => currentTime >= word.startTime && currentTime < word.endTime
    );
  };

  const currentWordIndex = getCurrentWordIndex();

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: '#1E293B',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <FileText size={16} style={{ color: '#A78BFA' }} />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#F1F5F9',
          }}
        >
          Transcript
        </span>
        <span
          style={{
            fontSize: '12px',
            color: '#94A3B8',
            marginLeft: 'auto',
          }}
        >
          Click any word to jump
        </span>
      </div>

      {/* Scrollable transcript */}
      <div
        ref={containerRef}
        className="overflow-y-auto p-4 pr-2 custom-scrollbar"
        style={{
          maxHeight: '220px',
          lineHeight: '1.8',
        }}
      >
        <div className="flex flex-wrap gap-x-1 gap-y-2">
          {transcript.map((word, index) => {
            const isCurrentWord = index === currentWordIndex;

            return (
              <span
                key={index}
                ref={isCurrentWord ? currentWordRef : null}
                onClick={() => onWordClick(word.startTime)}
                className="cursor-pointer transition-all duration-150"
                style={{
                  fontSize: '15px',
                  fontWeight: isCurrentWord ? 600 : 400,
                  color: isCurrentWord ? '#FFFFFF' : '#CBD5E1',
                  background: word.isFiller
                    ? 'rgba(251, 146, 60, 0.25)' // Orange for filler words
                    : isCurrentWord
                    ? 'rgba(167, 139, 250, 0.3)' // Purple for current word
                    : 'transparent',
                  padding: word.isFiller || isCurrentWord ? '2px 4px' : '2px 0',
                  borderRadius: '4px',
                  textDecoration: word.isFiller ? 'underline' : 'none',
                  textDecorationColor: word.isFiller ? 'rgba(251, 146, 60, 0.5)' : 'transparent',
                  textDecorationStyle: 'wavy',
                  textUnderlineOffset: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentWord) {
                    e.currentTarget.style.color = '#F1F5F9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentWord) {
                    e.currentTarget.style.color = '#CBD5E1';
                  }
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
