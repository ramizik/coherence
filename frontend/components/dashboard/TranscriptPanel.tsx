'use client';

import { useState } from 'react';
import { FileText, ChevronDown, Search, Download } from 'lucide-react';
import { type TranscriptSegment as TranscriptSegmentType, formatTimestamp } from '@/lib/mock-data';

interface TranscriptPanelProps {
  transcript: TranscriptSegmentType[];
  onSeek: (timestamp: number) => void;
}

/**
 * TranscriptPanel - Collapsible full transcript with highlighted issues
 * 
 * Features:
 * - Expandable/collapsible panel
 * - Clickable timestamps to seek video
 * - Highlighted filler words and mismatches
 * - Search functionality
 * - Export to TXT
 */
export function TranscriptPanel({ transcript, onSeek }: TranscriptPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Count issues in transcript
  const issueCount = transcript.filter(seg => seg.highlight).length;

  // Calculate total word count
  const wordCount = transcript.reduce((acc, seg) => acc + seg.text.split(' ').length, 0);

  // Filter transcript by search query
  const filteredTranscript = searchQuery
    ? transcript.filter(seg => seg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : transcript;

  // Export transcript
  const handleExport = () => {
    const text = transcript
      .map(seg => `[${formatTimestamp(seg.timestamp)}] ${seg.text}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-400" strokeWidth={2} />
          <h2 className="text-[16px] font-semibold text-white" style={{ fontWeight: 600 }}>
            Full Transcript
          </h2>
          <span className="text-[14px] text-gray-400">
            ({wordCount} words)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {issueCount > 0 && (
            <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[12px] font-semibold" style={{ fontWeight: 600 }}>
              {issueCount} issue{issueCount !== 1 ? 's' : ''} highlighted
            </div>
          )}
          
          <ChevronDown
            className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Tools bar */}
          <div className="px-8 py-4 bg-white/[0.02] flex items-center justify-between gap-4 border-b border-white/10">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
              style={{ fontWeight: 500 }}
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              Download TXT
            </button>
          </div>

          {/* Transcript content */}
          <div 
            className="px-8 py-6 max-h-[500px] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(139, 92, 246, 0.5) rgba(255, 255, 255, 0.05)',
            }}
          >
            {filteredTranscript.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTranscript.map((segment) => (
                  <TranscriptSegment
                    key={segment.id}
                    segment={segment}
                    onSeek={onSeek}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TranscriptSegmentProps {
  segment: TranscriptSegmentType;
  onSeek: (timestamp: number) => void;
}

function TranscriptSegment({ segment, onSeek }: TranscriptSegmentProps) {
  // Determine styling based on highlight type
  const getHighlightStyle = () => {
    if (segment.highlight === 'filler') {
      return {
        bg: 'bg-amber-500/10',
        border: 'border-l-2 border-amber-500',
        text: 'text-white',
        badge: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Filler Words' },
      };
    }
    if (segment.highlight === 'mismatch') {
      return {
        bg: 'bg-red-500/10',
        border: 'border-l-2 border-red-500',
        text: 'text-white',
        badge: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Emotional Mismatch' },
      };
    }
    return {
      bg: '',
      border: '',
      text: 'text-gray-300',
      badge: null,
    };
  };

  const style = getHighlightStyle();

  // Highlight filler words in text
  const renderText = () => {
    if (segment.highlight === 'filler') {
      const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually'];
      let highlightedText = segment.text;
      
      fillerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        highlightedText = highlightedText.replace(
          regex,
          `<mark class="bg-amber-500/30 text-amber-200 px-1 rounded" style="text-decoration: underline wavy rgba(245, 158, 11, 0.6) 2px;">${word}</mark>`
        );
      });

      return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    }

    return segment.text;
  };

  return (
    <div className={`${style.bg} ${style.border} rounded-r-lg pl-4 pr-4 py-3 transition-all hover:bg-white/5`}>
      <div className="flex items-start gap-3">
        {/* Timestamp */}
        <button
          onClick={() => onSeek(segment.timestamp)}
          className="flex-shrink-0 font-mono text-[12px] text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 bg-purple-500/10 rounded hover:bg-purple-500/20"
          style={{ fontFamily: 'monospace', fontWeight: 500 }}
        >
          [{formatTimestamp(segment.timestamp)}]
        </button>

        <div className="flex-1">
          {/* Badge (if highlighted) */}
          {style.badge && (
            <div className={`inline-block ${style.badge.bg} ${style.badge.text} px-2 py-0.5 rounded text-[10px] font-semibold mb-2 uppercase tracking-wide`} style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
              {style.badge.label}
            </div>
          )}

          {/* Text */}
          <p className={`text-[15px] ${style.text}`} style={{ lineHeight: 1.8 }}>
            {renderText()}
          </p>
        </div>
      </div>
    </div>
  );
}
