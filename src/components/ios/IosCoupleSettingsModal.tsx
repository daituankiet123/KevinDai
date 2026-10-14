import { useState } from 'react';
import { Icon } from './Icon';
import { playHeartPop } from '../../utils/audio';
import { compressImage } from '../../utils/imageCompression';
import { requestNotificationPermission } from '../../utils/notifications';
import type { AccentTheme, CoupleData, CouplePhoto } from '../../types';
import { AvatarPickerFromAlbum } from '../AvatarPickerFromAlbum';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleData;
  onSave: (data: CoupleData) => void;
  soundEnabled: boolean;
  photos: CouplePhoto[];
};

const AVATAR_OPTIONS_BOY = ['👨‍✈️', '👮‍♂️', '💂‍♂️', '🧑‍✈️', '🧑', '😎', '🧸'];
const AVATAR_OPTIONS_GIRL = ['👧🌸', '👩‍🦰', '👸', '🌸', '🎀', '🐰', '🐱'];

export function IosCoupleSettingsModal({ isOpen, onClose, couple, onSave, soundEnabled, photos }: Props) {
  const [formData, setFormData] = useState<CoupleData>({ ...couple });
  const [showAvatarPickerBoy, setShowAvatarPickerBoy] = useState(false);
  const [showAvatarPickerGirl, setShowAvatarPickerGirl] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<'boyfriend' | 'girlfriend' | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    playHeartPop(soundEnabled);
    onClose();
  };

  const handleAvatarUpload = async (target: 'boyfriend' | 'girlfriend', file: File) => {
    setUploadingAvatar(target);
    try {
      const avatar = await compressImage(file, { maxDimension: 512, quality: 0.85 });
      setFormData({ ...formData, [target === 'boyfriend' ? 'boyfriendAvatar' : 'girlfriendAvatar']: avatar });
    } catch {
      alert('Không thể tải ảnh, vui lòng thử lại.');
    } finally {
      setUploadingAvatar(null);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none touch-target';

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-line bg-card p-6 pb-safe max-h-[92vh] overflow-y-auto sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Cài đặt cặp đôi</h2>
            <p className="text-xs text-mute">Tên, ngày xuất ngũ, âm thanh</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-9 items-center justify-center rounded-full bg-line text-mute active:bg-white/10 touch-target"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Chàng lính</h3>
            <input
              type="text"
              required
              value={formData.boyfriendName}
              onChange={(e) => setFormData({ ...formData, boyfriendName: e.target.value })}
              placeholder="Tên của anh"
              className={inputCls}
            />
            <input
              type="text"
              value={formData.boyfriendNickname}
              onChange={(e) => setFormData({ ...formData, boyfriendNickname: e.target.value })}
              placeholder="Biệt danh gọi yêu"
              className={inputCls}
            />
            <input
              type="text"
              value={formData.militaryUnit}
              onChange={(e) => setFormData({ ...formData, militaryUnit: e.target.value })}
              placeholder="Đơn vị đóng quân"
              className={inputCls}
            />
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_OPTIONS_BOY.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setFormData({ ...formData, boyfriendAvatar: av })}
                  className={`flex-none rounded-xl border p-2 text-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    formData.boyfriendAvatar === av ? 'border-rose bg-rose/20' : 'border-line'
                  }`}
                >
                  {av}
                </button>
              ))}
              <label className={`flex-none cursor-pointer rounded-xl border border-line px-3 py-2 text-xs font-semibold text-mute active:bg-line touch-target flex items-center gap-1 ${uploadingAvatar === 'boyfriend' ? 'opacity-50 pointer-events-none' : ''}`}>
                Tải ảnh
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  disabled={uploadingAvatar === 'boyfriend'}
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload('boyfriend', e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarPickerBoy(true)}
                disabled={uploadingAvatar === 'boyfriend'}
                className="flex-none cursor-pointer rounded-xl border border-line px-3 py-2 text-xs font-semibold text-mute active:bg-line flex items-center gap-1 touch-target disabled:opacity-50"
              >
                <Icon name="image" size={14} />
                <span>Chọn từ album</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Hậu phương</h3>
            <input
              type="text"
              required
              value={formData.girlfriendName}
              onChange={(e) => setFormData({ ...formData, girlfriendName: e.target.value })}
              placeholder="Tên của em"
              className={inputCls}
            />
            <input
              type="text"
              value={formData.girlfriendNickname}
              onChange={(e) => setFormData({ ...formData, girlfriendNickname: e.target.value })}
              placeholder="Biệt danh gọi yêu"
              className={inputCls}
            />
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_OPTIONS_GIRL.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setFormData({ ...formData, girlfriendAvatar: av })}
                  className={`flex-none rounded-xl border p-2 text-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    formData.girlfriendAvatar === av ? 'border-rose bg-rose/20' : 'border-line'
                  }`}
                >
                  {av}
                </button>
              ))}
              <label className={`flex-none cursor-pointer rounded-xl border border-line px-3 py-2 text-xs font-semibold text-mute active:bg-line touch-target flex items-center gap-1 ${uploadingAvatar === 'girlfriend' ? 'opacity-50 pointer-events-none' : ''}`}>
                Tải ảnh
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  disabled={uploadingAvatar === 'girlfriend'}
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload('girlfriend', e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarPickerGirl(true)}
                disabled={uploadingAvatar === 'girlfriend'}
                className="flex-none cursor-pointer rounded-xl border border-line px-3 py-2 text-xs font-semibold text-mute active:bg-line flex items-center gap-1 touch-target disabled:opacity-50"
              >
                <Icon name="image" size={14} />
                <span>Chọn từ album</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">Mốc thời gian</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-mute">Nhập ngũ</label>
                <input
                  type="date"
                  required
                  value={formData.militaryStartDate}
                  onChange={(e) => setFormData({ ...formData, militaryStartDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-mute">Xuất ngũ</label>
                <input
                  type="date"
                  required
                  value={formData.militaryEndDate}
                  onChange={(e) => setFormData({ ...formData, militaryEndDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-mute">Bắt đầu yêu</label>
                <input
                  type="date"
                  required
                  value={formData.datingStartDate}
                  onChange={(e) => setFormData({ ...formData, datingStartDate: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
            <input
              type="text"
              value={formData.sweetQuote}
              onChange={(e) => setFormData({ ...formData, sweetQuote: e.target.value })}
              placeholder="Lời nhắn ngọt ngào"
              className={inputCls}
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-line p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">Chủ đề màu</h3>
            <div className="flex gap-2">
              {([
                ['rose', '#f4a9b8', 'Hồng'],
                ['pink', '#f472b6', 'Hồng đậm'],
                ['violet', '#c4b5fd', 'Tím'],
                ['amber', '#fbbf24', 'Vàng'],
                ['teal', '#5eead4', 'Xanh ngọc'],
              ] as [AccentTheme, string, string][]).map(([theme, color, label]) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setFormData({ ...formData, accentTheme: theme })}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-2 transition touch-target ${
                    (formData.accentTheme ?? 'rose') === theme ? 'border-rose bg-rose/10' : 'border-line'
                  }`}
                >
                  <span
                    className="size-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] font-medium text-mute">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-line p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">Âm thanh</h3>
            <ToggleRow
              label="Nhạc nền lofi"
              checked={formData.bgMusicEnabled ?? false}
              onChange={(v) => setFormData({ ...formData, bgMusicEnabled: v })}
            />
            {(formData.bgMusicEnabled ?? false) && (
              <div className="flex items-center gap-3 py-1">
                <span className="text-xs text-mute">Âm lượng</span>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={formData.bgMusicVolume ?? 0.5}
                  onChange={(e) => setFormData({ ...formData, bgMusicVolume: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-500"
                />
              </div>
            )}
            <ToggleRow
              label="Hiệu ứng âm thanh"
              checked={formData.soundEnabled}
              onChange={(v) => setFormData({ ...formData, soundEnabled: v })}
            />
            <ToggleRow
              label="Mưa trái tim"
              checked={formData.rainHeartsEnabled}
              onChange={(v) => setFormData({ ...formData, rainHeartsEnabled: v })}
            />
            <ToggleRow
              label="Thông báo kỷ niệm"
              checked={formData.notificationsEnabled ?? false}
              onChange={async (v) => {
                if (v) await requestNotificationPermission();
                setFormData({ ...formData, notificationsEnabled: v });
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line touch-target"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 touch-target"
            >
              Lưu cài đặt
            </button>
          </div>
        </form>
      </div>
    </div>

    <>
    <AvatarPickerFromAlbum
      isOpen={showAvatarPickerBoy}
      onClose={() => setShowAvatarPickerBoy(false)}
      photos={photos}
      target="boyfriend"
      onSelectAvatar={(url) => setFormData({ ...formData, boyfriendAvatar: url })}
      soundEnabled={soundEnabled}
    />

    <AvatarPickerFromAlbum
      isOpen={showAvatarPickerGirl}
      onClose={() => setShowAvatarPickerGirl(false)}
      photos={photos}
      target="girlfriend"
      onSelectAvatar={(url) => setFormData({ ...formData, girlfriendAvatar: url })}
      soundEnabled={soundEnabled}
    />
  </>
  </>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between py-2 touch-target"
    >
      <span className="text-sm text-ink">{label}</span>
      <span
        className={`relative h-[31px] w-[51px] flex-none rounded-full transition-colors ${
          checked ? 'bg-rose' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 size-[27px] rounded-full bg-ink transition-[left] ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}