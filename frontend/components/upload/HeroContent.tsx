'use client';

import { CheckCircle } from 'lucide-react';

/**
 * HeroContent - Left column content with branding, headline, and features
 * 
 * Displays:
 * - Main headline with gradient text
 * - Subheadline
 * - Feature pills
 * - Trust indicators
 */
export function HeroContent() {
  return (
    <div className="flex flex-col justify-center gap-0">
      {/* Hero Content - Vertically Centered */}
      <div className="max-w-2xl space-y-12">
        {/* Main Headline */}
        <h2 
          className="text-[56px] font-black text-white leading-[1.1] tracking-tight"
          style={{ fontWeight: 900 }}
        >
          Your words say one thing. Your body says another.
        </h2>

        {/* Subheadline */}
        <p className="text-[20px] text-[#9CA3AF] leading-relaxed max-w-[560px]">
          Upload your presentation and discover when your body language contradicts your words. Get actionable coaching to speak with confidence.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4">
          <FeaturePill text="✓ Analyzes speech & body language" />
          <FeaturePill text="✓ Detects emotional mismatches" />
          <FeaturePill text="✓ Instant coaching feedback" />
        </div>

        {/* Trust Indicator */}
        <div className="flex items-center gap-2 text-[14px] text-[#6B7280]">
          
        </div>
      </div>
    </div>
  );
}

/**
 * FeaturePill - Small glassmorphic badge for feature highlights
 */
function FeaturePill({ text }: { text: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-[14px] text-white/90 whitespace-nowrap">
      {text}
    </div>
  );
}