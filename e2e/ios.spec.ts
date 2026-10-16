import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?ios=1');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('opens the iOS stats screen and shows the note streak', async ({ page }) => {
  await page.getByRole('button', { name: 'Thêm' }).click();
  await page.getByRole('button', { name: 'Thống kê & Insights' }).click();
  await expect(page.getByText('chuỗi nhật ký liên tiếp')).toBeVisible();
  await expect(page.getByText('Tổng kết nhanh')).toBeVisible();
});

test('creates a share code on the iOS share screen', async ({ page }) => {
  await page.getByRole('button', { name: 'Thêm' }).click();
  await page.getByRole('button', { name: 'Chia sẻ dữ liệu' }).click();
  await page.getByRole('button', { name: 'Tạo mã chia sẻ' }).click();
  await expect(page.getByText('Mã chia sẻ', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mã chia sẻ', { exact: true })).toContainText('cav1-');
});
