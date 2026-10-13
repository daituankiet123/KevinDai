import React, { useState } from 'react';
import { Shield, User, Calendar, Volume2, Camera } from 'lucide-react';
import { CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';
import { compressImage } from '../utils/imageCompression';
import { requestNotificationPermission } from '../utils/notifications';

interface CoupleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleData;
  onSave: (data: CoupleData) => void;
  soundEnabled: boolean;
}

const AVATAR_OPTIONS_BOY = ['👨‍✈️', '👮‍♂️', '💂‍♂️', '🧑‍✈️', '🧑', '😎', '🧸'];
const AVATAR_OPTIONS_GIRL = ['👧🌸', '👩‍🦰', '👸', '🌸', '🎀', '🐰', '🐱'];

export const CoupleSettingsModal: React.FC<CoupleSettingsModalProps> = ({
  isOpen,
  onClose,
  couple,
  onSave,
  soundEnabled,
}) => {
  const [formData, setFormData] = useState<CoupleData>({ ...couple });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    playHeartPop(soundEnabled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-rose-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-rose-100 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl shadow-xs">
            ⚙️
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Cài Đặt Đôi Lứa &amp; Lịch Nghĩa Vụ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh thông tin của chàng lính và nàng hậu phương ngọt ngào.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Boyfriend info */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Thông tin Chàng Lính (Bạn trai)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên thật của anh *
                </label>
                <input
                  type="text"
                  required
                  value={formData.boyfriendName}
                  onChange={(e) => setFormData({ ...formData, boyfriendName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Biệt danh gọi yêu
                </label>
                <input
                  type="text"
                  value={formData.boyfriendNickname}
                  onChange={(e) => setFormData({ ...formData, boyfriendNickname: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Đơn vị đóng quân
                </label>
                <input
                  type="text"
                  value={formData.militaryUnit}
                  onChange={(e) => setFormData({ ...formData, militaryUnit: e.target.value })}
                  placeholder="Ví dụ: Trường Cao đẳng Hậu cần 2 (Thủ Đức) - Y tá Đại đội..."
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Ảnh đại diện của anh (Ông Chã Húi)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl overflow-hidden border border-emerald-300 shrink-0">
                    {formData.boyfriendAvatar &&
                    (formData.boyfriendAvatar.startsWith('data:') ||
                      formData.boyfriendAvatar.startsWith('http')) ? (
                      <img
                        src={formData.boyfriendAvatar}
                        alt="Boyfriend"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{formData.boyfriendAvatar || '👨‍✈️'}</span>
                    )}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const avatar = await compressImage(file, {
                              maxDimension: 512,
                              quality: 0.85,
                            });
                            setFormData({ ...formData, boyfriendAvatar: avatar });
                          } catch {
                            alert('Không thể tải ảnh, vui lòng thử lại.');
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {AVATAR_OPTIONS_BOY.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setFormData({ ...formData, boyfriendAvatar: av })}
                        className={`text-base p-1.5 rounded-lg border transition ${
                          formData.boyfriendAvatar === av
                            ? 'border-emerald-500 bg-emerald-100 scale-110'
                            : 'border-slate-200 hover:bg-white'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Girlfriend info */}
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 text-sm">
              <User className="w-4 h-4 text-rose-600" />
              <span>Thông tin Hậu Phương (Bạn gái)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên của em *
                </label>
                <input
                  type="text"
                  required
                  value={formData.girlfriendName}
                  onChange={(e) => setFormData({ ...formData, girlfriendName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Biệt danh gọi yêu
                </label>
                <input
                  type="text"
                  value={formData.girlfriendNickname}
                  onChange={(e) => setFormData({ ...formData, girlfriendNickname: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Ảnh đại diện của em (Bà Chã Thơm)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-xl overflow-hidden border border-pink-300 shrink-0">
                  {formData.girlfriendAvatar &&
                  (formData.girlfriendAvatar.startsWith('data:') ||
                    formData.girlfriendAvatar.startsWith('http')) ? (
                    <img
                      src={formData.girlfriendAvatar}
                      alt="Girlfriend"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{formData.girlfriendAvatar || '👧🌸'}</span>
                  )}
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-xl border border-pink-300 bg-white hover:bg-pink-50 text-rose-800 text-xs font-bold transition flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tải ảnh từ máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const avatar = await compressImage(file, {
                            maxDimension: 512,
                            quality: 0.85,
                          });
                          setFormData({ ...formData, girlfriendAvatar: avatar });
                        } catch {
                          alert('Không thể tải ảnh, vui lòng thử lại.');
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {AVATAR_OPTIONS_GIRL.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setFormData({ ...formData, girlfriendAvatar: av })}
                      className={`text-base p-1.5 rounded-lg border transition ${
                        formData.girlfriendAvatar === av
                          ? 'border-rose-500 bg-rose-100 scale-110'
                          : 'border-slate-200 hover:bg-white'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Romantic Music Settings */}
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-purple-900 text-sm">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Âm Thanh &amp; Nhạc Nền Lãng Mạn</span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    Nhạc nền lãng mạn (Lofi Piano)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Phát giai điệu du dương, ấm áp khi sử dụng ứng dụng
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.bgMusicEnabled ?? false}
                  onChange={(e) => setFormData({ ...formData, bgMusicEnabled: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                />
              </label>

              {(formData.bgMusicEnabled ?? false) && (
                <div className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-700 text-xs shrink-0">
                    Âm lượng nhạc ({Math.round((formData.bgMusicVolume ?? 0.5) * 100)}%)
                  </span>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={formData.bgMusicVolume ?? 0.5}
                    onChange={(e) =>
                      setFormData({ ...formData, bgMusicVolume: parseFloat(e.target.value) })
                    }
                    className="w-40 accent-rose-500 cursor-pointer"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-purple-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.soundEnabled}
                    onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700 text-xs">Âm thanh hiệu ứng</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-purple-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rainHeartsEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, rainHeartsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-700 text-xs">Cơn mưa trái tim</span>
                </label>
              </div>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    Thông báo nhắc nhở kỷ niệm
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Gửi thông báo trình duyệt khi kỷ niệm sắp đến hoặc trong ngày
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notificationsEnabled ?? false}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      await requestNotificationPermission();
                    }
                    setFormData({ ...formData, notificationsEnabled: checked });
                  }}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Military & Dating Dates */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Mốc Thời Gian Quân Ngũ (2026 - 2028) &amp; Tình Yêu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Ngày nhập ngũ *
                </label>
                <input
                  type="date"
                  required
                  value={formData.militaryStartDate}
                  onChange={(e) => setFormData({ ...formData, militaryStartDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Ngày xuất ngũ *
                </label>
                <input
                  type="date"
                  required
                  value={formData.militaryEndDate}
                  onChange={(e) => setFormData({ ...formData, militaryEndDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Ngày bắt đầu yêu *
                </label>
                <input
                  type="date"
                  required
                  value={formData.datingStartDate}
                  onChange={(e) => setFormData({ ...formData, datingStartDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Lời nhắn gửi ngọt ngào
              </label>
              <input
                type="text"
                value={formData.sweetQuote}
                onChange={(e) => setFormData({ ...formData, sweetQuote: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition"
            >
              Lưu Cài Đặt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
