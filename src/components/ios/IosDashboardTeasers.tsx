import { useShallow } from 'zustand/react/shallow';
import { Icon } from './Icon';
import { useAppStore } from '../../store';
import { getAnniversaryStatus } from '../../utils/dateCalculations';
import { letterStatus } from '../../utils/letters';
import { useNow } from '../../hooks/useNow';
import type { Section } from './IosApp';

type Props = {
  onNavigate: (section: Section) => void;
};

export function IosDashboardTeasers({ onNavigate }: Props) {
  const { anniversaries, wishes, photos, letters } = useAppStore(
    useShallow((s) => ({
      anniversaries: s.anniversaries,
      wishes: s.wishes,
      photos: s.photos,
      letters: s.letters,
    }))
  );
  const now = useNow();
  const latestLetters = [...letters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const drafts = letters.filter((l) => letterStatus(l) === 'draft').length;

  return (
    <div className="space-y-3">
      {/* Anniversaries */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <button
          type="button"
          onClick={() => onNavigate('anniversaries')}
          className="flex w-full items-center justify-between px-4 py-3.5 active:bg-line/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Icon name="calendar" size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">Kỷ niệm</div>
              <div className="text-xs text-mute">{anniversaries.length} sự kiện</div>
            </div>
          </div>
          <Icon name="chevron" size={20} className="text-mute" />
        </button>

        {anniversaries.length > 0 && (
          <div className="border-t border-line px-4 pb-3.5">
            <div className="space-y-1.5">
              {anniversaries.slice(0, 2).map((a) => {
                const status = getAnniversaryStatus(a, now);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl bg-line/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.icon || '💖'}</span>
                      <span className="text-xs font-medium text-ink">{a.title}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        status.isToday ? 'text-emerald-400' : 'text-mute'
                      }`}
                    >
                      {status.isToday ? 'Hôm nay!' : `${status.daysRemaining} ngày`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Love Letters */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <button
          type="button"
          onClick={() => onNavigate('letters')}
          className="flex w-full items-center justify-between px-4 py-3.5 active:bg-line/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/20 text-rose">
              <Icon name="mail" size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">Hộp thư</div>
              <div className="text-xs text-mute">
                {letters.length} lá thư{drafts > 0 && ` · ${drafts} nháp`}
              </div>
            </div>
          </div>
          <Icon name="chevron" size={20} className="text-mute" />
        </button>

        {latestLetters.length > 0 && (
          <div className="border-t border-line px-4 py-3.5">
            <div className="space-y-1.5">
              {latestLetters.slice(0, 2).map((l) => (
                <div key={l.id} className="flex items-center gap-2 rounded-xl bg-line/30 px-3 py-2">
                  <span className="text-base" aria-hidden="true">
                    {letterStatus(l) === 'sent' ? '🔒' : '📝'}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{l.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Album */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <button
          type="button"
          onClick={() => onNavigate('album')}
          className="flex w-full items-center justify-between px-4 py-3.5 active:bg-line/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Icon name="image" size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">Album ảnh</div>
              <div className="text-xs text-mute">{photos.length} kỷ niệm</div>
            </div>
          </div>
          <Icon name="chevron" size={20} className="text-mute" />
        </button>

        {photos.length > 0 && (
          <div className="border-t border-line px-4 pb-3.5 pt-3">
            <div className="flex gap-2">
              {photos.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-line"
                >
                  <img
                    src={p.url}
                    alt={p.caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {photos[0] && (
              <p className="mt-2 truncate text-xs italic text-mute">
                "{photos[0].caption}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Wish List */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <button
          type="button"
          onClick={() => onNavigate('wishes')}
          className="flex w-full items-center justify-between px-4 py-3.5 active:bg-line/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Icon name="star" size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-ink">Ước nguyện</div>
              <div className="text-xs text-mute">
                {wishes.filter((w) => w.completed).length}/{wishes.length} đã hoàn thành
              </div>
            </div>
          </div>
          <Icon name="chevron" size={20} className="text-mute" />
        </button>

        {wishes.length > 0 && (
          <div className="border-t border-line px-4 pb-3.5">
            <div className="space-y-1.5">
              {wishes.slice(0, 2).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-xl bg-line/30 px-3 py-2"
                >
                  <span
                    className={`text-xs font-medium ${
                      w.completed ? 'text-mute line-through' : 'text-ink'
                    }`}
                  >
                    {w.title}
                  </span>
                  <span className="text-xs text-rose">❤️ {w.hearts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
