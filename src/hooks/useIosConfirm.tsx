import { useCallback, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/** useConfirm phiên bản iOS — bottom sheet dark tone phù hợp giao diện night. */
export function useIosConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    if (state) {
      state.resolve(result);
      setState(null);
    }
  };

  const Dialog = state ? (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-confirm-title"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-line bg-card pb-safe shadow-2xl sm:rounded-3xl sm:pb-6 animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        <div className="flex items-start gap-3 p-5">
          <div
            className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl ${
              state.tone === 'danger' ? 'bg-rose/20 text-rose' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 id="ios-confirm-title" className="text-base font-bold text-ink">
              {state.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-mute">{state.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-mute active:bg-line transition touch-target"
          >
            {state.cancelLabel ?? 'Hủy'}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-night active:opacity-80 transition touch-target ${
              state.tone === 'danger' ? 'bg-rose' : 'bg-emerald-500'
            }`}
          >
            {state.confirmLabel ?? 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialogElement: Dialog };
}
