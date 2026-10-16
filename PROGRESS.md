# Tiến độ dự án "Chờ Anh Về"

> Cập nhật: 13/10/2026

## Mục tiêu

Đánh giá và cải tiến dự án "Chờ Anh Về" (app React đếm ngược nghĩa vụ quân sự 2026–2028 + nhật ký tình yêu) theo kế hoạch nhiều giai đoạn đã thống nhất.

Đã hoàn thành **Giai đoạn 1–5** và **đợt cải tiến tổng hợp** (ổn định dữ liệu, hiệu năng, UX, chất lượng code, vận hành).

## Thông tin dự án

- Vị trí: `/workspaces/KevinDai`
- Stack: React 19 + Vite 8 + Tailwind 4, TypeScript ~5.7.3, tiếng Việt
- Build 3 dạng: `dist`, single-file HTML, ZIP portable + Electron wrapper
- Package manager: **npm** (đã xóa `bun.lock` cũ, chỉ giữ `package-lock.json`)

## Các quyết định đã chốt với user

1. Thực hiện Giai đoạn 1 trước
2. Bỏ hẳn dependency Gemini thừa
3. Dùng Zustand cho state management
4. Hạ TypeScript về ~5.7.3 (vì `@typescript-eslint` peer chỉ hỗ trợ `<6.1.0`)

## Giai đoạn 1 — Dọn dẹp dependencies & fix bug ✅

- Fix `package.json`: bump `esbuild` `^0.25.0` → `^0.28.0` (vite@8 cần); xóa `@google/genai`, `dotenv`, `express`, `@types/express`; thêm `zustand@^5`
- Tạo `src/utils/dateUtils.ts` (`todayStr`, `todayMonthStr`, `pad2`)
- **Fix bug múi giờ**: mọi `new Date().toISOString().slice(0,10)` (UTC) thay bằng helper local-time ở 5 file; `parseLocalDate()` fix việc `new Date('YYYY-MM-DD')` parse UTC trong `dateCalculations.ts`
- Tạo `src/constants.ts` (`DAILY_NOTE_MOOD_META`, `CATEGORY_ICONS`, `SUGGESTED_NOTE_TAGS`, `PHOTO_TAG_OPTIONS`)
- Xóa tham chiếu Gemini khỏi `metadata.json` + `.env.example`
- Electron security: `webSecurity: true`, `sandbox: true` (`electron.cjs`)

## Giai đoạn 2 — Zustand store ✅

- Tạo `src/store.ts`: Zustand store trung tâm, 6 loại dữ liệu + ~20 action, tự sync localStorage
- Refactor `App.tsx` dùng selector `useAppStore((s) => s.xxx)`, bỏ ~20 handler CRUD

## Giai đoạn 3 — Ảnh & testing ✅

- `src/utils/imageCompression.ts`: canvas resize 1280px / avatar 512px, JPEG q0.8 — tích hợp 4 điểm upload (PhotoAlbumSection, CountdownHero, CoupleSettingsModal ×2, LoveLettersSection)
- `src/utils/photoStorage.ts`: IndexedDB qua `idb-keyval`, migrate từ localStorage key `love_soldier_photos_v4` → IDB `love_soldier_photos_v5`; store có `hydratePhotos()` gọi khi mount trong `App.tsx`
- **22 unit tests pass** (`dateCalculations.test.ts` 14, `dateUtils.test.ts` 4, `storage.test.ts` 4)
- Thêm `vitest.config.ts` + scripts `test` / `test:watch`

## Giai đoạn 4 — Chất lượng & trải nghiệm ✅

