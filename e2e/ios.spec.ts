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

test('saves a draft letter and filters it in the Nháp folder', async ({ page }) => {
  await page.getByRole('button', { name: 'Hộp thư' }).click();
  await page.getByRole('button', { name: 'Viết thư mới' }).click();
  await page.getByLabel('Tiêu đề').fill('Lá thư tự động tạo');
  await page.getByLabel('Lời thư').fill('Nội dung của lá thư tự động tạo');
  await page.getByRole('button', { name: 'Lưu nháp' }).click();
  await expect(page.getByText('Lá thư tự động tạo', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Đã gửi' }).click();
  await expect(page.getByText('Lá thư tự động tạo', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Nháp' }).click();
  await expect(page.getByText('Lá thư tự động tạo', { exact: true })).toBeVisible();
});
