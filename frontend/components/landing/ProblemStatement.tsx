'use client';

import { Frown, MessageSquareWarning, Eye } from 'lucide-react';
import { StatCard } from './StatCard';

interface Stat {
  icon: typeof Frown;
  number: string;
  label: string;
  description: string;
}

const stats: Stat[] = [
  {
    icon: Frown,
    number: '75%',
    label: 'Fear Public Speaking',
    description: 'Public speaking is the #1 most common phobia, even above death.'
  },
  {
    icon: MessageSquareWarning,
    number: '90%',
    label: 'Lack Objective Feedback',
    description: 'Students practice presentations but have no way to measure actual improvement.'
  },
  {
    icon: Eye,
    number: '55%',
    label: 'Communication is Non-Verbal',
    description: 'Yet existing tools only analyze your words, missing the majority of your message.'
  }
];

/**
 * ProblemStatement - Statistics section that validates user pain points
 * 
 * Appears immediately below the hero section with a lighter, cleaner design.
 * Features three stat cards with gradient numbers and supporting descriptions.
 */
export function ProblemStatement() {
  return (
    <section 
      className="relative w-full bg-gradient-to-b from-[#0F172A] to-[#1E293B] m-[0px]"
      aria-label="Problem statement section with statistics"
    >
      {/* Top separator line */}
      

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-[80px] py-[0px]">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* Eyebrow text */}
          <p 
            className="text-[12px] font-medium text-[#06B6D4] uppercase tracking-widest mb-4 pt-[30px]"
            style={{ fontWeight: 500 }}
          >
            THE CHALLENGE
          </p>

          {/* Main title */}
          <h2 
            className="text-[48px] font-bold text-white tracking-tight max-w-[600px] mx-auto"
            style={{ fontWeight: 700 }}
          >
            Why Presentations Fail
          </h2>
        </div>

        {/* Three-column stat cards */}
        <div className="flex justify-between gap-8 pb-[30px]">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.label}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
              description={stat.description}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
}