- `eslint.config.js` (flat config: `@typescript-eslint/parser` + react-hooks + react-refresh + prettier, node globals cho `.cjs`/`scripts/*.js`, `no-undef: 'off'` cho TS)
- `.prettierrc.json`, `.prettierignore`
- Scripts mới: `lint` (eslint .), `lint:fix`, `format`, `format:check`, `typecheck`, `test`
- Fix react-hooks error: refactor `DailyNoteModal.tsx` thành wrapper + `DailyNoteForm` với `key={initialNote?.id ?? targetDate ?? 'new'}`, bỏ useEffect sync state
- Tạo `src/components/ConfirmDialog.tsx` + `src/hooks/useConfirm.tsx` (Promise-based) — thay `confirm()` native ở: WishListSection, PhotoAlbumSection, LoveLettersSection, AnniversariesSection, DailyNotesSection, TodayDailyNoteCard (kèm render `{ConfirmDialogElement}` cuối JSX + `aria-label="Xóa ..."`)
- `AnniversariesSection`: thêm `useMemo` cho `statuses` + `now`
- Cleanup unused imports hoàn tất: CountdownHero, CoupleSettingsModal, DailyLoveNote, DailyNoteModal, DailyNotesSection, DesktopCornerWidget, DesktopExeModal, Header, LoveFireworksModal, LoveLettersSection, MilestonesSection (xóa prop `couple` khỏi destructuring, giữ type import), PhotoAlbumSection (xóa `Eye`, `Layers`, `favoriteCount`), TodayDailyNoteCard (xóa `Sparkles`, `MessageCircle`, bỏ prop `onAddOrUpdateNote` khỏi destructuring + interface), WishListSection (`Sparkles`, `ListChecks`), `vite.config.ts` (`path`)
- Fix warning `react-hooks/exhaustive-deps` ở `LoveFireworksModal`: bọc `triggerConfettiCannons` trong `useCallback`
- Xóa `bun.lock` (chỉ giữ `package-lock.json`)
- `.gitignore`: thêm `dist-singlefile/`, `public/*.zip`, `public/*.html` (build artifacts được sinh lại khi build); untrack các artifacts đã bị git track
- Thêm GitHub Actions CI `.github/workflows/ci.yml` (lint + typecheck + test + build, node 20, npm ci)

## Giai đoạn 5 — Củng cố & refactor ✅

- **Fix storage migration cứng nhắc**: `loadCoupleData`/`loadAnniversaries` giờ dùng cờ one-time (`*_migrated_v4`) — không còn ép cứng ngày nhập ngũ/ra quân mỗi lần load (user sửa settings giờ không bị reset)
- **Untrack build artifacts** còn sót: `dist-singlefile/*`, `dev-dist/*` (thêm `dev-dist/` vào `.gitignore`)
- **ID unique**: tạo `src/utils/id.ts` (`newId` dùng `crypto.randomUUID()`) thay `Date.now()` ở 5 điểm tạo id (note, anniv, wish, letter, photo)
- **IndexedDB error surfacing**: `savePhotosIndexedDB` không nuốt lỗi; store dùng `persistPhotos()` để ghi log khi lưu ảnh thất bại
- **Tách component lớn**: `PhotoAlbumSection` (694 → 320 dòng) tách thành `PhotoAddModal` + `PhotoCard` + `PhotoLightbox`; `DailyNotesSection` (919 → 390 dòng) tách thành `DailyNotesFilter` + `DailyNoteListItem`
- **Tăng test**: thêm `store.test.ts` (9 action tests) + `id.test.ts` (3 tests) → **36/36 tests pass**

### Trạng thái verify cuối

| Kiểm tra | Kết quả |
|---|---|
| `npx eslint .` | 0 errors, 0 warnings |
| `npx tsc --noEmit` | pass |
| `npm test` | 36/36 pass |
| `npm run build` | pass (dist + single-file + ZIP) |

## Đợt cải tiến tổng hợp ✅

Theo báo cáo kế hoạch 5 nhóm đã thống nhất (A–E). Dark mode (C3) được bỏ qua theo quyết định của user.

### A — Ổn định dữ liệu
- **Serialize ghi IndexedDB**: `queueSavePhotos()` trong `photoStorage.ts` nối tiếp các lần ghi, luôn persist ảnh mới nhất (tránh ghi chồng lỗi khi heart/fav/xóa liên tiếp). Store dùng `persistPhotos` gọi queue.
- **Validate schema khi import**: `store.ts` thêm các guard `isCoupleData`/`isAnniversary`/`isLetter`/`isWish`/`isPhoto`/`isDailyNote`; `importData` trả `boolean` để App báo "Tập tin sao lưu không hợp lệ" khi file lỗi.
- **Bắt lỗi quota localStorage**: các `save*` trong `storage.ts` trả `boolean`; store set `storageError` và App hiển thị toast cảnh báo (nút đóng qua `clearStorageError`).

### B — Hiệu năng
- **Gom selectors + `useShallow`**: `App.tsx` gom 7 data fields + 22 actions vào 2 `useShallow` selector (import từ `zustand/react/shallow`), giảm re-render không cần thiết.
- **Cô lập đồng hồ**: tạo `hooks/useNow.ts` (tick interval) thay `useState`+`setInterval` trong App; App dùng `useNow()`.

