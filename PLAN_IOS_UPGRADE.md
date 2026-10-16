# Kế hoạch nâng cấp toàn diện giao diện iOS app "Chờ Anh Về"

> Bản kế hoạch chi tiết — đã khảo sát `src/components/ios/` + `src/index.css` + `package.json` + `capacitor.config.ts` + workflows. Phạm vi **chỉ giao diện iOS app**, **không động vào Desktop**.

## Bối cảnh

Người dùng muốn nâng cấp iOS app theo phong cách **Sweet & dreamy — nhiều gradient**, bổ sung 4 nhóm tính năng (album nâng cao, thư tình cải tiến, thống kê, đồng bộ & chia sẻ), mức refactor **có thận trọng** — được phép tách component, thêm field optional, refactor nội bộ section, **không đổi shape dữ liệu lưu** (giữ backward-compat cho cả localStorage lẫn IndexedDB).

### Hiện trạng rút gọn
- 21 file trong `src/components/ios/`, 6 file Tailwind utility trong `src/index.css`, 1 store trung tâm ở `src/store.ts`.
- Theme night đã vững: 7 token (`night`, `card`, `bar`, `line`, `ink`, `mute`, `rose`) + 5 accent qua `data-accent`.
- Kho animation đã có trong CSS nhưng **iOS chưa khai thác**: `heartBeatGlow`, `sparkleTwinkle`, `wobble`, `gentlePulse`, `gradientShift`, `floatHeartContinuous`, `shimmerText`, `gradient-text`, `glass-panel`, `animated-bg`, `floating-heart`.
- Khoảng trống UX lớn nhất:
  - Nền app phẳng — không có gradient/animation toàn cục.
  - 100% card dùng `bg-card` phẳng — không glass, không gradient, không glow.
  - Album ảnh iOS: 606 dòng, modal thêm ảnh **không nén** (Desktop thì có `compressImage`), **không confirm khi xóa**, **không slideshow thật**, **không tag filter**, edit caption bằng `window.prompt`.
  - Thư tình iOS: **không confirm khi xóa**, **không cho backdate**, **không folder draft/sent**, **không multi-photo**, **không mood filter**.
  - IosApp đang `useShallow` chọn ~20 actions → component cha render lại toàn bộ iOS shell khi bất kỳ action nào thay đổi identity.

## Mục tiêu

1. **Visual**: đưa gradient + glow + animation ngọt ngào đã có sẵn trong CSS vào iOS app; giữ tone night đặc trưng, không dark-mode lật.
2. **UX polish**: bổ sung confirm trước khi xoá ảnh/thư, slideshow thật, nén ảnh iOS, mood filter, backdate cho thư.
3. **Album nâng cao**: tag filter, slideshow tự động, multi-select, swipe-to-delete trong lightbox, EXIF date (nếu có).
4. **Thư tình cải tiến**: folder draft/sent, multi-photo gallery, mood filter, backdate, lock seal.
5. **Thống kê & insights**: streak ghi chú (đếm chuỗi ngày + lửa 🔥).
6. **Đồng bộ & chia sẻ**: share link 8 ký tự + QR code, Web Share API.
7. **Refactor có chọn lọc**: tách các iOS component lớn (>250 dòng) thành module con, giữ nguyên store.

## Không nằm trong phạm vi
- Không đụng vào `src/components/*.tsx` (Desktop).
- Không đổi `src/types.ts` field bắt buộc; chỉ **thêm field optional** + flag migration nếu cần.
- Không thêm cloud backend (Supabase/Firebase) — chỉ share-link peer-to-peer.
- Không thêm dark mode; không xoá theme accent hiện có.
- Không sửa Desktop build/single-file/Electron/zip.

---

## Tổng quan thay đổi (file-level)

### 1. Refactor nền tảng (Foundation)

