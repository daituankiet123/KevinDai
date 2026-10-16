import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { IosField, IosInput } from './IosField';
import { compressImage } from '../../utils/imageCompression';
import { todayStr } from '../../utils/dateUtils';
import { PHOTO_TAG_OPTIONS } from '../../constants';
import type { CouplePhoto } from '../../types';
import { newId } from '../../utils/id';

const TAG_OPTIONS = PHOTO_TAG_OPTIONS.filter((t) => t !== 'Tất cả' && t !== 'Yêu thích ❤️');

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (photo: CouplePhoto) => void;
};

export function IosAddPhotoSheet({ isOpen, onClose, onAddPhoto }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => todayStr());
  const [tag, setTag] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setPreview(null);
    setCaption('');
    setLocation('');
    setDate(todayStr());
    setTag('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 1280, quality: 0.82 });
      setPreview(compressed);
    } catch (e) {
      if (e instanceof Error && e.message === 'IMAGE_TOO_LARGE') {
        setError('Ảnh quá lớn (>8MB). Vui lòng chọn ảnh nhẹ hơn.');
      } else {
        setError('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
      }
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    const newPhoto: CouplePhoto = {
      id: newId('photo'),
      url: preview,
      caption: caption.trim() || 'Khoảnh khắc yêu thương 💕',
      date,
      location: location.trim() || undefined,
      tag: tag || '',
      isFavorite: false,
      hearts: 0,
    };
    onAddPhoto(newPhoto);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-card pb-safe p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Thêm ảnh mới</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng"
            className="text-mute transition active:text-ink"
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        <div className="mb-4">
          {preview ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-line">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Bỏ ảnh"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white active:bg-black/80"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-line/30 transition active:bg-line touch-target"
            >
              {compressing ? (
                <>
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
                  <span className="text-sm text-mute">Đang nén ảnh...</span>
                </>
              ) : (
                <>
                  <Icon name="image" size={40} className="mb-2 text-mute" />
                  <span className="text-sm text-mute">Chọn ảnh hoặc chụp mới</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <IosField label="Lời tựa">
            <IosInput
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Khoảnh khắc yêu thương..."
              maxLength={120}
            />
          </IosField>

          <div className="grid grid-cols-2 gap-3">
            <IosField label="Ngày">
              <IosInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </IosField>
            <IosField label="Địa điểm">
              <IosInput
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="TP.HCM..."
                maxLength={60}
              />
            </IosField>
          </div>

          <IosField label="Thẻ (tuỳ chọn)">
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(tag === t ? '' : t)}
                  className={`ios-pill transition ${
                    tag === t
                      ? 'bg-rose text-night shadow-[0_0_12px_-2px_var(--color-rose)]'
                      : 'bg-line text-mute active:bg-line/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </IosField>

          {error && <p className="text-[11px] text-rose-400">{error}</p>}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition touch-target"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!preview || compressing}
            className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night disabled:opacity-50 active:opacity-80 transition touch-target"
          >
            Lưu ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
