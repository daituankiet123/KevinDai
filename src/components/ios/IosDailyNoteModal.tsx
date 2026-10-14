import { useState } from 'react';
import { Icon } from './Icon';
import { playSweetChime } from '../../utils/audio';
import { todayStr } from '../../utils/dateUtils';
import { newId } from '../../utils/id';
import { SUGGESTED_NOTE_TAGS } from '../../constants';
import type { DailyNote, DailyNoteMood, DailyNoteAuthor } from '../../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: DailyNote) => void;
  initialNote?: DailyNote | null;
  targetDate?: string;
  soundEnabled: boolean;
  boyfriendName?: string;
  girlfriendName?: string;
};

const MOODS: { id: DailyNoteMood; label: string; icon: string }[] = [
  { id: 'love', label: 'Yêu thương', icon: '💖' },
  { id: 'miss', label: 'Nhớ da diết', icon: '🥺' },
  { id: 'happy', label: 'Bình yên', icon: '🌸' },
  { id: 'proud', label: 'Tự hào', icon: '🎖️' },
  { id: 'special', label: 'Cuộc gọi', icon: '📞' },
  { id: 'excited', label: 'Háo hức', icon: '🌟' },
  { id: 'tired', label: 'Mệt nhưng cố', icon: '🔋' },
];

export function IosDailyNoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  targetDate,
  soundEnabled,
  boyfriendName = 'Đại Tuấn Kiệt',
  girlfriendName = 'Lê Thị Thanh Tuyền',
}: Props) {
  const [date, setDate] = useState(initialNote?.date || targetDate || todayStr());
  const [content, setContent] = useState(initialNote?.content || '');
  const [mood, setMood] = useState<DailyNoteMood>(initialNote?.mood || 'love');
  const [author, setAuthor] = useState<DailyNoteAuthor>(initialNote?.author || 'girlfriend');
  const [tag, setTag] = useState(initialNote?.tag || '');
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    playSweetChime(soundEnabled);
    const nowIso = new Date().toISOString();
    onSave({
      id: initialNote ? initialNote.id : newId('note'),
      date,
      content: content.trim(),
      mood,
      author,
      tag: customTag.trim() || tag || 'Nhật ký',
      hearts: initialNote ? initialNote.hearts : 1,
      createdAt: initialNote ? initialNote.createdAt : nowIso,
      updatedAt: nowIso,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-line bg-card p-6 pb-safe max-h-[92vh] overflow-y-auto sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {initialNote ? 'Sửa nhật ký' : 'Nhật ký hôm nay'}
            </h2>
            <p className="text-xs text-mute">{date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-9 items-center justify-center rounded-full bg-line text-mute active:bg-white/10"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-mute">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink focus:border-rose focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-mute">Cảm xúc</label>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition ${
                    mood === m.id ? 'border-rose bg-rose/20' : 'border-line'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-[9px] font-medium text-mute">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-mute">Người ghi</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'girlfriend', label: 'Em', icon: '👧🌸' },
                { id: 'boyfriend', label: 'Anh', icon: '👨‍✈️' },
                { id: 'both', label: 'Cả hai', icon: '💑' },
              ] as { id: DailyNoteAuthor; label: string; icon: string }[]).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAuthor(a.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                    author === a.id
                      ? 'border-rose bg-rose/20 text-rose'
                      : 'border-line text-mute'
                  }`}
                >
                  <span>{a.icon}</span>
                  <span>
                    {a.id === 'girlfriend'
                      ? girlfriendName.split(' ').pop()
                      : a.id === 'boyfriend'
                        ? boyfriendName.split(' ').pop()
                        : a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-mute">Chủ đề</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_NOTE_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTag(t);
                    setCustomTag('');
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    tag === t && !customTag ? 'bg-rose text-night' : 'bg-line text-mute'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Hoặc tự nhập chủ đề..."
              className="w-full rounded-xl border border-line bg-night px-4 py-2.5 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-mute">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder={`Viết gì đó cho ${boyfriendName.split(' ').pop() || 'anh'}...`}
              className="w-full resize-none rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 disabled:opacity-50"
            >
              {initialNote ? 'Lưu thay đổi' : 'Lưu nhật ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
