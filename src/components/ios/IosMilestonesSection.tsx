import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store';
import { calculateMilitaryCountdown } from '../../utils/dateCalculations';
import { useNow } from '../../hooks/useNow';
import type { MilestoneCelebrationData } from '../LoveFireworksModal';

type Props = {
  onTriggerFireworks: (milestone: MilestoneCelebrationData) => void;
};

interface MilestoneDef {
  id: string;
  monthMark: number;
  title: string;
  timeframe: string;
  rank: string;
  description: string;
  girlfriendTip: string;
  icon: string;
}

const MILESTONES: MilestoneDef[] = [
  {
    id: 'm1',
    monthMark: 2.2,
    title: 'Khóa Huấn Luyện Tân Binh',
    timeframe: '04/03/2026 - 12/06/2026',
    rank: 'Chiến sĩ mới',
    description:
      'Bắt đầu nhập ngũ ngày 04/03/2026. Rèn luyện 11 chế độ trong ngày, gấp chăn màn vuông vức, bắn súng AK, điều lệnh đội ngũ và thích nghi kỷ luật thép quân đội.',
    girlfriendTip:
      'Giai đoạn này anh bị hạn chế điện thoại, em hãy viết thư tay gửi vào và kiên nhẫn đợi cuộc gọi ngắn ngày cuối tuần nhé!',
    icon: '🪖',
  },
  {
    id: 'm2',
    monthMark: 2.3,
    title: 'Lễ Tuyên Thệ',
    timeframe: '12/06/2026',
    rank: 'Binh nhì ⭐',
    description:
      'Hoàn thành xuất sắc giai đoạn tân binh ngày 12/06/2026! Khoảnh khắc thiêng liêng hôn lên Quân kỳ Quyết thắng, sẵn sàng nhận nhiệm vụ mới.',
    girlfriendTip: 'Ngày 12/06/2026 em lên thăm anh, cùng anh chia sẻ niềm tự hào người lính nhé.',
    icon: '🎖️',
  },
  {
    id: 'm2b',
    monthMark: 6,
    title: 'Đi Học Y Tá Đại Đội',
    timeframe: 'Tháng 6/2026 - Tháng 12/2026',
    rank: 'Học viên Y tá Quân y 🩺',
    description:
      'Chuyển về Trường Cao đẳng Hậu cần 2 tại TP. Thủ Đức để theo học chuyên môn Y tá Đại đội.',
    girlfriendTip: 'Anh học tập tại Thủ Đức sẽ gần hơn, thuận tiện liên lạc và gặp gỡ hơn!',
    icon: '🩺',
  },
  {
    id: 'm4',
    monthMark: 12,
    title: 'Tròn 1 Năm - 50% Chặng Đường',
    timeframe: '04/03/2027',
    rank: 'Binh nhất - Y tá Đại đội ⭐⭐',
    description:
      'Cán mốc 1 năm nghĩa vụ quân sự (04/03/2026 - 04/03/2027)! Đảm nhiệm vững vàng công tác chăm lo sức khỏe cho toàn đại đội.',
    girlfriendTip: 'Nửa chặng đường đã trôi qua rồi! Ngày sum họp đã rút ngắn đi một nửa rồi đó.',
    icon: '⏳',
  },
  {
    id: 'm5',
    monthMark: 18,
    title: '3/4 Chặng Đường',
    timeframe: 'Tháng 9/2027',
    rank: 'Hạ sĩ / Y tá Đại đội ⭐⭐⭐',
    description:
      'Trở thành chiến sĩ Quân y giàu kinh nghiệm của đơn vị, chuẩn bị tâm thế cho ngày trở về.',
    girlfriendTip: 'Chỉ còn vài tháng ngắn ngủi nữa thôi, hậu phương chuẩn bị tinh thần đón chàng lính về nhé!',
    icon: '🌟',
  },
  {
    id: 'm6',
    monthMark: 22.5,
    title: 'LỄ RA QUÂN XUẤT NGŨ VINH QUANG',
    timeframe: '10/01/2028',
    rank: 'Hoàn thành xuất sắc nghĩa vụ 💍',
    description:
      'Ngày 10/01/2028: Nhận quyết định hoàn thành nghĩa vụ quân sự vẻ vang, khoác ba lô trở về trong vòng tay yêu thương.',
    girlfriendTip: 'Ngày 10/01/2028 lịch sử! Em đón chàng lính Y tá kiên trung của em về.',
    icon: '👰🤵',
  },
];

export function IosMilestonesSection({ onTriggerFireworks }: Props) {
  const couple = useAppStore(useShallow((s) => s.couple));
  const currentTime = useNow();
  const countdown = calculateMilitaryCountdown(
    couple.militaryStartDate,
    couple.militaryEndDate,
    couple.datingStartDate,
    currentTime
  );
  const monthsPassed = countdown.daysPassed / 30.4;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink">Lộ Trình 24 Tháng</div>
            <div className="text-xs text-mute">Nghĩa vụ quân sự 2026 - 2028</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-rose">{monthsPassed.toFixed(1)} / 24</div>
            <div className="text-[10px] text-mute">tháng đã qua</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-rose to-pink-500 transition-all duration-700"
            style={{ width: `${Math.min(100, (monthsPassed / 24) * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative space-y-3 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {MILESTONES.map((item) => {
          const isPassed = monthsPassed >= item.monthMark;
          const isCurrent = !isPassed && monthsPassed >= item.monthMark - 3;
          return (
            <div key={item.id} className="relative pl-12">
              <div
                className={`absolute left-0 top-1 flex size-10 items-center justify-center rounded-full border-2 text-lg ${
                  isPassed
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : isCurrent
                      ? 'border-rose bg-rose/20 animate-pulse'
                      : 'border-line bg-card'
                }`}
              >
                {item.icon}
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  isCurrent ? 'border-rose bg-rose/10' : 'border-line bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink">{item.title}</div>
                    <div className="text-[11px] text-rose">{item.rank}</div>
                    <div className="text-[11px] text-mute">{item.timeframe}</div>
                  </div>
                  {isPassed && <span className="text-sm text-emerald-400">✓</span>}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mute">{item.description}</p>
                <p className="mt-2 text-xs italic text-rose/80">"{item.girlfriendTip}"</p>
                {isPassed && (
                  <button
                    type="button"
                    onClick={() =>
                      onTriggerFireworks({
                        title: item.title,
                        timeframe: item.timeframe,
                        rank: item.rank,
                        icon: item.icon,
                        description: item.description,
                        girlfriendMessage: item.girlfriendTip,
                      })
                    }
                    className="mt-3 rounded-xl bg-rose/20 px-4 py-2 text-xs font-semibold text-rose active:bg-rose/30"
                  >
                    🎆 Pháo hoa ăn mừng
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