| File | Hành động | Lý do |
|---|---|---|
| `src/index.css` | **Bổ sung** (không xoá): keyframe `roseFloat`, `softGlow`, `cardShine`; utility `.ios-card-gradient`, `.ios-pill`, `.ios-fab`; cập nhật `body.ios-app` thêm gradient nền tĩnh + lớp glow động. | Kho animation "kho báu" chưa dùng; nâng cấp 1 chỗ dùng được toàn app. |
| `src/components/ios/IosShell.tsx` | **Sửa nhẹ**: thêm nền gradient tĩnh (rose→violet→teal rất nhạt), tăng max-w từ 520 → 480 nếu mật độ hiển thị tốt hơn (giữ 520). | Bề mặt thị giác cần gradient để cảm giác dreamy. |
| `src/components/ios/EmptyState.tsx` (mới) | Tạo component dùng chung: icon + title + subtitle + CTA. | 7+ section đều tự dựng empty state riêng → không nhất quán. |
| `src/components/ios/IosToggle.tsx` (mới) | Trích từ `IosCoupleSettingsModal.tsx`: iOS-style switch 51×27. | Tái sử dụng cho MoreTab sau này + mọi nơi cần toggle. |
| `src/components/ios/IosField.tsx` (mới) | Input/Textarea/Select chuẩn iOS (label + helper + error). | Chuẩn hoá form. |
| `src/components/ios/SectionHeader.tsx` (mới) | Trích từ `IosApp.tsx` (đang là inline function). | Tái sử dụng cho mọi section. |
| `src/hooks/useIosConfirm.tsx` (mới) | Bản sao `useConfirm` nhưng dùng style iOS sheet (rose tone). | Hiện ConfirmDialog dùng theme sáng, iOS cần phiên bản dark. |
| `src/utils/photoShare.ts` (mới) | `navigator.share` fallback `clipboard.writeText` cho ảnh/text. | Tách logic share ra util. |
| `src/utils/qrCode.ts` (mới) | Tạo QR SVG bằng thuật toán tự code (≈80 dòng, không cần dep). | Tránh thêm `qrcode` package. |
| `src/utils/shareLink.ts` (mới) | Mã hoá/giải mã share-link: payload → chuỗi base64url + checksum 8 ký tự, nén gzip dùng `CompressionStream` (native). | Share link 8 ký tự + QR. |
| `src/utils/stats.ts` (mới) | `computeNoteStreak(notes)`, `computeMoodByMonth(notes)`. | Tách logic thống kê. |
| `src/utils/dateUtils.ts` | **Bổ sung** `daysBetween(a, b)`, `isSameDay(a, b)` — tiện cho streak. | Nhỏ, an toàn. |

### 2. Album ảnh iOS (`IosPhotoAlbumSection.tsx`)

| Hành động | Chi tiết |
|---|---|
| **Tách** `IosPhotoViewer` (~280 dòng inline) → `IosPhotoViewer.tsx`. | Tái sử dụng được + dễ test. |
| **Tạo** `IosPhotoGrid.tsx` — render grid 2 cột + empty state + tag filter chips + search. | Section chính gọn lại ~150 dòng. |
| **Tạo** `IosAddPhotoSheet.tsx` — bottom sheet thêm ảnh. | Dùng `compressImage` (đã có ở Desktop), thêm tag select + hearts mặc định. |
| **Tạo** `IosSlideshow.tsx` — overlay tự động next 4s, có progress bar + nút pause. | Tận dụng prop `isSlideshow` đã có sẵn trong `PhotoLightbox`; ta không dùng chung Desktop, mà tự viết bản gọn cho iOS. |
| **Confirm xoá**: dùng `useIosConfirm`. | Thay vì xoá thẳng. |
| **Edit caption**: thay `window.prompt` bằng modal iOS sheet. | Native prompt cảm giác rẻ tiền. |
| **Tag filter chips** ngay dưới search: lấy từ `PHOTO_TAG_OPTIONS` (constants). | Đồng nhất với Desktop. |
| **Nén ảnh** trước khi lưu (dùng `compressImage` có sẵn). | iOS hiện không nén → tốn IndexedDB. |
| **Swipe ngang trong lightbox**: dùng `pointerdown/move/up` (đã có touch start/move cho pan; tách riêng). | Cải thiện điều hướng. |
| **Web Share** từ lightbox: nút `↗` mở `navigator.share({title, url, text})`. | Tận dụng native iOS share sheet. |
| **Streak ảnh / tổng kết** nhỏ trên header (n ảnh · ❤️ tổng · 🔥 chuỗi). | Dùng `stats.ts`. |

