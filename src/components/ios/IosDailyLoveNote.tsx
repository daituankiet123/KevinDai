import { useState } from 'react';
import { playHeartPop } from '../../utils/audio';
import confetti from 'canvas-confetti';

const SWEET_NOTES = [
  'Khoảng cách không thể làm phai mờ tình yêu, nó chỉ khiến ngày tái ngộ thêm nồng say và trân quý.',
  'Anh canh giữ bình yên cho Tổ quốc, em gìn giữ hạnh phúc cho tương lai đôi mình.',
  'Hai năm quân ngũ là thước đo lòng son. Chờ anh về, em sẽ là cô dâu hạnh phúc nhất trần đời.',
  'Mỗi sáng thức dậy nhìn lịch đếm ngược, em lại biết chúng mình đang tiến gần hơn một bước về phía nhau.',
  'Dẫu thao trường có nắng cháy hay mưa dầm, nhớ rằng ở hậu phương luôn có một trái tim hướng về anh.',
  'Người lính kiên cường trên bãi tập, nhưng trước nụ cười của em lại là chàng trai dịu dàng nhất.',
  'Thời gian trôi không chờ đợi ai, nhưng tình yêu của em sẽ kiên nhẫn đợi anh từng giây từng phút.',
  'Gửi ngàn nụ hôn và cái ôm ấm áp vào làn gió mát, nhờ gió bay đến nơi đóng quân của anh yêu.',
  'Yêu một người lính là học cách kiên cường, tự lập và tự hào khôn xiết về người đàn ông của mình.',
  'Ngày anh khoác ba lô xuất ngũ trở về, em sẽ chạy đến ôm anh thật chặt trước sự ngưỡng mộ của mọi người!',
];

type Props = {
  soundEnabled: boolean;
};

export function IosDailyLoveNote({ soundEnabled }: Props) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SWEET_NOTES.length));

  const handleNext = (e: React.MouseEvent) => {
    playHeartPop(soundEnabled);
    setIndex((prev) => (prev + 1) % SWEET_NOTES.length);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 12,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f4a9b8', '#f43f5e', '#fb7185'],
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-base">🌸</span>
          <span className="text-xs font-semibold text-mute">Lời thì thầm mỗi ngày</span>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-8 items-center gap-1 rounded-full bg-rose/20 px-3 text-xs font-semibold text-rose active:bg-rose/30 transition-colors"
        >
          <span className="text-sm">✨</span>
          <span>Tiếp</span>
        </button>
      </div>
      <div className="px-4 py-4">
        <p className="text-sm leading-relaxed text-ink/90 font-medium">
          "{SWEET_NOTES[index]}"
        </p>
      </div>
    </div>
  );
}