### C — UX / Tính năng
- **Notification reminder kỷ niệm**: `utils/notifications.ts` (`requestNotificationPermission`, `sendNotification`) + `hooks/useAnniversaryNotifications.ts` (gửi 1 lần/ngày/kỷ niệm, lưu ledger localStorage). Toggle trong `CoupleSettingsModal`; cờ `notificationsEnabled` thêm vào `CoupleData`.
- **Undo khi xóa**: store thêm `lastDeleted` + `undoDelete`/`clearLastDeleted`; các action `delete*` ghi item bị xóa; App hiển thị snackbar "Đã xóa — Hoàn tác" (auto-dismiss 6s).
- ~~Dark mode~~ — bỏ qua (phạm vi quá rộng, giữ giao diện sáng hiện tại).

### D — Chất lượng code
- **E2E test Playwright**: thêm `@playwright/test`, `playwright.config.ts`, `e2e/app.spec.ts` (4 test), script `test:e2e`.
- **Tách App.tsx**: tạo `components/DashboardTeasers.tsx` (3 teaser card Sự kiện/Album/Ước nguyện), App.tsx 654 → ~500 dòng.
- **A11y**: thêm `aria-label="Đóng"` cho các nút ✕ modal + `aria-label` cho nút xóa/yêu thích còn thiếu.

### E — Vận hành / Tooling
- **Clean cross-platform**: `scripts/clean.js` (Node `fs.rmSync`) thay `rm -rf`; script `clean` đổi thành `node scripts/clean.js`.
- **Fix PWA path**: `start_url`/`scope`/`id` đổi thành `./`, icon `src` bỏ leading slash (phù hợp `base: './'` khi deploy subpath); cập nhật `public/manifest.json` và regex inline trong `scripts/package.js`.

### Trạng thái verify đợt cải tiến

| Kiểm tra | Kết quả |
|---|---|
| `npx eslint .` | 0 errors, 0 warnings |
| `npx tsc --noEmit` | pass |
| `npm test` | 36/36 pass |
| `npx playwright test` | 4/4 pass |
| `npm run build` | pass (dist + single-file + ZIP) |

## Đợt hỗ trợ chạy trên iPhone (PWA + IPA) ✅

Theo yêu cầu "chạy được trên iPhone bằng file IPA". Chọn hướng chính là **PWA installable** (không cần IPA, chạy ngay qua Safari), đồng thời chuẩn bị **Capacitor + GitHub Actions macOS** để build IPA (sideload) khi cần.

### PWA installable trên iOS
- **Icon PNG cho iOS**: thêm `sharp` (devDependency) + `scripts/generate-icons.js` sinh `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` từ `public/icon.svg`. iOS không nhận apple-touch-icon dạng SVG → phải là PNG.
- **`index.html`**: thêm `viewport-fit=cover` + `maximum-scale=1` + `user-scalable=no`; `apple-mobile-web-app-status-bar-style=black-translucent`; `apple-touch-icon` trỏ `icon-180.png`; manifest/icon đổi sang đường dẫn relative (`./`) khớp `base: './'`.
- **Manifest** (`vite.config.ts` + `public/manifest.json`): icon chuyển sang PNG (any 192/512 + maskable 512).

### Capacitor → IPA
- Thêm `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`; `capacitor.config.ts` (`appId: com.choanhve.app`, `webDir: dist`).
- Scripts: `cap:sync`, `cap:add:ios`, `cap:open:ios`.
- `.github/workflows/build-ios.yml`: build IPA **unsigned** (sideload qua AltStore/Sideloadly) trên `macos-latest`; có bước ký tùy chọn nếu cấu hình secrets (`BUILD_CERTIFICATE_BASE64`, `P12_PASSWORD`, `KEYCHAIN_PASSWORD`, `PROVISIONING_PROFILE_BASE64`).
- `.gitignore`: thêm `ios/`, `android/`.

### Lưu ý cài đặt
- **PWA**: iPhone mở Safari → vào URL → Chia sẻ → "Thêm vào Màn hình chính". Chạy offline như app gốc.
- **IPA**: file `.ipa` unsigned chỉ cài qua sideload (AltStore, Sideloadly, hoặc jailbreak); muốn cài trực tiếp cần tài khoản Apple Developer (99 USD/năm) để ký + đóng gói qua TestFlight/App Store.

