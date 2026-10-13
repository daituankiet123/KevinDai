export interface MoodMeta {
  icon: string;
  label: string;
  badgeClass: string;
  cardBorder: string;
}

export const DAILY_NOTE_MOOD_META: Record<string, MoodMeta> = {
  love: {
    icon: '💖',
    label: 'Yêu thương',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    cardBorder: 'border-rose-200',
  },
  miss: {
    icon: '🥺',
    label: 'Nhớ da diết',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    cardBorder: 'border-indigo-200',
  },
  happy: {
    icon: '🌸',
    label: 'Vui vẻ & Bình yên',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    cardBorder: 'border-amber-200',
  },
  proud: {
    icon: '🎖️',
    label: 'Tự hào chàng lính',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cardBorder: 'border-emerald-200',
  },
  special: {
    icon: '📞',
    label: 'Cuộc gọi / Sự kiện',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    cardBorder: 'border-sky-200',
  },
  excited: {
    icon: '🌟',
    label: 'Háo hức & Động lực',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cardBorder: 'border-yellow-200',
  },
  tired: {
    icon: '🔋',
    label: 'Mệt nhưng cố gắng',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    cardBorder: 'border-teal-200',
  },
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Cuộc gọi đơn vị': '📞',
  'Thăm nuôi': '🍱',
  'Thao trường': '🎖️',
  'Gửi thư tay': '💌',
  'Học Y tá Đại đội': '🩺',
  'Kỷ niệm': '🥂',
  'Lên đường nhập ngũ': '⭐',
  'Tâm sự': '🌸',
  'Động viên': '💪',
  'Ngày bình yên': '☕',
};

export const SUGGESTED_NOTE_TAGS = [
  'Cuộc gọi đơn vị',
  'Thăm nuôi',
  'Thao trường',
  'Gửi thư tay',
  'Kỷ niệm',
  'Động viên',
  'Ngày bình yên',
  'Học Y tá Đại đội',
];

export const PHOTO_TAG_OPTIONS = [
  'Tất cả',
  'Yêu thích ❤️',
  'Hẹn hò',
  'Sinh nhật',
  'Quân ngũ',
  'Kỷ niệm',
  'Du lịch',
];
