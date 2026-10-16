import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store';
import { IosField, IosTextarea } from './IosField';
import { IosToggle } from './IosToggle';
import { Icon } from './Icon';
import { useIosConfirm } from '../../hooks/useIosConfirm';
import { decodeShareLink, encodeShareLink } from '../../utils/shareLink';
import { makeQrSvg } from '../../utils/qrCode';
import { copyToClipboard, shareText } from '../../utils/photoShare';
import { todayStr } from '../../utils/dateUtils';

const HISTORY_KEY = 'love_soldier_share_history_v1';
const QR_MAX_CHARS = 200;
const DAY_MS = 86_400_000;

type HistoryEntry = {
  token: string;
  label: string;
  createdAt: string;
  expiresAt: string;
};

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return (parsed as HistoryEntry[]).filter(
      (e) => new Date(e.expiresAt).getTime() > now && typeof e.token === 'string'
    );
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* bỏ qua khi hết quota localStorage */
  }
}

export function IosShareScreen() {
  const { couple, anniversaries, letters, wishes, photos, dailyNotes, importData } = useAppStore(
    useShallow((s) => ({
      couple: s.couple,
      anniversaries: s.anniversaries,
      letters: s.letters,
      wishes: s.wishes,
      photos: s.photos,
      dailyNotes: s.dailyNotes,
      importData: s.importData,
    }))
  );
  const [includePhotos, setIncludePhotos] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());
  const { confirm, ConfirmDialogElement } = useIosConfirm();

  const counts = useMemo(
    () => ({
      letters: letters.length,
      notes: dailyNotes.length,
      wishes: wishes.length,
      anniversaries: anniversaries.length,
      photos: photos.length,
    }),
    [letters, dailyNotes, wishes, anniversaries, photos]
  );

  const qrSvg = token && token.length <= QR_MAX_CHARS ? makeQrSvg(token, 4) : null;

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const backup: Record<string, unknown> = {
        couple,
        anniversaries,
        letters,
        wishes,
        dailyNotes,
        exportedAt: new Date().toISOString(),
      };
      if (includePhotos) backup.photos = photos;
      const encoded = await encodeShareLink(backup);
      setToken(encoded);
      const entry: HistoryEntry = {
        token: encoded,
        label: includePhotos ? 'Toàn bộ (kèm ảnh)' : 'Không kèm ảnh',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * DAY_MS).toISOString(),
      };
      const next = [entry, ...history].slice(0, 10);
      setHistory(next);
      writeHistory(next);
    } catch {
      setError('Không tạo được mã chia sẻ. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    const value = pasteValue.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await decodeShareLink(value);
      if (!payload || typeof payload !== 'object') {
        setError('Mã không hợp lệ hoặc đã hỏng. Hãy kiểm tra lại.');
        return;
      }
      const ok = await confirm({
        title: 'Nhập dữ liệu chia sẻ?',
        message: 'Toàn bộ dữ liệu hiện tại của bạn sẽ bị thay thế bằng dữ liệu vừa nhận.',
        confirmLabel: 'Nhập',
        tone: 'danger',
      });
      if (!ok) return;
      const done = importData(payload as Record<string, unknown>);
      if (done) {
        setNotice('Đã nhập dữ liệu từ mã chia sẻ.');
        setPasteValue('');
      } else {
        setError('Dữ liệu trong mã không hợp lệ nên chưa được nhập.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 animate-pop-in">
      <div className="rounded-3xl border border-line ios-card-gradient p-5">
        <p className="text-sm font-semibold text-ink">Dữ liệu sẽ chia sẻ</p>
        <p className="mt-1 text-[11px] leading-relaxed text-mute">
          💌 {counts.letters} thư · 📝 {counts.notes} nhật ký · ⭐ {counts.wishes} ước nguyện · 🎀{' '}
          {counts.anniversaries} kỷ niệm · 📷 {counts.photos} ảnh
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-bar/60 px-4 py-3">
          <span className="text-xs text-ink">Kèm theo ảnh (mã sẽ rất dài)</span>
          <IosToggle
            checked={includePhotos}
            onChange={setIncludePhotos}
            ariaLabel="Kèm theo ảnh"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={busy}
          className="mt-3 w-full rounded-2xl bg-rose py-3 text-sm font-semibold text-night shadow-[0_0_18px_-6px_var(--color-rose)] transition active:opacity-80 disabled:opacity-50 touch-target"
        >
          {busy ? 'Đang tạo mã...' : 'Tạo mã chia sẻ'}
        </button>
        <p className="mt-2 text-[10px] leading-relaxed text-mute">
          Tạo ngày {todayStr()} · Mã có hiệu lực 30 ngày trong lịch sử máy này.
        </p>
      </div>

      {token && (
        <div className="rounded-3xl border border-line bg-card p-5">
          <p className="text-sm font-semibold text-ink">Mã chia sẻ</p>
          <textarea
            readOnly
            value={token}
            rows={4}
            aria-label="Mã chia sẻ"
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 w-full resize-none rounded-2xl border border-line bg-night px-3 py-2 text-[11px] leading-relaxed text-ink break-all"
          />
          <p className="mt-1 text-[10px] text-mute">{token.length} ký tự</p>

          {qrSvg ? (
            <div
              className="mx-auto mt-4 w-fit rounded-2xl bg-white p-2"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <p className="mt-3 rounded-2xl border border-line bg-bar/60 px-3 py-2 text-[11px] leading-relaxed text-mute">
              Mã dài hơn {QR_MAX_CHARS} ký tự nên không đủ chỗ cho QR — hãy sao chép hoặc gửi qua
              ứng dụng khác.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void copyToClipboard(token).then((ok) => setNotice(ok ? 'Đã sao chép mã.' : 'Không sao chép được.'))}
              className="flex-1 rounded-2xl border border-line py-3 text-xs font-semibold text-ink transition active:bg-line touch-target"
            >
              Sao chép
            </button>
            <button
              type="button"
              onClick={() => void shareText('Dữ liệu Chờ Anh Về', token)}
              className="flex-1 rounded-2xl bg-rose py-3 text-xs font-semibold text-night transition active:opacity-80 touch-target"
            >
              Chia sẻ qua...
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-line ios-card-gradient p-5">
        <p className="text-sm font-semibold text-ink">Nhập từ mã đã nhận</p>
        <IosField label="Dán mã chia sẻ" helper="Mã bắt đầu bằng cav1-">
          <IosTextarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={3}
            placeholder="cav1-..."
          />
        </IosField>
        <button
          type="button"
          onClick={() => void handleImport()}
          disabled={busy || !pasteValue.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3 text-sm font-semibold text-ink transition active:bg-line disabled:opacity-50 touch-target"
        >
          <Icon name="download" size={18} />
          Nhập dữ liệu
        </button>
        {error && <p className="mt-2 text-[11px] text-rose-400">{error}</p>}
        {notice && <p className="mt-2 text-[11px] text-emerald-400">{notice}</p>}
      </div>

      {history.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-line bg-card">
          <p className="border-b border-line px-5 py-3 text-xs font-semibold text-mute">
            Mã đã tạo gần đây
          </p>
          <ul className="divide-y divide-line">
            {history.map((entry) => (
              <li key={entry.token.slice(0, 24)}>
                <button
                  type="button"
                  onClick={() => setToken(entry.token)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition active:bg-line/50 touch-target"
                >
                  <span className="text-base" aria-hidden="true">
                    🔑
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-ink">{entry.label}</span>
                    <span className="block text-[10px] text-mute">
                      {new Date(entry.createdAt).toLocaleString('vi-VN')} ·{' '}
                      {entry.token.length} ký tự
                    </span>
                  </span>
                  <Icon name="chevron" size={18} className="flex-none text-mute" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ConfirmDialogElement}
    </div>
  );
}
