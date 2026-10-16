import { Icon } from './Icon';
import type { CouplePhoto } from '../../types';

type Props = {
  photos: CouplePhoto[];
  onOpen: (photo: CouplePhoto, index: number) => void;
};

export function IosPhotoGrid({ photos, onOpen }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo, idx) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onOpen(photo, idx)}
          aria-label={photo.caption}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-line ring-1 ring-inset ring-white/5 transition active:scale-95"
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-active:opacity-100" />
          {photo.isFavorite && (
            <span className="absolute left-2 top-2 text-sm drop-shadow-md">❤️</span>
          )}
          {photo.hearts > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              ❤️ {photo.hearts}
            </span>
          )}
          {photo.tag && (
            <span className="absolute left-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <Icon name="flag" size={10} />
              {photo.tag}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
