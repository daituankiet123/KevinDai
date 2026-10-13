import React from 'react';
import { Anniversary, WishItem, CouplePhoto } from '../types';
import { getAnniversaryStatus } from '../utils/dateCalculations';

interface DashboardTeasersProps {
  anniversaries: Anniversary[];
  wishes: WishItem[];
  photos: CouplePhoto[];
  now: Date;
  onNavigate: (tab: string) => void;
}

export const DashboardTeasers: React.FC<DashboardTeasersProps> = ({
  anniversaries,
  wishes,
  photos,
  now,
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Quick Teaser of Anniversaries */}
      <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 border border-rose-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h3 className="font-bold text-slate-800 text-base">Sự Kiện &amp; Kỷ Niệm</h3>
            </div>
            <button
              onClick={() => onNavigate('anniversaries')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="space-y-2.5">
            {anniversaries.slice(0, 3).map((a) => {
              const status = getAnniversaryStatus(a, now);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{a.icon || '💖'}</span>
                    <div className="truncate max-w-[130px]">
                      <div className="font-bold text-slate-800 truncate">{a.title}</div>
                      <div className="text-[10px] text-slate-400">{status.formattedDate}</div>
                    </div>
                  </div>
                  <span className="font-bold text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100 shrink-0 text-[11px]">
                    {status.isToday ? 'Hôm nay!' : `Còn ${status.daysRemaining} ngày`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
          <span>Nhắc nhở tự động</span>
          <button
            onClick={() => onNavigate('anniversaries')}
            className="font-bold text-rose-600 hover:text-rose-700"
          >
            + Thêm kỷ niệm
          </button>
        </div>
      </div>

      {/* Quick Teaser of Photo Album */}
      <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 border border-rose-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <h3 className="font-bold text-slate-800 text-base">Album Kỷ Niệm</h3>
            </div>
            <button
              onClick={() => onNavigate('album')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Mở album ({photos.length}) →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('album')}
                className="aspect-square rounded-xl overflow-hidden border border-rose-200 bg-rose-50 cursor-pointer hover:scale-105 transition"
              >
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic font-script text-base">
            "{photos[0]?.caption || 'Khoảnh khắc yêu thương của hai đứa mình'}"
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ảnh đôi lưu trữ offline</span>
          <button
            onClick={() => onNavigate('album')}
            className="font-bold text-rose-600 hover:text-rose-700"
          >
            + Tải thêm ảnh
          </button>
        </div>
      </div>

      {/* Quick Teaser of Wishlist */}
      <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 border border-rose-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💫</span>
              <h3 className="font-bold text-slate-800 text-base">Ước Nguyện Khi Anh Về</h3>
            </div>
            <button
              onClick={() => onNavigate('wishes')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Xem tất cả ({wishes.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {wishes.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{w.completed ? '✅' : '🌸'}</span>
                  <span
                    className={`font-semibold truncate ${
                      w.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {w.title}
                  </span>
                </div>
                <span className="text-rose-600 font-bold flex items-center gap-1 shrink-0 ml-1 text-xs">
                  ❤️ {w.hearts}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
          <span>Lên danh sách đón chàng lính</span>
          <button
            onClick={() => onNavigate('wishes')}
            className="font-bold text-rose-600 hover:text-rose-700"
          >
            + Thêm điều ước
          </button>
        </div>
      </div>
    </div>
  );
};
