import { ListGroup, ListRow, SwitchRow } from './ListGroup';

type Props = {
  music: boolean;
  onMusicChange: (on: boolean) => void;
  sfx: boolean;
  onSfxChange: (on: boolean) => void;
  hearts: boolean;
  onHeartsChange: (on: boolean) => void;
  onBackup: () => void;
  onCoupleSettings: () => void;
};

/** Tab "Thêm": cài đặt và sao lưu */
export function MoreTab(p: Props) {
  return (
    <div className="space-y-5 pb-4">
      <h1 className="flex h-[52px] items-center text-[34px] font-semibold">Thêm</h1>

      <ListGroup>
        <SwitchRow icon="music" title="Nhạc nền lofi" checked={p.music} onChange={p.onMusicChange} />
        <SwitchRow icon="sound" title="Hiệu ứng âm thanh" checked={p.sfx} onChange={p.onSfxChange} />
        <SwitchRow icon="heart" title="Mưa trái tim" checked={p.hearts} onChange={p.onHeartsChange} />
      </ListGroup>

      <ListGroup>
        <ListRow icon="download" title="Sao lưu dữ liệu" subtitle="Xuất tệp JSON" onClick={p.onBackup} />
        <ListRow icon="sliders" title="Cài đặt cặp đôi" subtitle="Tên, ngày xuất ngũ" onClick={p.onCoupleSettings} />
      </ListGroup>

      <div className="text-center text-xs text-mute pt-4">
        <p>💖 Chờ Anh Về</p>
        <p className="mt-1">2026 - 2028</p>
      </div>
    </div>
  );
}
