'use client';

import { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  number: string;
  label: string;
  description: string;
  delay: number;
}

/**
 * StatCard - Minimalist information card displaying a statistic
 *
 * Features:
 * - Glassmorphic background with subtle hover effect
 * - Icon with purple accent
 * - Large gradient number (main focal point)
 * - Label and supporting description
 * - Count-up animation when scrolled into view
 * - Entrance animation with stagger delay
 */
export function StatCard({ icon: Icon, number, label, description, delay }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract numeric value from string (e.g., "75%" -> 75)
  const targetNumber = parseInt(number.replace(/\D/g, ''));
  const suffix = number.replace(/\d/g, '');

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isVisible) return;

    const duration = 1200; // ms
    const steps = 60;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCurrentNumber(targetNumber);
        clearInterval(timer);
      } else {
        // Ease-out effect: faster at start, slower at end
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setCurrentNumber(Math.floor(targetNumber * easedProgress));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, targetNumber]);

  return (
    <div
      ref={cardRef}
      className="group flex-1 max-w-[380px] bg-white/3 backdrop-blur-sm border border-white/8 rounded-2xl p-12 hover:bg-white/5 hover:border-white/15 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-[400ms] ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <Icon
            className="w-14 h-14 text-[#A78BFA]"
            strokeWidth={1.5}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.3))'
            }}
          />
        </div>
      </div>

      {/* Statistic Number with Gradient */}
      <div className="mb-4">
        <p
          className="text-[72px] font-black leading-none text-center bg-gradient-to-br from-[#A78BFA] via-[#C4B5FD] to-[#22D3EE] bg-clip-text text-transparent"
          style={{
            fontWeight: 900,
            textShadow: '0 10px 20px rgba(167, 139, 250, 0.2)'
          }}
        >
          {currentNumber}{suffix}
        </p>
      </div>

      {/* Label */}
      <p
        className="text-[18px] font-semibold text-white text-center leading-[1.4] mb-3"
        style={{ fontWeight: 600 }}
      >
        {label}
      </p>

      {/* Supporting Description */}
      <p className="text-[15px] text-[#9CA3AF] text-center leading-relaxed max-w-[280px] mx-auto">
        {description}
      </p>
    </div>
  );
}
