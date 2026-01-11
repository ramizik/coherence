'use client';

import { PipelineNode } from './PipelineNode';
import { Connector } from './Connector';
import { InputCard } from './InputCard';
import { OutputCard } from './OutputCard';

/**
 * PipelineSection - White contrast section showing 3-step AI pipeline
 * 
 * Dramatic visual break from dark sections, showcasing Deepgram → TwelveLabs → Gemini
 * processing flow with sophisticated animations and technical credibility.
 */
export function PipelineSection() {
  return (
    <section 
      className="relative w-full"
      style={{ 
        background: '#F1F5F9',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB'
      }}
      aria-label="AI Processing Pipeline Diagram"
    >
      {/* Main container */}
      <div 
        className="max-w-[1400px] mx-auto px-[80px] py-[160px]"
        style={{ background: '#F1F5F9' }}
      >
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-[80px]">
          {/* Eyebrow text with gradient */}
          <div 
            className="mb-4 animate-pulse-subtle"
            style={{
              animation: 'pulse-text 3s ease-in-out infinite'
            }}
          >
            
          </div>

          {/* Main title */}
          <h2 
            className="tracking-tight max-w-[700px] mb-4"
            style={{ 
              fontWeight: 900,
              fontSize: '52px',
              lineHeight: '1.1',
              color: '#1F2937',
              letterSpacing: '-0.02em'
            }}
          >
            Three AI Models. One Perfect Analysis.
          </h2>

          {/* Subtitle */}
          <p 
            className="max-w-[600px]"
            style={{ 
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#6B7280'
            }}
          >
            Watch how your presentation flows through our AI pipeline in real-time
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative flex items-center justify-center mb-[60px]">
          {/* Input Card */}
          <div className="animate-fade-in-left">
            <InputCard />
          </div>

          {/* Dotted connector to Node 1 */}
          <div className="w-[80px] h-[2px] mx-4" style={{ borderTop: '2px dashed #D1D5DB' }} />

          {/* Node 1: Deepgram */}
          <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
            <PipelineNode
              step={1}
              company="Deepgram"
              subtitle="Audio Analysis"
              icon="waveform"
              features={['Transcription', 'Filler Words', 'Speaking Pace']}
              tooltipTitle="Speech Processing"
              tooltipContent="Converts audio to text, detects filler words (um, uh, like), measures speaking pace (WPM), and identifies pauses."
            />
          </div>

          {/* Animated Connector 1 */}
          <Connector delay={0} />

          {/* Node 2: TwelveLabs */}
          <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
            <PipelineNode
              step={2}
              company="TwelveLabs"
              subtitle="Visual Detection"
              icon="video"
              features={['Emotions', 'Eye Contact', 'Gestures']}
              tooltipTitle="Multimodal Video Understanding"
              tooltipContent="Analyzes facial expressions, tracks eye gaze direction, detects hand gestures and body language, identifies emotional states frame-by-frame."
            />
          </div>

          {/* Animated Connector 2 */}
          <Connector delay={700} />

          {/* Node 3: Gemini */}
          <div className="animate-scale-in" style={{ animationDelay: '600ms' }}>
            <PipelineNode
              step={3}
              company="Gemini"
              subtitle="AI Synthesis"
              icon="gemini"
              features={['Dissonance Detection', 'Coaching', 'Scoring']}
              tooltipTitle="Multimodal Reasoning Engine"
              tooltipContent="Synthesizes audio, visual, and slide data. Detects contradictions between speech and body language. Generates personalized coaching insights."
            />
          </div>

          {/* Dotted connector from Node 3 */}
          <div className="w-[80px] h-[2px] mx-4" style={{ borderTop: '2px dashed #D1D5DB' }} />

          {/* Output Card */}
          <div className="animate-fade-in-right" style={{ animationDelay: '800ms' }}>
            <OutputCard />
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes pulse-text {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 600ms ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-right {
          animation: fade-in-right 600ms ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 600ms ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-left,
          .animate-fade-in-right,
          .animate-scale-in,
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
