/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Header } from './components/Header';
import { CountdownHero } from './components/CountdownHero';
import { DashboardTeasers } from './components/DashboardTeasers';
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
import { useNow } from './hooks/useNow';
import { useAnniversaryNotifications } from './hooks/useAnniversaryNotifications';
import { isNativeIOSApp } from './utils/device';
import { IosApp } from './components/ios/IosApp';

export default function App() {
  if (isNativeIOSApp()) {
    return <IosApp />;
  }
  return <DesktopApp />;
}

function DesktopApp() {
  const { couple, anniversaries, letters, wishes, photos, dailyNotes, storageError, lastDeleted } =
    useAppStore(
      useShallow((s) => ({
        couple: s.couple,
        anniversaries: s.anniversaries,
        letters: s.letters,
        wishes: s.wishes,
        photos: s.photos,
        dailyNotes: s.dailyNotes,
        storageError: s.storageError,
        lastDeleted: s.lastDeleted,
      }))
    );
  const {
    updateCouple,
    importData,
    addAnniversary,
    deleteAnniversary,
    addLetter,
    deleteLetter,
    toggleFavoriteLetter,
    addWish,
    toggleWish,
    heartWish,
    deleteWish,
    addPhoto,
    deletePhoto,
    toggleFavoritePhoto,
    heartPhoto,
    editPhotoCaption,
    addOrUpdateNote,
    deleteNote,
    heartNote,
    hydratePhotos,
    clearStorageError,
    undoDelete,
    clearLastDeleted,
  } = useAppStore(
    useShallow((s) => ({
      updateCouple: s.updateCouple,
      importData: s.importData,
      addAnniversary: s.addAnniversary,
      deleteAnniversary: s.deleteAnniversary,
      addLetter: s.addLetter,
      deleteLetter: s.deleteLetter,
      toggleFavoriteLetter: s.toggleFavoriteLetter,
      addWish: s.addWish,
      toggleWish: s.toggleWish,
      heartWish: s.heartWish,
      deleteWish: s.deleteWish,
      addPhoto: s.addPhoto,
      deletePhoto: s.deletePhoto,
      toggleFavoritePhoto: s.toggleFavoritePhoto,
      heartPhoto: s.heartPhoto,
      editPhotoCaption: s.editPhotoCaption,
      addOrUpdateNote: s.addOrUpdateNote,
      deleteNote: s.deleteNote,
      heartNote: s.heartNote,
      hydratePhotos: s.hydratePhotos,
      clearStorageError: s.clearStorageError,
      undoDelete: s.undoDelete,
      clearLastDeleted: s.clearLastDeleted,
    }))
  );

  const [activeTab, setActiveTab] = useState('countdown');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [targetNoteDate, setTargetNoteDate] = useState<string | undefined>(undefined);
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const currentTime = useNow();
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

  // Send browser notifications for upcoming/today anniversaries
  useAnniversaryNotifications(anniversaries, couple.notificationsEnabled ?? false);

  // Auto-dismiss the undo snackbar after a few seconds
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => clearLastDeleted(), 6000);
    return () => clearTimeout(timer);
  }, [lastDeleted, clearLastDeleted]);

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
          const ok = importData(parsed);
          setBackupToast(
            ok ? 'Khôi phục dữ liệu sao lưu thành công! 💕' : 'Tập tin sao lưu không hợp lệ.'
          );
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
    <div className="min-h-screen flex flex-col animated-bg selection:bg-rose-200">
      {/* Decorative floating gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-300/30 blur-3xl" style={{ animation: 'blobFloat 12s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-amber-200/30 blur-3xl" style={{ animation: 'blobFloat 16s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-rose-300/25 blur-3xl" style={{ animation: 'blobFloat 14s ease-in-out infinite' }} />
      </div>

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
            <DashboardTeasers
              anniversaries={anniversaries}
              wishes={wishes}
              photos={photos}
              now={currentTime}
              onNavigate={setActiveTab}
            />
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
        photos={photos}
      />

      <LoveFireworksModal
        isOpen={isFireworksOpen}
        onClose={() => setIsFireworksOpen(false)}
        milestone={celebratingMilestone}
        boyfriendName={couple.boyfriendNickname || couple.boyfriendName}
        girlfriendName={couple.girlfriendNickname || couple.girlfriendName}
        soundEnabled={couple.soundEnabled}
      />

      {/* Storage Error Toast */}
      {storageError && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-rose-600 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-rose-500 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>⚠️</span>
          <span>{storageError}</span>
          <button
            onClick={clearStorageError}
            aria-label="Đóng thông báo lỗi"
            className="ml-1 hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Undo Delete Snackbar */}
      {lastDeleted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>Đã xóa.</span>
          <button
            onClick={undoDelete}
            className="text-rose-300 hover:text-rose-200 underline font-extrabold"
          >
            Hoàn tác
          </button>
          <button
            onClick={clearLastDeleted}
            aria-label="Đóng thông báo hoàn tác"
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
