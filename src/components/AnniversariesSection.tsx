import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Plus, Bell, BellRing, Heart, Trash2, CheckCircle2, Clock, Sparkles, CalendarPlus } from 'lucide-react';
import { Anniversary, AnniversaryCategory } from '../types';
import { getAnniversaryStatus, AnniversaryStatus } from '../utils/dateCalculations';
import { playBellNotification, playHeartPop, playSweetChime } from '../utils/audio';

interface AnniversariesSectionProps {
  anniversaries: Anniversary[];
  onAddAnniversary: (anniv: Anniversary) => void;
  onDeleteAnniversary: (id: string) => void;
  soundEnabled: boolean;
}

const CATEGORY_NAMES: Record<AnniversaryCategory, string> = {
  love: 'Tình Yêu',
  military: 'Quân Ngũ',
  birthday: 'Sinh Nhật',
  visit: 'Thăm Nuôi',
  custom: 'Tùy Chỉnh',
};

const ICONS_SUGGESTION = ['💑', '🎖️', '🎂', '🎀', '⭐', '⏳', '💍', '💐', '💌', '✈️', '🥂'];

export const AnniversariesSection: React.FC<AnniversariesSectionProps> = ({
  anniversaries,
  onAddAnniversary,
  onDeleteAnniversary,
  soundEnabled,
}) => {
  const [filter, setFilter] = useState<'all' | AnniversaryCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Form states for adding new anniversary
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newIsAnnual, setNewIsAnnual] = useState(true);
  const [newCategory, setNewCategory] = useState<AnniversaryCategory>('love');
  const [newReminderDays, setNewReminderDays] = useState(3);
  const [newNotes, setNewNotes] = useState('');
  const [newIcon, setNewIcon] = useState('💖');

  const now = new Date();
  const statuses: AnniversaryStatus[] = anniversaries.map((a) => getAnniversaryStatus(a, now));

  // Sort: Today first, then soonest upcoming
  statuses.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a.daysRemaining - b.daysRemaining;
  });

  const urgentList = statuses.filter((s) => s.isUrgent);

  // Request browser notification
  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Trình duyệt hiện tại không hỗ trợ Web Notification.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      playBellNotification(soundEnabled);
      new Notification('Đếm Ngày Chờ Anh 💖', {
        body: 'Thông báo nhắc nhở ngày kỷ niệm đã được kích hoạt thành công! Chúng mình sẽ nhắc bạn trước mỗi ngày đặc biệt.',
        icon: 'https://api.iconify.design/twemoji:sparkling-heart.svg',
      });
    }
  };

  const handleTestNotification = () => {
    playBellNotification(soundEnabled);
    if (Notification.permission === 'granted') {
      new Notification('Nhắc nhở ngày kỷ niệm 💌', {
        body: 'Sắp tới ngày kỷ niệm đặc biệt của hai đứa mình rồi đó, chuẩn bị quà và thư gửi anh nhé!',
        icon: 'https://api.iconify.design/twemoji:love-letter.svg',
      });
    }
  };

  const handleCelebrate = (s: AnniversaryStatus, e: React.MouseEvent) => {
    playBellNotification(soundEnabled);
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 40,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f43f5e', '#ec4899', '#f59e0b', '#10b981'],
    });
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const anniv: Anniversary = {
      id: `anniv-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      isAnnual: newIsAnnual,
      category: newCategory,
      reminderDaysBefore: Number(newReminderDays) || 3,
      notes: newNotes.trim(),
      icon: newIcon || '💖',
    };

    onAddAnniversary(anniv);
    playBellNotification(soundEnabled);
    setShowAddModal(false);

    // Reset form
    setNewTitle('');
    setNewDate('');
    setNewNotes('');
  };

  const handleExportCalendar = () => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Cho Anh Ve//VN\nCALSCALE:GREGORIAN\n";
    anniversaries.forEach((a) => {
      const cleanDate = a.date.replace(/-/g, '');
      ics += "BEGIN:VEVENT\n";
      ics += `SUMMARY:${a.title}\n`;
      ics += `DESCRIPTION:${a.notes || 'Kỷ niệm tình yêu Chờ Anh Về'}\n`;
      ics += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      ics += `DTEND;VALUE=DATE:${cleanDate}\n`;
      if (a.isAnnual) {
        ics += "RRULE:FREQ=YEARLY\n";
      }
      ics += "END:VEVENT\n";
    });
    ics += "END:VCALENDAR";

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Lich_Ky_Niem_Tinh_Yeu_Cho_Anh_Ve.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSweetChime(soundEnabled);
  };

  const filteredStatuses = filter === 'all'
    ? statuses
    : statuses.filter((s) => s.anniversary.category === filter);

  return (
    <div className="space-y-6">
      {/* Top Header & Notification Activation Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-rose-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <h2 className="text-lg font-bold text-slate-800">
              Nhắc Nhở Ngày Kỷ Niệm & Cột Mốc Tình Yêu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Không bao giờ bỏ lỡ sinh nhật anh, ngày yêu nhau hay những ngày phép, thăm nuôi quý giá.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleRequestNotification}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Bật thông báo Desktop</span>
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Thông báo đang BẬT (Thử chuông)</span>
            </button>
          )}

          <button
            onClick={handleExportCalendar}
            title="Tải file lịch iCal (.ics) để thêm vào Google Calendar, iPhone hoặc Android"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-rose-50 rounded-xl border border-rose-200 transition shadow-2xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-rose-500" />
            <span>Xuất file Lịch (.ics)</span>
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              playHeartPop(soundEnabled);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ngày Kỷ Niệm Mới</span>
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner if any anniversary is close */}
      {urgentList.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-rose-100 to-pink-100 p-4 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-lg shrink-0 animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Có sự kiện đang tới gần!
              </div>
              <div className="text-sm font-bold text-slate-800">
                {urgentList[0].isToday ? (
                  <span className="text-rose-600 font-extrabold">
                    Hôm nay là: {urgentList[0].anniversary.title} 🎉
                  </span>
                ) : (
                  <span>
                    Chỉ còn <strong>{urgentList[0].daysRemaining} ngày nữa</strong> là tới{' '}
                    <strong className="text-rose-600">{urgentList[0].anniversary.title}</strong>!
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => handleCelebrate(urgentList[0], e)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
          >
            Bắn pháo hoa chúc mừng ✨
          </button>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
            filter === 'all'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
          }`}
        >
          Tất cả ({statuses.length})
        </button>
        {(['love', 'military', 'birthday', 'visit'] as AnniversaryCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              filter === cat
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-rose-100'
            }`}
          >
            {CATEGORY_NAMES[cat]}
          </button>
        ))}
      </div>

      {/* Grid of Anniversary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStatuses.map((item) => {
          const { anniversary, daysRemaining, isToday, isUrgent, formattedDate } = item;
          return (
            <div
              key={anniversary.id}
              className={`relative rounded-2xl p-5 border transition duration-200 bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                isToday
                  ? 'border-2 border-rose-500 ring-2 ring-rose-200 bg-rose-50/40'
                  : isUrgent
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-rose-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-rose-50 border border-rose-100">
                      {anniversary.icon || '💖'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                          {CATEGORY_NAMES[anniversary.category]}
                        </span>
                        {anniversary.isAnnual && (
                          <span className="text-[10px] text-slate-400 font-medium">· Hàng năm</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mt-0.5">
                        {anniversary.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="text-right shrink-0">
                    {isToday ? (
                      <span className="inline-block px-2.5 py-1 text-xs font-black bg-rose-500 text-white rounded-full animate-bounce shadow-xs">
                        Hôm nay! 🎉
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-400">Còn lại</span>
                        <span className="text-lg font-black text-rose-600 tabular-nums">
                          {daysRemaining} ngày
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes if any */}
                {anniversary.notes && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-rose-50 italic">
                    "{anniversary.notes}"
                  </p>
                )}
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-50">
                <span className="text-[11px] text-slate-400">
                  Nhắc trước {anniversary.reminderDaysBefore} ngày
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCelebrate(item, e)}
                    title="Thả tim chúc mừng"
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa ngày kỷ niệm "${anniversary.title}" không?`)) {
                        onDeleteAnniversary(anniversary.id);
                      }
                    }}
                    title="Xóa ngày kỷ niệm"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Anniversary */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="font-bold text-slate-800 text-lg">Thêm Ngày Kỷ Niệm Mới</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên ngày kỷ niệm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kỷ niệm 500 ngày yêu, Ngày thăm nuôi..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ngày diễn ra *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Danh mục
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AnniversaryCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chọn biểu tượng
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS_SUGGESTION.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={`text-xl p-2 rounded-xl border transition ${
                        newIcon === icon
                          ? 'border-rose-500 bg-rose-50 scale-110'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nhắc trước (ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newReminderDays}
                    onChange={(e) => setNewReminderDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsAnnual}
                      onChange={(e) => setNewIsAnnual(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500"
                    />
                    <span>Lặp lại hàng năm</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú yêu thương
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú kế hoạch chuẩn bị, quà tặng hoặc tâm sự..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
                />
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
                  Lưu Kỷ Niệm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