### 3. Thư tình iOS (`IosLoveLettersSection.tsx`)

| Hành động | Chi tiết |
|---|---|
| **Tách** Add/Edit modal inline (~95 dòng) → `IosLetterEditor.tsx`. | Tái sử dụng. |
| **Confirm xoá** bằng `useIosConfirm`. | |
| **Mood filter chips** trên đầu list: 6 mood (`miss/love/proud/sweet/waiting/hug`) + "Tất cả". | Trước đây không có. |
| **Backdate**: thêm field "Ngày viết" cho phép chọn ngày trong quá khứ. | Hiện cứng = `new Date().toISOString()`. |
| **Multi-photo**: đổi `photoUrl?: string` (đang có) thành `photoUrls?: string[]` (optional mới). | Backward-compat: nếu ảnh cũ có `photoUrl` thì vẫn đọc được. |
| **Folder draft/sent**: 2 tab con phía trên list. Khi lưu từ editor mà chưa "gửi" thì ở draft, nếu chọn "Gửi" thì chuyển sent + set `sentAt`. | Thêm field optional `status: 'draft' \| 'sent'`, `sentAt?: string`. |
| **Lock seal**: thư đã gửi có icon 🔒 + không cho edit, chỉ xem. | |
| **Random reveal** với hiệu ứng "rút thăm" + animation ngẫu nhiên giữa các thư. | Tận dụng `confetti` có sẵn. |
| **Header stats** (tổng thư · đã gửi · nháp · top mood). | Tính bằng `useMemo`. |

### 4. Thống kê — tab "Thêm" (`MoreTab.tsx` + `IosApp.tsx`)

| Hành động | Chi tiết |
|---|---|
| Thêm 1 ListRow "Thống kê & Insights" trong MoreTab. Mở `IosStatsScreen.tsx` (mới). | |
| Trong `IosStatsScreen.tsx`: streak ghi chú (đếm chuỗi ngày liên tục + emoji 🔥), biểu đồ cột mood theo tháng (dùng SVG inline gradient), tổng kết nhanh (tổng thư, tổng ảnh, tổng tim). | |
| Nếu thiếu thời gian có thể lược bỏ biểu đồ mood — **streak là priority duy nhất** theo lựa chọn của user. | Giữ scope. |

### 5. Đồng bộ & chia sẻ

| Hành động | Chi tiết |
|---|---|
| **Thêm mục "Chia sẻ dữ liệu"** trong `IosCoupleSettingsModal.tsx`. | Nơi user phát sinh share link. |
| **Tạo share link**: bấm → sinh mã 8 ký tự từ `shareLink.ts` (mã hoá JSON backup + checksum). Hiển thị QR SVG (tự code, không cần dep). Nút "Sao chép link" + nút "Chia sẻ qua..." dùng `navigator.share`. | |
| **Import từ link**: mục "Dán link đã nhận" trong cùng section → giải mã → gọi `importData` (đã có sẵn). | |
| **Web Share API cho từng item** (ảnh/thư): nút ↗ ở lightbox ảnh + ở card thư. | Tận dụng native iOS share. |
| **KHÔNG thêm Supabase/cloud**. | Theo lựa chọn user. |

### 6. Tiểu tiết UI/UX

