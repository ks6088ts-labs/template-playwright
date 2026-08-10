// spec: specs/playwright-website-basic-operations.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('Homepage loads with hero content', async ({ page }) => {
    // 1. Navigate to https://playwright.dev/
    await page.goto('https://playwright.dev/');
    await expect(page.getByRole('link', { name: 'Playwright logo Playwright' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Playwright enables reliable' })).toBeVisible();

    // 2. Observe the hero banner call-to-action area
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Star microsoft/playwright on' })).toBeVisible();
    // star count is dynamic; match any "Nk+ stargazers on GitHub" pattern
    await expect(page.getByRole('link', { name: /\d+k\+ stargazers on GitHub/i })).toBeVisible();

    // 3. Observe the language availability paragraph in the hero
    await expect(page.getByRole('link', { name: 'TypeScript' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Python' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: '.NET' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Java' })).toBeVisible();
  });
});
