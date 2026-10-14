import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { IosShell, type TabId } from './IosShell';
import { MoreTab } from './MoreTab';
import { IosCountdownHero } from './IosCountdownHero';
import { IosDashboardTeasers } from './IosDashboardTeasers';
import { IosDailyLoveNote } from './IosDailyLoveNote';
import { IosTodayDailyNoteCard } from './IosTodayDailyNoteCard';
import { IosLoveStats } from './IosLoveStats';
import { IosAnniversariesSection } from './IosAnniversariesSection';
import { IosPhotoAlbumSection } from './IosPhotoAlbumSection';
import { IosDailyNotesSection } from './IosDailyNotesSection';
import { IosMilestonesSection } from './IosMilestonesSection';
import { IosLoveLettersSection } from './IosLoveLettersSection';
import { IosWishListSection } from './IosWishListSection';
import { IosDailyNoteModal } from './IosDailyNoteModal';
import { IosCoupleSettingsModal } from './IosCoupleSettingsModal';
import { LoveFireworksModal, type MilestoneCelebrationData } from '../LoveFireworksModal';
import { useAppStore } from '../../store';
import { startRomanticMusic, stopRomanticMusic } from '../../utils/audio';
import { useNow } from '../../hooks/useNow';
import { useAnniversaryNotifications } from '../../hooks/useAnniversaryNotifications';
import { calculateMilitaryCountdown } from '../../utils/dateCalculations';
import { setCountdownBadge } from '../../utils/notifications';
import type { CoupleData, DailyNote } from '../../types';

export type Section = 'notes' | 'anniversaries' | 'album' | 'milestones' | 'letters' | 'wishes';