- **Nút + tròn** trong mỗi section chuẩn hoá thành **FAB iOS** dùng class `bottom-fab` (đã có sẵn trong CSS) — hiện đang là nút tròn ở header, chuyển về góc phải dưới để đúng pattern iOS.
- **Action dạng text underline** ("Sửa", "Xoá") trong Anniversaries/DailyNotes → đổi sang icon với nhãn ngắn.
- **Helper text `text-[9px]`** trong Mood chip của `IosDailyNoteModal` → nâng 11px.
- **Animation entrance** cho mỗi section khi mount: dùng `animate-pop-in` đã có sẵn.
- **Countdown hero**: thêm `shadow-[0_0_24px_-6px] shadow-rose/30` quanh 4 ô, shimmer chạy ngang progress bar.
- **Nền app** thêm 3 lớp glow blob (rose/violet/amber) rất nhạt, có animation `blobFloat` đã có sẵn.

### 7. Animation & gradient audit

- Áp dụng `animate-heart-glow` cho nút "💕" quick stats ở IosCountdownHero.
- Áp dụng `animate-sparkle` cho emoji 🌸/💖 ở header.
- Dùng `gradient-text` cho quote ở `IosDailyLoveNote`.
- Dùng `font-script` (Dancing Script) cho quote ở `IosDailyLoveNote` + lời chúc sinh nhật.
- Card list: thêm lớp `bg-gradient-to-br from-card via-card to-bar/60` thay vì `bg-card` phẳng.

---

## File cần tạo mới

```
src/components/ios/
├── EmptyState.tsx
├── IosToggle.tsx
├── IosField.tsx
├── SectionHeader.tsx
├── IosPhotoViewer.tsx         (tách từ IosPhotoAlbumSection)
├── IosPhotoGrid.tsx           (tách từ IosPhotoAlbumSection)
├── IosAddPhotoSheet.tsx       (tách từ IosPhotoAlbumSection)
├── IosSlideshow.tsx           (tách overlay slideshow)
├── IosLetterEditor.tsx        (tách từ IosLoveLettersSection)
├── IosStatsScreen.tsx         (mới)
└── IosShareScreen.tsx         (mới - QR + share link)

src/hooks/
└── useIosConfirm.tsx          (mới - iOS dark sheet)

src/utils/
├── photoShare.ts              (mới)
├── qrCode.ts                  (mới - thuật toán tự code, không dep)
├── shareLink.ts               (mới - mã hoá/giải mã + checksum)
└── stats.ts                   (mới - streak + mood count)
```

## File cần sửa (giữ tương thích)

```
src/index.css                 # thêm keyframes/utility iOS
src/utils/dateUtils.ts        # thêm daysBetween, isSameDay
src/components/ios/IosShell.tsx
src/components/ios/IosApp.tsx           # dùng SectionHeader, useIosConfirm, route ShareScreen/StatsScreen
src/components/ios/IosCoupleSettingsModal.tsx  # thêm mục Chia sẻ + dùng IosToggle
src/components/ios/MoreTab.tsx          # thêm 2 row mới
src/components/ios/IosCountdownHero.tsx # thêm glow + shimmer + script font
src/components/ios/IosDailyLoveNote.tsx # gradient-text + script font
src/components/ios/IosAnniversariesSection.tsx  # dùng EmptyState + icon actions
src/components/ios/IosDailyNotesSection.tsx     # dùng EmptyState + thống nhất modal editor
src/components/ios/IosDailyNoteModal.tsx # text-[9px] → 11px; polish
src/components/ios/IosWishListSection.tsx       # dùng EmptyState
src/components/ios/IosPhotoAlbumSection.tsx     # chỉ điều phối sau khi tách
src/components/ios/IosLoveLettersSection.tsx    # chỉ điều phối sau khi tách
src/components/ios/ListGroup.tsx       # polish hover/active
```

