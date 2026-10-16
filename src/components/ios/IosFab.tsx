import { Icon } from './Icon';

type Props = {
  label: string;
  onClick: () => void;
};

/** Nút nổi iOS — cố định góc phải dưới, nằm ngay trên tab bar. */
export function IosFab({ label, onClick }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-30 bottom-fab mx-auto flex max-w-[520px] justify-end px-5">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose text-night shadow-[0_8px_24px_-6px_var(--color-rose)] transition active:scale-95 animate-soft-glow touch-target"
      >
        <Icon name="plus" size={26} />
      </button>
    </div>
  );
}
