import React from 'react';
import { Volume2, VolumeX, Sparkles, Download, Settings, Music, Pin } from 'lucide-react';
import { playHeartPop } from '../utils/audio';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  rainHeartsEnabled: boolean;
  setRainHeartsEnabled: (val: boolean) => void;
  onOpenSettings: () => void;
  onOpenExeModal: () => void;
  urgentAnniversariesCount: number;
  totalNotesCount?: number;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  isCornerWidgetVisible: boolean;
  onToggleCornerWidget: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  rainHeartsEnabled,
  setRainHeartsEnabled,
  onOpenSettings,
  onOpenExeModal,
  urgentAnniversariesCount,
  totalNotesCount = 0,
  isMusicPlaying,
  onToggleMusic,
  isCornerWidgetVisible,
  onToggleCornerWidget,
}) => {
  const navItems = [
    { id: 'countdown', label: 'Đếm ngược' },
    {
      id: 'notes',
      label: 'Ghi chú ngày',
      badge: totalNotesCount > 0 ? totalNotesCount : undefined,
    },
    {
      id: 'anniversaries',
      label: 'Kỷ niệm',
      badge: urgentAnniversariesCount > 0 ? urgentAnniversariesCount : undefined,
    },
    { id: 'album', label: 'Album ảnh' },
    { id: 'milestones', label: 'Chặng đường' },
    { id: 'letters', label: 'Hộp thư' },
    { id: 'wishes', label: 'Ước nguyện' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-rose-100 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#countdown"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('countdown');
              playHeartPop(soundEnabled);
            }}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 transition font-cute text-xl sm:text-2xl tracking-tight select-none"
          >
            <span className="inline-block animate-pulse-slow">💖</span>
            <span>Chờ Anh Về</span>
            <span className="text-xs font-sans font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full ml-1 hidden sm:inline-block">
              2026-2028
            </span>
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  playHeartPop(soundEnabled);
                }}
                className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-400 text-slate-900 rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action & Modal buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Romantic Background Music Button */}
          <button
            onClick={() => {
              onToggleMusic();
              playHeartPop(soundEnabled);
            }}
            title={isMusicPlaying ? 'Tắt nhạc nền lãng mạn' : 'Bật nhạc nền lãng mạn (Lofi Piano)'}
            className={`p-2 rounded-full transition relative flex items-center justify-center ${
              isMusicPlaying
                ? 'text-pink-600 bg-pink-100 hover:bg-pink-200 ring-2 ring-pink-300'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
            {isMusicPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Heart rain toggle */}
          <button
            onClick={() => {
              setRainHeartsEnabled(!rainHeartsEnabled);
              playHeartPop(soundEnabled);
            }}
            title={rainHeartsEnabled ? 'Tắt mưa trái tim' : 'Bật mưa trái tim'}
            className={`p-2 rounded-full transition ${
              rainHeartsEnabled
                ? 'text-rose-600 bg-rose-100 hover:bg-rose-200'
                : 'text-slate-400 hover:bg-rose-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playHeartPop(true);
            }}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            className={`p-2 rounded-full transition ${
              soundEnabled
                ? 'text-rose-600 bg-rose-100 hover:bg-rose-200'
                : 'text-slate-400 hover:bg-rose-50'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Corner widget pin toggle */}
          <button
            onClick={() => {
              onToggleCornerWidget();
              playHeartPop(soundEnabled);
            }}
            title={
              isCornerWidgetVisible
                ? 'Đang ghim widget góc màn hình (Nhấn để ẩn)'
                : 'Ghim widget góc màn hình nhỏ gọn'
            }
            className={`p-2 rounded-full transition ${
              isCornerWidgetVisible
                ? 'text-rose-600 bg-rose-100 hover:bg-rose-200 ring-1 ring-rose-300'
                : 'text-slate-400 hover:bg-rose-50'
            }`}
          >
            <Pin className={`w-4 h-4 ${isCornerWidgetVisible ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              onOpenSettings();
              playHeartPop(soundEnabled);
            }}
            title="Cài đặt đôi lứa & ngày nghĩa vụ"
            className="p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Download packaged app button */}
          <button
            onClick={() => {
              onOpenExeModal();
              playHeartPop(soundEnabled);
            }}
            title="Tải bản đóng gói ứng dụng về máy tính (File .ZIP Portable & File .HTML)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-xs transition transform active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải về máy</span>
            <span className="sm:hidden">Tải về</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-rose-100 py-1.5 px-2 bg-rose-50/70 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              playHeartPop(soundEnabled);
            }}
            className={`px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-1 text-[9px] bg-amber-400 text-slate-900 rounded-full px-1">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </header>
  );
};
