'use client';

import { Eye, MessageSquare, Gauge, Hand, TrendingUp, TrendingDown } from 'lucide-react';
import { Metrics } from '@/lib/mock-data';

interface QuickStatsProps {
  metrics: Metrics;
}

interface StatCardData {
  icon: typeof Eye;
  value: string;
  label: string;
  trend?: number;
  trendDirection?: 'up' | 'down';
}

/**
 * QuickStats - 2x2 grid of key performance metrics
 * 
 * Displays:
 * - Eye Contact percentage
 * - Filler Words count
 * - Speaking Pace (WPM)
 * - Fidget count
 * 
 * Each card shows value, label, and optional trend indicator
 */
export function QuickStats({ metrics }: QuickStatsProps) {
  const stats: StatCardData[] = [
    {
      icon: Eye,
      value: `${metrics.eyeContact}%`,
      label: 'Eye Contact',
      trend: Math.abs(metrics.eyeContactTrend),
      trendDirection: metrics.eyeContactTrend >= 0 ? 'up' : 'down',
    },
    {
      icon: MessageSquare,
      value: `${metrics.fillerWords}`,
      label: 'Filler Words',
      trend: Math.abs(metrics.fillerWordsTrend),
      trendDirection: metrics.fillerWordsTrend <= 0 ? 'up' : 'down', // Lower is better, so inverted
    },
    {
      icon: Gauge,
      value: `${metrics.speakingPace}`,
      label: 'WPM',
      trend: Math.abs(metrics.speakingPaceTrend),
      trendDirection: metrics.speakingPaceTrend >= 0 ? 'up' : 'down',
    },
    {
      icon: Hand,
      value: `${metrics.fidgeting}`,
      label: 'Fidgets',
      trend: Math.abs(metrics.fidgetingTrend),
      trendDirection: metrics.fidgetingTrend <= 0 ? 'up' : 'down', // Lower is better, so inverted
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, trend, trendDirection }: StatCardData) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trendDirection === 'up' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="relative w-[160px] h-[80px] bg-white/5 border border-white/8 rounded-xl p-4 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Icon - top left */}
      <Icon className="absolute top-4 left-4 w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" strokeWidth={2} />

      {/* Value - large */}
      <div className="flex flex-col items-end justify-center h-full">
        <span className="text-[32px] font-bold text-white leading-none" style={{ fontWeight: 700 }}>
          {value}
        </span>
        
        {/* Label */}
        <span className="text-[12px] text-gray-400 mt-1" style={{ fontWeight: 400 }}>
          {label}
        </span>
      </div>

      {/* Trend indicator - bottom right */}
      {trend !== undefined && (
        <div className={`absolute bottom-3 right-3 flex items-center gap-0.5 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[11px] font-semibold" style={{ fontWeight: 600 }}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
