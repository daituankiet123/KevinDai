import { chromium, devices } from '@playwright/test';

const URL = 'http://localhost:3000/?ios=1';
const OUT = 'C:/Users/Administrator/AppData/Local/Temp/opencode/ios-preview';

const iphone = devices['iPhone 14 Pro Max'];

const browser = await chromium.launch();
const context = await browser.newContext({ ...iphone });
const page = await context.newPage();

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// Tab countdown
await page.screenshot({ path: `${OUT}/1-countdown.png` });

// Tab notes
await page.getByRole('button', { name: 'Nhật ký', exact: true }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/2-notes.png` });

// Tab anniversaries
await page.getByRole('button', { name: 'Kỷ niệm', exact: true }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/3-anniversaries.png` });

// Tab album
await page.getByRole('button', { name: 'Album', exact: true }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/4-album.png` });

// Tab more
await page.getByRole('button', { name: 'Thêm', exact: true }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/5-more.png` });

// Open settings modal
await page.getByText('Cài đặt cặp đôi').click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/6-settings.png` });
await page.getByRole('button', { name: 'Đóng' }).click();
await page.waitForTimeout(400);

// Back to countdown, open note modal
await page.getByRole('button', { name: 'Đếm ngược', exact: true }).click();
await page.waitForTimeout(600);
await page.getByText('Viết nhật ký hôm nay').first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/7-note-modal.png` });

await browser.close();
console.log('done ->', OUT);
