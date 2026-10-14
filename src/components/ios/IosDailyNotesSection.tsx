import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import type { DailyNote, DailyNoteMood } from '../../types';
import { DAILY_NOTE_MOOD_META } from '../../constants';

type Props = {
  onAddOrUpdateNote: (note: DailyNote) => void;
  onDeleteNote: (id: string) => void;
  onHeartNote: (id: string) => void;
  onOpenModal: (note?: DailyNote | null, date?: string) => void;
  soundEnabled: boolean;
};

const MOODS = DAILY_NOTE_MOOD_META;

export function IosDailyNotesSection({ onAddOrUpdateNote, onDeleteNote, onHeartNote, onOpenModal, soundEnabled }: Props) {
  const { dailyNotes, couple } = useAppStore(useShallow((s) => ({ dailyNotes: s.dailyNotes, couple: s.couple })));
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<DailyNoteMood>('love');
  const [newTag, setNewTag] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const filteredNotes = useMemo(() => {
    const list = dailyNotes.filter((note) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          note.content.toLowerCase().includes(q) ||
          (note.tag && note.tag.toLowerCase().includes(q)) ||
          note.date.includes(q)
        );
      }
      return true;
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyNotes, searchTerm]);

  const stats = useMemo(() => {
    const total = dailyNotes.length;
    const totalHearts = dailyNotes.reduce((acc, n) => acc + (n.hearts || 0), 0);
    return { total, totalHearts };
  }, [dailyNotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const note: DailyNote = {
      id: crypto.randomUUID(),
      date: today,
      content: newContent.trim(),
      mood: newMood,
      tag: newTag.trim() || undefined,
      hearts: 0,
      author: 'girlfriend',
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateNote(note);
    playHeartPop(soundEnabled);
    setShowAdd(false);
    setNewContent('');
    setNewMood('love');
    setNewTag('');
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${days[d.getDay()]}, ${day}/${month}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight">Nhật ký</h1>
          <p className="text-xs text-mute">{stats.total} ngày đã ghi · ❤️ {stats.totalHearts}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose text-night active:scale-95 transition"
        >
          <Icon name="plus" size={24} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm nhật ký..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
        />
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Notes List */}
      <div className="space-y-2">
        {filteredNotes.map((note) => (
          <div key={note.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">{MOODS[note.mood]?.icon || '💕'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-mute">{formatDate(note.date)}</span>
                  {note.tag && (
                    <span className="rounded-full bg-line px-2 py-0.5 text-[10px] font-medium text-mute">
                      {note.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink/90 leading-relaxed">{note.content}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <button
                type="button"
                onClick={() => onHeartNote(note.id)}
                className="flex items-center gap-1 text-xs text-mute active:text-rose transition"
              >
                <span>{note.hearts > 0 ? '❤️' : '🤍'}</span>
                <span>{note.hearts}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenModal(note)}
                  className="text-xs text-mute underline active:text-ink"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteNote(note.id)}
                  className="text-xs text-mute underline active:text-red-400"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-8 text-center">
            <div className="mb-2 text-4xl">📝</div>
            <p className="text-sm text-mute">
              {searchTerm ? 'Không tìm thấy nhật ký nào' : 'Chưa có nhật ký nào hôm nay'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="mt-3 rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-night"
              >
                Viết nhật ký đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-line p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-ink">Nhật ký {formatDate(today)}</h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-mute hover:text-ink transition"
              >
                <Icon name="x" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mood Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-mute">Cảm xúc hôm nay</label>
                <div className="flex gap-2">
                  {Object.entries(MOODS).map(([key, mood]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewMood(key as DailyNoteMood)}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 transition ${
                        newMood === key ? 'border-rose bg-rose/20' : 'border-line'
                      }`}
                    >
                      <span className="text-xl">{mood.icon}</span>
                      <span className="text-[10px] font-medium text-mute">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Nhật ký hôm nay</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={`Viết gì đó cho ${couple.boyfriendNickname || 'anh'}...`}
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none resize-none"
                  autoFocus
                />
              </div>

              {/* Tag */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Chủ đề (tùy chọn)</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ví dụ: Thăm nuôi, Sinh nhật..."
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 transition"
                >
                  Lưu nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
