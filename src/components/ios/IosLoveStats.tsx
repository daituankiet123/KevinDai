import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store';
import { useNow } from '../../hooks/useNow';
import { DAILY_NOTE_MOOD_META } from '../../constants';

export function IosLoveStats() {
  const { dailyNotes, photos, letters, wishes, anniversaries, couple } = useAppStore(
    useShallow((s) => ({
      dailyNotes: s.dailyNotes,
      photos: s.photos,
      letters: s.letters,
      wishes: s.wishes,
      anniversaries: s.anniversaries,
      couple: s.couple,
    }))
  );

  const totalHearts =
    dailyNotes.reduce((a, n) => a + (n.hearts || 0), 0) +
    photos.reduce((a, p) => a + (p.hearts || 0), 0) +
    wishes.reduce((a, w) => a + (w.hearts || 0), 0);

  // Mood breakdown
  const moodCounts: Record<string, number> = {};
  dailyNotes.forEach((n) => {
    moodCounts[n.mood] = (moodCounts[n.mood] || 0) + 1;
  });
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const maxMood = sortedMoods.length ? sortedMoods[0][1] : 1;

  const now = useNow();
  const datingDays = Math.max(
    0,
    Math.floor((now.getTime() - new Date(`${couple.datingStartDate}T00:00:00`).getTime()) / 86400000)
  );

  const stats = [
    { label: 'Ngày yêu nhau', value: datingDays.toLocaleString(), icon: '💞' },
    { label: 'Nhật ký', value: dailyNotes.length.toString(), icon: '📝' },
    { label: 'Bức ảnh', value: photos.length.toString(), icon: '📷' },
    { label: 'Lá thư', value: letters.length.toString(), icon: '💌' },
    { label: 'Kỷ niệm', value: anniversaries.length.toString(), icon: '🎀' },
    { label: 'Trái tim trao', value: totalHearts.toLocaleString(), icon: '❤️' },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">💖</span>
          <span className="text-xs font-semibold text-mute">Tổng quan tình yêu</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-line">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-3 text-center">
            <div className="text-base">{s.icon}</div>
            <div className="text-lg font-bold text-rose tabular-nums">{s.value}</div>
            <div className="text-[10px] font-medium text-mute">{s.label}</div>
          </div>
        ))}
      </div>

      {sortedMoods.length > 0 && (
        <div className="border-t border-line px-4 py-3">
          <div className="mb-2 text-[11px] font-semibold text-mute">Cảm xúc chủ đạo</div>
          <div className="space-y-2">
            {sortedMoods.map(([mood, count]) => {
              const meta = DAILY_NOTE_MOOD_META[mood];
              return (
                <div key={mood} className="flex items-center gap-2">
                  <span className="text-base">{meta?.icon || '💕'}</span>
                  <span className="w-20 truncate text-xs text-ink">{meta?.label || mood}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose to-pink-400"
                      style={{ width: `${Math.round((count / maxMood) * 100)}%` }}
                    />
                  </div>
                  <span className="w-5 text-right text-xs tabular-nums text-mute">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
