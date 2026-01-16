'use client';

import { Eye, MessageSquare, Gauge, Hand, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { Metrics } from '@/lib/mock-data';

interface MetricsGridProps {
  metrics: Metrics;
}

interface MetricCardData {
  icon: typeof Eye;
  title: string;
  value: string;
  target: string;
  percentage: number; // 0-100 for comparison bar
  insight: {
    icon: typeof CheckCircle;
    text: string;
    isGood: boolean;
  };
  trend: number;
  trendDirection: 'up' | 'down';
  isGoodTrend: boolean;
}

/**
 * MetricsGrid - Detailed 4-column grid showing in-depth metric analysis
 * 
 * Features:
 * - Eye Contact analysis
 * - Filler Words count
 * - Speaking Pace (WPM)
 * - Nervous Gestures count
 * 
 * Each card shows value, comparison bar, insight, and trend
 */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricCards: MetricCardData[] = [
    {
      icon: Eye,
      title: 'Eye Contact',
      value: `${metrics.eyeContact}%`,
      target: 'Target: 90%',
      percentage: (metrics.eyeContact / 90) * 100,
      insight: {
        icon: CheckCircle,
        text: metrics.eyeContact >= 80 ? 'Great job! Above average' : 'Needs improvement - practice more',
        isGood: metrics.eyeContact >= 80,
      },
      trend: Math.abs(metrics.eyeContactTrend),
      trendDirection: metrics.eyeContactTrend >= 0 ? 'up' : 'down',
      isGoodTrend: metrics.eyeContactTrend >= 0,
    },
    {
      icon: MessageSquare,
      title: 'Filler Words',
      value: `${metrics.fillerWords}`,
      target: 'Target: <10',
      percentage: Math.min((10 - metrics.fillerWords) / 10 * 100, 100),
      insight: {
        icon: metrics.fillerWords <= 10 ? CheckCircle : AlertCircle,
        text: metrics.fillerWords <= 10 ? 'Acceptable - Room for improvement' : 'Too many - practice pausing',
        isGood: metrics.fillerWords <= 10,
      },
      trend: Math.abs(metrics.fillerWordsTrend),
      trendDirection: metrics.fillerWordsTrend <= 0 ? 'up' : 'down',
      isGoodTrend: metrics.fillerWordsTrend <= 0,
    },
    {
      icon: Gauge,
      title: 'Speaking Pace',
      value: `${metrics.speakingPace} WPM`,
      target: 'Ideal: 140-160',
      percentage: metrics.speakingPace >= 140 && metrics.speakingPace <= 160 
        ? 95 
        : Math.max(0, 100 - Math.abs(metrics.speakingPace - 150) / 2),
      insight: {
        icon: CheckCircle,
        text: metrics.speakingPace >= 140 && metrics.speakingPace <= 160
          ? 'Perfect pace - Easy to follow'
          : metrics.speakingPace < 140
          ? 'A bit slow - Try speeding up'
          : 'A bit fast - Slow down slightly',
        isGood: metrics.speakingPace >= 140 && metrics.speakingPace <= 160,
      },
      trend: Math.abs(metrics.speakingPaceTrend),
      trendDirection: metrics.speakingPaceTrend >= 0 ? 'up' : 'down',
      isGoodTrend: metrics.speakingPace < 140 ? metrics.speakingPaceTrend > 0 : metrics.speakingPace > 160 ? metrics.speakingPaceTrend < 0 : true,
    },
    {
      icon: Hand,
      title: 'Nervous Gestures',
      value: `${metrics.fidgeting}`,
      target: 'Target: <5',
      percentage: Math.min((5 - metrics.fidgeting) / 5 * 100, 100),
      insight: {
        icon: metrics.fidgeting < 5 ? CheckCircle : AlertCircle,
        text: metrics.fidgeting < 5 
          ? 'Well controlled gestures' 
          : 'Try standing still for 3+ seconds',
        isGood: metrics.fidgeting < 5,
      },
      trend: Math.abs(metrics.fidgetingTrend),
      trendDirection: metrics.fidgetingTrend <= 0 ? 'up' : 'down',
      isGoodTrend: metrics.fidgetingTrend <= 0,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {metricCards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  target,
  percentage,
  insight,
  trend,
  trendDirection,
  isGoodTrend,
}: MetricCardData) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;
  const trendColor = isGoodTrend ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
  const InsightIcon = insight.icon;

  // Determine value color based on performance
  const getValueColor = () => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-xl p-6 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Icon className="w-8 h-8 text-purple-400" strokeWidth={2} />
        </div>

        {/* Trend badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold" style={{ fontWeight: 600 }}>
            {trendDirection === 'up' ? '+' : '-'}{trend}
            {title === 'Eye Contact' || title === 'Speaking Pace' ? '' : ''}
          </span>
        </div>
      </div>

      {/* Metric title */}
      <h3 className="text-[14px] font-medium text-gray-400 mb-2" style={{ fontWeight: 500 }}>
        {title}
      </h3>

      {/* Primary value */}
      <div className={`text-[48px] font-black mb-3 leading-none ${getValueColor()}`} style={{ fontWeight: 900 }}>
        {value}
      </div>

      {/* Comparison bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5">
          {target}
        </p>
      </div>

      {/* Mini insight */}
      <div className={`flex items-start gap-2 mt-auto pt-3 border-t border-white/5`}>
        <InsightIcon 
          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${insight.isGood ? 'text-green-400' : 'text-amber-400'}`} 
          strokeWidth={2} 
        />
        <p className="text-[12px] text-gray-300" style={{ lineHeight: 1.4 }}>
          {insight.text}
        </p>
      </div>
    </div>
  );
}
