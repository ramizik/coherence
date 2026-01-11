'use client';

import { useState } from 'react';
import { Clock, Lightbulb, Frown, Hand, Clock as ClockIcon, Eye, MessageSquare, CheckCircle, ChevronDown } from 'lucide-react';
import { DissonanceFlag, formatTimestamp } from '../../lib/mock-data';

interface CoachingCardsProps {
  flags: DissonanceFlag[];
  onSeek: (timestamp: number, flagId: string) => void;
  selectedFlagId: string | null;
}

type FilterType = 'all' | 'critical' | 'warnings' | 'suggestions';

const issueTypeIcons = {
  EMOTIONAL_MISMATCH: Frown,
  MISSING_GESTURE: Hand,
  PACING_MISMATCH: ClockIcon,
  EYE_CONTACT_LOSS: Eye,
  FILLER_WORDS: MessageSquare,
  POSITIVE_MOMENT: CheckCircle,
};

/**
 * CoachingCards - Scrollable stack of coaching insights and feedback
 * 
 * Features:
 * - Severity-based color coding (HIGH, MEDIUM, LOW)
 * - Interactive cards that seek video on click
 * - Filter by severity level
 * - Mark as reviewed functionality
 * - Highlights when selected from timeline
 */
export function CoachingCards({ flags, onSeek, selectedFlagId }: CoachingCardsProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [reviewedFlags, setReviewedFlags] = useState<Set<string>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter flags based on selected filter
  const filteredFlags = flags.filter(flag => {
    if (filter === 'critical') return flag.severity === 'HIGH';
    if (filter === 'warnings') return flag.severity === 'MEDIUM';
    if (filter === 'suggestions') return flag.severity === 'LOW';
    return true; // 'all'
  });

  // Count issues by severity
  const issueCount = flags.filter(f => f.type !== 'POSITIVE_MOMENT').length;

  const toggleReviewed = (flagId: string) => {
    const newReviewed = new Set(reviewedFlags);
    if (newReviewed.has(flagId)) {
      newReviewed.delete(flagId);
    } else {
      newReviewed.add(flagId);
    }
    setReviewedFlags(newReviewed);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-white" style={{ fontWeight: 600 }}>
            Coaching Insights
          </h2>
          <span className="text-[14px] text-gray-400">
            ({issueCount} issue{issueCount !== 1 ? 's' : ''} detected)
          </span>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            style={{ fontWeight: 500 }}
          >
            {filter === 'all' && 'All Issues'}
            {filter === 'critical' && 'Critical'}
            {filter === 'warnings' && 'Warnings'}
            {filter === 'suggestions' && 'Suggestions'}
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>

          {showFilterMenu && (
            <div className="absolute top-full mt-2 right-0 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 min-w-[140px]">
              {[
                { value: 'all', label: 'All Issues' },
                { value: 'critical', label: 'Critical' },
                { value: 'warnings', label: 'Warnings' },
                { value: 'suggestions', label: 'Suggestions' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilter(value as FilterType);
                    setShowFilterMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-[13px] hover:bg-white/10 transition-colors ${
                    value === filter ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cards container - scrollable */}
      <div 
        className="flex-1 space-y-4 overflow-y-auto pr-3 max-h-[700px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139, 92, 246, 0.5) rgba(255, 255, 255, 0.05)',
        }}
      >
        {filteredFlags.map((flag) => (
          <CoachingCard
            key={flag.id}
            flag={flag}
            onSeek={onSeek}
            isSelected={flag.id === selectedFlagId}
            isReviewed={reviewedFlags.has(flag.id)}
            onToggleReviewed={toggleReviewed}
          />
        ))}

        {filteredFlags.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" strokeWidth={2} />
            <p className="text-[24px] font-bold text-white mb-2" style={{ fontWeight: 700 }}>
              No Issues Found
            </p>
            <p className="text-[16px] text-gray-400">
              {filter !== 'all' ? 'Try changing the filter' : 'Great job!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CoachingCardProps {
  flag: DissonanceFlag;
  onSeek: (timestamp: number, flagId: string) => void;
  isSelected: boolean;
  isReviewed: boolean;
  onToggleReviewed: (flagId: string) => void;
}

function CoachingCard({ flag, onSeek, isSelected, isReviewed, onToggleReviewed }: CoachingCardProps) {
  const isPositive = flag.type === 'POSITIVE_MOMENT';
  
  // Severity-based styling
  const severityConfig = {
    HIGH: {
      borderColor: 'border-red-500',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      badgeText: '❌ CRITICAL',
      gradientOverlay: 'bg-gradient-to-r from-red-500/5 to-transparent',
    },
    MEDIUM: {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
      badgeText: '⚠️ WARNING',
      gradientOverlay: 'bg-gradient-to-r from-amber-500/5 to-transparent',
    },
    LOW: {
      borderColor: isPositive ? 'border-green-500/50' : 'border-green-500/50',
      bgColor: isPositive ? 'bg-green-500/20' : 'bg-green-500/10',
      textColor: 'text-green-400',
      badgeText: isPositive ? '✓ EXCELLENT' : '✓ TIP',
      gradientOverlay: 'bg-gradient-to-r from-green-500/5 to-transparent',
    },
  };

  const config = severityConfig[flag.severity];
  const Icon = issueTypeIcons[flag.type];

  return (
    <div
      className={`relative bg-white/5 backdrop-blur-md border-2 ${config.borderColor} rounded-xl p-6 transition-all duration-400 hover:-translate-y-0.5 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0F172A]' : ''
      } ${isReviewed ? 'opacity-50' : ''}`}
    >
      {/* Gradient overlay on left edge */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.gradientOverlay}`} />

      {/* Background icon (watermark) */}
      {Icon && (
        <Icon className="absolute top-6 right-6 w-12 h-12 text-white opacity-5" strokeWidth={1.5} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        {/* Severity badge */}
        <div className={`px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} text-[12px] font-semibold border ${config.borderColor}`} style={{ fontWeight: 600 }}>
          {config.badgeText}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md">
          <Clock className="w-3 h-3 text-gray-400" strokeWidth={2} />
          <span className="text-[13px] font-medium text-gray-400" style={{ fontWeight: 500 }}>
            ⏱ {formatTimestamp(flag.timestamp)}
          </span>
        </div>
      </div>

      {/* Issue type tag */}
      <div className="mb-3">
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.05em' }}>
          {flag.type.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Quote section (if exists) */}
      {flag.quote && (
        <div className="mb-3">
          <p className="text-[12px] font-medium text-gray-500 mb-1" style={{ fontWeight: 500 }}>
            You said:
          </p>
          <p className="text-[15px] text-white italic pl-3 border-l-4 border-purple-500/30" style={{ lineHeight: 1.5 }}>
            "{flag.quote}"
          </p>
        </div>
      )}

      {/* Problem description */}
      <div className="mb-4">
        {flag.quote && (
          <p className="text-[12px] font-medium text-gray-500 mb-1" style={{ fontWeight: 500 }}>
            But:
          </p>
        )}
        <p className="text-[14px] text-gray-300" style={{ lineHeight: 1.6 }}>
          {flag.description}
        </p>
      </div>

      {/* Coaching advice */}
      <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" strokeWidth={2} />
          <span className="text-[13px] font-semibold text-cyan-300" style={{ fontWeight: 600 }}>
            {isPositive ? 'Keep it up:' : 'How to fix:'}
          </span>
        </div>
        <p className="text-[14px] text-cyan-100" style={{ lineHeight: 1.6 }}>
          {flag.coaching}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSeek(flag.timestamp, flag.id)}
          className="flex-1 px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 hover:border-purple-400 transition-all text-[14px] font-medium"
          style={{ fontWeight: 500 }}
        >
          Jump to Moment →
        </button>

        {!isPositive && (
          <button
            onClick={() => onToggleReviewed(flag.id)}
            className={`px-4 py-2 border rounded-lg transition-all text-[14px] font-medium ${
              isReviewed
                ? 'bg-green-500/20 border-green-500 text-green-300'
                : 'bg-transparent border-white/20 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
            style={{ fontWeight: 500 }}
          >
            {isReviewed ? '✓ Reviewed' : 'Mark as Reviewed'}
          </button>
        )}
      </div>

      {/* Confidence indicator (optional, bottom-right corner) */}
      {flag.confidence && (
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-500">
          {flag.confidence}% confidence
        </div>
      )}
    </div>
  );
}