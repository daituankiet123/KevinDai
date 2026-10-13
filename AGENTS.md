# AGENTS.md

Hướng dẫn cho các agent làm việc trên dự án "Chờ Anh Về".

## Stack

React 19 + Vite 8 + Tailwind 4, TypeScript ~5.7.3, Zustand 5, tiếng Việt. Package manager: **npm** (chỉ `package-lock.json`, không có `bun.lock`).

## Lệnh kiểm tra (chạy sau mỗi thay đổi)

```bash
npm run typecheck   # tsc --noEmit
npx eslint .        # 0 errors / 0 warnings
npm test            # vitest run (36/36)
npm run test:e2e    # playwright test (4/4)
npm run build       # dist + single-file + ZIP
npm run generate:icons  # sinh icon PNG cho PWA từ public/icon.svg (cần sharp)
```

## Mobile (iPhone/iOS)

- **PWA installable** (không cần IPA): chạy trên iPhone qua Safari → "Thêm vào Màn hình chính". Cần icon PNG (`public/icon-180.png` cho apple-touch, `icon-192/512.png` cho manifest).
- **Capacitor** (build IPA, cần macOS): `capacitor.config.ts` (`webDir: dist`). Script `cap:sync`, `cap:add:ios`, `cap:open:ios`. Thư mục `ios/` được gitignore (sinh lại bằng `npx cap add ios`).
- **Workflow `.github/workflows/build-ios.yml`** build IPA (unsigned, dành cho sideload) trên `macos-latest`; có hỗ trợ ký nếu cấu hình secrets.

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
