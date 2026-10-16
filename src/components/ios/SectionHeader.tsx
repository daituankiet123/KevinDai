import type { ReactNode } from 'react';
import { Icon } from './Icon';

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
};

/** Tiêu đề section kiểu iOS Large Title + nút quay lại. */
export function SectionHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Quay lại"
        className="flex size-9 items-center justify-center rounded-full bg-card text-ink active:bg-line touch-target"
      >
        <Icon name="back" size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-sm text-mute">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
