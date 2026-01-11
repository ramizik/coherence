'use client';

/**
 * AnimatedBackground - Animated gradient mesh with floating geometric shapes
 *
 * Creates a premium feel with:
 * - Animated gradient (purple to cyan)
 * - Floating circles and hexagons with parallax effect
 * - Subtle grid pattern overlay
 * - Noise texture for depth
 */
export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#0F172A] to-[#06B6D4]/20 animate-[gradient_10s_ease-in-out_infinite]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating circles */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#8B5CF6]/10 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
      <div className="absolute top-[60%] left-[10%] w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[30%] right-[15%] w-80 h-80 rounded-full bg-[#8B5CF6]/8 blur-3xl animate-[float_30s_ease-in-out_infinite]" />

      {/* Floating hexagons (using clip-path) */}
      <div
        className="absolute top-[20%] right-[5%] w-48 h-48 bg-[#06B6D4]/5 blur-2xl animate-[float_22s_ease-in-out_infinite]"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      />
      <div
        className="absolute bottom-[15%] right-[25%] w-56 h-56 bg-[#8B5CF6]/7 blur-2xl animate-[float_28s_ease-in-out_infinite_reverse]"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />

      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(-15px) translateX(-15px); }
        }
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
