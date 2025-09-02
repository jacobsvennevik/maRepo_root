import { test, expect } from '@playwright/test';

test('no /api/* from browser; only /backend/api/*', async ({ page }) => {
  const badCalls: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.origin.startsWith('http://localhost:3000') && url.pathname.startsWith('/api/')) {
      badCalls.push(url.toString());
    }
  });

  await page.goto('/login');
  await page.goto('/projects/727ba94c-7bc1-4be9-ad2c-2e2d092258f3');

  expect(badCalls, '❌ These calls must use /backend/api/*').toEqual([]);
});


