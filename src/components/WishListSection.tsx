import React, { useState } from 'react';
import { Check, Plus, Heart, Sparkles, Trash2, ListChecks } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishItem } from '../types';
import { playHeartPop, playSweetChime } from '../utils/audio';
import { useConfirm } from '../hooks/useConfirm';

interface WishListSectionProps {
  wishes: WishItem[];
  onAddWish: (wish: WishItem) => void;
  onToggleWish: (id: string) => void;
  onHeartWish: (id: string) => void;
  onDeleteWish: (id: string) => void;
  soundEnabled: boolean;
}

const WISH_CATEGORIES = ['Tất cả', 'Đón anh về', 'Ăn uống', 'Du lịch', 'Kỷ niệm', 'Hẹn hò', 'Tương lai'];

export const WishListSection: React.FC<WishListSectionProps> = ({
  wishes,
  onAddWish,
  onToggleWish,
  onHeartWish,
  onDeleteWish,
  soundEnabled,
}) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hẹn hò');
  const [showAddModal, setShowAddModal] = useState(false);
  const { confirm, ConfirmDialogElement } = useConfirm();

  const completedCount = wishes.filter((w) => w.completed).length;

  const handleToggle = (id: string, e: React.MouseEvent) => {
    const item = wishes.find((w) => w.id === id);
    if (item && !item.completed) {
      playSweetChime(soundEnabled);
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#10b981', '#f43f5e', '#ec4899', '#f59e0b'],
      });
    } else {
      playHeartPop(soundEnabled);
    }
    onToggleWish(id);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: WishItem = {
      id: `wish-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      category: newCategory,
      hearts: 1,
    };

    onAddWish(newItem);
    playHeartPop(soundEnabled);
    setNewTitle('');
    setShowAddModal(false);
  };

  const filteredWishes = activeCategory === 'Tất cả'
    ? wishes
    : wishes.filter((w) => w.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-bold text-slate-800">
              Hộp Ước Nguyện Khi Anh Về (2028)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Những điều ngọt ngào nhất định hai đứa mình sẽ cùng làm sau ngày anh xuất ngũ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-700">
            Đã hoàn thành {completedCount}/{wishes.length} điều
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              playHeartPop(soundEnabled);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Điều Ước</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/80 p-3.5 rounded-2xl border border-rose-100 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">Tiến độ chuẩn bị cho ngày sum họp:</span>
          <span className="text-rose-600">
            {wishes.length > 0 ? Math.round((completedCount / wishes.length) * 100) : 0}% ({completedCount}/{wishes.length} điều ước)
          </span>
        </div>
        <div className="h-2.5 w-full bg-rose-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${wishes.length > 0 ? Math.round((completedCount / wishes.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {WISH_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredWishes.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-4 border transition duration-200 bg-white flex items-center justify-between gap-3 shadow-xs hover:shadow-md ${
              item.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-100'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Checkbox button */}
              <button
                onClick={(e) => handleToggle(item.id, e)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                  item.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 hover:border-rose-400 bg-white'
                }`}
              >
                {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  {item.category}
                </span>
                <p
                  className={`text-sm font-semibold truncate ${
                    item.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Heart upvote */}
              <button
                onClick={() => {
                  onHeartWish(item.id);
                  playHeartPop(soundEnabled);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{item.hearts}</span>
              </button>

              <button
                aria-label="Xóa điều ước"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Xóa điều ước',
                    message: `Bạn muốn xóa điều ước "${item.title}"?`,
                    confirmLabel: 'Xóa',
                  });
                  if (ok) {
                    onDeleteWish(item.id);
                  }
                }}
                className="p-1 rounded-lg text-slate-300 hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Wish */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💫</span>
                <h3 className="font-bold text-slate-800 text-lg">Thêm Điều Ước Mới</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Điều muốn làm khi anh về *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cùng anh đi ăn món bún bò quen, du lịch biển..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Thể loại
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                >
                  {WISH_CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition"
                >
                  Lưu Điều Ước
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ConfirmDialogElement}
    </div>
  );
};