## File KHÔNG đụng
- `src/components/*.tsx` (Desktop) — giữ nguyên.
- `src/store.ts` — chỉ đọc, không sửa.
- `src/types.ts` — không thêm field bắt buộc; nếu cần multi-photo trong `LoveLetter` thì thêm field optional `photoUrls?: string[]` (giữ `photoUrl?` cũ).
- `vite.config.ts`, `capacitor.config.ts`, `.github/workflows/*` — không đụng.
- `src/utils/storage.ts`, `src/utils/photoStorage.ts` — không đụng (dữ liệu cũ phải tương thích ngược).

---

## Migration / Backward-compat

1. **Multi-photo thư**: mở rộng `LoveLetter`:
   ```ts
   // src/types.ts - thêm optional, KHÔNG xoá photoUrl cũ
   export interface LoveLetter {
     // ... các field cũ
     photoUrl?: string;            // (cũ - giữ nguyên)
     photoUrls?: string[];         // (mới - ưu tiên nếu có)
     status?: 'draft' | 'sent';    // (mới - mặc định 'sent' nếu undefined)
     sentAt?: string;              // (mới)
   }
   ```
   Khi đọc, fallback `photoUrls ?? (photoUrl ? [photoUrl] : [])`.

2. **Share link**: thêm key localStorage `love_soldier_share_history_v1` (mảng các link đã tạo, có thời hạn 30 ngày). KHÔNG can thiệp vào schema lưu hiện hành.

3. **Không có migration data nào khác** — chỉ thêm field optional.

---

## Trình tự triển khai (gợi ý 1–2 tuần, mỗi phase có thể commit)

**Phase A — Foundation (ngày 1)**
- Thêm keyframes/utility vào `src/index.css`.
- Tạo `EmptyState`, `IosToggle`, `IosField`, `SectionHeader`, `useIosConfirm`.
- Tạo `utils/photoShare.ts`, `utils/shareLink.ts`, `utils/qrCode.ts`, `utils/stats.ts`.
- Cập nhật `IosShell` thêm gradient nền + glow blob.

**Phase B — Album ảnh (ngày 2–3)**
- Tách `IosPhotoViewer` / `IosPhotoGrid` / `IosAddPhotoSheet` / `IosSlideshow`.
- Áp `compressImage` cho upload.
- Thêm confirm xoá, edit caption modal, tag filter chips, multi-select.
- Web Share cho ảnh.
- Slideshow thật (timer 4s + progress bar).

**Phase C — Thư tình (ngày 4)**
- Tách `IosLetterEditor`.
- Thêm mood filter chips, backdate, multi-photo, folder draft/sent, lock seal.
- Random reveal với confetti.
- Confirm xoá.

**Phase D — Thống kê + Chia sẻ (ngày 5)**
- `IosStatsScreen` với streak + biểu đồ mood + tổng kết.
- `IosShareScreen` với QR + share link + import link.
- Thêm 2 row trong `MoreTab` + cập nhật `IosCoupleSettingsModal`.
- Update `IosApp.tsx` route.

**Phase E — Polish & a11y (ngày 6)**
- Áp animation: `heart-glow`, `sparkle`, `wobble`, `gradient-text` cho quote.
- Countdown hero glow/shimmer.
- FAB dùng `bottom-fab`.
- Helper text 9px → 11px.
- Icon cho action "Sửa/Xoá".
- ARIA label cho mọi button icon (theo AGENTS.md).

**Phase F — Verify (ngày 7)**
- `npm run typecheck` ✅
- `npx eslint .` ✅ 0/0
- `npm test` ✅ ≥ 36/36
- `npm run test:e2e` ✅ ≥ 4/4
- `npm run build` ✅
- Test thủ công: PWA install giả lập + add ảnh mới + tạo thư + share QR.

---

## Hàm chính cần viết (signature)

