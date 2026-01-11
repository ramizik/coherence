/**
 * Mock Data for Coherence Analysis Results
 *
 * This file contains comprehensive mock data representing a full presentation analysis.
 * In production, this data would come from the FastAPI backend after video processing.
 *
 * BACKEND_HOOK: Replace with actual API calls
 * GET /api/videos/{videoId}/results
 */

export interface DissonanceFlag {
  id: string;
  timestamp: number; // in seconds
  type: 'EMOTIONAL_MISMATCH' | 'MISSING_GESTURE' | 'PACING_MISMATCH' | 'EYE_CONTACT_LOSS' | 'FILLER_WORDS' | 'POSITIVE_MOMENT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  quote?: string; // What the user said
  coaching: string; // Actionable advice
  confidence?: number; // AI confidence (0-100)
  duration?: number; // How long the issue lasted (seconds)
  visualEvidence?: string; // What TwelveLabs detected
  verbalEvidence?: string; // What Deepgram transcribed
}

export interface Metrics {
  eyeContact: number; // percentage 0-100
  fillerWords: number; // count
  speakingPace: number; // words per minute
  fidgeting: number; // count
  // Detailed breakdowns
  eyeContactTrend: number; // +/- percentage change
  fillerWordsTrend: number; // +/- count change
  speakingPaceTrend: number; // +/- WPM change
  fidgetingTrend: number; // +/- count change
}

// Import Gemini types from API types
import type { GeminiReport } from '../types/api';

export interface AnalysisResult {
  videoId: string;
  videoTitle: string;
  uploadDate: string;
  duration: number; // total seconds
  fileSize: string;
  resolution: string;
  coherenceScore: number; // 0-100
  metrics: Metrics;
  dissonanceFlags: DissonanceFlag[];
  transcript: TranscriptSegment[];
  videoUrl: string;
  thumbnailUrl?: string;
  // Gemini comprehensive coaching report (separate tab in frontend)
  geminiReport?: GeminiReport;
}

export type { GeminiReport };

export interface TranscriptSegment {
  id: string;
  timestamp: number; // start time in seconds
  text: string;
  speaker?: string;
  highlight?: 'filler' | 'mismatch' | null;
  flagId?: string; // Reference to associated dissonance flag
}

