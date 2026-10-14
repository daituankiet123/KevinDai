import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Calendar,
  Shield,
  MapPin,
  Smile,
  Send,
  Camera,
  Copy,
  Check,
} from 'lucide-react';
import { CoupleData } from '../types';
import { CountdownState } from '../utils/dateCalculations';
import { playSweetChime } from '../utils/audio';
import { compressImage } from '../utils/imageCompression';

interface CountdownHeroProps {
  couple: CoupleData;
  countdown: CountdownState;
  onOpenSettings: () => void;
  onTriggerFireworks?: () => void;
  onUpdateAvatar?: (target: 'boyfriend' | 'girlfriend', newAvatar: string) => void;
}

export const CountdownHero: React.FC<CountdownHeroProps> = ({
  couple,
  countdown,
  onTriggerFireworks,
  onUpdateAvatar,
}) => {
  const [hugCount, setHugCount] = useState(countdown.hugsSent);
  const [justHugged, setJustHugged] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const boyfriendInputRef = useRef<HTMLInputElement | null>(null);
  const girlfriendInputRef = useRef<HTMLInputElement | null>(null);

  const isImageAvatar = (avatar: string) =>
    avatar &&
    (avatar.startsWith('data:image') || avatar.startsWith('http') || avatar.includes('/'));

  const handleCopyCountdown = () => {
    const shareText =
      `💖 Chờ Anh Về (2026 - 2028) 💕\n` +
      `Ông Chã Húi (${couple.boyfriendName}) & Bà Chã Thơm (${couple.girlfriendName})\n` +
      `⏳ Còn ${countdown.daysRemaining} ngày, ${countdown.hours} giờ, ${countdown.minutes} phút nữa là đến ngày xuất ngũ đón anh về (10/01/2028)!\n` +
      `🎖️ Đã hoàn thành ${countdown.progressPercent.toFixed(1)}% chặng đường tại ${couple.militaryUnit || 'Trường Cao đẳng Hậu cần 2, Thủ Đức'}.\n` +
      `Quen nhau từ 29/08/2024 · Đã bên nhau ${countdown.totalDaysDating} ngày yêu thương 🌸💍`;

    navigator.clipboard.writeText(shareText);
    playSweetChime(couple.soundEnabled);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleUploadAvatar = async (
    target: 'boyfriend' | 'girlfriend',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const avatar = await compressImage(file, { maxDimension: 512, quality: 0.85 });
        if (onUpdateAvatar) {
          onUpdateAvatar(target, avatar);
          playSweetChime(couple.soundEnabled);
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'IMAGE_TOO_LARGE') {
          alert('Ảnh quá lớn (>8MB), vui lòng chọn ảnh nhẹ hơn.');
        }
      }
    }
  };

  const handleSendHug = (e: React.MouseEvent) => {
    playSweetChime(couple.soundEnabled);
    setHugCount((prev) => prev + 1);
    setJustHugged(true);
    setTimeout(() => setJustHugged(false), 800);

    // Confetti heart burst from button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6'],
      shapes: ['circle'],
      scalar: 1.2,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50 to-pink-100/90 p-6 sm:p-8 md:p-10 border border-rose-200/80 shadow-lg">
      {/* Background soft glow circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-pink-300/20 blur-3xl pointer-events-none" />

      {/* Top Banner: Couple Profiles & Identity */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-rose-200/60">
        {/* Boyfriend Card */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3.5 rounded-2xl border border-rose-200/60 shadow-xs hover:shadow-sm transition w-full sm:w-auto">
          <div
            className="relative group cursor-pointer"
            onClick={() => boyfriendInputRef.current?.click()}
            title="Nhấn để đổi ảnh đại diện của Ông Chã Húi"
          >
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 overflow-hidden text-2xl sm:text-3xl shadow-xs border-2 border-emerald-200">
              {isImageAvatar(couple.boyfriendAvatar) ? (
                <img
                  src={couple.boyfriendAvatar}
                  alt="Boyfriend"
                  className="w-full h-full object-cover"
                />
              ) : (
                couple.boyfriendAvatar || '👨‍✈️'
              )}
              <span className="absolute -bottom-1 -right-1 text-xs bg-emerald-700 text-white font-extrabold px-1.5 py-0.2 rounded-full border border-white z-10">
                NVQS
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              ref={boyfriendInputRef}
              accept="image/*"
              capture="user"
              onChange={(e) => handleUploadAvatar('boyfriend', e)}
              className="hidden"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {couple.boyfriendNickname || 'Chàng Lính Của Em'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{couple.boyfriendName}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Sinh: 06/09/2003
              </span>
              <span className="text-slate-300">·</span>
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{couple.militaryUnit || 'Trường Cao đẳng Hậu cần 2, Thủ Đức'}</span>
            </div>
          </div>
        </div>

        {/* Center Heart Connection */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 sm:w-12 bg-rose-300/60" />
            <div className="relative group cursor-pointer" onClick={handleSendHug}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md transform hover:scale-110 active:scale-95 transition">
                <Heart
                  className={`w-6 h-6 fill-white ${justHugged ? 'animate-ping' : 'animate-pulse'}`}
                />
              </div>
            </div>
            <span className="h-px w-8 sm:w-12 bg-rose-300/60" />
          </div>
          <div className="text-xs font-bold text-rose-600 mt-2 bg-rose-100/90 px-3 py-0.5 rounded-full border border-rose-200">
            Quen nhau từ 29/08/2024 ({countdown.totalDaysDating} ngày) 💕
          </div>
        </div>

        {/* Girlfriend Card */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3.5 rounded-2xl border border-rose-200/60 shadow-xs hover:shadow-sm transition w-full sm:w-auto">
          <div className="flex-1 text-right">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center justify-end gap-1">
              <Smile className="w-3 h-3" />
              {couple.girlfriendNickname || 'Hậu Phương Nhỏ'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{couple.girlfriendName}</h2>
            <div className="text-xs text-rose-500 font-medium mt-0.5 flex items-center justify-end gap-1">
              <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                Sinh: 07/04/2004
              </span>
              <span className="text-slate-300">·</span>
              <span>Đợi anh về 🌸</span>
            </div>
          </div>
          <div
            className="relative group cursor-pointer"
            onClick={() => girlfriendInputRef.current?.click()}
            title="Nhấn để đổi ảnh đại diện của Bà Chã Thơm"
          >
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 overflow-hidden text-2xl sm:text-3xl shadow-xs border-2 border-pink-200">
              {isImageAvatar(couple.girlfriendAvatar) ? (
                <img
                  src={couple.girlfriendAvatar}
                  alt="Girlfriend"
                  className="w-full h-full object-cover"
                />
              ) : (
                couple.girlfriendAvatar || '👧🌸'
              )}
              <span className="absolute -bottom-1 -right-1 text-xs bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded-full border border-white z-10">
                Yêu
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              ref={girlfriendInputRef}
              accept="image/*"
              capture="user"
              onChange={(e) => handleUploadAvatar('girlfriend', e)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Countdown Clocks */}
      <div className="my-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 font-bold text-xs sm:text-sm mb-4 border border-rose-300/50 shadow-sm">
          <Sparkles className="w-4 h-4 text-rose-600 animate-sparkle" />
          {countdown.isBeforeStart
            ? 'Đếm ngược ngày anh chính thức lên đường nhập ngũ 2026'
            : countdown.isCompleted
              ? '🎉 ANH ĐÃ XUẤT NGŨ HOÀN THÀNH NGHĨA VỤ QUÂN SỰ! 🎉'
              : 'Đếm ngược ngày xuất ngũ 2028 - Đón anh về bên em 💍'}
        </div>

        {/* Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {/* Days */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-rose-200 shadow-md flex flex-col items-center justify-center transform hover:-translate-y-1 hover:shadow-lg transition duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400" />
            <span key={countdown.daysRemaining} className="animate-pop-in text-3xl sm:text-5xl md:text-6xl font-extrabold text-rose-600 tabular-nums tracking-tight">
              {countdown.daysRemaining}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Ngày Còn Lại
            </span>
            <span className="text-[11px] text-rose-400 mt-0.5">
              (Đã qua {countdown.daysPassed} ngày)
            </span>
          </div>

          {/* Hours */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-pink-200 shadow-md flex flex-col items-center justify-center transform hover:-translate-y-1 hover:shadow-lg transition duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400" />
            <span key={countdown.hours} className="animate-pop-in text-3xl sm:text-5xl md:text-6xl font-extrabold text-pink-600 tabular-nums tracking-tight">
              {countdown.hours.toString().padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Giờ
            </span>
            <span className="text-[11px] text-pink-400 mt-0.5">Thời gian trôi</span>
          </div>

          {/* Minutes */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-rose-200 shadow-md flex flex-col items-center justify-center transform hover:-translate-y-1 hover:shadow-lg transition duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500" />
            <span key={countdown.minutes} className="animate-pop-in text-3xl sm:text-5xl md:text-6xl font-extrabold text-rose-500 tabular-nums tracking-tight">
              {countdown.minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Phút
            </span>
            <span className="text-[11px] text-rose-400 mt-0.5">Từng nhịp thở</span>
          </div>

          {/* Seconds */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-pink-200 shadow-md flex flex-col items-center justify-center transform hover:-translate-y-1 hover:shadow-lg transition duration-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-rose-400" />
            <span key={countdown.seconds} className="animate-pop-in text-3xl sm:text-5xl md:text-6xl font-extrabold text-rose-600 tabular-nums tracking-tight">
              {countdown.seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
              Giây
            </span>
            <span className="text-[11px] text-rose-400 mt-0.5">Trái tim đập</span>
          </div>
        </div>
      </div>

      {/* Military Journey Interactive Progress Track */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-rose-200/80 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎖️</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Tiến độ 24 Tháng Nghĩa Vụ Quân Sự (2026 - 2028)
              </h3>
              <p className="text-xs text-slate-500">
                Chặng đường rèn luyện và chứng minh tình yêu son sắt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCountdown}
              title="Sao chép tình trạng đếm ngược để chia sẻ lên tin nhắn / mạng xã hội"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-full transition shadow-xs"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Sao chép đếm ngược</span>
                </>
              )}
            </button>

            {onTriggerFireworks && (
              <button
                onClick={onTriggerFireworks}
                title="Bắn pháo hoa tình yêu ăn mừng tiến độ"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-full transition shadow-xs"
              >
                <span>🎆</span>
                <span className="hidden sm:inline">Pháo hoa</span>
              </button>
            )}
            <span className="text-xl sm:text-2xl font-black text-rose-600 tabular-nums">
              {countdown.progressPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              {countdown.daysPassed}/{countdown.totalDays} ngày
            </span>
          </div>
        </div>

        {/* Visual Track with soldier walking to girlfriend */}
        <div className="relative pt-6 pb-2">
          {/* Track Bar Background */}
          <div className="h-4 w-full bg-rose-100 rounded-full overflow-hidden p-0.5 border border-rose-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-rose-500 to-pink-500 rounded-full transition-all duration-700 relative"
              style={{ width: `${Math.min(100, Math.max(2, countdown.progressPercent))}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Moving Soldier Marker */}
          <div
            className="absolute top-0 transform -translate-x-1/2 transition-all duration-700 pointer-events-none flex flex-col items-center"
            style={{ left: `${Math.min(95, Math.max(5, countdown.progressPercent))}%` }}
          >
            <span className="text-2xl filter drop-shadow-sm animate-bounce">👨‍✈️</span>
            <span className="text-[10px] font-bold text-white bg-emerald-700 px-1.5 py-0.2 rounded-full shadow-xs whitespace-nowrap">
              Anh đang đi
            </span>
          </div>

          {/* Goal Girlfriend Marker at 100% */}
          <div className="absolute top-0 right-0 transform translate-x-1/2 pointer-events-none flex flex-col items-center">
            <span className="text-2xl filter drop-shadow-sm animate-pulse">👰🌸</span>
            <span className="text-[10px] font-bold text-white bg-rose-600 px-1.5 py-0.2 rounded-full shadow-xs whitespace-nowrap">
              Đón anh
            </span>
          </div>
        </div>

        {/* Start and Finish dates */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-3 border-t border-rose-100 mt-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Nhập ngũ: <strong>{couple.militaryStartDate}</strong>
            </span>
          </div>
          <div className="text-rose-600 font-semibold italic text-center hidden md:block">
            "{couple.sweetQuote}"
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            <span>
              Xuất ngũ: <strong>{couple.militaryEndDate}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Sweet Stats & Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/70 backdrop-blur-xs rounded-xl p-3.5 border border-rose-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
            🍲
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Bữa cơm chờ anh</div>
            <div className="text-lg font-bold text-slate-800 tabular-nums">
              {countdown.mealsWaited.toLocaleString()} bữa
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xs rounded-xl p-3.5 border border-rose-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-lg shrink-0">
            💌
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Cái ôm gửi vào gió</div>
            <div className="text-lg font-bold text-slate-800 tabular-nums">
              {hugCount.toLocaleString()} cái ôm
            </div>
          </div>
        </div>

        {/* Send Hug Button */}
        <button
          onClick={handleSendHug}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm active:scale-98 transition group"
        >
          <Send className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Gửi 1 cái ôm cho anh ngay</span>
        </button>
      </div>
    </div>
  );
};