```ts
// src/utils/stats.ts
export function computeNoteStreak(notes: DailyNote[], today: Date): number;
export function computeMoodByMonth(notes: DailyNote[]): Array<{ym: string; counts: Record<DailyNoteMood, number>}>;
export function computeTotalStats(state: {photos, letters, dailyNotes}): {photos, letters, notes, hearts};

// src/utils/shareLink.ts
export function encodeShareLink(payload: unknown): Promise<string>; // base64url + checksum
export function decodeShareLink(token: string): Promise<unknown | null>;
export function makeChecksum(data: string): string; // 8 ký tự hex

// src/utils/qrCode.ts
export function makeQrSvg(data: string, size?: number): string; // SVG path chuẩn QR

// src/hooks/useIosConfirm.tsx
export function useIosConfirm(): { confirm: (opts) => Promise<boolean>; ConfirmDialogElement };

// src/utils/photoShare.ts
export async function sharePhoto(photo: CouplePhoto): Promise<boolean>; // navigator.share hoặc fallback
```

## Verify (cách kiểm thử cuối)

1. **typecheck**: `npm run typecheck` — 0 error.
2. **lint**: `npx eslint .` — 0/0.
3. **unit**: `npm test` — ≥ 36/36 (có thể thêm 2–4 test cho `stats.ts`, `shareLink.ts`).
4. **e2e**: `npm run test:e2e` — ≥ 4/4; nếu cần thêm test mới thì thêm 1 spec cho "mở IosStatsScreen, thấy streak" và 1 spec cho "tạo share link, quét QR".
5. **build**: `npm run build` — ra `dist/`, `dist-singlefile/`, ZIP.
6. **smoke test** trên thiết bị thật: cài PWA vào iPhone, thử:
   - Mở Album → upload 1 ảnh (kiểm tra nén + lưu IndexedDB).
   - Mở lightbox → zoom 2 ngón, xoay, prev/next.
   - Bấm nút Slideshow ▶ → tự chuyển ảnh sau 4s.
   - Mở Thư tình → viết thư mới, đính 2 ảnh, chọn backdate 29/08/2024.
   - Mở Thống kê → thấy streak hiện tại.
   - Mở Chia sẻ → sinh link 8 ký tự → quét QR bằng iPhone thứ 2 → nhập link → dữ liệu hiện ra.

## Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Tách component lớn (`IosPhotoAlbumSection`) có thể vỡ logic zoom/pan cũ | Giữ nguyên thuật toán touch/mouse; copy-paste sang file mới rồi mới polish. |
| Thêm field optional vào `LoveLetter` có thể ảnh hưởng test e2e Desktop | Chỉ thêm optional, không sửa logic Desktop; chạy lại e2e Desktop để xác nhận. |
| Tự code QR có thể tạo ảnh quá phức tạp | Dùng QR version 3–5 (chứa ~50–100 byte), kiểm thử bằng cách quét bằng Camera iPhone. |
| Share link base64url có thể dài > 500 ký tự → QR dày | Nén qua `CompressionStream` gzip native trước khi base64; chia sẻ text thay vì QR nếu payload > 1KB. |
| Tăng animation có thể làm giảm FPS trên iPhone cũ | Dùng `transform`/`opacity` (composite layer) thay vì `width`/`height`; giữ `will-change` ở lightbox ảnh. |
| Nền gradient toàn app có thể gây burn-in OLED | Tắt animation nếu `prefers-reduced-motion: reduce`. |

## Tiêu chí hoàn thành

- [ ] Mọi file mới có JSDoc ngắn.
- [ ] ESLint + TypeScript pass sạch.
- [ ] Không có `console.log` rác (theo AGENTS.md).
- [ ] Mọi button icon có `aria-label` (theo AGENTS.md).
- [ ] Không thêm comment thừa (theo AGENTS.md).
- [ ] Data mẫu ngày luôn qua `dateUtils.ts` (theo AGENTS.md).
- [ ] PWA build vẫn installable + ZIP portable.
- [ ] iOS test thật (nếu có máy) hoặc qua `?ios=1` trên Safari.
