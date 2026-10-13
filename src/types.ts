export interface CoupleData {
  boyfriendName: string;
  girlfriendName: string;
  boyfriendNickname: string;
  girlfriendNickname: string;
  boyfriendAvatar: string;
  girlfriendAvatar: string;
  militaryStartDate: string; // YYYY-MM-DD (e.g. 2026-04-04)
  militaryEndDate: string; // YYYY-MM-DD (e.g. 2028-04-04)
  datingStartDate: string; // YYYY-MM-DD (e.g. 2024-08-29)
  militaryUnit: string; // e.g. "Trường Cao đẳng Hậu cần 2 (Thủ Đức) - Y tá Đại đội"
  sweetQuote: string;
  soundEnabled: boolean;
  rainHeartsEnabled: boolean;
  bgMusicEnabled?: boolean;
  bgMusicVolume?: number; // 0 to 1
  notificationsEnabled?: boolean;
}

export interface CouplePhoto {
  id: string;
  url: string; // base64 or image url
  caption: string;
  date: string; // YYYY-MM-DD
  location?: string;
  tag: string;
  hearts: number;
  isFavorite: boolean;
}

export type AnniversaryCategory = 'love' | 'military' | 'birthday' | 'visit' | 'custom';

export interface Anniversary {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or MM-DD for annual
  isAnnual: boolean;
  category: AnniversaryCategory;
  reminderDaysBefore: number;
  notes?: string;
  icon?: string;
}

export type MoodType = 'miss' | 'love' | 'proud' | 'sweet' | 'waiting' | 'hug';

export interface LoveLetter {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  mood: MoodType;
  photoUrl?: string;
  isFavorite: boolean;
}

export interface WishItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  hearts: number;
}

export interface MilitaryMilestone {
  id: string;
  monthMark: number; // in months
  title: string;
  description: string;
  badgeTitle: string;
  icon: string;
}

export type DailyNoteMood = 'love' | 'miss' | 'happy' | 'proud' | 'special' | 'excited' | 'tired';
export type DailyNoteAuthor = 'girlfriend' | 'boyfriend' | 'both';

export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: DailyNoteMood;
  author: DailyNoteAuthor;
  tag?: string;
  hearts: number;
  createdAt: string;
  updatedAt?: string;
}
