/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CountdownHero } from './components/CountdownHero';
import { AnniversariesSection } from './components/AnniversariesSection';
import { MilestonesSection } from './components/MilestonesSection';
import { LoveLettersSection } from './components/LoveLettersSection';
import { WishListSection } from './components/WishListSection';
import { PhotoAlbumSection } from './components/PhotoAlbumSection';
import { DailyLoveNote } from './components/DailyLoveNote';
import { DailyNotesSection } from './components/DailyNotesSection';
import { TodayDailyNoteCard } from './components/TodayDailyNoteCard';
import { DailyNoteModal } from './components/DailyNoteModal';
import { HeartParticles } from './components/HeartParticles';
import { DesktopExeModal } from './components/DesktopExeModal';
import { CoupleSettingsModal } from './components/CoupleSettingsModal';
import { LoveFireworksModal, MilestoneCelebrationData } from './components/LoveFireworksModal';
import { DesktopCornerWidget } from './components/DesktopCornerWidget';

import { useAppStore } from './store';
import { calculateMilitaryCountdown, getAnniversaryStatus } from './utils/dateCalculations';
import { CoupleData, DailyNote } from './types';
import { startRomanticMusic, stopRomanticMusic, setRomanticMusicVolume } from './utils/audio';
import { todayStr } from './utils/dateUtils';

