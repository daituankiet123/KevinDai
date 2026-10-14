import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import { newId } from '../../utils/id';
import type { LoveLetter, MoodType } from '../../types';

type Props = {
  onAddLetter: (letter: LoveLetter) => void;
  onEditLetter: (letter: LoveLetter) => void;
  onDeleteLetter: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  soundEnabled: boolean;
};

const MOODS: { id: MoodType; label: string; icon: string }[] = [
  { id: 'miss', label: 'Nhớ anh', icon: '🥺' },
  { id: 'love', label: 'Yêu anh', icon: '💖' },
  { id: 'proud', label: 'Tự hào', icon: '🎖️' },
  { id: 'sweet', label: 'Ngọt ngào', icon: '🌸' },
  { id: 'waiting', label: 'Chờ đợi', icon: '⏳' },
  { id: 'hug', label: 'Cái ôm', icon: '🫂' },
];

export function IosLoveLettersSection({
  onAddLetter,
  onEditLetter,
  onDeleteLetter,
  onToggleFavorite,
  soundEnabled,
}: Props) {
  const letters = useAppStore(useShallow((s) => s.letters));
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<LoveLetter | null>(null);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('love');

  const filtered = letters.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.content.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setMood('love');
    setShowAdd(true);
  };

  const openEdit = (letter: LoveLetter) => {
    setEditing(letter);
    setTitle(letter.title);
    setContent(letter.content);
    setMood(letter.mood);
    setShowAdd(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const payload: LoveLetter = {
      id: editing ? editing.id : newId('letter'),
      date: editing ? editing.date : new Date().toISOString(),
      title: title.trim() || 'Gửi anh',
      content: content.trim(),
      mood,
      isFavorite: editing ? editing.isFavorite : false,
    };
    if (editing) onEditLetter(payload);
    else onAddLetter(payload);
    playHeartPop(soundEnabled);
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-mute">{letters.length} lá thư</p>
        <button
          type="button"
          onClick={openAdd}
          aria-label="Viết thư mới"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose text-night active:scale-95 transition"
        >
          <Icon name="plus" size={24} />
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm lá thư..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div className="space-y-2">
        {filtered.map((letter) => (
          <div key={letter.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">{MOODS.find((m) => m.id === letter.mood)?.icon || '💌'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{letter.title}</span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(letter.id)}
                    className="text-lg active:scale-90 transition-transform"
                    aria-label="Yêu thích"
                  >
                    {letter.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="text-[11px] text-mute">
                  {new Date(letter.date).toLocaleDateString('vi-VN')}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/90">{letter.content}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-4 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => openEdit(letter)}
                className="text-xs text-mute underline active:text-ink"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDeleteLetter(letter.id)}
                className="text-xs text-mute underline active:text-red-400"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-8 text-center">
            <div className="mb-2 text-4xl">💌</div>
            <p className="text-sm text-mute">
              {search ? 'Không tìm thấy lá thư nào' : 'Chưa có lá thư nào'}
            </p>
            {!search && (
              <button
                type="button"
                onClick={openAdd}
                className="mt-3 rounded-xl bg-rose px-4 py-2 text-xs font-semibold text-night"
              >
                Viết lá thư đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl border border-line bg-card p-6 pb-safe max-h-[90vh] overflow-y-auto sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                {editing ? 'Sửa lá thư' : 'Viết thư tình'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                aria-label="Đóng"
                className="flex size-9 items-center justify-center rounded-full bg-line text-mute active:bg-white/10"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề (ví dụ: Gửi anh yêu)"
                className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
              />
              <div>
                <label className="mb-2 block text-xs font-semibold text-mute">Tâm trạng</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        mood === m.id ? 'border-rose bg-rose/20 text-rose' : 'border-line text-mute'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Viết lời yêu thương gửi anh..."
                className="w-full resize-none rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
                autoFocus
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 disabled:opacity-50"
                >
                  {editing ? 'Lưu thay đổi' : 'Gửi thư'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
