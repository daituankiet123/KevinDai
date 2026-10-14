import { useEffect, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type TabId = 'countdown' | 'notes' | 'anniversaries' | 'album' | 'more';

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'countdown', label: 'Đếm ngược', icon: 'clock' },
  { id: 'notes', label: 'Nhật ký', icon: 'book' },
  { id: 'anniversaries', label: 'Kỷ niệm', icon: 'calendar' },
  { id: 'album', label: 'Album', icon: 'image' },
  { id: 'more', label: 'Thêm', icon: 'dots' },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
  children: ReactNode;
};

/** Khung app kiểu iOS: vùng nội dung cuộn + tab bar dưới, tôn trọng safe area. */
export function IosShell({ active, onChange, children }: Props) {
  const mainRef = useRef<HTMLElement>(null);

  // Đổi tab thì quay về đầu trang, giống app native
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [active]);

  return (
    <div className="mx-auto flex h-dvh max-w-[520px] flex-col bg-night text-ink">
      <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain px-5 pt-safe pb-tabbar">
        {children}
      </main>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bar/90 pb-safe backdrop-blur-xl"
      >
        <ul className="mx-auto flex h-[49px] max-w-[520px] px-2">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <li key={tab.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => onChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose ${
                    isActive ? 'text-rose' : 'text-mute'
                  }`}
                >
                  <Icon name={tab.icon} size={26} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
