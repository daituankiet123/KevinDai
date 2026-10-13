# Tiến độ dự án "Chờ Anh Về"

> Cập nhật: 13/10/2026

## Mục tiêu

Đánh giá và cải tiến dự án "Chờ Anh Về" (app React đếm ngược nghĩa vụ quân sự 2026–2028 + nhật ký tình yêu) theo kế hoạch nhiều giai đoạn đã thống nhất.

Hiện đã hoàn thành **Giai đoạn 4 (chất lượng & trải nghiệm)**. Toàn bộ 4 giai đoạn đều đã xong.

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

### Trạng thái verify cuối

| Kiểm tra | Kết quả |
|---|---|
| `npx eslint .` | 0 errors, 0 warnings |
| `npx tsc --noEmit` | pass |
| `npm test` | 22/22 pass |
| `npm run build` | pass (dist + single-file + ZIP) |

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