### Trạng thái verify đợt iPhone

| Kiểm tra | Kết quả |
|---|---|
| `npx eslint .` | 0 errors, 0 warnings |
| `npx tsc --noEmit` | pass |
| `npm test` | 36/36 pass |
| `npm run build` | pass (dist + single-file + ZIP, precache 17 entries) |

## File quan trọng

| File | Ghi chú |
|---|---|
| `package.json` | scripts (`lint`, `typecheck`, `test`, `format`), deps đã sửa |
| `src/store.ts` | Zustand store trung tâm; photos qua IndexedDB |
| `src/utils/dateUtils.ts` | `todayStr()`, `todayMonthStr()`, `pad2()`, `parseLocalDate()` |
| `src/utils/dateCalculations.ts` | đã dùng `parseLocalDate`; có tests |
| `src/utils/imageCompression.ts`, `src/utils/photoStorage.ts` | nén ảnh + IndexedDB |
| `src/components/ConfirmDialog.tsx`, `src/hooks/useConfirm.tsx` | replacement cho `confirm()` native (6 component) |
| `src/components/DailyNoteModal.tsx` | wrapper + `DailyNoteForm` (key-based remount) |
| `src/components/TodayDailyNoteCard.tsx` | đã bỏ prop `onAddOrUpdateNote` khỏi destructuring + interface |
| `src/App.tsx` | đã refactor dùng Zustand selectors |
| `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts` | tooling configs |
| `src/utils/*.test.ts` | 22 tests đang pass |
| `electron.cjs`, `metadata.json`, `.env.example` | đã sửa (security, bỏ Gemini) |
| `.github/workflows/ci.yml` | CI (lint + typecheck + test + build) |
| `src/utils/id.ts` | `newId()` dùng `crypto.randomUUID()` |
| `src/components/PhotoAddModal.tsx` / `PhotoCard.tsx` / `PhotoLightbox.tsx` | tách từ `PhotoAlbumSection` |
| `src/components/DailyNotesFilter.tsx` / `DailyNoteListItem.tsx` | tách từ `DailyNotesSection` |
| `src/store.test.ts` / `src/utils/id.test.ts` | 12 test store actions + id |
| `src/hooks/useNow.ts` | hook tick đồng hồ (interval) |
| `src/hooks/useAnniversaryNotifications.ts` | gửi notification kỷ niệm 1 lần/ngày |
| `src/utils/notifications.ts` | requestPermission + sendNotification |
| `src/components/DashboardTeasers.tsx` | 3 teaser card tách từ App.tsx |
| `scripts/clean.js` | clean build artifacts cross-platform |
| `playwright.config.ts` / `e2e/app.spec.ts` | E2E test Playwright |
| `public/icon-*.png` | icon PWA (sinh từ `npm run generate:icons`, cần sharp) |
| `scripts/generate-icons.js` | sinh icon PNG cho PWA/iOS từ icon.svg |
| `capacitor.config.ts` | cấu hình Capacitor (`webDir: dist`) — chỉ dùng local, không còn CI |
| `.github/workflows/build-ios.yml` | ~~build IPA unsigned trên macOS~~ — đã gỡ (xem "Chốt hướng: chỉ PWA") |

## Chốt hướng: iPhone chỉ dùng PWA (bỏ IPA) ✅

Theo yêu cầu "PWA thôi, không cần IPA":

- Gỡ `.github/workflows/build-ios.yml` — workflow này đỏ từ đầu (`npx cap add ios` báo Capacitor CLI cần Node ≥ 22 trong khi workflow pin Node 20) và không còn cần thiết.
- `capacitor.config.ts`, dependency `@capacitor/*` và script `cap:*` vẫn ở lại repo để mở Xcode build local khi cần, nhưng không còn bước CI IPA nào. `src/utils/device.ts:isCapacitor()` giữ nguyên (chỉ là feature detection, không tốn dependency runtime).
- Dọn `index.html`: bỏ link `/icons/apple-touch-icon-180.png` (404 trên Pages), bỏ `rel="manifest"` trùng (giữ `./manifest.json`, plugin PWA tự chèn `manifest.webmanifest`), gộp `apple-touch-icon` về một tag `sizes="180x180"`.
- Tài liệu cập nhật: `AGENTS.md` (mục Mobile), `PROJECT_OVERVIEW.md` (Mobile + mục Đóng gói).
