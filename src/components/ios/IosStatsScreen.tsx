import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store';
import { useNow } from '../../hooks/useNow';
import { DAILY_NOTE_MOOD_META } from '../../constants';
import { computeMoodByMonth, computeNoteStreak, computeTotalStats } from '../../utils/stats';
import { daysBetween, parseLocalDate } from '../../utils/dateUtils';
import { calculateMilitaryCountdown } from '../../utils/dateCalculations';
import type { DailyNoteMood } from '../../types';

const MOOD_COLORS: Record<DailyNoteMood, string> = {
  love: '#f4a9b8',
  miss: '#a5b4fc',
  happy: '#fbbf24',
  proud: '#34d399',
  special: '#38bdf8',
  excited: '#fde047',
  tired: '#5eead4',
};

const MOOD_ORDER: DailyNoteMood[] = ['love', 'miss', 'happy', 'proud', 'special', 'excited', 'tired'];

export function IosStatsScreen() {
  const { dailyNotes, photos, letters, couple } = useAppStore(
    useShallow((s) => ({
      dailyNotes: s.dailyNotes,
      photos: s.photos,
      letters: s.letters,
      couple: s.couple,
    }))
  );
  const now = useNow();

  const streak = useMemo(() => computeNoteStreak(dailyNotes, now), [dailyNotes, now]);
  const totals = useMemo(
    () => computeTotalStats({ photos, letters, dailyNotes }),
    [photos, letters, dailyNotes]
  );
  const byMonth = useMemo(() => computeMoodByMonth(dailyNotes).slice(0, 6).reverse(), [dailyNotes]);

  const datingDays = daysBetween(parseLocalDate(couple.datingStartDate), now);
  const daysLeft = calculateMilitaryCountdown(
    couple.militaryStartDate,
    couple.militaryEndDate,
    couple.datingStartDate,
    now
  ).daysRemaining;

  const maxMonth = Math.max(1, ...byMonth.map((m) => Object.values(m.counts).reduce((a, b) => a + b, 0)));

  return (
    <div className="space-y-4 animate-pop-in">
      <div className="overflow-hidden rounded-3xl border border-line ios-card-gradient p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-rose/15 text-4xl animate-soft-glow">
            🔥
          </div>
          <div className="min-w-0">
            <p className="text-3xl font-bold text-rose tabular-nums">{streak} ngày</p>
            <p className="text-xs text-mute">chuỗi nhật ký liên tiếp của tụi mình</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniStat label="Ngày yêu nhau" value={datingDays.toLocaleString()} icon="💞" />
          <MiniStat label="Ngày chờ anh" value={daysLeft.toLocaleString()} icon="⏳" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-card">
        <p className="border-b border-line px-5 py-3 text-xs font-semibold text-mute">Tổng kết nhanh</p>
        <div className="grid grid-cols-4 gap-px bg-line">
          <TotalCell icon="📷" label="Ảnh" value={totals.photos} />
          <TotalCell icon="💌" label="Thư" value={totals.letters} />
          <TotalCell icon="📝" label="Nhật ký" value={totals.notes} />
          <TotalCell icon="❤️" label="Tim" value={totals.hearts} />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line ios-card-gradient p-5">
        <p className="mb-4 text-xs font-semibold text-mute">Cảm xúc theo tháng</p>
        {byMonth.length === 0 ? (
          <p className="text-xs text-mute">Chưa có nhật ký nào để thống kê.</p>
        ) : (
          <>
            <div className="flex h-32 items-end justify-between gap-2">
              {byMonth.map(({ ym, counts }) => {
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                const height = Math.max(6, Math.round((total / maxMonth) * 100));
                return (
                  <div key={ym} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] tabular-nums text-mute">{total}</span>
                    <div
                      className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-t-lg"
                      style={{ height: `${height}%` }}
                    >
                      {MOOD_ORDER.map((mood) => {
                        const c = counts[mood] ?? 0;
                        if (!c) return null;
                        return (
                          <div
                            key={mood}
                            style={{
                              height: `${(c / total) * 100}%`,
                              background: `linear-gradient(180deg, ${MOOD_COLORS[mood]}, ${MOOD_COLORS[mood]}99)`,
                            }}
                            title={`${DAILY_NOTE_MOOD_META[mood]?.label}: ${c}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-mute">{ym.slice(5)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
              {MOOD_ORDER.filter((m) => byMonth.some((b) => (b.counts[m] ?? 0) > 0)).map((mood) => (
                <span key={mood} className="flex items-center gap-1.5 text-[10px] text-mute">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: MOOD_COLORS[mood] }}
                    aria-hidden="true"
                  />
                  {DAILY_NOTE_MOOD_META[mood]?.label || mood}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bar/60 px-3 py-2">
      <div className="text-lg font-bold text-ink tabular-nums">
        <span aria-hidden="true">{icon}</span> {value}
      </div>
      <div className="text-[10px] text-mute">{label}</div>
    </div>
  );
}

function TotalCell({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-card p-3 text-center">
      <div className="text-base" aria-hidden="true">
        {icon}
      </div>
      <div className="text-lg font-bold text-rose tabular-nums">{value}</div>
      <div className="text-[10px] text-mute">{label}</div>
    </div>
  );
}
