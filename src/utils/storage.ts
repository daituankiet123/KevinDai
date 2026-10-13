import { CoupleData, Anniversary, LoveLetter, WishItem, CouplePhoto, DailyNote } from '../types';

export const DEFAULT_COUPLE: CoupleData = {
  boyfriendName: 'Đại Tuấn Kiệt',
  girlfriendName: 'Lê Thị Thanh Tuyền',
  boyfriendNickname: 'Ông Chã Húi của Tuyền (Chàng lính)',
  girlfriendNickname: 'Bà Chã Thơm của Kiệt (Hậu phương)',
  boyfriendAvatar: '👨‍✈️',
  girlfriendAvatar: '👧🌸',
  militaryStartDate: '2026-03-04', // Ngày nhập ngũ: 04/03/2026
  militaryEndDate: '2028-01-10', // Ra quân ngày 10/01/2028
  datingStartDate: '2024-08-29', // Quen nhau từ 29/08/2024
  militaryUnit: 'Trường Cao đẳng Hậu cần 2 (Thủ Đức) - Y tá Đại đội',
  sweetQuote: 'Bà Chã Thơm yên tâm đợi nhé, 10/01/2028 Ông Chã Húi ra quân về cưới em!',
  soundEnabled: true,
  rainHeartsEnabled: true,
  bgMusicEnabled: false,
  bgMusicVolume: 0.5,
  notificationsEnabled: false,
};

export const DEFAULT_ANNIVERSARIES: Anniversary[] = [
  {
    id: 'anniv-1',
    title: 'Kỷ niệm ngày quen nhau & yêu nhau (29/08/2024)',
    date: '2024-08-29',
    isAnnual: true,
    category: 'love',
    reminderDaysBefore: 5,
    notes: 'Ngày định mệnh Tuấn Kiệt & Lê Thị Thanh Tuyền chính thức thuộc về nhau 💕',
    icon: '💑',
  },
  {
    id: 'anniv-2',
    title: 'Sinh nhật Em yêu (Lê Thị Thanh Tuyền - 07/04/2004)',
    date: '2004-04-07',
    isAnnual: true,
    category: 'birthday',
    reminderDaysBefore: 5,
    notes: 'Ngày sinh nhật của cô gái ngọt ngào nhất thế giới của anh!',
    icon: '🎀',
  },
  {
    id: 'anniv-3',
    title: 'Sinh nhật Anh Kiệt (06/09/2003)',
    date: '2003-09-06',
    isAnnual: true,
    category: 'birthday',
    reminderDaysBefore: 5,
    notes: 'Sinh nhật chàng lính của Thanh Tuyền, gửi trọn yêu thương vào đơn vị!',
    icon: '🎂',
  },
  {
    id: 'anniv-4',
    title: 'Kỷ niệm 1 năm quen nhau (29/08/2025)',
    date: '2025-08-29',
    isAnnual: false,
    category: 'love',
    reminderDaysBefore: 7,
    notes: 'Tròn 1 năm bên nhau đầy ắp kỷ niệm đẹp trước ngày nhập ngũ.',
    icon: '🥂',
  },
  {
    id: 'anniv-5',
    title: 'Ngày tiễn anh lên đường nhập ngũ (04/03/2026)',
    date: '2026-03-04',
    isAnnual: false,
    category: 'military',
    reminderDaysBefore: 7,
    notes: 'Thanh Tuyền ở nhà là hậu phương vững chắc nhất của anh Kiệt!',
    icon: '🎖️',
  },
  {
    id: 'anniv-6',
    title: 'Kết thúc tân binh & Lễ tuyên thệ chiến sĩ mới (12/06/2026)',
    date: '2026-06-12',
    isAnnual: false,
    category: 'military',
    reminderDaysBefore: 5,
    notes: 'Hoàn thành xuất sắc khóa huấn luyện tân binh, chuẩn bị đi học Y tá Đại đội!',
    icon: '⭐',
  },
  {
    id: 'anniv-6b',
    title: 'Đi học Y tá Đại đội tại Trường Cao đẳng Hậu cần 2 (Thủ Đức)',
    date: '2026-06-15',
    isAnnual: false,
    category: 'military',
    reminderDaysBefore: 3,
    notes:
      'Chiến sĩ Quân y tương lai rèn luyện chuyên môn y khoa tại Thủ Đức để chăm sóc sức khỏe bộ đội!',
    icon: '🩺',
  },
  {
    id: 'anniv-7',
    title: 'Tròn 1 năm quân ngũ (04/03/2027)',
    date: '2027-03-04',
    isAnnual: false,
    category: 'military',
    reminderDaysBefore: 7,
    notes: 'Đã đi được nửa chặng đường rồi Tuyền ơi, sắp được về với em!',
    icon: '⏳',
  },
  {
    id: 'anniv-8',
    title: 'NGÀY RA QUÂN XUẤT NGŨ ĐÓN ANH VỀ (10/01/2028)',
    date: '2028-01-10',
    isAnnual: false,
    category: 'military',
    reminderDaysBefore: 15,
    notes: 'Anh Kiệt hoàn thành xuất sắc nghĩa vụ quân sự, về đón Thanh Tuyền làm vợ!',
    icon: '💍',
  },
];

