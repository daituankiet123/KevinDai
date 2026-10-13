import React, { useState, useMemo } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { DailyNote, CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';
import { todayMonthStr } from '../utils/dateUtils';
import { DAILY_NOTE_MOOD_META } from '../constants';
import { DailyNotesFilter } from './DailyNotesFilter';
import { DailyNoteListItem } from './DailyNoteListItem';

interface DailyNotesSectionProps {
  notes: DailyNote[];
  couple: CoupleData;
  onAddOrUpdateNote: (note: DailyNote) => void;
  onDeleteNote: (id: string) => void;
  onHeartNote: (id: string) => void;
  onOpenModal: (note?: DailyNote | null, date?: string) => void;
  soundEnabled: boolean;
}

const MOOD_META = DAILY_NOTE_MOOD_META;

export const DailyNotesSection: React.FC<DailyNotesSectionProps> = ({
  notes,
  couple,
  onDeleteNote,
  onHeartNote,
  onOpenModal,
  soundEnabled,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filter notes based on all criteria
  const filteredNotes = useMemo(() => {
    const list = notes.filter((note) => {
      // 1. Search term (matches content, tag, or date string)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchSearch =
          note.content.toLowerCase().includes(query) ||
          (note.tag && note.tag.toLowerCase().includes(query)) ||
          note.date.includes(query);
        if (!matchSearch) return false;
      }

      // 2. Category / Thể loại filter
      if (selectedCategory !== 'all') {
        const cat = note.tag?.trim() || 'Nhật ký';
        if (cat !== selectedCategory) return false;
      }

      // 3. Time / Ngày tháng filter
      if (selectedTimeFilter === 'this_month') {
        const nowYm = todayMonthStr();
        if (!note.date.startsWith(nowYm)) return false;
      } else if (selectedTimeFilter === 'year_2026') {
        if (!note.date.startsWith('2026')) return false;
      } else if (selectedTimeFilter === 'year_2027') {
        if (!note.date.startsWith('2027')) return false;
      } else if (selectedTimeFilter === 'year_2028') {
        if (!note.date.startsWith('2028')) return false;
      } else if (selectedTimeFilter === 'custom_month') {
        if (selectedMonth !== 'all' && !note.date.startsWith(selectedMonth)) return false;
      } else if (selectedTimeFilter === 'custom_range') {
        if (startDate && note.date < startDate) return false;
        if (endDate && note.date > endDate) return false;
      }

      // 4. Mood filter
      if (selectedMoodFilter !== 'all' && note.mood !== selectedMoodFilter) {
        return false;
      }

      // 5. Author filter
      if (selectedAuthorFilter !== 'all' && note.author !== selectedAuthorFilter) {
        return false;
      }

      return true;
    });

    // Sort order
    return list.sort((a, b) => {
      return sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    });
  }, [
    notes,
    searchTerm,
    selectedCategory,
    selectedTimeFilter,
    selectedMonth,
    startDate,
    endDate,
    selectedMoodFilter,
    selectedAuthorFilter,
    sortOrder,
  ]);

  const handleResetFilters = () => {
    playHeartPop(soundEnabled);
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTimeFilter('all');
    setSelectedMonth('all');
    setStartDate('');
    setEndDate('');
    setSelectedMoodFilter('all');
    setSelectedAuthorFilter('all');
    setSortOrder('desc');
  };

  const handleFilterByCategory = (catName: string) => {
    playHeartPop(soundEnabled);
    setSelectedCategory(catName);
  };

  const handleFilterByMonth = (ymStr: string) => {
    playHeartPop(soundEnabled);
    setSelectedTimeFilter('custom_month');
    setSelectedMonth(ymStr);
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = notes.length;
    const moodCounts: Record<string, number> = {};
    let totalHearts = 0;

    notes.forEach((n) => {
      moodCounts[n.mood] = (moodCounts[n.mood] || 0) + 1;
      totalHearts += n.hearts || 0;
    });

    let topMoodItem: { id: string; count: number } | null = null;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (!topMoodItem || count > topMoodItem.count) {
        topMoodItem = { id: mood, count };
      }
    }

    const resolvedTopMood = topMoodItem ? MOOD_META[topMoodItem.id] : null;

    return {
      total,
      topMood: resolvedTopMood,
      topMoodCount: topMoodItem ? topMoodItem.count : 0,
      totalHearts,
    };
  }, [notes]);

  const formatDateVietnamese = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const daysOfWeek = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
      ];
      const dayName = daysOfWeek[d.getDay()];
      return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  const formatMonthLabel = (ymStr: string) => {
    try {
      const [year, month] = ymStr.split('-');
      return `Tháng ${month}/${year}`;
    } catch {
      return ymStr;
    }
  };

  const handleCopyAllNotesSummary = () => {
    const summaryText = filteredNotes
      .slice(0, 20)
      .map(
        (n) =>
          `📅 [${n.date}] (${n.tag || 'Nhật ký'} - ${MOOD_META[n.mood]?.label || 'Cảm xúc'}): "${n.content}"`
      )
      .join('\n\n');

    const fullMessage = `💖 NHẬT KÝ QUÂN NGŨ - CHỜ ANH VỀ (2026-2028)\nCặp đôi: ${couple.boyfriendName} & ${couple.girlfriendName}\n(Đã lọc: ${filteredNotes.length} ghi chú)\n\n${summaryText}`;

    navigator.clipboard.writeText(fullMessage);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-rose-100">
              <span>🌸</span>
              <span>Ghi Chép Mỗi Ngày · Tra Cứu Kỷ Niệm Dễ Dàng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Nhật Ký Cảm Xúc Hàng Ngày
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Mỗi ngày trong quân ngũ là một bước đếm ngược gần hơn tới ngày anh về. Lọc theo thể
              loại, sự kiện hoặc mốc ngày tháng để tìm lại mọi kỷ niệm đáng nhớ của hai đứa!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyAllNotesSummary}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white border border-white/30 transition shadow-xs cursor-pointer"
            >
              {copiedSummary ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedSummary ? 'Đã sao chép' : 'Sao chép nhật ký'}</span>
            </button>

            <button
              onClick={() => onOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white text-rose-600 hover:bg-rose-50 shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Viết ghi chú ngày</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
            📅
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Đã ghi chép</div>
            <div className="text-lg font-extrabold text-slate-800">{stats.total} ngày</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl shrink-0">
            {stats.topMood?.icon || '💖'}
          </div>
          <div className="truncate">
            <div className="text-[11px] font-semibold text-slate-400">Cảm xúc chủ đạo</div>
            <div className="text-sm font-extrabold text-slate-800 truncate">
              {stats.topMood?.label || 'Yêu thương'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            🏷️
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Thể loại sự kiện</div>
            <div className="text-lg font-extrabold text-amber-700">
              {new Set(notes.map((n) => n.tag?.trim() || 'Nhật ký')).size} chủ đề
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
            ❤️
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Tổng lượt tim</div>
            <div className="text-lg font-extrabold text-rose-600">{stats.totalHearts} ❤️</div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE FILTER & SEARCH SYSTEM */}
      <DailyNotesFilter
        notes={notes}
        couple={couple}
        soundEnabled={soundEnabled}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTimeFilter={selectedTimeFilter}
        setSelectedTimeFilter={setSelectedTimeFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedMoodFilter={selectedMoodFilter}
        setSelectedMoodFilter={setSelectedMoodFilter}
        selectedAuthorFilter={selectedAuthorFilter}
        setSelectedAuthorFilter={setSelectedAuthorFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filteredCount={filteredNotes.length}
        onResetFilters={handleResetFilters}
      />

      {/* Notes List / Timeline */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span>Hiển thị {filteredNotes.length} kỷ niệm</span>
            <span>{sortOrder === 'desc' ? 'Mới nhất ở trên' : 'Cũ nhất ở trên'}</span>
          </div>

          {filteredNotes.map((note) => (
            <DailyNoteListItem
              key={note.id}
              note={note}
              couple={couple}
              soundEnabled={soundEnabled}
              onHeartNote={onHeartNote}
              onDeleteNote={onDeleteNote}
              onOpenModal={onOpenModal}
              onFilterByMonth={handleFilterByMonth}
              onFilterByCategory={handleFilterByCategory}
              formatDateVietnamese={formatDateVietnamese}
              formatMonthLabel={formatMonthLabel}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 border border-dashed border-rose-200 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">
              Không tìm thấy ghi chú nào phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có ghi chú nào thỏa mãn bộ lọc hiện tại. Hãy thử chọn thể loại khác hoặc đặt lại
              bộ lọc để xem toàn bộ danh sách nhé!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Đặt lại bộ lọc
            </button>
            <button
              onClick={() => onOpenModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Viết ghi chú mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
