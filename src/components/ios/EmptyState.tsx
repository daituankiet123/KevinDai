import type { ReactNode } from 'react';

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
};

/** Trạng thái rỗng dùng chung cho các section iOS (gradient nhẹ, glow icon). */
export function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line bg-gradient-to-br from-card/80 to-bar/40 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose/15 text-3xl shadow-[0_0_18px_-4px] shadow-rose/40">
        <span aria-hidden="true">{icon}</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {subtitle && <p className="text-xs leading-relaxed text-mute">{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 rounded-full bg-rose px-5 py-2 text-xs font-semibold text-night active:opacity-80 transition touch-target"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function EmptyStateSlot({ children }: { children: ReactNode }) {
  return <div className="py-4">{children}</div>;
}
