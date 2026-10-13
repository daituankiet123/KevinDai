import React, { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, X, Award } from 'lucide-react';
import { playCelebrationFanfare } from '../utils/audio';

export interface MilestoneCelebrationData {
  title: string;
  timeframe: string;
  rank: string;
  icon: string;
  description: string;
  girlfriendMessage?: string;
}

interface LoveFireworksModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneCelebrationData | null;
  boyfriendName: string;
  girlfriendName: string;
  soundEnabled: boolean;
}

export const LoveFireworksModal: React.FC<LoveFireworksModalProps> = ({
  isOpen,
  onClose,
  milestone,
  boyfriendName,
  girlfriendName,
  soundEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger continuous fireworks cannon bursts
  const triggerConfettiCannons = useCallback(() => {
    playCelebrationFanfare(soundEnabled);

    // Left cannon
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#f59e0b', '#10b981'],
    });

    // Right cannon
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#f43f5e', '#fb7185', '#ec4899', '#6366f1', '#f59e0b'],
    });

    // Center starburst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#f43f5e', '#ffffff', '#fb7185', '#fbbf24'],
        scalar: 1.2,
      });
    }, 400);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isOpen) return;

    triggerConfettiCannons();

    // Canvas heart particle fireworks loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface FireworkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
    }

    let particles: FireworkParticle[] = [];

    const createHeartBurst = (cx: number, cy: number, color: string) => {
      for (let t = 0; t < Math.PI * 2; t += 0.15) {
        // Heart formula: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const speed = 0.18 + Math.random() * 0.08;

        particles.push({
          x: cx,
          y: cy,
          vx: hx * speed,
          vy: hy * speed,
          alpha: 1,
          color,
          size: Math.random() * 2.5 + 2,
          decay: Math.random() * 0.015 + 0.01,
        });
      }
    };

    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#ec4899', '#f59e0b', '#34d399'];

    // Spawn random heart fireworks every 800ms
    const interval = setInterval(() => {
      const rx = Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
      const ry = Math.random() * (canvas.height * 0.4) + canvas.height * 0.15;
      const col = colors[Math.floor(Math.random() * colors.length)];
      createHeartBurst(rx, ry, col);
    }, 700);

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // subtle gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, soundEnabled, triggerConfettiCannons]);

  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Canvas Fireworks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Main Celebration Card */}
      <div className="relative z-20 max-w-lg w-full bg-gradient-to-b from-white via-rose-50/90 to-pink-100 rounded-3xl p-6 sm:p-8 border-2 border-rose-300 shadow-2xl text-center transform animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Heart Decor */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl animate-bounce">🎆</span>
          <span className="text-3xl animate-pulse">💖</span>
          <span className="text-3xl animate-bounce">✨</span>
        </div>

        {/* Celebration Title */}
        <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-md mb-3 animate-pulse">
          Pháo Hoa Tình Yêu Chúc Mừng Cột Mốc
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight mb-2">
          {milestone.title}
        </h3>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 w-fit mx-auto px-3.5 py-1 rounded-full border border-emerald-200 mb-4">
          <Award className="w-3.5 h-3.5" />
          <span>{milestone.rank}</span>
          <span>·</span>
          <span>{milestone.timeframe}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
          {milestone.description}
        </p>

        {/* Message for the Couple */}
        <div className="bg-white/90 rounded-2xl p-4 border border-rose-200 shadow-inner mb-6 text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Dành riêng cho {boyfriendName} &amp; {girlfriendName}:</span>
          </div>
          <p className="font-script text-lg sm:text-xl text-slate-800 leading-snug">
            "{milestone.girlfriendMessage || 'Tình yêu vượt qua 2 năm thử thách thao trường, mỗi cột mốc hoàn thành là một bước tiến gần hơn tới ngày sum vầy vĩnh cửu!'}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={triggerConfettiCannons}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bắn Thêm Đợt Pháo Hoa Nữa 🎆</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
