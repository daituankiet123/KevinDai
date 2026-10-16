# AGENTS.md

Hướng dẫn cho các agent làm việc trên dự án "Chờ Anh Về".

## Stack

React 19 + Vite 8 + Tailwind 4, TypeScript ~5.7.3, Zustand 5, tiếng Việt. Package manager: **npm** (chỉ `package-lock.json`, không có `bun.lock`).

## Lệnh kiểm tra (chạy sau mỗi thay đổi)

```bash
npm run typecheck   # tsc --noEmit
npx eslint .        # 0 errors / 0 warnings
npm test            # vitest run (59/59)
npm run test:e2e    # playwright test (9/9: app + ios + pwa; thêm --workers=1 nếu runner thiếu tài nguyên)
npm run build       # dist + single-file + ZIP
npm run generate:icons  # sinh icon PNG cho PWA từ public/icon.svg (cần sharp)
```

## Mobile (iPhone/iOS) — chỉ PWA, không làm IPA

- **PWA installable** là con đường duy nhất: Safari trên iPhone → "Thêm vào Màn hình chính". Cần icon PNG (`public/icon-180.png` cho apple-touch, `icon-192/512.png` + `icon-maskable-512.png` cho manifest) và `public/manifest.json` — `index.html` chỉ khai báo **một** `rel="manifest"` và **một** `apple-touch-icon` (plugin PWA tự chèn thêm `manifest.webmanifest`).
- Sinh lại icon bằng `npm run generate:icons` khi sửa `public/icon.svg`.
- **Không build IPA/App Store.** `capacitor.config.ts` + script `cap:*` còn trong repo để dùng local khi cần (không có workflow macOS nữa — `.github/workflows/build-ios.yml` đã gỡ vì runner Node 20 không tương thích Capacitor CLI yêu cầu Node ≥ 22). Không thêm workflow IPA hay dependency mới cho hướng mobile.

## Kiến trúc chính

- `src/store.ts` — Zustand store trung tâm (6 loại dữ liệu + actions). Photos lưu qua IndexedDB (queue tuần tự `queueSavePhotos`); các loại khác qua localStorage.
- `src/utils/storage.ts` — load/save localStorage + DEFAULT_* dữ liệu mẫu. Các hàm `save*` trả `boolean` (để báo lỗi quota).
- `src/utils/photoStorage.ts` — IndexedDB (idb-keyval), `queueSavePhotos` serialize ghi.
- `src/hooks/` — `useNow`, `useConfirm`, `useAnniversaryNotifications`.
- `src/components/` — UI; modal dùng `useConfirm` thay `confirm()` native; button icon thuần phải có `aria-label` hoặc `title`.

## Quy ước

- Không thêm comment trừ khi được yêu cầu.
- Giữ phong cách Tailwind hiện tại (giao diện sáng, tươi vui); **không** thêm dark mode.
- Dữ liệu ngày luôn dùng helper local-time trong `src/utils/dateUtils.ts` (không dùng `toISOString` cho date-only).
- Build artifacts (`dist/`, `dist-singlefile/`, `dev-dist/`, `public/*.zip`, `public/*.html`) được sinh lại khi build, không commit.
- CI: `.github/workflows/ci.yml` chạy lint + typecheck + test + build (node 20, npm ci).
