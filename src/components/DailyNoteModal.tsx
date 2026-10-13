import React, { useState } from 'react';
import { X, Calendar, Sparkles, MessageSquare, Tag, UserCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyNote, DailyNoteMood, DailyNoteAuthor } from '../types';
import { playHeartPop, playSweetChime } from '../utils/audio';
import { todayStr } from '../utils/dateUtils';
import { SUGGESTED_NOTE_TAGS } from '../constants';

interface DailyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: DailyNote) => void;
  initialNote?: DailyNote | null;
  targetDate?: string;
  soundEnabled: boolean;
  boyfriendName?: string;
  girlfriendName?: string;
}

const MOOD_OPTIONS: { id: DailyNoteMood; label: string; icon: string; bg: string; text: string }[] = [
  { id: 'love', label: 'Yêu thương', icon: '💖', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  { id: 'miss', label: 'Nhớ da diết', icon: '🥺', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  { id: 'happy', label: 'Vui vẻ & Bình yên', icon: '🌸', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  { id: 'proud', label: 'Tự hào chàng lính', icon: '🎖️', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  { id: 'special', label: 'Cuộc gọi / Sự kiện', icon: '📞', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  { id: 'excited', label: 'Háo hức & Động lực', icon: '🌟', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  { id: 'tired', label: 'Mệt nhưng cố gắng', icon: '🔋', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
];

const SUGGESTED_TAGS = SUGGESTED_NOTE_TAGS;

const QUICK_PROMPTS = [
  'Hôm nay nghe được giọng anh 5 phút qua điện thoại, nghe anh cười là em an tâm cả ngày!',
  'Nhớ anh nhiều lắm, mở app nhìn lịch đếm ngược lại thấy chúng mình sắp về chung một nhà rồi.',
  'Hôm nay bãi tập nắng gắt nhưng nghĩ về hậu phương là anh có thêm 200% sức mạnh!',
  'Chuẩn bị xong giỏ quà để cuối tuần lên thăm chàng lính tại Trường Cao đẳng Hậu cần 2.',
  'Hoàn thành xuất sắc nhiệm vụ trực ban hôm nay, chiến sĩ nhớ cô bé của anh thật nhiều!',
];

export const DailyNoteModal: React.FC<DailyNoteModalProps> = ({ isOpen, ...rest }) => {
  if (!isOpen) return null;
  // Remount the form whenever the target note/date changes so state is
  // initialized from props without a state-syncing effect.
  const formKey = rest.initialNote?.id ?? rest.targetDate ?? 'new';
  return <DailyNoteForm key={formKey} {...rest} />;
};

const DailyNoteForm: React.FC<Omit<DailyNoteModalProps, 'isOpen'>> = ({
  onClose,
  onSave,
  initialNote,
  targetDate,
  soundEnabled,
  boyfriendName = 'Đại Tuấn Kiệt',
  girlfriendName = 'Lê Thị Thanh Tuyền',
}) => {
  const [date, setDate] = useState<string>(initialNote?.date || targetDate || todayStr());
  const [content, setContent] = useState<string>(initialNote?.content || '');
  const [mood, setMood] = useState<DailyNoteMood>(initialNote?.mood || 'love');
  const [author, setAuthor] = useState<DailyNoteAuthor>(initialNote?.author || 'girlfriend');
  const [tag, setTag] = useState<string>(initialNote?.tag || 'Cuộc gọi đơn vị');
  const [customTag, setCustomTag] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    playSweetChime(soundEnabled);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a'],
    });

    const nowIso = new Date().toISOString();
    const finalNote: DailyNote = {
      id: initialNote ? initialNote.id : `note-${Date.now()}`,
      date,
      content: content.trim(),
      mood,
      author,
      tag: customTag.trim() || tag || 'Nhật ký',
      hearts: initialNote ? initialNote.hearts : 1,
      createdAt: initialNote ? initialNote.createdAt : nowIso,
      updatedAt: nowIso,
    };

    onSave(finalNote);
    onClose();
  };

  const handleApplyPrompt = (prompt: string) => {
    playHeartPop(soundEnabled);
    setContent(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner">
              📝
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialNote ? 'Chỉnh Sửa Ghi Chú Ngày' : 'Ghi Chú & Cảm Xúc Trong Ngày'}
              </h2>
              <p className="text-xs text-rose-100">
                Lưu lại sự kiện quan trọng và cảm xúc đôi lứa mỗi ngày
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Ngày ghi chép:</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/40 focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-semibold text-slate-800"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Cảm xúc / Tâm trạng trong ngày:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = mood === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      playHeartPop(soundEnabled);
                      setMood(m.id);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition text-left text-xs font-bold ${
                      isSelected
                        ? `${m.bg} ${m.text} ring-2 ring-rose-400 shadow-xs scale-[1.02]`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/40'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-pink-500" />
              <span>Người ghi:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAuthor('girlfriend')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  author === 'girlfriend'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50'
                }`}
              >
                <span>👧🌸</span>
                <span className="truncate">Em ({girlfriendName.split(' ').pop() || 'Tuyền'})</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthor('boyfriend')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  author === 'boyfriend'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span>👨‍✈️⭐</span>
                <span className="truncate">Anh ({boyfriendName.split(' ').pop() || 'Kiệt'})</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthor('both')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  author === 'both'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50'
                }`}
              >
                <span>💑💖</span>
                <span className="truncate">Cả hai đứa</span>
              </button>
            </div>
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-rose-500" />
              <span>Chủ đề / Sự kiện:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_TAGS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setTag(t);
                    setCustomTag('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    tag === t && !customTag
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Hoặc tự nhập chủ đề sự kiện..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <span>Nội dung ghi chú ngắn:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {content.length} ký tự
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              placeholder="Nhập 1-3 câu cảm xúc hôm nay (VD: Hôm nay nhận cuộc gọi 5 phút của anh, em mừng rớt nước mắt. Nhớ anh nhiều lắm...)"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-slate-800 placeholder-slate-400 leading-relaxed font-sans text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Quick prompt suggestions */}
          <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100">
            <div className="text-[11px] font-bold text-rose-800 mb-1.5 flex items-center gap-1">
              <span>💡 Gợi ý nhanh (nhấp để điền):</span>
            </div>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPrompt(p)}
                  className="w-full text-left text-[11px] text-slate-600 hover:text-rose-700 hover:bg-white p-1.5 rounded-lg border border-transparent hover:border-rose-200 transition line-clamp-1 italic"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialNote ? 'Lưu thay đổi' : 'Lưu ghi chú'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
