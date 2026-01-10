'use client';

import { useEffect, useState } from 'react';
import { Brain, Eye, Mic, Zap, TrendingUp, Target, Sparkles, Activity } from 'lucide-react';

interface HexagonData {
  id: number;
  text: string;
  icon: typeof Brain;
  position: {
    x: number;
    y: number;
  };
  delay: number;
  duration: number;
}

const facts = [
  { text: 'AI analyzes 47 facial expressions per second', icon: Eye },
  { text: '89% of communication is non-verbal', icon: Brain },
  { text: 'Voice tone carries 38% of your message', icon: Mic },
  { text: 'Processing 180 seconds of micro-expressions', icon: Activity },
  { text: 'Detecting emotional congruence patterns', icon: Sparkles },
  { text: 'Eye contact boosts trust by 52%', icon: Target },
  { text: 'Analyzing speech-gesture synchronization', icon: Zap },
  { text: 'Optimal speaking pace: 140-160 words/min', icon: TrendingUp },
  { text: 'Scanning for filler word patterns', icon: Mic },
  { text: 'Mapping energy levels throughout presentation', icon: Activity },
  { text: 'Cross-referencing slide content with delivery', icon: Brain },
  { text: 'Identifying high-impact coaching moments', icon: Target },
];

/**
 * FloatingHexagons - Animated hexagons with facts that float around the processing view
 * 
 * Features:
 * - Random positioning around the viewport with overlap prevention
 * - Fade in/out animations
 * - Glassmorphic design with hover effects
 * - Interesting facts about AI analysis and presentation coaching
 */
export function FloatingHexagons() {
  const [hexagons, setHexagons] = useState<HexagonData[]>([]);

  useEffect(() => {
    // Generate hexagons with random positions
    const generateHexagons = () => {
      const count = 4; // Reduced number of hexagons
      const newHexagons: HexagonData[] = [];
      const occupiedAreas: { x: number; y: number }[] = [];
      const minDistance = 25; // Minimum distance between hexagons (in percentage)

      const isPositionValid = (x: number, y: number) => {
        // Check if in center area (where processing card is)
        if (x > 20 && x < 80 && y > 15 && y < 85) {
          return false;
        }

        // Check distance from other hexagons
        for (const area of occupiedAreas) {
          const distance = Math.sqrt(Math.pow(x - area.x, 2) + Math.pow(y - area.y, 2));
          if (distance < minDistance) {
            return false;
          }
        }

        return true;
      };

      let attempts = 0;
      while (newHexagons.length < count && attempts < 100) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        if (isPositionValid(x, y)) {
          const fact = facts[Math.floor(Math.random() * facts.length)];
          
          newHexagons.push({
            id: newHexagons.length,
            text: fact.text,
            icon: fact.icon,
            position: { x, y },
            delay: Math.random() * 2,
            duration: 4 + Math.random() * 2,
          });

          occupiedAreas.push({ x, y });
        }

        attempts++;
      }

      setHexagons(newHexagons);
    };

    generateHexagons();

    // Regenerate hexagons every 10 seconds for variety
    const interval = setInterval(() => {
      generateHexagons();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {hexagons.map((hexagon) => (
        <div
          key={hexagon.id}
          className="absolute pointer-events-auto animate-float-in"
          style={{
            left: `${hexagon.position.x}%`,
            top: `${hexagon.position.y}%`,
            animationDelay: `${hexagon.delay}s`,
            animationDuration: `${hexagon.duration}s`,
          }}
        >
          <HexagonCard text={hexagon.text} icon={hexagon.icon} />
        </div>
      ))}
    </div>
  );
}

interface HexagonCardProps {
  text: string;
  icon: typeof Brain;
}

function HexagonCard({ text, icon: Icon }: HexagonCardProps) {
  return (
    <div 
      className="relative w-[160px] h-[180px] group cursor-pointer transition-all duration-500 hover:scale-105"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
    >
      {/* Glassmorphic hexagon background */}
      <div 
        className="absolute inset-0 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-[#8B5CF6]/20 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
        style={{
          clipPath: 'inherit',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center w-full h-full px-6 py-8">
        {/* Icon */}
        <div className="mb-3 p-2.5 rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/10 group-hover:border-[#8B5CF6]/30 group-hover:bg-[#8B5CF6]/10 transition-all duration-500">
          <Icon className="w-5 h-5 text-[#8B5CF6]/70 group-hover:text-[#8B5CF6] transition-colors duration-500" strokeWidth={2} />
        </div>

        {/* Text */}
        <p className="text-[10.5px] text-white/40 text-center leading-relaxed font-medium group-hover:text-white/60 transition-colors duration-500" style={{ fontWeight: 500 }}>
          {text}
        </p>
      </div>
    </div>
  );
}