import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';
import { IosFab } from './IosFab';
import { useIosConfirm } from '../../hooks/useIosConfirm';
import { useAppStore } from '../../store';
import { getAnniversaryStatus, type AnniversaryStatus } from '../../utils/dateCalculations';
import { playBellNotification } from '../../utils/audio';
import type { Anniversary, AnniversaryCategory } from '../../types';

type Props = {
  onAddAnniversary: (anniv: Anniversary) => void;
  onEditAnniversary: (anniv: Anniversary) => void;
  onDeleteAnniversary: (id: string) => void;
  soundEnabled: boolean;
};

const CATEGORY_NAMES: Record<AnniversaryCategory, string> = {
  love: 'Tình Yêu',
  military: 'Quân Ngũ',
  birthday: 'Sinh Nhật',
  visit: 'Thăm Nuôi',
  custom: 'Tùy Chỉnh',
};

const ICONS = ['💑', '🎖️', '🎂', '🎀', '⭐', '⏳', '💍', '💐', '💌', '✈️', '🥂', '🌸'];

const inputCls =
  'w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-rose focus:outline-none';

export function IosAnniversariesSection({
  onAddAnniversary,
  onEditAnniversary,
  onDeleteAnniversary,
  soundEnabled,
}: Props) {
  const anniversaries = useAppStore(useShallow((s) => s.anniversaries));
  const [filter, setFilter] = useState<'all' | AnniversaryCategory>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const { confirm, ConfirmDialogElement } = useIosConfirm();

  // Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<AnniversaryCategory>('love');
  const [icon, setIcon] = useState('💖');
  const [notes, setNotes] = useState('');

  const now = useMemo(() => new Date(), []);
  const statuses: AnniversaryStatus[] = useMemo(
    () => anniversaries.map((a) => ({ ...getAnniversaryStatus(a, now), anniversary: a })),
    [anniversaries, now]
  );

  statuses.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a.daysRemaining - b.daysRemaining;
  });

  const filtered = statuses.filter((s) => {
    if (filter !== 'all' && s.anniversary.category !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.anniversary.title.toLowerCase().includes(q) ||
        (s.anniversary.notes || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setDate('');
    setCategory('love');
    setIcon('💖');
    setNotes('');
    setShowModal(true);
  };

  const handleDelete = async (anniversary: Anniversary) => {
    const ok = await confirm({
      title: 'Xóa kỷ niệm này?',
      message: `“${anniversary.title}” sẽ bị xóa khỏi danh sách.`,
      confirmLabel: 'Xóa',
      tone: 'danger',
    });
    if (ok) onDeleteAnniversary(anniversary.id);
  };

  const openEdit = (a: Anniversary) => {
    setEditing(a);
    setTitle(a.title);
    setDate(a.date);
    setCategory(a.category);
    setIcon(a.icon || '💖');
    setNotes(a.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const payload: Anniversary = {
      id: editing ? editing.id : crypto.randomUUID(),
      title: title.trim(),
      date,
      isAnnual: true,
      category,
      reminderDaysBefore: editing ? editing.reminderDaysBefore : 3,
      notes: notes.trim(),
      icon: icon || '💖',
    };
    if (editing) onEditAnniversary(payload);
    else onAddAnniversary(payload);
    playBellNotification(soundEnabled);
    setShowModal(false);
  };

  return (
    <div className="space-y-4 pb-16 animate-pop-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-semibold leading-tight">Kỷ niệm</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm kỷ niệm..."
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

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            filter === 'all' ? 'bg-rose text-night' : 'bg-line text-mute'
          }`}
        >
          Tất cả
        </button>
        {(['love', 'military', 'birthday', 'visit', 'custom'] as AnniversaryCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === cat ? 'bg-rose text-night' : 'bg-line text-mute'
            }`}
          >
            {CATEGORY_NAMES[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(({ anniversary, daysRemaining, isToday, formattedDate }) => (
          <div
            key={anniversary.id}
            className={`rounded-2xl border p-4 ${
              isToday ? 'border-rose bg-rose/10' : 'border-line ios-card-gradient'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{anniversary.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate">{anniversary.title}</div>
                <div className="text-xs text-mute">{formattedDate}</div>
              </div>
              <div className="text-right shrink-0">
                {isToday ? (
                  <span className="inline-block rounded-full bg-rose px-2.5 py-1 text-[11px] font-bold text-night animate-wobble">
                    Hôm nay! 🎉
                  </span>
                ) : (
                  <div className="text-sm font-bold text-rose">{daysRemaining} ngày</div>
                )}
              </div>
            </div>
            {anniversary.notes && (
              <p className="mt-2 text-xs text-mute italic">"{anniversary.notes}"</p>
            )}
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => openEdit(anniversary)}
                aria-label={`Sửa kỷ niệm ${anniversary.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-mute transition active:scale-95 active:text-ink touch-target"
              >
                <Icon name="pen" size={16} />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(anniversary)}
                aria-label={`Xóa kỷ niệm ${anniversary.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-mute transition active:scale-95 active:text-rose touch-target"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon="🎀"
            title={search || filter !== 'all' ? 'Không tìm thấy kỷ niệm nào' : 'Chưa có kỷ niệm nào'}
            subtitle={
              search || filter !== 'all'
                ? 'Thử đổi từ khoá hoặc bộ lọc khác nhé.'
                : 'Đánh dấu những ngày đáng nhớ của tụi mình.'
            }
            action={
              !search && filter === 'all'
                ? { label: 'Thêm kỷ niệm đầu tiên', onClick: openAdd }
                : undefined
            }
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-line p-6 pb-safe max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-ink">
                {editing ? 'Sửa kỷ niệm' : 'Thêm kỷ niệm'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Đóng"
                className="text-mute hover:text-ink transition touch-target"
              >
                <Icon name="x" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Tên</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Kỷ niệm 500 ngày"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-mute">Ngày</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-mute">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AnniversaryCategory)}
                    className={inputCls}
                  >
                    <option value="love">Tình Yêu</option>
                    <option value="military">Quân Ngũ</option>
                    <option value="birthday">Sinh Nhật</option>
                    <option value="visit">Thăm Nuôi</option>
                    <option value="custom">Tùy Chỉnh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Biểu tượng</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      aria-label={`Chọn biểu tượng ${ic}`}
                      className={`text-xl p-2 rounded-xl border transition min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        icon === ic ? 'border-rose bg-rose/20' : 'border-line'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-mute">Ghi chú</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose py-3 text-sm font-semibold text-night active:opacity-80 transition"
                >
                  {editing ? 'Lưu thay đổi' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ConfirmDialogElement}

      <IosFab label="Thêm kỷ niệm" onClick={openAdd} />
    </div>
  );
}