export const DEFAULT_LETTERS: LoveLetter[] = [];

export const DEFAULT_WISHES: WishItem[] = [
  {
    id: 'w-1',
    title: 'Cái ôm thật chặt và nụ hôn ấm áp ngay cổng doanh trại ngày đón anh Kiệt xuất ngũ',
    completed: false,
    category: 'Đón anh về',
    hearts: 99,
  },
  {
    id: 'w-2',
    title: 'Nấu một bữa cơm toàn những món anh Kiệt mê mẩn nhất sau 2 năm thao trường',
    completed: false,
    category: 'Ăn uống',
    hearts: 78,
  },
  {
    id: 'w-3',
    title: 'Anh Kiệt đưa Thanh Tuyền đi du lịch Đà Lạt ngắm sương mù và nắm tay dạo hồ Xuân Hương',
    completed: false,
    category: 'Du lịch',
    hearts: 85,
  },
  {
    id: 'w-4',
    title: 'Chụp một bộ ảnh đôi kỷ niệm: anh mặc quân phục danh dự, Tuyền mặc áo dài trắng',
    completed: false,
    category: 'Kỷ niệm',
    hearts: 92,
  },
  {
    id: 'w-5',
    title: 'Cùng nhau đi ăn mừng ngày kỷ niệm quen nhau 29/08 thật hoành tráng',
    completed: false,
    category: 'Hẹn hò',
    hearts: 88,
  },
  {
    id: 'w-6',
    title: 'Đi xem bộ phim rạp đầu tiên sau chuỗi ngày dài xa cách',
    completed: false,
    category: 'Hẹn hò',
    hearts: 60,
  },
  {
    id: 'w-7',
    title: 'Được anh đưa đi dạo phố ban đêm và ăn kem ốc quế như những ngày đầu mới quen',
    completed: false,
    category: 'Hẹn hò',
    hearts: 72,
  },
  {
    id: 'w-8',
    title: 'Bàn chuyện tương lai ngôi nhà chung của Tuấn Kiệt & Thanh Tuyền 💕',
    completed: false,
    category: 'Tương lai',
    hearts: 150,
  },
];

const PHOTO_1 =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><defs><linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ffe4e6"/><stop offset="100%" stop-color="%23fed7aa"/></linearGradient></defs><rect width="600" height="450" rx="24" fill="url(%23bg1)"/><circle cx="300" cy="180" r="85" fill="%23ffffff" opacity="0.9"/><text x="300" y="195" font-size="70" text-anchor="middle">💑</text><text x="300" y="300" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23e11d48" text-anchor="middle">29/08/2024</text><text x="300" y="335" font-family="sans-serif" font-size="16" fill="%2364748b" text-anchor="middle">Ngày định mệnh hai đứa mình chính thức quen nhau</text></svg>';

const PHOTO_2 =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><defs><linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fce7f3"/><stop offset="100%" stop-color="%23fda4af"/></linearGradient></defs><rect width="600" height="450" rx="24" fill="url(%23bg2)"/><circle cx="300" cy="180" r="85" fill="%23ffffff" opacity="0.9"/><text x="300" y="195" font-size="70" text-anchor="middle">🎂🌸</text><text x="300" y="300" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23be185d" text-anchor="middle">Sinh Nhật Bà Chã Thơm</text><text x="300" y="335" font-family="sans-serif" font-size="16" fill="%2364748b" text-anchor="middle">Lê Thị Thanh Tuyền - 07/04/2004</text></svg>';

const PHOTO_3 =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><defs><linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23dcfce7"/><stop offset="100%" stop-color="%23fed7aa"/></linearGradient></defs><rect width="600" height="450" rx="24" fill="url(%23bg3)"/><circle cx="300" cy="180" r="85" fill="%23ffffff" opacity="0.9"/><text x="300" y="195" font-size="70" text-anchor="middle">🎖️👨‍✈️</text><text x="300" y="300" font-family="sans-serif" font-weight="bold" font-size="22" fill="%2315803d" text-anchor="middle">Trung đoàn 88 - Sư đoàn 302</text><text x="300" y="335" font-family="sans-serif" font-size="16" fill="%2364748b" text-anchor="middle">Chàng lính Đại Tuấn Kiệt rèn luyện vì Tổ quốc</text></svg>';

