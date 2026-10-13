import React from 'react';
import { Calendar, Heart, Edit3, Trash2, Tag, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyNote, CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';
import { DAILY_NOTE_MOOD_META } from '../constants';
import { useConfirm } from '../hooks/useConfirm';

interface DailyNoteListItemProps {
  note: DailyNote;
  couple: CoupleData;
  soundEnabled: boolean;
  onHeartNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onOpenModal: (note?: DailyNote | null, date?: string) => void;
  onFilterByMonth: (ymStr: string) => void;
  onFilterByCategory: (catName: string) => void;
  formatDateVietnamese: (dateStr: string) => string;
  formatMonthLabel: (ymStr: string) => string;
}

const MOOD_META = DAILY_NOTE_MOOD_META;

export const DailyNoteListItem: React.FC<DailyNoteListItemProps> = ({
  note,
  couple,
  soundEnabled,
  onHeartNote,
  onDeleteNote,
  onOpenModal,
  onFilterByMonth,
  onFilterByCategory,
  formatDateVietnamese,
  formatMonthLabel,
}) => {
  const { confirm, ConfirmDialogElement } = useConfirm();
  const mood = MOOD_META[note.mood] || MOOD_META.love;
  const noteYm = note.date.slice(0, 7);

  const authorLabel = (author: string) => {
    if (author === 'girlfriend') {
      return {
        name: couple.girlfriendNickname || couple.girlfriendName || 'Bà Chã Thơm',
        avatar: couple.girlfriendAvatar || '👧🌸',
      };
    }
    if (author === 'boyfriend') {
      return {
        name: couple.boyfriendNickname || couple.boyfriendName || 'Ông Chã Húi',
        avatar: couple.boyfriendAvatar || '👨‍✈️',
      };
    }
    return {
      name: 'Cả hai đứa',
      avatar: '💑',
    };
  };

  const author = authorLabel(note.author);

  const handleHeartClick = (e: React.MouseEvent) => {
    onHeartNote(note.id);
    playHeartPop(soundEnabled);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#fda4af', '#f43f5e', '#fb7185'],
    });
  };

  return (
    <div
      className={`relative bg-white rounded-3xl p-5 sm:p-6 border ${mood.cardBorder} shadow-xs hover:shadow-md transition space-y-3`}
    >
      {/* Note Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Badge (Clickable to filter by month) */}
          <button
            onClick={() => onFilterByMonth(noteYm)}
            title={`Nhấp để lọc tất cả ghi chú trong ${formatMonthLabel(noteYm)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition group cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateVietnamese(note.date)}</span>
          </button>

          {/* Category Tag Badge (Clickable to filter by this category) */}
          {note.tag && (
            <button
              onClick={() => onFilterByCategory(note.tag || '')}
              title={`Nhấp để lọc theo thể loại "${note.tag}"`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
            >
              <Tag className="w-3 h-3 text-amber-600" />
              <span>{note.tag}</span>
            </button>
          )}

          {/* Mood Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${mood.badgeClass}`}
          >
            <span>{mood.icon}</span>
            <span>{mood.label}</span>
          </span>

          {/* Author Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <span>{author.avatar}</span>
            <span>{author.name}</span>
          </span>
        </div>

        {/* Actions (Edit / Delete) */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => onOpenModal(note, note.date)}
            title="Chỉnh sửa ghi chú"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            aria-label="Xóa ghi chú"
            onClick={async () => {
              const ok = await confirm({
                title: 'Xóa ghi chú',
                message: 'Bạn có chắc muốn xóa ghi chú này không?',
                confirmLabel: 'Xóa',
              });
              if (ok) {
                onDeleteNote(note.id);
              }
            }}
            title="Xóa ghi chú"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-sans font-medium whitespace-pre-wrap py-1">
        "{note.content}"
      </div>

      {/* Footer Bar */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {note.updatedAt
              ? `Cập nhật lúc ${new Date(note.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              : `Ghi nhận ngày ${note.date}`}
          </span>
        </div>

        <button
          onClick={handleHeartClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition transform active:scale-95 cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>{note.hearts} yêu thích</span>
        </button>
      </div>

      {ConfirmDialogElement}
    </div>
  );
};
