import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { CouplePhoto } from '../types';
import { todayStr } from '../utils/dateUtils';
import { compressImage } from '../utils/imageCompression';
import { newId } from '../utils/id';

interface PhotoAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (photo: CouplePhoto) => void;
  onSuccess: () => void;
}

export const PhotoAddModal: React.FC<PhotoAddModalProps> = ({
  isOpen,
  onClose,
  onAddPhoto,
  onSuccess,
}) => {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(todayStr());
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('Hẹn hò');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      try {
        const compressed = await compressImage(file);
        urls.push(compressed);
      } catch (err) {
        if (err instanceof Error && err.message === 'IMAGE_TOO_LARGE') {
          alert(`Ảnh "${file.name}" quá lớn (>8MB), vui lòng chọn ảnh nhẹ hơn.`);
        }
      }
    }

    setFileUrls(urls);
    if (filesArray.length === 1 && !caption) {
      setCaption(filesArray[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileUrls.length === 0) {
      alert('Vui lòng chọn ít nhất một tấm ảnh từ máy tính!');
      return;
    }

    fileUrls.forEach((url, idx) => {
      const photoCaption =
        fileUrls.length > 1
          ? `${caption.trim() || 'Kỷ niệm yêu thương'} (${idx + 1})`
          : caption.trim() || 'Khoảnh khắc ngọt ngào của hai đứa mình';

      const newPhoto: CouplePhoto = {
        id: newId('photo'),
        url,
        caption: photoCaption,
        date,
        location: location.trim() || undefined,
        tag,
        hearts: 1,
        isFavorite: false,
      };

      onAddPhoto(newPhoto);
    });

    setFileUrls([]);
    setCaption('');
    setLocation('');
    setTag('Hẹn hò');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-rose-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <h3 className="font-bold text-slate-800 text-lg">Thêm Ảnh Kỷ Niệm Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Photo selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Chọn một hoặc nhiều ảnh từ máy tính *
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-2xl p-4 bg-rose-50/40 hover:bg-rose-50 transition cursor-pointer">
              {fileUrls.length > 0 ? (
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {fileUrls.slice(0, 3).map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Preview ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-rose-600">
                      Đã chọn {fileUrls.length} ảnh
                    </span>
                    <button
                      type="button"
                      onClick={() => setFileUrls([])}
                      className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-md font-bold"
                    >
                      Chọn lại
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full py-5">
                  <Upload className="w-8 h-8 text-rose-400 mb-1" />
                  <span className="text-xs font-bold text-rose-600">
                    Nhấn để tải một hoặc nhiều ảnh lên cùng lúc
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, WEBP (Lưu offline an toàn trong máy tính)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Lời chú thích ngọt ngào *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ví dụ: Buổi chiều đi dạo cùng Bà Chã Thơm, Nụ cười làm tan chảy trái tim..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ngày kỷ niệm *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Chủ đề
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
              >
                <option value="Hẹn hò">Hẹn hò</option>
                <option value="Sinh nhật">Sinh nhật</option>
                <option value="Quân ngũ">Quân ngũ</option>
                <option value="Kỷ niệm">Kỷ niệm</option>
                <option value="Du lịch">Du lịch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Địa điểm chụp
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Quán cafe quen, Đà Lạt, Doanh trại Trung đoàn 88..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-rose-200 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition"
            >
              Lưu Vào Album 💖
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
