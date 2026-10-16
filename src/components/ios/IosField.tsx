import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

const baseInputClass =
  'w-full rounded-xl border border-line bg-night px-4 py-3 text-sm text-ink placeholder:text-mute focus:border-rose focus:outline-none touch-target';

type FieldProps = {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
};

export function IosField({ label, helper, error, children }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">{label}</span>
      {children}
      {error ? (
        <span className="block text-[11px] text-rose-400">{error}</span>
      ) : helper ? (
        <span className="block text-[11px] text-mute">{helper}</span>
      ) : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function IosInput({ className = '', ...rest }: InputProps) {
  return <input className={`${baseInputClass} ${className}`} {...rest} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function IosTextarea({ className = '', rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={`${baseInputClass} resize-none leading-relaxed ${className}`}
      {...rest}
    />
  );
}
