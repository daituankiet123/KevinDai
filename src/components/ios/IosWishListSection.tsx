import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';
import { IosFab } from './IosFab';
import { useAppStore } from '../../store';
import { playHeartPop } from '../../utils/audio';
import { newId } from '../../utils/id';
import type { WishItem } from '../../types';

type Props = {
  onAddWish: (wish: WishItem) => void;
  onEditWish: (wish: WishItem) => void;
  onToggleWish: (id: string) => void;
  onHeartWish: (id: string) => void;
  onDeleteWish: (id: string) => void;
  soundEnabled: boolean;
};

export function IosWishListSection({
  onAddWish,
  onEditWish,
  onToggleWish,
  onHeartWish,
  onDeleteWish,
  soundEnabled,
}: Props) {
  const wishes = useAppStore(useShallow((s) => s.wishes));
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<WishItem | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  const completed = wishes.filter((w) => w.completed).length;

  const filtered = wishes.filter((w) => {
    if (filter === 'done' && !w.completed) return false;
    if (filter === 'pending' && w.completed) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
    }
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setCategory('');
    setShowAdd(true);
  };

  const openEdit = (wish: WishItem) => {
    setEditing(wish);
    setTitle(wish.title);
    setCategory(wish.category);
    setShowAdd(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload: WishItem = {
      id: editing ? editing.id : newId('wish'),
      title: title.trim(),
      completed: editing ? editing.completed : false,
      category: category.trim() || 'Chung',
      hearts: editing ? editing.hearts : 0,
    };
    if (editing) onEditWish(payload);
    else onAddWish(payload);
    playHeartPop(soundEnabled);
    setShowAdd(false);
  };

  return (
    <div className="space-y-4 pb-16 animate-pop-in">
      <div className="flex items-center justify-between">
        <p className="text-xs text-mute">
          {completed}/{wishes.length} đã hoàn thành
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm ước nguyện..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 pl-10 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'done'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === f ? 'bg-rose text-night' : 'bg-line text-mute'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chưa xong' : 'Đã xong'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((wish) => (
          <div
            key={wish.id}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              wish.completed ? 'border-line ios-card-gradient opacity-70' : 'border-line ios-card-gradient'
            }`}
          >
            <button
              type="button"
              onClick={() => onToggleWish(wish.id)}
              aria-label={wish.completed ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}
              className={`flex size-7 flex-none items-center justify-center rounded-full border-2 transition ${
                wish.completed ? 'border-emerald-500 bg-emerald-500 text-night' : 'border-line'
              }`}
            >
              {wish.completed && <Icon name="check" size={16} />}
            </button>
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium ${
                  wish.completed ? 'text-mute line-through' : 'text-ink'
                }`}
              >
                {wish.title}
              </div>
              <div className="text-[11px] text-mute">{wish.category}</div>
            </div>
            <button
              type="button"
              onClick={() => onHeartWish(wish.id)}
              className="flex items-center gap-1 text-xs text-rose active:scale-90 transition-transform"
            >
              <span>{wish.hearts > 0 ? '❤️' : '🤍'}</span>
              <span>{wish.hearts}</span>
            </button>
            <button
              type="button"
              onClick={() => openEdit(wish)}
              className="text-mute active:text-ink"
              aria-label="Sửa"
            >
              <Icon name="pen" size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteWish(wish.id)}
              className="text-mute active:text-red-400"
              aria-label="Xóa"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon="⭐"
            title={
              search || filter !== 'all' ? 'Không tìm thấy ước nguyện nào' : 'Chưa có ước nguyện nào'
            }
            subtitle={
              search || filter !== 'all'
                ? 'Thử đổi từ khoá hoặc bộ lọc khác nhé.'
                : 'Liệt kê những điều tụi mình muốn làm khi anh về.'
            }
            action={
              !search && filter === 'all'
                ? { label: 'Thêm ước nguyện đầu tiên', onClick: openAdd }
                : undefined
            }
          />
        )}
      </div>

      <IosFab label="Thêm ước nguyện" onClick={openAdd} />

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl border border-line bg-card p-6 pb-safe max-h-[90vh] overflow-y-auto sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                {editing ? 'Sửa ước nguyện' : 'Ước nguyện mới'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                aria-label="Đóng"
                className="flex size-9 items-center justify-center rounded-full bg-line text-mute active:bg-white/10"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Việc muốn làm khi anh về..."
                className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
                autoFocus
              />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Danh mục (ví dụ: Du lịch, Ăn uống...)"
                className="w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
