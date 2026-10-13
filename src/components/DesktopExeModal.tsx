import React, { useState } from 'react';
import { Download, Check, Copy, HardDrive, FileArchive, FileCode } from 'lucide-react';
import { playSweetChime } from '../utils/audio';

interface DesktopExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  soundEnabled: boolean;
}

export const DesktopExeModal: React.FC<DesktopExeModalProps> = ({
  isOpen,
  onClose,
  onExportData,
  onImportData,
  soundEnabled,
}) => {
  const [copiedZipUrl, setCopiedZipUrl] = useState(false);
  const [copiedHtmlUrl, setCopiedHtmlUrl] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zipDownloadUrl = `${origin}/ChoAnhVe_Desktop_Portable.zip`;
  const htmlDownloadUrl = `${origin}/ChoAnhVe_SingleFile_Offline.html`;

  const handleCopyLink = (url: string, type: 'zip' | 'html') => {
    navigator.clipboard.writeText(url);
    playSweetChime(soundEnabled);
    if (type === 'zip') {
      setCopiedZipUrl(true);
      setTimeout(() => setCopiedZipUrl(false), 2000);
    } else {
      setCopiedHtmlUrl(true);
      setTimeout(() => setCopiedHtmlUrl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-rose-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-full hover:bg-slate-100 transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-rose-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md">
            📥
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tải Bản Đóng Gói Ứng Dụng Về Máy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã đóng gói hoàn chỉnh sẵn sàng chạy offline 100% trên mọi máy tính (Windows, Mac,
              Linux).
            </p>
          </div>
        </div>

        {/* Direct Download Options */}
        <div className="space-y-4">
          {/* Option 1: Full Portable ZIP Package */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                <FileArchive className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Gói Ứng Dụng Đầy Đủ (Portable .ZIP)
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    Đầy đủ nhất
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Bao gồm toàn bộ mã nguồn đóng gói, file khởi chạy nhanh{' '}
                  <code>Chay_Ung_Dung_Windows.bat</code> và tài nguyên chạy offline.
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-1 truncate max-w-xs sm:max-w-md">
                  {zipDownloadUrl}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2 shrink-0">
              <a
                href="/ChoAnhVe_Desktop_Portable.zip"
                download="ChoAnhVe_Desktop_Portable.zip"
                onClick={() => playSweetChime(soundEnabled)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md active:scale-95 transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Tải File .ZIP</span>
              </a>

              <button
                onClick={() => handleCopyLink(zipDownloadUrl, 'zip')}
                title="Sao chép link tải trực tiếp"
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-rose-100 border border-rose-200 transition whitespace-nowrap"
              >
                {copiedZipUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>{copiedZipUrl ? 'Đã chép link' : 'Chép link tải'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Standalone Single-file HTML */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Bản Độc Lập 1-File HTML (Không cần giải nén)
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Gọn nhẹ
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Toàn bộ ứng dụng đóng gói thành đúng 1 tệp HTML duy nhất. Nhấp đúp mở bằng mọi
                  trình duyệt là chạy ngay lập tức.
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-1 truncate max-w-xs sm:max-w-md">
                  {htmlDownloadUrl}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2 shrink-0">
              <a
                href="/ChoAnhVe_SingleFile_Offline.html"
                download="ChoAnhVe_SingleFile_Offline.html"
                onClick={() => playSweetChime(soundEnabled)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Tải File .HTML</span>
              </a>

              <button
                onClick={() => handleCopyLink(htmlDownloadUrl, 'html')}
                title="Sao chép link tải trực tiếp"
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-emerald-100 border border-emerald-200 transition whitespace-nowrap"
              >
                {copiedHtmlUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{copiedHtmlUrl ? 'Đã chép link' : 'Chép link tải'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="mt-6 pt-5 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HardDrive className="w-4 h-4 text-rose-500" />
            <span>Sao lưu dữ liệu kỷ niệm &amp; nhật ký:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onExportData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file JSON</span>
            </button>

            <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl cursor-pointer transition">
              <span>Nhập JSON</span>
              <input type="file" accept=".json" onChange={onImportData} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