export const DEFAULT_PHOTOS: CouplePhoto[] = [
  {
    id: 'photo-1',
    url: PHOTO_1,
    caption: 'Buổi hẹn hò đầu tiên đáng nhớ của Ông Chã Húi và Bà Chã Thơm (29/08/2024)',
    date: '2024-08-29',
    location: 'Quán cafe kỷ niệm',
    tag: 'Hẹn hò',
    hearts: 99,
    isFavorite: true,
  },
  {
    id: 'photo-2',
    url: PHOTO_2,
    caption: 'Bà Chã Thơm rạng ngời ngày sinh nhật tuổi 20 - Em mãi là công chúa của anh Kiệt',
    date: '2024-04-07',
    location: 'Bữa tiệc sinh nhật',
    tag: 'Sinh nhật',
    hearts: 88,
    isFavorite: true,
  },
  {
    id: 'photo-3',
    url: PHOTO_3,
    caption: 'Chiến sĩ Quân y - Y tá Đại đội học tập tại Trường Cao đẳng Hậu cần 2, Thủ Đức',
    date: '2026-06-15',
    location: 'Trường Cao đẳng Hậu cần 2, Thủ Đức',
    tag: 'Quân ngũ',
    hearts: 120,
    isFavorite: false,
  },
];

export const DEFAULT_DAILY_NOTES: DailyNote[] = [
  {
    id: 'note-sample-1',
    date: '2026-03-04',
    content:
      'Ngày tiễn anh lên đường nhập ngũ. Nhìn bóng lưng anh bước qua cổng doanh trại mà rưng rưng, nhưng em tự hào về anh lắm! Hứa ở nhà ngoan đợi anh về.',
    mood: 'proud',
    author: 'girlfriend',
    tag: 'Lên đường nhập ngũ',
    hearts: 99,
    createdAt: '2026-03-04T08:30:00.000Z',
  },
  {
    id: 'note-sample-2',
    date: '2026-03-15',
    content:
      'Cuộc gọi 3 phút đầu tiên từ bưu cục đơn vị tân binh! Nghe giọng anh khỏe re, dặn em ăn uống đầy đủ là an tâm rồi. Yêu anh nhiều lắm!',
    mood: 'special',
    author: 'girlfriend',
    tag: 'Cuộc gọi đơn vị',
    hearts: 88,
    createdAt: '2026-03-15T19:45:00.000Z',
  },
  {
    id: 'note-sample-3',
    date: '2026-04-12',
    content:
      'Chuyến thăm nuôi tân binh đầu tiên! Mang cho anh hộp thịt kho và trái cây em tự tay làm, nhìn anh rắn rỏi và chững chạc hẳn lên, thương ghê gớm.',
    mood: 'love',
    author: 'girlfriend',
    tag: 'Thăm nuôi',
    hearts: 115,
    createdAt: '2026-04-12T10:15:00.000Z',
  },
  {
    id: 'note-sample-4',
    date: '2026-06-15',
    content:
      'Anh chính thức chuyển sang học Y tá Đại đội tại Trường Cao đẳng Hậu cần 2 ở Thủ Đức! Gần em hơn một chút rồi, sắp được gặp nhau thường xuyên hơn!',
    mood: 'excited',
    author: 'both',
    tag: 'Học Y tá Đại đội',
    hearts: 102,
    createdAt: '2026-06-15T14:00:00.000Z',
  },
  {
    id: 'note-sample-5',
    date: '2026-08-29',
    content:
      'Tròn 2 năm ngày hai đứa yêu nhau (29/08/2024 - 29/08/2026). Dù xa cách địa lý nhưng tình cảm chúng mình ngày càng bền chặt.',
    mood: 'love',
    author: 'both',
    tag: 'Kỷ niệm',
    hearts: 130,
    createdAt: '2026-08-29T20:00:00.000Z',
  },
  {
    id: 'note-sample-6',
    date: '2026-09-18',
    content:
      'Hôm nay đơn vị diễn tập đêm và hành quân dã ngoại. Mệt nhoài nhưng nghĩ đến ngày 10/01/2028 ra quân về cưới em là bao mệt mỏi tan biến!',
    mood: 'proud',
    author: 'boyfriend',
    tag: 'Thao trường',
    hearts: 94,
    createdAt: '2026-09-18T22:30:00.000Z',
  },
  {
    id: 'note-sample-7',
    date: '2026-10-04',
    content:
      'Gửi bức thư tay kèm vài tấm ảnh thẻ đôi vào đơn vị cho anh. Hy vọng đầu tuần tới chàng lính của em sẽ nhận được niềm vui bất ngờ này!',
    mood: 'miss',
    author: 'girlfriend',
    tag: 'Gửi thư tay',
    hearts: 89,
    createdAt: '2026-10-04T16:20:00.000Z',
  },
];

