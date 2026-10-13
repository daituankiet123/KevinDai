import React, { useState } from 'react';
import { Sparkles, Copy, Check, Heart, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playHeartPop } from '../utils/audio';

const SWEET_NOTES = [
  "Khoảng cách không thể làm phai mờ tình yêu, nó chỉ khiến ngày tái ngộ thêm nồng say và trân quý.",
  "Anh canh giữ bình yên cho Tổ quốc, em gìn giữ hạnh phúc cho tương lai đôi mình.",
  "Hai năm quân ngũ là thước đo lòng son. Chờ anh về, em sẽ là cô dâu hạnh phúc nhất trần đời.",
  "Mỗi sáng thức dậy nhìn lịch đếm ngược, em lại biết chúng mình đang tiến gần hơn một bước về phía nhau.",
  "Dẫu thao trường có nắng cháy hay mưa dầm, nhớ rằng ở hậu phương luôn có một trái tim hướng về anh.",
  "Người lính kiên cường trên bãi tập, nhưng trước nụ cười của em lại là chàng trai dịu dàng nhất.",
  "Thời gian trôi không chờ đợi ai, nhưng tình yêu của em sẽ kiên nhẫn đợi anh từng giây từng phút.",
  "Gửi ngàn nụ hôn và cái ôm ấm áp vào làn gió mát, nhờ gió bay đến nơi đóng quân của anh yêu.",
  "Yêu một người lính là học cách kiên cường, tự lập và tự hào khôn xiết về người đàn ông của mình.",
  "Ngày anh khoác ba lô xuất ngũ trở về, em sẽ chạy đến ôm anh thật chặt trước sự ngưỡng mộ của mọi người!"
];

interface DailyLoveNoteProps {
  soundEnabled: boolean;
}

export const DailyLoveNote: React.FC<DailyLoveNoteProps> = ({ soundEnabled }) => {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleNext = (e: React.MouseEvent) => {
    playHeartPop(soundEnabled);
    setIndex((prev) => (prev + 1) % SWEET_NOTES.length);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#fda4af', '#f43f5e', '#fb7185'],
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SWEET_NOTES[index]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-amber-50/90 p-5 border border-rose-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            Lời Thì Thầm Cho Hậu Phương Mỗi Ngày
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Sao chép lời nhắn"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white/70 hover:bg-white rounded-lg border border-rose-100 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rút quẻ khác</span>
          </button>
        </div>
      </div>

      <div className="font-script text-xl sm:text-2xl text-rose-950 font-bold leading-relaxed py-1">
        "{SWEET_NOTES[index]}"
      </div>
    </div>
  );
};