export default function App() {
  const couple = useAppStore((s) => s.couple);
  const anniversaries = useAppStore((s) => s.anniversaries);
  const letters = useAppStore((s) => s.letters);
  const wishes = useAppStore((s) => s.wishes);
  const photos = useAppStore((s) => s.photos);
  const dailyNotes = useAppStore((s) => s.dailyNotes);
  const updateCouple = useAppStore((s) => s.updateCouple);
  const importData = useAppStore((s) => s.importData);
  const addAnniversary = useAppStore((s) => s.addAnniversary);
  const deleteAnniversary = useAppStore((s) => s.deleteAnniversary);
  const addLetter = useAppStore((s) => s.addLetter);
  const deleteLetter = useAppStore((s) => s.deleteLetter);
  const toggleFavoriteLetter = useAppStore((s) => s.toggleFavoriteLetter);
  const addWish = useAppStore((s) => s.addWish);
  const toggleWish = useAppStore((s) => s.toggleWish);
  const heartWish = useAppStore((s) => s.heartWish);
  const deleteWish = useAppStore((s) => s.deleteWish);
  const addPhoto = useAppStore((s) => s.addPhoto);
  const deletePhoto = useAppStore((s) => s.deletePhoto);
  const toggleFavoritePhoto = useAppStore((s) => s.toggleFavoritePhoto);
  const heartPhoto = useAppStore((s) => s.heartPhoto);
  const editPhotoCaption = useAppStore((s) => s.editPhotoCaption);
  const addOrUpdateNote = useAppStore((s) => s.addOrUpdateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const heartNote = useAppStore((s) => s.heartNote);
  const hydratePhotos = useAppStore((s) => s.hydratePhotos);

  const [activeTab, setActiveTab] = useState('countdown');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [targetNoteDate, setTargetNoteDate] = useState<string | undefined>(undefined);
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<MilestoneCelebrationData | null>(
    null
  );
  const [isFireworksOpen, setIsFireworksOpen] = useState(false);

  const [isCornerWidgetVisible, setIsCornerWidgetVisible] = useState<boolean>(() => {
    return localStorage.getItem('corner_widget_visible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('corner_widget_visible', String(isCornerWidgetVisible));
  }, [isCornerWidgetVisible]);

  // Hydrate photos from IndexedDB on mount
  useEffect(() => {
    hydratePhotos();
  }, [hydratePhotos]);

  // Live timer interval (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update music volume when changed in settings
  useEffect(() => {
    if (couple.bgMusicVolume !== undefined) {
      setRomanticMusicVolume(couple.bgMusicVolume);
    }
  }, [couple.bgMusicVolume]);

  const handleToggleMusic = () => {
    if (isMusicPlaying) {
      stopRomanticMusic();
      setIsMusicPlaying(false);
      updateCouple({ ...couple, bgMusicEnabled: false });
    } else {
      startRomanticMusic(couple.bgMusicVolume ?? 0.5);
      setIsMusicPlaying(true);
      updateCouple({ ...couple, bgMusicEnabled: true });
    }
  };

  // Calculate live countdown metrics
  const countdown = calculateMilitaryCountdown(
    couple.militaryStartDate,
    couple.militaryEndDate,
    couple.datingStartDate,
    currentTime
  );

  const handleTriggerFireworks = (milestoneData?: MilestoneCelebrationData) => {
    const data: MilestoneCelebrationData = milestoneData || {
      title: `Tiến Độ Quân Ngũ Đạt ${countdown.progressPercent.toFixed(1)}%`,
      timeframe: `${countdown.daysPassed}/${countdown.totalDays} ngày`,
      rank: 'Chiến sĩ kiên định ⭐',
      icon: '🎖️',
      description: `Đã cùng nhau vượt qua ${countdown.daysPassed} ngày trên chặng đường 24 tháng rèn luyện tại ${couple.militaryUnit || 'Trường Cao đẳng Hậu cần 2, Thủ Đức'}.`,
      girlfriendMessage:
        'Bà Chã Thơm luôn là hậu phương ấm áp nhất, cùng Ông Chã Húi đếm từng ngày đón anh về 10/01/2028!',
    };
    setCelebratingMilestone(data);
    setIsFireworksOpen(true);
  };

  const handleUpdateAvatar = (target: 'boyfriend' | 'girlfriend', newAvatar: string) => {
    if (target === 'boyfriend') {
      updateCouple({ ...couple, boyfriendAvatar: newAvatar });
    } else {
      updateCouple({ ...couple, girlfriendAvatar: newAvatar });
    }
  };

  // Sync state to local storage + manage music on couple update
  const handleUpdateCouple = (newCouple: CoupleData) => {
    updateCouple(newCouple);
    if (newCouple.bgMusicEnabled && !isMusicPlaying) {
      startRomanticMusic(newCouple.bgMusicVolume ?? 0.5);
      setIsMusicPlaying(true);
    } else if (!newCouple.bgMusicEnabled && isMusicPlaying) {
      stopRomanticMusic();
      setIsMusicPlaying(false);
    }
  };

  const handleOpenNoteModal = (note?: DailyNote | null, date?: string) => {
    setEditingNote(note || null);
    setTargetNoteDate(date);
    setIsNoteModalOpen(true);
  };

  // Export full backup
  const handleExportData = () => {
    const fullBackup = {
      couple,
      anniversaries,
      letters,
      wishes,
      photos,
      dailyNotes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_DemNgayChoAnh_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          importData(parsed);
          setBackupToast('Khôi phục dữ liệu sao lưu thành công! 💕');
          setTimeout(() => setBackupToast(null), 3500);
        } catch {
          setBackupToast('Tập tin sao lưu không hợp lệ.');
          setTimeout(() => setBackupToast(null), 3500);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate urgent anniversaries count for top badge
  const urgentAnniversariesCount = anniversaries.filter(
    (a) => getAnniversaryStatus(a, currentTime).isUrgent
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-rose-100/30 selection:bg-rose-200">
      {/* Background Floating Hearts */}
      <HeartParticles enabled={couple.rainHeartsEnabled} />

      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={couple.soundEnabled}
        setSoundEnabled={(val) => handleUpdateCouple({ ...couple, soundEnabled: val })}
        rainHeartsEnabled={couple.rainHeartsEnabled}
        setRainHeartsEnabled={(val) => handleUpdateCouple({ ...couple, rainHeartsEnabled: val })}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
        urgentAnniversariesCount={urgentAnniversariesCount}
        totalNotesCount={dailyNotes.length}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        isCornerWidgetVisible={isCornerWidgetVisible}
        onToggleCornerWidget={() => setIsCornerWidgetVisible((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Daily Love Note Affirmation banner */}
        <DailyLoveNote soundEnabled={couple.soundEnabled} />

        {/* Tab Content Display */}
        {activeTab === 'countdown' && (
          <div className="space-y-6 sm:space-y-8">
            <CountdownHero
              couple={couple}
              countdown={countdown}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onTriggerFireworks={() => handleTriggerFireworks()}
              onUpdateAvatar={handleUpdateAvatar}
            />

            {/* Today's Daily Note Card */}
            <TodayDailyNoteCard
              notes={dailyNotes}
              couple={couple}
              onDeleteNote={deleteNote}
              onHeartNote={heartNote}
              onOpenModal={handleOpenNoteModal}
              onViewAllNotes={() => setActiveTab('notes')}
              soundEnabled={couple.soundEnabled}
            />

            {/* Quick Teaser of Milestones & Anniversaries in main view */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 border border-rose-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔔</span>
                      <h3 className="font-bold text-slate-800 text-base">Sự Kiện &amp; Kỷ Niệm</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('anniversaries')}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Xem tất cả →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {anniversaries.slice(0, 3).map((a) => {
                      const status = getAnniversaryStatus(a, currentTime);
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{a.icon || '💖'}</span>
                            <div className="truncate max-w-[130px]">
                              <div className="font-bold text-slate-800 truncate">{a.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {status.formattedDate}
                              </div>
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
                    onClick={() => setActiveTab('anniversaries')}
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
                      onClick={() => setActiveTab('album')}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Mở album ({photos.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setActiveTab('album')}
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
                    onClick={() => setActiveTab('album')}
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
                      onClick={() => setActiveTab('wishes')}
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
                    onClick={() => setActiveTab('wishes')}
                    className="font-bold text-rose-600 hover:text-rose-700"
                  >
                    + Thêm điều ước
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anniversaries' && (
          <AnniversariesSection
            anniversaries={anniversaries}
            onAddAnniversary={addAnniversary}
            onDeleteAnniversary={deleteAnniversary}
            soundEnabled={couple.soundEnabled}
          />
        )}

        {activeTab === 'album' && (
          <PhotoAlbumSection
            photos={photos}
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
            onToggleFavorite={toggleFavoritePhoto}
            onHeartPhoto={heartPhoto}
            onEditCaption={editPhotoCaption}
            soundEnabled={couple.soundEnabled}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestonesSection
            countdown={countdown}
            couple={couple}
            onTriggerFireworks={handleTriggerFireworks}
          />
        )}

        {activeTab === 'letters' && (
          <LoveLettersSection
            letters={letters}
            onAddLetter={addLetter}
            onDeleteLetter={deleteLetter}
            onToggleFavorite={toggleFavoriteLetter}
            soundEnabled={couple.soundEnabled}
          />
        )}

        {activeTab === 'notes' && (
          <DailyNotesSection
            notes={dailyNotes}
            couple={couple}
            onAddOrUpdateNote={addOrUpdateNote}
            onDeleteNote={deleteNote}
            onHeartNote={heartNote}
            onOpenModal={handleOpenNoteModal}
            soundEnabled={couple.soundEnabled}
          />
        )}

        {activeTab === 'wishes' && (
          <WishListSection
            wishes={wishes}
            onAddWish={addWish}
            onToggleWish={toggleWish}
            onHeartWish={heartWish}
            onDeleteWish={deleteWish}
            soundEnabled={couple.soundEnabled}
          />
        )}
      </main>

      {/* Sweet Footer */}
      <footer className="mt-12 py-8 border-t border-rose-200/60 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-rose-600 font-cute text-base">
          <span>💖</span>
          <span>Hậu phương vững chắc - Tiền tuyến vững vàng</span>
          <span>💖</span>
        </div>
        <p className="text-slate-400">
          Ứng dụng đếm lịch nghĩa vụ quân sự 2026 - 2028 · Lưu giữ tình yêu và chờ ngày anh về vinh
          quang.
        </p>
        <div className="flex items-center justify-center gap-4 pt-1 text-slate-400">
          <button
            onClick={() => setIsExeModalOpen(true)}
            className="hover:text-rose-600 transition underline cursor-pointer"
          >
            Đóng gói .EXE &amp; Cài Desktop
          </button>
          <span>·</span>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-rose-600 transition underline cursor-pointer"
          >
            Tùy chỉnh thông tin đôi lứa
          </button>
          <span>·</span>
          <button
            onClick={handleExportData}
            className="hover:text-rose-600 transition underline cursor-pointer"
          >
            Sao lưu dữ liệu
          </button>
        </div>
      </footer>

      {/* Modals */}
      <DailyNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
          setTargetNoteDate(undefined);
        }}
        onSave={addOrUpdateNote}
        initialNote={editingNote}
        targetDate={targetNoteDate}
        soundEnabled={couple.soundEnabled}
        boyfriendName={couple.boyfriendNickname || couple.boyfriendName}
        girlfriendName={couple.girlfriendNickname || couple.girlfriendName}
      />

      <DesktopExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        soundEnabled={couple.soundEnabled}
      />

      <CoupleSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        couple={couple}
        onSave={handleUpdateCouple}
        soundEnabled={couple.soundEnabled}
      />

      <LoveFireworksModal
        isOpen={isFireworksOpen}
        onClose={() => setIsFireworksOpen(false)}
        milestone={celebratingMilestone}
        boyfriendName={couple.boyfriendNickname || couple.boyfriendName}
        girlfriendName={couple.girlfriendNickname || couple.girlfriendName}
        soundEnabled={couple.soundEnabled}
      />

      {/* Backup Notification Toast */}
      {backupToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>✨</span>
          <span>{backupToast}</span>
        </div>
      )}

      {/* Desktop Corner Widget Overlay (Pin to Screen & Desktop PiP) */}
      <DesktopCornerWidget
        couple={couple}
        countdown={countdown}
        isVisible={isCornerWidgetVisible}
        onToggleVisible={() => setIsCornerWidgetVisible(false)}
        soundEnabled={couple.soundEnabled}
      />
    </div>
  );
}
