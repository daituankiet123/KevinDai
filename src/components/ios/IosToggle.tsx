type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
};

/** Công tắc iOS 51×27 — track rose khi bật, line khi tắt. */
export function IosToggle({ checked, onChange, ariaLabel, disabled = false }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-[31px] w-[51px] flex-none rounded-full transition-colors after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50 ${
        checked ? 'bg-rose' : 'bg-line'
      }`}
    >
      <span
        className={`absolute top-0.5 size-[27px] rounded-full bg-ink transition-[left] shadow-sm ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
