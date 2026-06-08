import { test, expect } from '@playwright/test';
import { NAVIGATION_MAP } from '../utils/test-data';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

  })
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/The Internet/);
  });

  test('Validate page content', async ({ page }) => {
    await expect.soft(page.getByRole('heading', { name: "Welcome to the-internet" })).toBeVisible();
    await expect.soft(page.getByRole('heading', { name: 'Available Examples' })).toBeVisible();
  });

  test.describe('link navigation', () => {

    NAVIGATION_MAP.forEach(element => {
      const { name, path } = element;
      test(`Validate navigation to ${name}`, async ({ page }) => {
        await page.getByRole('link', { name: name }).click();
        await expect(page).toHaveURL(new RegExp(`${path}`));
      })

    })

  })
});
