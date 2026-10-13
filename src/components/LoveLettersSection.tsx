import React, { useState } from 'react';
import { Plus, Sparkles, Image, Calendar, Trash2, Star } from 'lucide-react';
import { LoveLetter, MoodType } from '../types';
import { playHeartPop, playSweetChime } from '../utils/audio';
import { compressImage } from '../utils/imageCompression';
import { useConfirm } from '../hooks/useConfirm';
import { newId } from '../utils/id';

interface LoveLettersSectionProps {
  letters: LoveLetter[];
  onAddLetter: (letter: LoveLetter) => void;
  onDeleteLetter: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  soundEnabled: boolean;
}

const MOOD_META: Record<MoodType, { label: string; icon: string; bg: string }> = {
  miss: { label: 'Nhớ anh da diết', icon: '🥺', bg: 'bg-indigo-50 text-indigo-700' },
  love: { label: 'Yêu anh say đắm', icon: '💖', bg: 'bg-rose-50 text-rose-700' },
  proud: { label: 'Tự hào về anh', icon: '🎖️', bg: 'bg-emerald-50 text-emerald-700' },
  sweet: { label: 'Ngọt ngào bình yên', icon: '🌸', bg: 'bg-pink-50 text-pink-700' },
  waiting: { label: 'Kiên lòng chờ đợi', icon: '⏳', bg: 'bg-amber-50 text-amber-700' },
  hug: { label: 'Gửi ngàn cái ôm', icon: '🫂', bg: 'bg-purple-50 text-purple-700' },
};