const STORAGE_KEYS = {
  COUPLE: 'love_soldier_couple_data_v4',
  ANNIVERSARIES: 'love_soldier_anniversaries_v4',
  LETTERS: 'love_soldier_letters_v4',
  WISHES: 'love_soldier_wishes_v4',
  PHOTOS: 'love_soldier_photos_v4',
  DAILY_NOTES: 'love_soldier_daily_notes_v4',
};

// One-time migration flag: set after the initial "old defaults" correction ran,
// so user edits made later are never overwritten on reload.
const COUPLE_MIGRATION_FLAG = 'love_soldier_couple_migrated_v4';

export function loadCoupleData(): CoupleData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPLE);
    if (!raw) return DEFAULT_COUPLE;

    const parsed = JSON.parse(raw);

    // Run the legacy "old dates" correction only once (for users who still have
    // the outdated 2026-04-04/2028-04-04 defaults from before the fix).
    if (localStorage.getItem(COUPLE_MIGRATION_FLAG) !== '1') {
      localStorage.setItem(COUPLE_MIGRATION_FLAG, '1');
      if (parsed.militaryStartDate === '2026-04-04' || parsed.militaryEndDate === '2028-04-04') {
        const updated = {
          ...parsed,
          militaryStartDate: DEFAULT_COUPLE.militaryStartDate,
          militaryEndDate: DEFAULT_COUPLE.militaryEndDate,
          militaryUnit: DEFAULT_COUPLE.militaryUnit,
        };
        saveCoupleData(updated);
        return updated;
      }
    }

    return { ...DEFAULT_COUPLE, ...parsed };
  } catch {
    return DEFAULT_COUPLE;
  }
}

export function saveCoupleData(data: CoupleData): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.COUPLE, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save couple data error:', e);
    return false;
  }
}

// One-time migration flag for anniversaries (same rationale as couple migration).
const ANNIVERSARIES_MIGRATION_FLAG = 'love_soldier_anniversaries_migrated_v4';

export function loadAnniversaries(): Anniversary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNIVERSARIES);
    if (!raw) {
      saveAnniversaries(DEFAULT_ANNIVERSARIES);
      return DEFAULT_ANNIVERSARIES;
    }
    const parsed: Anniversary[] = JSON.parse(raw);
    // Auto-update if old dates detected (runs once, so later user edits survive).
    if (localStorage.getItem(ANNIVERSARIES_MIGRATION_FLAG) !== '1') {
      localStorage.setItem(ANNIVERSARIES_MIGRATION_FLAG, '1');
      if (
        parsed.some(
          (a) =>
            a.date === '2026-04-04' ||
            a.date === '2028-04-04' ||
            (a.id === 'anniv-5' && a.date !== '2026-03-04')
        )
      ) {
        saveAnniversaries(DEFAULT_ANNIVERSARIES);
        return DEFAULT_ANNIVERSARIES;
      }
    }
    return parsed;
  } catch {
    return DEFAULT_ANNIVERSARIES;
  }
}

export function saveAnniversaries(data: Anniversary[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNIVERSARIES, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save anniversaries error:', e);
    return false;
  }
}

export function loadLetters(): LoveLetter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (!raw) return [];
    const parsed: LoveLetter[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter(
      (l) => l.id !== 'letter-1' && l.id !== 'letter-2' && l.id !== 'letter-3'
    );
    if (cleaned.length !== parsed.length) {
      saveLetters(cleaned);
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveLetters(data: LoveLetter[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save letters error:', e);
    return false;
  }
}

export function loadWishes(): WishItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHES);
    if (!raw) return DEFAULT_WISHES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WISHES;
  }
}

export function saveWishes(data: WishItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save wishes error:', e);
    return false;
  }
}

export function loadDailyNotes(): DailyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES);
    if (!raw) {
      saveDailyNotes(DEFAULT_DAILY_NOTES);
      return DEFAULT_DAILY_NOTES;
    }
    const parsed: DailyNote[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveDailyNotes(DEFAULT_DAILY_NOTES);
      return DEFAULT_DAILY_NOTES;
    }
    return parsed;
  } catch {
    return DEFAULT_DAILY_NOTES;
  }
}

export function saveDailyNotes(data: DailyNote[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save daily notes error:', e);
    return false;
  }
}
