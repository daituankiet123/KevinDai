import { test, expect } from '@playwright/test';

const PWA_ASSETS = [
  'manifest.json',
  'manifest.webmanifest',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'sw.js',
  'registerSW.js',
];

test('all PWA assets resolve', async ({ request }) => {
  for (const asset of PWA_ASSETS) {
    const response = await request.get(`/${asset}`);
    expect(response.status(), asset).toBe(200);
  }
});

test('every manifest and apple-touch-icon link in the page resolves', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('link[rel="manifest"], link[rel="apple-touch-icon"]')
    .evaluateAll((els) => els.map((el) => (el as HTMLLinkElement).href));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});