export function IosApp() {
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
    editAnniversary,
    deleteAnniversary,
    addLetter,
    editLetter,
    deleteLetter,
    toggleFavoriteLetter,
    addWish,
    editWish,
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
    undoDelete,
    clearLastDeleted,
  } = useAppStore(
    useShallow((s) => ({
      updateCouple: s.updateCouple,
      importData: s.importData,
      addAnniversary: s.addAnniversary,
      editAnniversary: s.editAnniversary,
      deleteAnniversary: s.deleteAnniversary,
      addLetter: s.addLetter,
      editLetter: s.editLetter,
      deleteLetter: s.deleteLetter,
      toggleFavoriteLetter: s.toggleFavoriteLetter,
      addWish: s.addWish,
      editWish: s.editWish,
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
      undoDelete: s.undoDelete,
      clearLastDeleted: s.clearLastDeleted,
    }))
  );

  const [tab, setTab] = useState<TabId>('countdown');
  const [section, setSection] = useState<Section | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [targetNoteDate, setTargetNoteDate] = useState<string | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<MilestoneCelebrationData | null>(null);
  const [isFireworksOpen, setIsFireworksOpen] = useState(false);
  const currentTime = useNow();

  useEffect(() => {
    hydratePhotos();
  }, [hydratePhotos]);

  useAnniversaryNotifications(anniversaries, couple.notificationsEnabled ?? false);

  // Cập nhật badge icon app = số ngày đếm ngược còn lại (mỗi ngày / khi giờ thay đổi)
  useEffect(() => {
    const days = calculateMilitaryCountdown(
      couple.militaryStartDate,
      couple.militaryEndDate,
      couple.datingStartDate,
      currentTime
    ).daysRemaining;
    void setCountdownBadge(days);
  }, [couple.militaryStartDate, couple.militaryEndDate, couple.datingStartDate, currentTime]);

  // Áp dụng chủ đề màu nhấn (cá nhân hóa)
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', couple.accentTheme ?? 'rose');
  }, [couple.accentTheme]);

  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => clearLastDeleted(), 6000);
    return () => clearTimeout(timer);
  }, [lastDeleted, clearLastDeleted]);

  const handleToggleMusic = () => {
    if (couple.bgMusicEnabled) {
      stopRomanticMusic();
      updateCouple({ ...couple, bgMusicEnabled: false });
    } else {
      startRomanticMusic(couple.bgMusicVolume ?? 0.5);
      updateCouple({ ...couple, bgMusicEnabled: true });
    }
  };

  const handleUpdateCouple = (newCouple: CoupleData) => {
    updateCouple(newCouple);
    if (newCouple.bgMusicEnabled && !couple.bgMusicEnabled) {
      startRomanticMusic(newCouple.bgMusicVolume ?? 0.5);
    } else if (!newCouple.bgMusicEnabled && couple.bgMusicEnabled) {
      stopRomanticMusic();
    }
  };

  const handleOpenNoteModal = (note?: DailyNote | null, date?: string) => {
    setEditingNote(note || null);
    setTargetNoteDate(date);
    setIsNoteModalOpen(true);
  };

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
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_DemNgayChoAnh_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importData(parsed);
      } catch {
        /* ignore */
      }
    };
    reader.readAsText(file);
  };

  const openSection = (s: Section) => setSection(s);
  const goBack = () => setSection(null);

  const handleTriggerFireworks = (data: MilestoneCelebrationData) => {
    setCelebratingMilestone(data);
    setIsFireworksOpen(true);
  };

  const renderContent = () => {
    if (section) {
      switch (section) {
        case 'notes':
          return (
            <div className="space-y-4">
              <SectionHeader title="Nhật ký" subtitle="Ghi lại từng ngày chờ anh" onBack={goBack} />
              <IosDailyNotesSection
                onAddOrUpdateNote={addOrUpdateNote}
                onDeleteNote={deleteNote}
                onHeartNote={heartNote}
                onOpenModal={handleOpenNoteModal}
                soundEnabled={couple.soundEnabled}
              />
            </div>
          );
        case 'anniversaries':
          return (
            <div className="space-y-4">
              <SectionHeader title="Kỷ niệm" subtitle="Những ngày đáng nhớ" onBack={goBack} />
              <IosAnniversariesSection
                onAddAnniversary={addAnniversary}
                onEditAnniversary={editAnniversary}
                onDeleteAnniversary={deleteAnniversary}
                soundEnabled={couple.soundEnabled}
              />
            </div>
          );
        case 'album':
          return (
            <div className="space-y-4">
              <SectionHeader title="Album ảnh" subtitle="Khoảnh khắc yêu thương" onBack={goBack} />
              <IosPhotoAlbumSection
                onAddPhoto={addPhoto}
                onDeletePhoto={deletePhoto}
                onToggleFavorite={toggleFavoritePhoto}
                onHeartPhoto={heartPhoto}
                onEditCaption={editPhotoCaption}
                soundEnabled={couple.soundEnabled}
              />
            </div>
          );
        case 'milestones':
          return (
            <div className="space-y-4">
              <SectionHeader title="Chặng đường" subtitle="Mốc quân ngũ và ăn mừng" onBack={goBack} />
              <IosMilestonesSection onTriggerFireworks={handleTriggerFireworks} />
            </div>
          );
        case 'letters':
          return (
            <div className="space-y-4">
              <SectionHeader title="Hộp thư" subtitle="Thư tình cho nhau" onBack={goBack} />
              <IosLoveLettersSection
                onAddLetter={addLetter}
                onEditLetter={editLetter}
                onDeleteLetter={deleteLetter}
                onToggleFavorite={toggleFavoriteLetter}
                soundEnabled={couple.soundEnabled}
              />
            </div>
          );
        case 'wishes':
          return (
            <div className="space-y-4">
              <SectionHeader title="Ước nguyện" subtitle="Việc muốn làm khi anh về" onBack={goBack} />
              <IosWishListSection
                onAddWish={addWish}
                onEditWish={editWish}
                onToggleWish={toggleWish}
                onHeartWish={heartWish}
                onDeleteWish={deleteWish}
                soundEnabled={couple.soundEnabled}
              />
            </div>
          );
      }
    }

    switch (tab) {
      case 'countdown':
        return (
          <div className="space-y-4">
            <IosCountdownHero />
            <IosTodayDailyNoteCard onOpenModal={handleOpenNoteModal} soundEnabled={couple.soundEnabled} />
            <IosLoveStats />
            <IosDashboardTeasers onNavigate={openSection} />
            <IosDailyLoveNote soundEnabled={couple.soundEnabled} />
          </div>
        );
      case 'notes':
        return (
          <IosDailyNotesSection
            onAddOrUpdateNote={addOrUpdateNote}
            onDeleteNote={deleteNote}
            onHeartNote={heartNote}
            onOpenModal={handleOpenNoteModal}
            soundEnabled={couple.soundEnabled}
          />
        );
      case 'anniversaries':
        return (
          <IosAnniversariesSection
            onAddAnniversary={addAnniversary}
            onEditAnniversary={editAnniversary}
            onDeleteAnniversary={deleteAnniversary}
            soundEnabled={couple.soundEnabled}
          />
        );
      case 'album':
        return (
          <IosPhotoAlbumSection
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
            onToggleFavorite={toggleFavoritePhoto}
            onHeartPhoto={heartPhoto}
            onEditCaption={editPhotoCaption}
            soundEnabled={couple.soundEnabled}
          />
        );
      case 'more':
        return (
          <MoreTab
            music={couple.bgMusicEnabled ?? false}
            onMusicChange={() => handleToggleMusic()}
            sfx={couple.soundEnabled}
            onSfxChange={(on) => handleUpdateCouple({ ...couple, soundEnabled: on })}
            hearts={couple.rainHeartsEnabled}
            onHeartsChange={(on) => handleUpdateCouple({ ...couple, rainHeartsEnabled: on })}
            onBackup={handleExportData}
            onCoupleSettings={() => setIsSettingsModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <IosShell active={tab} onChange={(id) => { setTab(id); setSection(null); }}>
        {renderContent()}
      </IosShell>

      <IosDailyNoteModal
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

      <IosCoupleSettingsModal
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

      {storageError && (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-[520px] rounded-2xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-xl">
          {storageError}
        </div>
      )}

      {lastDeleted && (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-[520px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-xs font-bold text-night shadow-xl">
          <span>Đã xóa.</span>
          <button onClick={undoDelete} className="font-extrabold text-rose underline">
            Hoàn tác
          </button>
          <button onClick={clearLastDeleted} aria-label="Đóng" className="ml-auto text-mute">
            ✕
          </button>
        </div>
      )}

      <input type="file" accept="application/json" className="hidden" id="ios-import-backup" onChange={handleImportData} />
    </>
  );
}

function SectionHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="flex size-9 items-center justify-center rounded-full bg-card text-ink active:bg-line"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-mute">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
