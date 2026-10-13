import React, { useState } from 'react';
import {
  Search,
  Tag,
  Calendar,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  X,
  ChevronDown,
} from 'lucide-react';
import { DailyNote, CoupleData } from '../types';
import { playHeartPop } from '../utils/audio';
import { DAILY_NOTE_MOOD_META, CATEGORY_ICONS } from '../constants';

const MOOD_META = DAILY_NOTE_MOOD_META;

interface DailyNotesFilterProps {
  notes: DailyNote[];
  couple: CoupleData;
  soundEnabled: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedTimeFilter: string;
  setSelectedTimeFilter: (v: string) => void;
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  selectedMoodFilter: string;
  setSelectedMoodFilter: (v: string) => void;
  selectedAuthorFilter: string;
  setSelectedAuthorFilter: (v: string) => void;
  sortOrder: 'desc' | 'asc';
  setSortOrder: (v: 'desc' | 'asc') => void;
  filteredCount: number;
  onResetFilters: () => void;
}

export const DailyNotesFilter: React.FC<DailyNotesFilterProps> = ({
  notes,
  couple,
  soundEnabled,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedTimeFilter,
  setSelectedTimeFilter,
  selectedMonth,
  setSelectedMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedMoodFilter,
  setSelectedMoodFilter,
  selectedAuthorFilter,
  setSelectedAuthorFilter,
  sortOrder,
  setSortOrder,
  filteredCount,
  onResetFilters,
}) => {
  const [isAdvancedDateOpen, setIsAdvancedDateOpen] = useState(false);

  // Extract all unique categories/tags with counts
  const availableCategories = React.useMemo(() => {
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
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.date && n.date.length >= 7) {
        set.add(n.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [notes]);

  const formatMonthLabel = (ymStr: string) => {
    try {
      const [year, month] = ymStr.split('-');
      return `Tháng ${month}/${year}`;
    } catch {
      return ymStr;
    }
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

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTimeFilter !== 'all' ||
    selectedMoodFilter !== 'all' ||
    selectedAuthorFilter !== 'all';

  return (
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
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
          }}
          title={
            sortOrder === 'desc' ? 'Đang sắp xếp: Mới nhất trước' : 'Đang sắp xếp: Cũ nhất trước'
          }
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
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-700'}`}
                >
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
            <span>
              {isAdvancedDateOpen ? 'Ẩn bộ lọc ngày tùy chỉnh' : 'Chọn khoảng ngày cụ thể'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isAdvancedDateOpen ? 'rotate-180' : ''}`}
            />
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
            <ChevronDown
              className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${selectedTimeFilter === 'custom_month' ? 'text-white' : 'text-slate-400'}`}
            />
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
            <span className="font-bold text-rose-700">Tìm thấy {filteredCount} ghi chú</span>
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 bg-white hover:text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại tất cả</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