// Mock video URL (placeholder)
export const MOCK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const mockAnalysisResult: AnalysisResult = {
  videoId: 'demo-video-abc123',
  videoTitle: 'MBA Product Pitch - Final Presentation',
  uploadDate: 'Jan 10, 2026',
  duration: 222, // 3:42
  fileSize: '45 MB',
  resolution: '1080p',
  coherenceScore: 67,

  metrics: {
    eyeContact: 85,
    fillerWords: 8,
    speakingPace: 142,
    fidgeting: 6,
    eyeContactTrend: 12, // +12%
    fillerWordsTrend: -5, // -5 words (improvement)
    speakingPaceTrend: 8, // +8 WPM
    fidgetingTrend: -2, // -2 fidgets (improvement)
  },

  dissonanceFlags: [
    {
      id: 'flag-1',
      timestamp: 15.5,
      type: 'EMOTIONAL_MISMATCH',
      severity: 'HIGH',
      quote: "We're incredibly thrilled about our Q4 results",
      description: "Your facial expression showed ANXIETY (87% confidence). Your frown contradicted the enthusiasm in your words.",
      coaching: "Smile with teeth and lean forward 10° when expressing enthusiasm. Practice in a mirror until the expression feels natural.",
      confidence: 87,
      duration: 12,
    },
    {
      id: 'flag-2',
      timestamp: 45.2,
      type: 'MISSING_GESTURE',
      severity: 'MEDIUM',
      quote: "Look at this chart on the right",
      description: "No hand movement or pointing gesture detected when referencing visual elements.",
      coaching: "Point at the screen or use a laser pointer to guide audience attention. Physical gestures reinforce verbal cues.",
      confidence: 92,
      duration: 8,
    },
    {
      id: 'flag-3',
      timestamp: 105.8,
      type: 'PACING_MISMATCH',
      severity: 'HIGH',
      description: "Slide 4 contains 127 words but you only spent 14 seconds on it. Audience cannot read and listen simultaneously.",
      coaching: "Either cut slide text to 50 words or extend your explanation to ~45 seconds. Use the 1-second-per-word rule.",
      confidence: 95,
      duration: 14,
    },
    {
      id: 'flag-4',
      timestamp: 135.3,
      type: 'EYE_CONTACT_LOSS',
      severity: 'MEDIUM',
      description: "Looked at floor for 8 consecutive seconds during key value proposition statement.",
      coaching: "Practice looking at the camera lens (simulates audience eye contact). Place a sticky note with a smiley face near the lens as a reminder.",
      confidence: 89,
      duration: 8,
    },
    {
      id: 'flag-5',
      timestamp: 27.8,
      type: 'FILLER_WORDS',
      severity: 'LOW',
      description: "Used 'um' 3 times in 20 seconds during the opening introduction.",
      coaching: "Pause instead of filling silence. Silence shows confidence. Practice replacing filler words with 2-second pauses.",
      confidence: 78,
      duration: 20,
    },
    {
      id: 'flag-6',
      timestamp: 170.5,
      type: 'POSITIVE_MOMENT',
      severity: 'LOW',
      quote: "Our solution saves companies an average of $50,000 annually",
      description: "Perfect emotional alignment! Confident tone matched with genuine smile and open body language.",
      coaching: "This is your peak performance - keep this energy throughout. Your conviction was palpable and persuasive.",
      confidence: 94,
      duration: 15,
    },
  ],

  transcript: [
    {
      id: 'seg-1',
      timestamp: 0,
      text: "Good morning everyone. Um, thank you for, uh, being here today. I'm excited to present our, like, revolutionary new product.",
      highlight: 'filler',
      flagId: 'flag-5',
    },
    {
      id: 'seg-2',
      timestamp: 12,
      text: "We're incredibly thrilled about our Q4 results. Revenue exceeded projections by 34%.",
      highlight: 'mismatch',
      flagId: 'flag-1',
    },
    {
      id: 'seg-3',
      timestamp: 32,
      text: "Let me walk you through the market analysis. As you can see here, our target demographic has grown significantly.",
      highlight: null,
    },
    {
      id: 'seg-4',
      timestamp: 45,
      text: "Look at this chart on the right - it shows our competitive positioning across three key metrics.",
      highlight: 'mismatch',
      flagId: 'flag-2',
    },
    {
      id: 'seg-5',
      timestamp: 58,
      text: "Now, the technical architecture is built on a microservices foundation with real-time data synchronization.",
      highlight: null,
    },
    {
      id: 'seg-6',
      timestamp: 78,
      text: "Our AI engine analyzes customer behavior patterns and predicts churn with 92% accuracy.",
      highlight: null,
    },
    {
      id: 'seg-7',
      timestamp: 95,
      text: "Moving to the financial projections - we anticipate breaking even by Q3 next year.",
      highlight: null,
    },
    {
      id: 'seg-8',
      timestamp: 120,
      text: "The go-to-market strategy focuses on enterprise clients in the fintech sector initially.",
      highlight: null,
    },
    {
      id: 'seg-9',
      timestamp: 135,
      text: "Our unique value proposition combines ease of use with enterprise-grade security and scalability.",
      highlight: 'mismatch',
      flagId: 'flag-4',
    },
    {
      id: 'seg-10',
      timestamp: 155,
      text: "We've assembled a world-class team with expertise spanning AI, cloud infrastructure, and product design.",
      highlight: null,
    },
    {
      id: 'seg-11',
      timestamp: 170,
      text: "Our solution saves companies an average of $50,000 annually while improving customer satisfaction by 28%.",
      highlight: null,
      flagId: 'flag-6',
    },
    {
      id: 'seg-12',
      timestamp: 190,
      text: "In conclusion, we're seeking $2M in Series A funding to scale our sales and engineering teams.",
      highlight: null,
    },
    {
      id: 'seg-13',
      timestamp: 208,
      text: "Thank you for your time. I'm happy to answer any questions you might have.",
      highlight: null,
    },
  ],

  videoUrl: MOCK_VIDEO_URL,
  thumbnailUrl: '/mock-thumbnails/presentation-frame.jpg',
};

/**
 * Performance level text based on coherence score
 */
export function getPerformanceLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 76) {
    return {
      label: 'Excellent',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    };
  } else if (score >= 51) {
    return {
      label: 'Good Start',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    };
  } else {
    return {
      label: 'Needs Work',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    };
  }
}

/**
 * Get score ring gradient colors based on score
 */
export function getScoreGradient(score: number): {
  from: string;
  to: string;
} {
  if (score >= 76) {
    return { from: '#10B981', to: '#34D399' }; // Green to emerald
  } else if (score >= 51) {
    return { from: '#F59E0B', to: '#FCD34D' }; // Orange to yellow
  } else {
    return { from: '#EF4444', to: '#F59E0B' }; // Red to orange
  }
}

/**
 * Format timestamp from seconds to MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
