import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/** Nhóm danh sách bo góc kiểu iOS (inset grouped). Chỉ nhận ListRow / SwitchRow làm con. */
export function ListGroup({ children }: { children: ReactNode }) {
  return (
    <ul className="overflow-hidden rounded-[20px] border border-line bg-card [&>li:not(:last-child)]:border-b [&>li:not(:last-child)]:border-line">
      {children}
    </ul>
  );
}

function IconBadge({ name }: { name: IconName }) {
  return (
    <span className="flex size-8 flex-none items-center justify-center rounded-[10px] bg-line text-rose">
      <Icon name={name} size={22} />
    </span>
  );
}

type RowProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onClick: () => void;
};

export function ListRow({ icon, title, subtitle, onClick }: RowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-14 w-full items-center gap-3 px-3.5 text-left active:bg-line/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose"
      >
        <IconBadge name={icon} />
        <span className="min-w-0 flex-1">
          <span className="block text-base">{title}</span>
          {subtitle && <span className="block text-xs text-mute">{subtitle}</span>}
        </span>
        <Icon name="chevron" size={22} className="flex-none text-mute" />
      </button>
    </li>
  );
}

type SwitchRowProps = {
  icon: IconName;
  title: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function SwitchRow({ icon, title, checked, onChange }: SwitchRowProps) {
  return (
    <li className="flex min-h-14 items-center gap-3 px-3.5">
      <IconBadge name={icon} />
      <span className="flex-1 text-base">{title}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        // after: mở rộng vùng chạm lên ~51px mà không đổi kích thước công tắc
        className={`relative h-[31px] w-[51px] flex-none rounded-full transition-colors after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
          checked ? 'bg-rose' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 size-[27px] rounded-full bg-ink transition-[left] ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </li>
  );
}
