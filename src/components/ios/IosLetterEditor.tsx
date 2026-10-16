import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { IosField, IosInput, IosTextarea } from './IosField';
import { LETTER_MOOD_META, LETTER_MOOD_ORDER } from '../../constants';
import { compressImage } from '../../utils/imageCompression';
import { newId } from '../../utils/id';
import { todayStr } from '../../utils/dateUtils';
import { letterPhotos, letterStatus } from '../../utils/letters';
import type { LoveLetter } from '../../types';

const MAX_PHOTOS = 3;

type Props = {
  letter: LoveLetter | null;
  onClose: () => void;
  onSubmit: (letter: LoveLetter, status: 'draft' | 'sent') => void;
};

function localDateOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return todayStr();
  return todayStr(date);
}

function toIsoFromDate(dateStr: string, reference: Date): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(
    year,
    (month || 1) - 1,
    day || 1,
    reference.getHours(),
    reference.getMinutes(),
    reference.getSeconds()
  ).toISOString();
}

export function IosLetterEditor({ letter, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(() => letter?.title ?? '');
  const [content, setContent] = useState(() => letter?.content ?? '');
  const [mood, setMood] = useState(() => letter?.mood ?? 'love');
  const [dateStr, setDateStr] = useState(() =>
    letter ? localDateOf(letter.date) : todayStr()
  );
  const [photos, setPhotos] = useState<string[]>(() => (letter ? letterPhotos(letter) : []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSentDraft = letter ? letterStatus(letter) === 'sent' : false;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      if (room <= 0) {
        setError(`Chỉ đính kèm tối đa ${MAX_PHOTOS} ảnh mỗi lá thư.`);
        return;
      }
      const picked = Array.from(files).slice(0, room);
      const next: string[] = [];
      for (const file of picked) {
        next.push(await compressImage(file, { maxDimension: 1024, quality: 0.75 }));
      }
      setPhotos((prev) => [...prev, ...next]);
      if (files.length > room) {
        setError(`Chỉ đính kèm tối đa ${MAX_PHOTOS} ảnh, đã giữ ${next.length} ảnh mới.`);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'IMAGE_TOO_LARGE') {
        setError('Ảnh quá lớn (>8MB). Vui lòng chọn ảnh nhẹ hơn.');
      } else {
        setError('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
      }
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = (status: 'draft' | 'sent') => {
    if (!content.trim()) {
      setError('Thư chưa có nội dung.');
      return;
    }
    const reference = letter ? new Date(letter.date) : new Date();
    const payload: LoveLetter = {
      id: letter?.id ?? newId('letter'),
      date: toIsoFromDate(dateStr, Number.isNaN(reference.getTime()) ? new Date() : reference),
      title: title.trim() || 'Gửi anh',
      content: content.trim(),
      mood,
      photoUrls: photos.length > 0 ? photos : undefined,
      photoUrl: photos[0],
      isFavorite: letter?.isFavorite ?? false,
      status,
      sentAt: status === 'sent' ? (letter?.sentAt ?? new Date().toISOString()) : undefined,
    };
    onSubmit(payload, status);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl border border-line bg-card p-6 pb-safe shadow-2xl sm:rounded-3xl animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">
            {letter ? (isSentDraft ? 'Lá thư đã gửi' : 'Sửa lá thư') : 'Viết thư tình'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-mute transition active:bg-line/60 touch-target"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {isSentDraft && (
          <p className="mb-4 rounded-xl border border-line bg-bar/60 px-3 py-2 text-[11px] text-mute">
            🔒 Thư đã gửi được niêm phong, chỉ xem lại được thôi.
          </p>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit('sent');
          }}
        >
          <IosField label="Tiêu đề">
            <IosInput
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gửi anh yêu..."
              maxLength={80}
              disabled={isSentDraft}
            />
          </IosField>

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-mute">
              Tâm trạng
            </span>
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {LETTER_MOOD_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={isSentDraft}
                  onClick={() => setMood(id)}
                  className={`ios-pill transition touch-target ${
                    mood === id
                      ? 'bg-rose text-night shadow-[0_0_12px_-2px_var(--color-rose)]'
                      : 'bg-line text-mute active:bg-line/60'
                  }`}
                >
                  {LETTER_MOOD_META[id].icon} {LETTER_MOOD_META[id].label}
                </button>
              ))}
            </div>
          </div>

          <IosField label="Ngày viết" helper="Chọn ngày trong quá khứ để ghi lại thư cũ">
            <IosInput
              type="date"
              value={dateStr}
              max={todayStr()}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={isSentDraft}
            />
          </IosField>

          <IosField label="Lời thư">
            <IosTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Viết lời yêu thương gửi anh..."
              disabled={isSentDraft}
            />
          </IosField>

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-mute">
              Ảnh đính kèm ({photos.length}/{MAX_PHOTOS})
            </span>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div key={`${src.slice(0, 24)}-${i}`} className="relative">
                  <img
                    src={src}
                    alt={`Ảnh đính kèm ${i + 1}`}
                    className="aspect-square w-full rounded-xl border border-line object-cover"
                  />
                  {!isSentDraft && (
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={`Bỏ ảnh ${i + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white active:bg-black/90 touch-target"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
              ))}
              {!isSentDraft && photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Thêm ảnh đính kèm"
                  className={`flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-line bg-line/30 text-mute transition active:bg-line touch-target ${
                    busy ? 'opacity-50' : ''
                  }`}
                >
                  {busy ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-rose border-t-transparent" />
                  ) : (
                    <Icon name="plus" size={22} />
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              onChange={(e) => void handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {error && <p className="text-[11px] text-rose-400">{error}</p>}

          {!isSentDraft && (
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => submit('draft')}
                disabled={busy}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute transition active:bg-line disabled:opacity-50 touch-target"
              >
                Lưu nháp
              </button>
              <button
                type="submit"
                disabled={busy || !content.trim()}
                className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night transition active:opacity-80 disabled:opacity-50 touch-target"
              >
                Gửi thư
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
