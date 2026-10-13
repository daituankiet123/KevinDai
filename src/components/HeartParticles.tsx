import React, { useEffect, useState } from 'react';

interface HeartParticlesProps {
  enabled: boolean;
}

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  symbol: string;
}

const HEART_ICONS = ['💖', '💕', '💗', '💓', '🌸', '✨', '💐', '💝', '❤️'];

export const HeartParticles: React.FC<HeartParticlesProps> = ({ enabled }) => {
  const [clickHearts, setClickHearts] = useState<ClickParticle[]>([]);

  // Listen to clicks anywhere on screen to spawn cute hearts
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't trigger on input/button if dragging or selecting
      const target = e.target as HTMLElement;
      if (target.closest('input') || target.closest('textarea')) return;

      const newParticles: ClickParticle[] = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: e.clientX + (Math.random() * 40 - 20),
        y: e.clientY + (Math.random() * 40 - 20),
        color: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899'][
          Math.floor(Math.random() * 5)
        ],
        size: Math.floor(Math.random() * 12) + 14,
        symbol: HEART_ICONS[Math.floor(Math.random() * HEART_ICONS.length)],
      }));

      setClickHearts((prev) => [...prev.slice(-20), ...newParticles]);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Cleanup click particles after 1.2s
  useEffect(() => {
    if (clickHearts.length === 0) return;
    const timer = setTimeout(() => {
      setClickHearts((prev) => prev.slice(4));
    }, 1000);
    return () => clearTimeout(timer);
  }, [clickHearts]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {/* Background ambient floating hearts */}
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 7 + 4) % 96;
        const duration = 12 + (i % 6) * 2;
        const delay = (i * 1.5) % 10;
        const size = 16 + (i % 5) * 5;
        const symbol = HEART_ICONS[i % HEART_ICONS.length];

        return (
          <div
            key={i}
            className="floating-heart select-none opacity-40 transition-opacity hover:opacity-80"
            style={{
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              fontSize: `${size}px`,
            }}
          >
            {symbol}
          </div>
        );
      })}

      {/* Click explosion hearts */}
      {clickHearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute select-none pointer-events-none animate-ping"
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: `${heart.size}px`,
            transform: 'translate(-50%, -50%)',
            animationDuration: '0.8s',
          }}
        >
          {heart.symbol}
        </span>
      ))}
    </div>
  );
};
