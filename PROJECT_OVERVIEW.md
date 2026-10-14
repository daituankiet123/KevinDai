# Báo cáo tổng quan dự án "Chờ Anh Về"

> Cập nhật: 13/10/2026

## 1. Giới thiệu

Ứng dụng web **PWA** (React) dành riêng cho cặp đôi **Đại Tuấn Kiệt & Lê Thị Thanh Tuyền** — đếm ngược thời gian nghĩa vụ quân sự (2026–2028), lưu giữ nhật ký tình yêu, kỷ niệm và ước nguyện chờ ngày xuất ngũ đón anh về. Toàn bộ giao diện và nội dung bằng **tiếng Việt**.

## 2. Thông tin kỹ thuật

| Hạng mục | Chi tiết |
|---|---|
| Stack | React 19 + Vite 8 + Tailwind CSS 4 + TypeScript ~5.7.3 |
| State | Zustand 5 (store trung tâm) |
| Storage | localStorage (text data) + IndexedDB/idb-keyval (ảnh) |
| Test | Vitest (36 unit) + Playwright (4 E2E) |
| Lint/Format | ESLint (flat) + Prettier |
| Package manager | npm (`package-lock.json`) |
| Build targets | `dist/` (web), `dist-singlefile/` (HTML 1 file), ZIP portable, Electron |
| Mobile | PWA installable + Capacitor (IPA qua GitHub Actions macOS) |

## 3. Kiến trúc (thư mục `src/`)

```
src/
├── App.tsx                  # Container chính (tab điều hướng, modals, toasts)
├── main.tsx                 # Entry point React
├── store.ts                 # Zustand store (6 loại dữ liệu + ~30 actions)
├── types.ts                 # Kiểu dữ liệu (Couple, Anniversary, Photo, Note...)
├── constants.ts             # Mood meta, category icons, tags
├── index.css                # Tailwind + animations
├── hooks/
│   ├── useNow.ts            # Đồng hồ tick (interval)
│   ├── useConfirm.tsx       # Promise-based confirm dialog
│   └── useAnniversaryNotifications.ts  # Thông báo kỷ niệm
├── utils/
│   ├── dateUtils.ts         # Helper ngày local-time (tránh bug UTC)
│   ├── dateCalculations.ts  # Countdown + anniversary status
│   ├── storage.ts           # localStorage load/save + DEFAULT_* dữ liệu mẫu
│   ├── photoStorage.ts      # IndexedDB + queueSavePhotos (serialize)
│   ├── imageCompression.ts  # Nén ảnh canvas (1280/512px, JPEG 0.8)
│   ├── audio.ts             # Web Audio synth (hiệu ứng + nhạc nền lofi)
│   ├── notifications.ts     # Browser Notification API
│   └── id.ts                # newId() crypto.randomUUID
└── components/ (23 files)
    ├── Header, CountdownHero, DashboardTeasers
    ├── AnniversariesSection, MilestonesSection
    ├── LoveLettersSection, WishListSection
    ├── PhotoAlbumSection (+ PhotoAddModal/PhotoCard/PhotoLightbox)
    ├── DailyNotesSection (+ Filter/ListItem/Modal/TodayCard)
    ├── DailyLoveNote, HeartParticles, DesktopCornerWidget
    └── Modals: ConfirmDialog, CoupleSettingsModal, DesktopExeModal, LoveFireworksModal
```

## 4. Chức năng chính (7 tab)

| Tab | Chức năng |
|---|---|
| **Đếm ngược** | Countdown ngày/giờ/phút/giây xuất ngũ, tiến độ %, thống kê (bữa cơm chờ, cái ôm), teaser 3 mục |
| **Ghi chú ngày** | Nhật ký theo ngày, mood, tác giả (anh/em/cả hai), tag, tim |
| **Kỷ niệm** | Sự kiện định kỳ/một lần, nhắc trước N ngày, badge khẩn cấp |
| **Album ảnh** | Upload/nén ảnh, yêu thích, caption, lightbox, tải về |
| **Chặng đường** | Mốc quân ngũ + ăn mừng (pháo hoa) |
| **Hộp thư** | Thư tình (mood, yêu thích) |
| **Ước nguyện** | Danh sách việc muốn làm khi anh về |

**Tính năng phụ:** nhạc nền lofi, mưa trái tim, hiệu ứng âm thanh, pháo hoa ăn mừng, widget góc màn hình, sao lưu/khôi phục JSON, PWA cài đặt.

## 5. Quản lý dữ liệu

- **6 loại dữ liệu**: `couple`, `anniversaries`, `letters`, `wishes`, `photos`, `dailyNotes`.
- **Ảnh** lưu IndexedDB (vượt quota localStorage 5MB), ghi qua **hàng đợi tuần tự** `queueSavePhotos` tránh ghi chồng lỗi.
- **Migration** one-time flag cho dữ liệu cũ (không reset thay đổi của user).
- **Validate schema** khi import backup; **bắt lỗi quota** và hiển thị toast cảnh báo.
- **Undo khi xóa** (snackbar hoàn tác).

## 6. Chất lượng & kiểm thử

| Kiểm tra | Kết quả |
|---|---|
| `npm run typecheck` | ✅ |
| `npx eslint .` | ✅ 0 error/warning |
| `npm test` (Vitest) | ✅ 36/36 |
| `npm run test:e2e` (Playwright) | ✅ 4/4 |
| `npm run build` | ✅ dist + single-file + ZIP |
| `npm run generate:icons` | ✅ icon PNG (cần sharp) |

## 7. Đóng gói & triển khai

- **Web**: `dist/` — PWA installable (icon PNG, manifest, service worker).
- **Single-file HTML**: `ChoAnhVe_SingleFile_Offline.html` (chạy offline 100%).
- **ZIP portable**: kèm `.bat`/`.sh` launcher + `serve.mjs`.
- **Electron**: wrapper desktop.
- **iPhone/iOS**: PWA (Safari → "Thêm vào Màn hình chính") + Capacitor → IPA (workflow `.github/workflows/build-ios.yml` trên macOS, unsigned cho sideload).
- **CI**: `.github/workflows/ci.yml` (lint + typecheck + test + build).

## 8. Tiến trình phát triển

Giai đoạn 1–5 đã hoàn thành + đợt cải tiến tổng hợp (ổn định dữ liệu, hiệu năng, UX, chất lượng code, vận hành) + đợt hỗ trợ iPhone. Chi tiết trong `PROGRESS.md`.

## 9. Những điểm nổi bật kỹ thuật

- Xử lý **ngày local-time** xuyên suốt (tránh bug múi giờ từ `toISOString`).
- **Âm thanh tổng hợp** bằng Web Audio API (không cần file audio ngoài).
- **Ảnh nén** trước khi lưu (giảm dung lượng IndexedDB).
- **A11y**: `aria-label` cho button icon, dialog có `role`/`aria-modal`.
- State tối ưu bằng `useShallow` + cô lập đồng hồ `useNow`.
