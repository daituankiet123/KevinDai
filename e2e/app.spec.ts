import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the app title and countdown hero', async ({ page }) => {
  await expect(page.getByText('Chờ Anh Về').first()).toBeVisible();
  await expect(page.getByText('Ngày Còn Lại')).toBeVisible();
});

test('navigates between tabs', async ({ page }) => {
  await page.getByRole('button', { name: 'Album ảnh' }).click();
  await expect(page.getByText('Album Kỷ Niệm')).toBeVisible();
});

test('adds a wish', async ({ page }) => {
  await page.getByRole('button', { name: 'Ước nguyện' }).click();
  await expect(page.getByText('Ước Nguyện Khi Anh Về')).toBeVisible();
});

test('opens settings modal', async ({ page }) => {
  await page.getByTitle('Cài đặt đôi lứa & ngày nghĩa vụ').click();
  await expect(page.getByText('Cài Đặt Đôi Lứa & Lịch Nghĩa Vụ')).toBeVisible();
});
