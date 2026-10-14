import { ListGroup, ListRow, SwitchRow } from './ListGroup';

export type MoreSection = 'milestones' | 'letters' | 'wishes';

type Props = {
  onOpenSection: (section: MoreSection) => void;
  music: boolean;
  onMusicChange: (on: boolean) => void;
  sfx: boolean;
  onSfxChange: (on: boolean) => void;
  hearts: boolean;
  onHeartsChange: (on: boolean) => void;
  onBackup: () => void;
  onCoupleSettings: () => void;
};

/** Tab "Thêm": gom 3 mục phụ (Chặng đường, Hộp thư, Ước nguyện) và cài đặt. */
export function MoreTab(p: Props) {
  return (
    <div className="space-y-5 pb-4">
      <h1 className="flex h-[52px] items-center text-[34px] font-semibold">Thêm</h1>

      <ListGroup>
        <ListRow icon="flag" title="Chặng đường" subtitle="Mốc quân ngũ và ăn mừng" onClick={() => p.onOpenSection('milestones')} />
        <ListRow icon="mail" title="Hộp thư" subtitle="Thư tình cho nhau" onClick={() => p.onOpenSection('letters')} />
        <ListRow icon="star" title="Ước nguyện" subtitle="Việc muốn làm khi anh về" onClick={() => p.onOpenSection('wishes')} />
      </ListGroup>

      <ListGroup>
        <SwitchRow icon="music" title="Nhạc nền lofi" checked={p.music} onChange={p.onMusicChange} />
        <SwitchRow icon="sound" title="Hiệu ứng âm thanh" checked={p.sfx} onChange={p.onSfxChange} />
        <SwitchRow icon="heart" title="Mưa trái tim" checked={p.hearts} onChange={p.onHeartsChange} />
      </ListGroup>

      <ListGroup>
        <ListRow icon="download" title="Sao lưu và khôi phục" subtitle="Tệp JSON" onClick={p.onBackup} />
        <ListRow icon="sliders" title="Cài đặt cặp đôi" subtitle="Tên, ngày xuất ngũ" onClick={p.onCoupleSettings} />
      </ListGroup>
    </div>
  );
}
