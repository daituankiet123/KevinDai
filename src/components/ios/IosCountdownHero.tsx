import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { calculateMilitaryCountdown } from '../../utils/dateCalculations';
import { useNow } from '../../hooks/useNow';
import { playSweetChime } from '../../utils/audio';
import confetti from 'canvas-confetti';

export function IosCountdownHero() {
  const { couple } = useAppStore(useShallow((s) => ({ couple: s.couple })));
  const currentTime = useNow();
  const [hugCount, setHugCount] = useState(0);
  const [justHugged, setJustHugged] = useState(false);

  const countdown = calculateMilitaryCountdown(
    couple.militaryStartDate,
    couple.militaryEndDate,
    couple.datingStartDate,
    currentTime
  );

  const handleHug = (e: React.MouseEvent) => {
    playSweetChime(couple.soundEnabled);
    setHugCount((p) => p + 1);
    setJustHugged(true);
    setTimeout(() => setJustHugged(false), 800);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      colors: ['#f4a9b8', '#f43f5e', '#fb7185', '#f472b6'],
      shapes: ['circle'],
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <div className="overflow-hidden rounded-[28px] border border-line bg-card">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-rose-600/20 via-rose-500/10 to-transparent px-5 pt-safe pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-mute">
              Nghĩa vụ quân sự
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose" />
              <span className="text-[10px] font-bold text-rose">Đang đếm ngược</span>
            </div>
          </div>

          {/* Countdown Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: countdown.daysRemaining, label: 'Ngày' },
              { value: countdown.hours.toString().padStart(2, '0'), label: 'Giờ' },
              { value: countdown.minutes.toString().padStart(2, '0'), label: 'Phút' },
              { value: countdown.seconds.toString().padStart(2, '0'), label: 'Giây' },
            ].map((item, i) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="relative mb-1.5 w-full aspect-square rounded-2xl bg-night/80 border border-line flex items-center justify-center overflow-hidden shadow-[0_0_24px_-6px] shadow-rose/30">
                  <span
                    key={`${item.value}-${i}`}
                    className="text-2xl sm:text-3xl font-bold text-rose tabular-nums"
                    style={{ animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                  >
                    {item.value}
                  </span>
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                </div>
                <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Couple Info */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-line">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl border border-emerald-500/30">
              {couple.boyfriendAvatar || '👨‍✈️'}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                {couple.boyfriendNickname || 'Chàng Lính'}
              </div>
              <div className="text-sm font-semibold text-ink">{couple.boyfriendName}</div>
            </div>
          </div>

          {/* Heart Button */}
          <button
            type="button"
            onClick={handleHug}
            aria-label="Gửi cái ôm tới anh"
            className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-rose animate-heart-glow transition-transform ${
              justHugged ? 'scale-110' : 'active:scale-90'
            }`}
          >
            <span className={`text-xl ${justHugged ? 'animate-ping' : 'animate-pulse'}`}>💕</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                {couple.girlfriendNickname || 'Hậu Phương'}
              </div>
              <div className="text-sm font-semibold text-ink">{couple.girlfriendName}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl border border-rose-500/30">
              {couple.girlfriendAvatar || '👧🌸'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-mute mb-2">
            <span>{countdown.daysPassed} ngày đã qua</span>
            <span className="text-rose font-bold">{countdown.progressPercent.toFixed(1)}%</span>
            <span>{countdown.totalDays} ngày</span>
          </div>
          <div className="h-2 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-rose to-pink-500 transition-all duration-700 relative"
              style={{ width: `${Math.min(100, countdown.progressPercent)}%` }}
            >
              <div className="absolute inset-0 animate-shimmer-slide" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-line bg-card p-3.5 text-center">
          <div className="text-lg font-bold text-rose">{countdown.totalDaysDating}</div>
          <div className="text-[10px] font-semibold text-mute uppercase tracking-wider">Ngày yêu</div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-3.5 text-center">
          <div className="text-lg font-bold text-rose">{countdown.mealsWaited.toLocaleString()}</div>
          <div className="text-[10px] font-semibold text-mute uppercase tracking-wider">Bữa cơm</div>
        </div>
        <button
          type="button"
          onClick={handleHug}
          className="rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-center active:bg-rose/20 animate-heart-glow transition-colors"
        >
          <div className="text-lg font-bold text-rose">{hugCount}</div>
          <div className="text-[10px] font-semibold text-mute uppercase tracking-wider">Cái ôm 💕</div>
        </button>
      </div>

      {/* Dates Info */}
      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Icon name="calendar" size={16} />
            </div>
            <div>
              <div className="text-[10px] text-mute">Nhập ngũ</div>
              <div className="font-semibold text-ink">{couple.militaryStartDate}</div>
            </div>
          </div>
          <div className="text-rose font-bold italic text-sm">
            "{couple.sweetQuote}"
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-[10px] text-mute">Xuất ngũ</div>
              <div className="font-semibold text-ink">{couple.militaryEndDate}</div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <Icon name="flag" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