export const LoveLettersSection: React.FC<LoveLettersSectionProps> = ({
  letters,
  onAddLetter,
  onDeleteLetter,
  onToggleFavorite,
  soundEnabled,
}) => {
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [randomModal, setRandomModal] = useState(false);
  const { confirm, ConfirmDialogElement } = useConfirm();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('miss');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleOpenRandom = () => {
    if (letters.length === 0) return;
    const randomIndex = Math.floor(Math.random() * letters.length);
    setSelectedLetter(letters[randomIndex]);
    setRandomModal(true);
    playSweetChime(soundEnabled);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPhotoUrl(compressed);
      } catch {
        alert('Không thể tải ảnh, vui lòng thử lại.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newLetter: LoveLetter = {
      id: newId('letter'),
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      photoUrl: photoUrl || undefined,
      isFavorite: false,
    };

    onAddLetter(newLetter);
    playSweetChime(soundEnabled);
    setShowWriteModal(false);

    // Reset
    setTitle('');
    setContent('');
    setPhotoUrl('');
    setMood('miss');
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-white to-rose-50/80 backdrop-blur-sm rounded-2xl p-5 border border-rose-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl animate-wobble">💌</span>
            <h2 className="text-lg font-bold text-slate-800">
              Hộp Thư Gửi Chàng Lính & Nhật Ký Chờ Đợi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gom góp từng dòng tâm tư, nỗi nhớ và những câu chuyện nhỏ mỗi ngày chờ ngày anh về cùng
            đọc lại.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {letters.length > 0 && (
            <button
              onClick={handleOpenRandom}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mở ngẫu nhiên một bức thư</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowWriteModal(true);
              playHeartPop(soundEnabled);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Thư Mới Gửi Anh</span>
          </button>
        </div>
      </div>

      {/* Letters List */}
      {letters.length === 0 ? (
        <div className="text-center py-14 bg-white/70 rounded-3xl border border-dashed border-rose-200 p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
            💌
          </div>
          <h3 className="text-base font-bold text-slate-700">
            Hộp Thư Riêng Tư Của Hai Bạn Đang Trống
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Các lá thư mẫu mặc định đã được dọn sạch để nhường chỗ cho những tâm tư riêng tư nhất.
            Bà Chã Thơm hãy bấm nút dưới đây để gửi lá thư đầu tiên cho Ông Chã Húi nhé!
          </p>
          <button
            onClick={() => {
              setShowWriteModal(true);
              playHeartPop(soundEnabled);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Lá Thư Đầu Tiên Gửi Anh</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((letter) => {
            const moodInfo = MOOD_META[letter.mood] || MOOD_META.love;
            const letterDate = new Date(letter.date);
            const dateStr = `${letterDate.getDate().toString().padStart(2, '0')}/${(letterDate.getMonth() + 1).toString().padStart(2, '0')}/${letterDate.getFullYear()}`;

            return (
              <div
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className="group relative rounded-2xl p-5 border border-rose-100 bg-white hover:border-rose-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Stamp style on top right */}
                <div className="absolute top-3 right-3 w-10 h-10 border border-dashed border-rose-300 bg-rose-50/80 rounded-md flex flex-col items-center justify-center text-[10px] text-rose-600 font-bold rotate-6 group-hover:rotate-0 transition">
                  <span>VN</span>
                  <span>NVQS</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${moodInfo.bg}`}
                    >
                      <span>{moodInfo.icon}</span>
                      <span>{moodInfo.label}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition line-clamp-1 pr-10">
                    {letter.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-script text-base line-clamp-3 mt-2 leading-relaxed italic">
                    "{letter.content}"
                  </p>

                  {letter.photoUrl && (
                    <div className="mt-3 h-28 rounded-xl overflow-hidden bg-rose-50 border border-rose-100">
                      <img
                        src={letter.photoUrl}
                        alt="Đính kèm"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-50 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(letter.id)}
                      className={`p-1 rounded-md transition ${
                        letter.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${letter.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      aria-label="Xóa bức thư"
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Xóa bức thư',
                          message: 'Bạn có chắc muốn xóa bức thư này không?',
                          confirmLabel: 'Xóa thư',
                        });
                        if (ok) {
                          onDeleteLetter(letter.id);
                        }
                      }}
                      className="p-1 rounded-md text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Write Letter */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-rose-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                <h3 className="font-bold text-slate-800 text-lg">Viết Thư Gửi Chàng Lính</h3>
              </div>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tiêu đề bức thư *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhớ anh ngày mưa, Chúc mừng anh bắn súng đạt giỏi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tâm trạng hôm nay
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(MOOD_META) as MoodType[]).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMood(m)}
                      className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        mood === m
                          ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{MOOD_META[m].icon}</span>
                      <span>{MOOD_META[m].label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nội dung tâm tư gửi anh *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Anh yêu à, hôm nay ở nhà em..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm leading-relaxed"
                />
              </div>

              {/* Photo attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đính kèm ảnh kỷ niệm (Lưu an toàn trong máy)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 transition">
                    <Image className="w-4 h-4" />
                    <span>Chọn ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-9 h-9 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Bỏ ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition"
                >
                  Lưu Vào Hộp Thư 💌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View / Read Letter */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-gradient-to-b from-rose-50/90 to-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rose-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedLetter(null);
                setRandomModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
            >
              ✕
            </button>

            {randomModal && (
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                  ✨ Lá thư ngẫu nhiên mở ra bất ngờ!
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                {MOOD_META[selectedLetter.mood]?.icon} {MOOD_META[selectedLetter.mood]?.label}
              </span>
              <span className="text-xs text-slate-400">
                · Ngày viết: {new Date(selectedLetter.date).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4">{selectedLetter.title}</h3>

            <div className="font-script text-xl sm:text-2xl text-slate-700 leading-relaxed bg-white/70 p-5 rounded-2xl border border-rose-100/80 shadow-inner whitespace-pre-wrap">
              {selectedLetter.content}
            </div>

            {selectedLetter.photoUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-rose-200">
                <img
                  src={selectedLetter.photoUrl}
                  alt="Kỷ niệm"
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}

            <div className="mt-6 flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-rose-100">
              <span>Hậu phương vững chắc 💖</span>
              <button
                onClick={() => {
                  setSelectedLetter(null);
                  setRandomModal(false);
                }}
                className="px-4 py-2 font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition"
              >
                Gấp Thư Lại 💌
              </button>
            </div>
          </div>
        </div>
      )}

      {ConfirmDialogElement}
    </div>
  );
};
