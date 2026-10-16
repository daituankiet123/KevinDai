import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { todayStr } from '../../utils/dateUtils';
import { playHeartPop } from '../../utils/audio';
import type { DailyNote } from '../../types';

type Props = {
  onOpenModal: (note?: DailyNote | null, date?: string) => void;
  soundEnabled: boolean;
};

export function IosTodayDailyNoteCard({ onOpenModal, soundEnabled }: Props) {
  const { dailyNotes, couple } = useAppStore(
    useShallow((s) => ({ dailyNotes: s.dailyNotes, couple: s.couple }))
  );
  const today = todayStr();
  const todayNote = dailyNotes.find((n) => n.date === today);

  const handleHeart = () => {
    playHeartPop(soundEnabled);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <span className="text-xs font-semibold text-mute">Nhật ký hôm nay</span>
        </div>
        <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="px-4 py-3.5">
        {todayNote ? (
          <div className="space-y-2">
            <p className="text-sm text-ink/90 leading-relaxed">{todayNote.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleHeart}
                  aria-label="Thả tim cho nhật ký hôm nay"
                  className="flex items-center gap-1 text-xs text-rose active:scale-90 transition-transform touch-target"
                >
                  <span>{todayNote.hearts > 0 ? '❤️' : '🤍'}</span>
                  <span className="font-medium">{todayNote.hearts}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onOpenModal(todayNote)}
                className="text-xs font-medium text-mute underline active:text-ink transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenModal(null, today)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-line/20 py-4 text-xs font-medium text-mute active:bg-line/30 transition-colors"
          >
            <Icon name="pen" size={16} />
            <span>Viết nhật ký hôm nay cho {couple.boyfriendNickname || 'anh'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
