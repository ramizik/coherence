/**
 * Mock data for frontend development and testing.
 * 
 * This data matches the TypeScript interfaces and can be used when
 * the backend is not available.
 */
import type { AnalysisResult, StatusResponse } from '@/types';

export const mockAnalysisResult: AnalysisResult = {
  videoId: 'demo-video-1',
  videoUrl: '/mock-videos/sample-pitch.mp4',
  durationSeconds: 183,
  coherenceScore: 67,
  scoreTier: 'Good Start',
  metrics: {
    eyeContact: 62,
    fillerWords: 12,
    fidgeting: 8,
    speakingPace: 156,
    speakingPaceTarget: '140-160',
  },
  dissonanceFlags: [
    {
      id: 'flag-1',
      timestamp: 45.2,
      endTimestamp: 48.0,
      type: 'EMOTIONAL_MISMATCH',
      severity: 'HIGH',
      description: 'Said "thrilled to present" but facial expression showed anxiety',
      coaching: 'Practice saying this line while smiling in a mirror. Your face should match your excitement.',
      visualEvidence: 'TwelveLabs: "person looking anxious" at 0:43-0:48',
      verbalEvidence: 'Deepgram: "thrilled" (positive sentiment)',
    },
    {
      id: 'flag-2',
      timestamp: 83.5,
      type: 'MISSING_GESTURE',
      severity: 'MEDIUM',
      description: 'Said "look at this data" without pointing at screen',
      coaching: 'When referencing visuals, physically point to anchor audience attention.',
      verbalEvidence: 'Deepgram: deictic phrase "this data" detected',
    },
    {
      id: 'flag-3',
      timestamp: 135.8,
      endTimestamp: 149.8,
      type: 'PACING_MISMATCH',
      severity: 'HIGH',
      description: 'Slide 4 contains 127 words but only shown for 14 seconds',
      coaching: 'Either reduce slide text to <50 words or extend explanation to ~45 seconds.',
    },
  ],
  timelineHeatmap: [
    { timestamp: 12, severity: 'LOW' },
    { timestamp: 45, severity: 'HIGH' },
    { timestamp: 83, severity: 'MEDIUM' },
    { timestamp: 135, severity: 'HIGH' },
  ],
  strengths: ['Clear voice projection', 'Logical structure', 'Good pacing overall'],
  priorities: [
    'Reduce nervous fidgeting (8 instances detected)',
    'Increase eye contact with camera (currently 62%, target 80%)',
    'Match facial expressions to emotional language',
  ],
};

export const mockStatusSequence: StatusResponse[] = [
  { videoId: 'demo', status: 'queued', progress: 0, stage: 'Queued for processing...' },
  { videoId: 'demo', status: 'processing', progress: 10, stage: 'Extracting audio...', etaSeconds: 50 },
  { videoId: 'demo', status: 'processing', progress: 25, stage: 'Transcribing speech...', etaSeconds: 40 },
  { videoId: 'demo', status: 'processing', progress: 45, stage: 'Analyzing body language...', etaSeconds: 30 },
  { videoId: 'demo', status: 'processing', progress: 65, stage: 'Detecting dissonance patterns...', etaSeconds: 20 },
  { videoId: 'demo', status: 'processing', progress: 85, stage: 'Generating coaching insights...', etaSeconds: 10 },
  { videoId: 'demo', status: 'complete', progress: 100, stage: 'Analysis complete!' },
];
