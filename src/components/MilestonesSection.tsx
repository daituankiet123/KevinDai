import React from 'react';
import { Heart, CheckCircle2, Clock } from 'lucide-react';
import { CountdownState } from '../utils/dateCalculations';
import { CoupleData } from '../types';
import { MilestoneCelebrationData } from './LoveFireworksModal';

interface MilestonesSectionProps {
  countdown: CountdownState;
  couple: CoupleData;
  onTriggerFireworks: (milestone: MilestoneCelebrationData) => void;
}

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
    description: 'Bắt đầu nhập ngũ ngày 04/03/2026. Rèn luyện 11 chế độ trong ngày, gấp chăn màn vuông vức, bắn súng AK, điều lệnh đội ngũ và thích nghi kỷ luật thép quân đội.',
    girlfriendTip: 'Giai đoạn này anh bị hạn chế điện thoại, em hãy viết thư tay gửi vào và kiên nhẫn đợi cuộc gọi ngắn ngày cuối tuần nhé!',
    icon: '🪖',
  },
  {
    id: 'm2',
    monthMark: 2.3,
    title: 'Kết Thúc Tân Binh & Lễ Tuyên Thệ (12/06/2026)',
    timeframe: '12/06/2026',
    rank: 'Binh nhì ⭐',
    description: 'Hoàn thành xuất sắc giai đoạn tân binh ngày 12/06/2026! Khoảnh khắc thiêng liêng hôn lên Quân kỳ Quyết thắng, sẵn sàng nhận nhiệm vụ mới.',
    girlfriendTip: 'Ngày 12/06/2026 hoàn thành tân binh! Em lên thăm anh, cùng anh chia sẻ niềm tự hào người lính nhé.',
    icon: '🎖️',
  },
  {
    id: 'm2b',
    monthMark: 6,
    title: 'Đi Học Y Tá Đại Đội (Trường CĐ Hậu Cần 2 - Thủ Đức)',
    timeframe: 'Tháng 6/2026 - Tháng 12/2026',
    rank: 'Học viên Y tá Quân y 🩺',
    description: 'Chuyển về Trường Cao đẳng Hậu cần 2 tại TP. Thủ Đức để theo học chuyên môn Y tá Đại đội. Học tập nghiệp vụ y khoa, băng bó cứu thương, vệ sinh phòng dịch và chăm sóc sức khỏe đồng đội.',
    girlfriendTip: 'Anh học tập tại Thủ Đức sẽ gần hơn, thuận tiện liên lạc và cơ hội gặp gỡ hơn! Em chúc chàng lính Quân y học tập thật giỏi nha.',
    icon: '🩺',
  },
  {
    id: 'm4',
    monthMark: 12,
    title: 'Tròn 1 Năm - 50% Chặng Đường Quân Ngũ',
    timeframe: '04/03/2027',
    rank: 'Binh nhất - Y tá Đại đội ⭐⭐',
    description: 'Cán mốc 1 năm nghĩa vụ quân sự (04/03/2026 - 04/03/2027)! Đảm nhiệm vững vàng công tác chăm lo sức khỏe cho toàn đại đội, được xét phong quân hàm Binh nhất.',
    girlfriendTip: 'Nửa chặng đường đã trôi qua rồi Tuyền ơi! Ngày sum họp đã rút ngắn đi một nửa rồi đó.',
    icon: '⏳',
  },
  {
    id: 'm5',
    monthMark: 18,
    title: '3/4 Chặng Đường - Đếm Ngược Giai Đoạn Cuối',
    timeframe: 'Tháng 9/2027',
    rank: 'Hạ sĩ / Y tá Đại đội ⭐⭐⭐',
    description: 'Trở thành chiến sĩ Quân y giàu kinh nghiệm của đơn vị, hoàn thành xuất sắc mọi nhiệm vụ được giao, chuẩn bị tâm thế cho ngày trở về.',
    girlfriendTip: 'Chỉ còn vài tháng ngắn ngủi nữa thôi, hậu phương chuẩn bị tinh thần đón chàng lính về nhé!',
    icon: '🌟',
  },
  {
    id: 'm6',
    monthMark: 22.5,
    title: 'LỄ RA QUÂN XUẤT NGŨ VINH QUANG - ĐOÀN TỤ',
    timeframe: '10/01/2028',
    rank: 'Hoàn thành xuất sắc nghĩa vụ 💍',
    description: 'Ngày 10/01/2028: Nhận quyết định hoàn thành nghĩa vụ quân sự vẻ vang, khoác ba lô trở về trong sự tự hào của gia đình và vòng tay yêu thương của Thanh Tuyền!',
    girlfriendTip: 'Ngày 10/01/2028 lịch sử! Thanh Tuyền đón chàng lính Y tá kiên trung của em về và bắt đầu xây dựng tổ ấm hạnh phúc.',
    icon: '👰🤵',
  },
];

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({ countdown, onTriggerFireworks }) => {
  // Estimated months passed based on days passed
  const monthsPassed = (countdown.daysPassed / 30.4);

  // Find latest achieved or active milestone
  const currentOrLatestMilestone = MILESTONES.slice().reverse().find((m) => monthsPassed >= (m.monthMark - 3)) || MILESTONES[0];

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-lg font-bold text-slate-800">
              Lộ Trình 24 Tháng Nghĩa Vụ Quân Sự (2026 - 2028)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Từng chặng đường rèn luyện của chàng lính và lời dặn dò yêu thương dành cho hậu phương nhỏ.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-200 text-right">
            <div className="text-[11px] text-slate-500 font-bold uppercase">Ước tính đã qua</div>
            <div className="text-sm font-extrabold text-rose-600">
              {monthsPassed.toFixed(1)} / 24 tháng
            </div>
          </div>
          <button
            onClick={() => onTriggerFireworks({
              title: currentOrLatestMilestone.title,
              timeframe: currentOrLatestMilestone.timeframe,
              rank: currentOrLatestMilestone.rank,
              icon: currentOrLatestMilestone.icon,
              description: currentOrLatestMilestone.description,
              girlfriendMessage: currentOrLatestMilestone.girlfriendTip,
            })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition"
          >
            <span>🎆</span>
            <span>Pháo hoa ăn mừng</span>
          </button>
        </div>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-rose-200">
        {MILESTONES.map((item) => {
          const isPassed = monthsPassed >= item.monthMark;
          const isCurrent = !isPassed && monthsPassed >= (item.monthMark - 3);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  isPassed
                    ? 'bg-emerald-500 border-white text-white shadow-xs'
                    : isCurrent
                    ? 'bg-rose-500 border-white text-white ring-4 ring-rose-200 animate-pulse'
                    : 'bg-white border-rose-200 text-slate-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : item.icon}
              </div>

              {/* Card content */}
              <div
                className={`rounded-2xl p-5 border transition duration-200 shadow-xs ${
                  isCurrent
                    ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-white border-rose-300 ring-2 ring-rose-200/50'
                    : isPassed
                    ? 'bg-white/80 border-emerald-100 opacity-90'
                    : 'bg-white/70 border-rose-100 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-600 uppercase">
                          {item.rank}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{item.timeframe}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onTriggerFireworks({
                        title: item.title,
                        timeframe: item.timeframe,
                        rank: item.rank,
                        icon: item.icon,
                        description: item.description,
                        girlfriendMessage: item.girlfriendTip,
                      })}
                      title="Bắn pháo hoa tình yêu ăn mừng cột mốc này"
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-full transition"
                    >
                      <span>🎆</span>
                      <span>Bắn pháo hoa</span>
                    </button>

                    {isPassed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã Hoàn Thành
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Đang Diễn Ra
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        Sắp Tới
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Tip for girlfriend */}
                <div className="mt-3 p-3 rounded-xl bg-rose-100/50 border border-rose-200/60 flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 fill-rose-500" />
                  <div className="text-xs text-rose-900 leading-normal">
                    <strong className="font-bold text-rose-700">Lời dặn hậu phương: </strong>
                    {item.girlfriendTip}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
