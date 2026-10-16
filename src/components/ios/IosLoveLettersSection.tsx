import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import confetti from 'canvas-confetti';
import { Share2, Sparkles } from 'lucide-react';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import { LETTER_MOOD_META, LETTER_MOOD_ORDER } from '../../constants';
import { letterPhotos, letterStatus, summarizeLetters } from '../../utils/letters';
import { shareLetter } from '../../utils/photoShare';
import { useIosConfirm } from '../../hooks/useIosConfirm';
import { EmptyState } from './EmptyState';
import { IosLetterEditor } from './IosLetterEditor';
import { IosLetterReader } from './IosLetterReader';
import { IosFab } from './IosFab';
import type { LoveLetter, MoodType } from '../../types';

type Props = {
  onAddLetter: (letter: LoveLetter) => void;
  onEditLetter: (letter: LoveLetter) => void;
  onDeleteLetter: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  soundEnabled: boolean;
};

type Folder = 'all' | 'sent' | 'draft';

const FOLDERS: { id: Folder; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'sent', label: 'Đã gửi' },
  { id: 'draft', label: 'Nháp' },
];

export function IosLoveLettersSection({
  onAddLetter,
  onEditLetter,
  onDeleteLetter,
  onToggleFavorite,
  soundEnabled,
}: Props) {
  const letters = useAppStore(useShallow((s) => s.letters));
  const [folder, setFolder] = useState<Folder>('all');
  const [activeMood, setActiveMood] = useState<MoodType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ letter: LoveLetter | null } | null>(null);
  const [reading, setReading] = useState<{ letter: LoveLetter; isRandom: boolean } | null>(null);
  const { confirm, ConfirmDialogElement } = useIosConfirm();

  const summary = useMemo(() => summarizeLetters(letters), [letters]);

  const sorted = useMemo(
    () => [...letters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [letters]
  );

  const filtered = useMemo(() => {
    let list = sorted;
    if (folder !== 'all') list = list.filter((l) => letterStatus(l) === folder);
    if (activeMood !== 'all') list = list.filter((l) => l.mood === activeMood);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) => l.title.toLowerCase().includes(q) || l.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sorted, folder, activeMood, search]);

  const moodCounts = useMemo(() => {
    const counts = new Map<MoodType, number>();
    for (const l of sorted) counts.set(l.mood, (counts.get(l.mood) ?? 0) + 1);
    return counts;
  }, [sorted]);

  const openEditor = (letter: LoveLetter | null) => {
    setEditor({ letter });
  };

  const closeEditor = () => {
    setEditor(null);
  };

  const handleSubmit = (letter: LoveLetter) => {
    if (editor?.letter) onEditLetter(letter);
    else onAddLetter(letter);
    playHeartPop(soundEnabled);
    closeEditor();
    setReading(null);
  };

  const sendDraft = (letter: LoveLetter) => {
    onEditLetter({ ...letter, status: 'sent', sentAt: new Date().toISOString() });
    playHeartPop(soundEnabled);
    setReading(null);
  };

  const handleDelete = async (letter: LoveLetter) => {
    const ok = await confirm({
      title: 'Xoá lá thư này?',
      message: `“${letter.title}” sẽ bị xoá vĩnh viễn. Bạn có chắc chắn?`,
      confirmLabel: 'Xoá',
      tone: 'danger',
    });
    if (!ok) return;
    onDeleteLetter(letter.id);
    setReading(null);
  };

  const revealRandom = (event: React.MouseEvent) => {
    if (sorted.length === 0) return;
    const letter = sorted[Math.floor(Math.random() * sorted.length)];
    setReading({ letter, isRandom: true });
    playHeartPop(soundEnabled);
    const rect = event.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 24,
      spread: 65,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f4a9b8', '#f43f5e', '#fb7185'],
    });
  };

  const readingLetter = reading ? letters.find((l) => l.id === reading.letter.id) ?? null : null;

  return (
    <div className="space-y-4 pb-16 animate-pop-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-mute">
          {summary.total} lá thư · Đã gửi {summary.sent} · Nháp {summary.drafts}
          {summary.topMood && ` · Trạng thái hay dùng: ${LETTER_MOOD_META[summary.topMood].icon}`}
        </p>
        <div className="flex items-center gap-2">
          {sorted.length > 0 && (
            <button
              type="button"
              onClick={revealRandom}
              aria-label="Rút thăm một lá thư"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-rose transition active:scale-95 touch-target"
            >
              <Sparkles size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex rounded-2xl border border-line bg-bar/60 p-1">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFolder(f.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition touch-target ${
              folder === f.id ? 'bg-rose text-night' : 'text-mute active:bg-line'
            }`}
          >
            {f.label}
            {f.id === 'draft' && summary.drafts > 0 && ` (${summary.drafts})`}
          </button>
        ))}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveMood('all')}
          className={`ios-pill whitespace-nowrap transition touch-target ${
            activeMood === 'all'
              ? 'bg-rose text-night shadow-[0_0_12px_-2px_var(--color-rose)]'
              : 'bg-line text-mute active:bg-line/60'
          }`}
        >
          Tất cả tâm trạng
        </button>
        {LETTER_MOOD_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveMood(activeMood === id ? 'all' : id)}
            className={`ios-pill whitespace-nowrap transition touch-target ${
              activeMood === id
                ? 'bg-rose text-night shadow-[0_0_12px_-2px_var(--color-rose)]'
                : 'bg-line text-mute active:bg-line/60'
            }`}
          >
            {LETTER_MOOD_META[id].icon} {LETTER_MOOD_META[id].label}
            {moodCounts.get(id) ? ` · ${moodCounts.get(id)}` : ''}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm lá thư..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none touch-target"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="💌"
          title={
            search || folder !== 'all' || activeMood !== 'all'
              ? 'Không tìm thấy lá thư nào'
              : 'Chưa có lá thư nào'
          }
          subtitle={
            search
              ? 'Thử đổi từ khoá hoặc bỏ bộ lọc nhé.'
              : 'Viết lá thư đầu tiên gửi anh nhé.'
          }
          action={
            !search && folder === 'all' && activeMood === 'all'
              ? { label: 'Viết lá thư đầu tiên', onClick: () => openEditor(null) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((letter) => {
            const photos = letterPhotos(letter);
            const sent = letterStatus(letter) === 'sent';
            const mood = LETTER_MOOD_META[letter.mood] ?? LETTER_MOOD_META.love;
            return (
              <div
                key={letter.id}
                className="rounded-2xl border border-line ios-card-gradient p-4"
              >
                <button
                  type="button"
                  onClick={() => setReading({ letter, isRandom: false })}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="text-xl" aria-hidden="true">
                    {mood.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{letter.title}</span>
                      {!sent && <span className="text-[10px]">📝</span>}
                    </div>
                    <div className="text-[11px] text-mute">
                      {new Date(letter.date).toLocaleDateString('vi-VN')} · {mood.label}
                      {!sent && ' · Nháp'}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/90">
                      {letter.content}
                    </p>
                    {photos.length > 0 && (
                      <div className="mt-2 flex gap-1.5">
                        {photos.slice(0, 3).map((src, i) => (
                          <img
                            key={`${src.slice(0, 24)}-${i}`}
                            src={src}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-line object-cover"
                          />
                        ))}
                        <span className="self-end text-[10px] text-mute">
                          {photos.length} ảnh
                        </span>
                      </div>
                    )}
                  </div>
                  {sent && (
                    <span className="ios-pill flex-none bg-line text-mute" title="Thư đã niêm phong">
                      🔒
                    </span>
                  )}
                </button>
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(letter.id)}
                    aria-label={letter.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                    className="text-lg transition active:scale-90 touch-target"
                  >
                    {letter.isFavorite ? '❤️' : '🤍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareLetter(letter)}
                    aria-label="Chia sẻ lá thư"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-rose transition active:scale-95 touch-target"
                  >
                    <Share2 size={16} />
                  </button>
                  {!sent && (
                    <button
                      type="button"
                      onClick={() => openEditor(letter)}
                      aria-label="Sửa thư"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-mute transition active:scale-95 touch-target"
                    >
                      <Icon name="pen" size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDelete(letter)}
                    aria-label="Xoá lá thư"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-mute transition active:scale-95 active:text-rose touch-target"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editor && (
        <IosLetterEditor
          key={editor.letter?.id ?? 'new'}
          letter={editor.letter}
          onClose={closeEditor}
          onSubmit={handleSubmit}
        />
      )}

      {readingLetter && reading && (
        <IosLetterReader
          letter={readingLetter}
          isRandomReveal={reading.isRandom}
          onClose={() => setReading(null)}
          onToggleFavorite={() => onToggleFavorite(readingLetter.id)}
          onEdit={() => {
            setReading(null);
            openEditor(readingLetter);
          }}
          onSend={() => sendDraft(readingLetter)}
          onDelete={() => void handleDelete(readingLetter)}
        />
      )}

      {ConfirmDialogElement}

      <IosFab label="Viết thư mới" onClick={() => openEditor(null)} />
    </div>
  );
}
