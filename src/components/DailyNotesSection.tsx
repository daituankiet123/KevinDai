import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Heart,
  Edit3,
  Trash2,
  Tag,
  Clock,
  Sparkles,
  Copy,
  Check,
  ArrowUpDown,
  RotateCcw,
  X,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyNote, CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';
import { todayMonthStr } from '../utils/dateUtils';
import { DAILY_NOTE_MOOD_META, CATEGORY_ICONS } from '../constants';
import { useConfirm } from '../hooks/useConfirm';

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
  const [isAdvancedDateOpen, setIsAdvancedDateOpen] = useState(false);
  const { confirm, ConfirmDialogElement } = useConfirm();

  // Extract all unique categories/tags with counts
  const availableCategories = useMemo(() => {
    const map: Record<string, number> = {};
    notes.forEach((n) => {
      const cat = n.tag?.trim() || 'Nhật ký';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      icon: CATEGORY_ICONS[name] || '🏷️',
    }));
  }, [notes]);

  // Extract all unique months (YYYY-MM) available in notes
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.date && n.date.length >= 7) {
        set.add(n.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [notes]);

  // Format YYYY-MM to Vietnamese string (e.g. "Tháng 03/2026")
  const formatMonthLabel = (ymStr: string) => {
    try {
      const [year, month] = ymStr.split('-');
      return `Tháng ${month}/${year}`;
    } catch {
      return ymStr;
    }
  };

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
      return sortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
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

  // Check if any filter is actively applied
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTimeFilter !== 'all' ||
    selectedMoodFilter !== 'all' ||
    selectedAuthorFilter !== 'all';

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

  // Quick filter triggers
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

  const handleHeartClick = (e: React.MouseEvent, noteId: string) => {
    onHeartNote(noteId);
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

  const formatDateVietnamese = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = daysOfWeek[d.getDay()];
      return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return dateStr;
    }
  };

  const authorLabel = (author: string) => {
    if (author === 'girlfriend') {
      return {
        name: couple.girlfriendNickname || couple.girlfriendName || 'Bà Chã Thơm',
        avatar: couple.girlfriendAvatar || '👧🌸',
        role: 'Hậu phương',
      };
    }
    if (author === 'boyfriend') {
      return {
        name: couple.boyfriendNickname || couple.boyfriendName || 'Ông Chã Húi',
        avatar: couple.boyfriendAvatar || '👨‍✈️',
        role: 'Chiến sĩ',
      };
    }
    return {
      name: 'Cả hai đứa',
      avatar: '💑',
      role: 'Đôi lứa',
    };
  };

  const handleCopyAllNotesSummary = () => {
    const summaryText = filteredNotes
      .slice(0, 20)
      .map((n) => `📅 [${n.date}] (${n.tag || 'Nhật ký'} - ${MOOD_META[n.mood]?.label || 'Cảm xúc'}): "${n.content}"`)
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
              Mỗi ngày trong quân ngũ là một bước đếm ngược gần hơn tới ngày anh về. Lọc theo thể loại, sự kiện hoặc mốc ngày tháng để tìm lại mọi kỷ niệm đáng nhớ của hai đứa!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyAllNotesSummary}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white border border-white/30 transition shadow-xs cursor-pointer"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
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
            <div className="text-lg font-extrabold text-amber-700">{availableCategories.length} chủ đề</div>
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-xs space-y-4">
        {/* Row 1: Search & Sort & Author */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, sự kiện, ngày tháng (VD: cuộc gọi, tân binh, 2026-03)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-2xl border border-rose-200/90 focus:outline-hidden focus:ring-2 focus:ring-rose-400 bg-rose-50/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Author filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-bold">
            <button
              onClick={() => setSelectedAuthorFilter('all')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
                selectedAuthorFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả người ghi
            </button>
            <button
              onClick={() => setSelectedAuthorFilter('girlfriend')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
                selectedAuthorFilter === 'girlfriend'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>👧</span>
              <span>Em ({couple.girlfriendName.split(' ').pop() || 'Tuyền'})</span>
            </button>
            <button
              onClick={() => setSelectedAuthorFilter('boyfriend')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
                selectedAuthorFilter === 'boyfriend'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>👨‍✈️</span>
              <span>Anh ({couple.boyfriendName.split(' ').pop() || 'Kiệt'})</span>
            </button>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => {
              playHeartPop(soundEnabled);
              setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
            }}
            title={sortOrder === 'desc' ? 'Đang sắp xếp: Mới nhất trước' : 'Đang sắp xếp: Cũ nhất trước'}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}</span>
          </button>
        </div>

        {/* Row 2: Lọc theo Thể loại (Category / Tag) */}
        <div className="pt-2 border-t border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>Lọc theo Thể loại / Chủ đề sự kiện:</span>
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Xem tất cả thể loại
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              Tất cả thể loại ({notes.length})
            </button>

            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleFilterByCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-200 hover:bg-rose-50/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-700'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Lọc theo Ngày tháng & Khoảng thời gian (Date & Time filter) */}
        <div className="pt-2 border-t border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Lọc theo Ngày tháng &amp; Dòng thời gian:</span>
            </span>

            <button
              onClick={() => setIsAdvancedDateOpen(!isAdvancedDateOpen)}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>{isAdvancedDateOpen ? 'Ẩn bộ lọc ngày tùy chỉnh' : 'Chọn khoảng ngày cụ thể'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAdvancedDateOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Quick Time Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
            <button
              onClick={() => {
                setSelectedTimeFilter('all');
                setSelectedMonth('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedTimeFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả thời gian
            </button>

            <button
              onClick={() => setSelectedTimeFilter('this_month')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedTimeFilter === 'this_month'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tháng này
            </button>

            <button
              onClick={() => setSelectedTimeFilter('year_2026')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedTimeFilter === 'year_2026'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Năm 2026
            </button>

            <button
              onClick={() => setSelectedTimeFilter('year_2027')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedTimeFilter === 'year_2027'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Năm 2027
            </button>

            <button
              onClick={() => setSelectedTimeFilter('year_2028')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedTimeFilter === 'year_2028'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Năm 2028
            </button>

            {/* Dropdown specific month */}
            <div className="relative shrink-0">
              <select
                value={selectedTimeFilter === 'custom_month' ? selectedMonth : 'none'}
                onChange={(e) => {
                  if (e.target.value === 'none') {
                    setSelectedTimeFilter('all');
                    setSelectedMonth('all');
                  } else {
                    handleFilterByMonth(e.target.value);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border appearance-none pr-7 cursor-pointer transition ${
                  selectedTimeFilter === 'custom_month'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-rose-200'
                }`}
              >
                <option value="none">🗓️ Chọn tháng cụ thể...</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthLabel(ym)}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${selectedTimeFilter === 'custom_month' ? 'text-white' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Advanced Date Range Inputs */}
          {isAdvancedDateOpen && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-rose-800">Khoảng ngày:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Từ:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedTimeFilter('custom_range');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedTimeFilter('custom_range');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-white font-medium text-slate-800"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedTimeFilter('all');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-100"
                >
                  Xóa khoảng ngày
                </button>
              )}
            </div>
          )}
        </div>

        {/* Row 4: Lọc theo Cảm xúc (Mood pills) */}
        <div className="pt-2 border-t border-rose-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold mr-1 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cảm xúc:</span>
          </span>
          <button
            onClick={() => setSelectedMoodFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedMoodFilter === 'all'
                ? 'bg-rose-100 text-rose-700 font-bold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          {Object.entries(MOOD_META).map(([key, meta]) => {
            const count = notes.filter((n) => n.mood === key).length;
            const isSelected = selectedMoodFilter === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMoodFilter(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-rose-500 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-rose-100 flex flex-wrap items-center justify-between gap-2 bg-rose-50/60 p-3 rounded-2xl text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700">Đang lọc:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  <span>Thể loại: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedTimeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  <span>
                    Thời gian:{' '}
                    {selectedTimeFilter === 'this_month'
                      ? 'Tháng này'
                      : selectedTimeFilter === 'custom_month'
                      ? formatMonthLabel(selectedMonth)
                      : selectedTimeFilter === 'custom_range'
                      ? `${startDate || '...'} -> ${endDate || '...'}`
                      : selectedTimeFilter.replace('year_', 'Năm ')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTimeFilter('all');
                      setSelectedMonth('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="hover:opacity-75"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedMoodFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  <span>Cảm xúc: {MOOD_META[selectedMoodFilter]?.label}</span>
                  <button onClick={() => setSelectedMoodFilter('all')} className="hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedAuthorFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  <span>Người ghi: {selectedAuthorFilter === 'girlfriend' ? 'Em' : 'Anh'}</span>
                  <button onClick={() => setSelectedAuthorFilter('all')} className="hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchTerm.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  <span>Từ khóa: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')} className="hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-700">
                Tìm thấy {filteredNotes.length} ghi chú
              </span>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 bg-white hover:text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại tất cả</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List / Timeline */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span>Hiển thị {filteredNotes.length} kỷ niệm</span>
            <span>{sortOrder === 'desc' ? 'Mới nhất ở trên' : 'Cũ nhất ở trên'}</span>
          </div>

          {filteredNotes.map((note) => {
            const mood = MOOD_META[note.mood] || MOOD_META.love;
            const author = authorLabel(note.author);
            const noteYm = note.date.slice(0, 7);

            return (
              <div
                key={note.id}
                className={`relative bg-white rounded-3xl p-5 sm:p-6 border ${mood.cardBorder} shadow-xs hover:shadow-md transition space-y-3`}
              >
                {/* Note Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date Badge (Clickable to filter by month) */}
                    <button
                      onClick={() => handleFilterByMonth(noteYm)}
                      title={`Nhấp để lọc tất cả ghi chú trong ${formatMonthLabel(noteYm)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition group cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDateVietnamese(note.date)}</span>
                    </button>

                    {/* Category Tag Badge (Clickable to filter by this category) */}
                    {note.tag && (
                      <button
                        onClick={() => handleFilterByCategory(note.tag || '')}
                        title={`Nhấp để lọc theo thể loại "${note.tag}"`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                      >
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{note.tag}</span>
                      </button>
                    )}

                    {/* Mood Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${mood.badgeClass}`}>
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
                    onClick={(e) => handleHeartClick(e, note.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition transform active:scale-95 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{note.hearts} yêu thích</span>
                  </button>
                </div>
              </div>
            );
          })}
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
              Không có ghi chú nào thỏa mãn bộ lọc hiện tại. Hãy thử chọn thể loại khác hoặc đặt lại bộ lọc để xem toàn bộ danh sách nhé!
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

      {ConfirmDialogElement}
    </div>
  );
};
