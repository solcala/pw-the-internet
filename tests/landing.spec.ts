import { test, expect } from '@fixtures';
import { NAVIGATION_MAP } from '@data/navigation.map';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.open();
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/The Internet/);
  });

  test('Validate page content', async ({ landingPage }) => {
    await expect.soft(landingPage.welcomeHeading).toBeVisible();
    await expect.soft(landingPage.examplesHeading).toBeVisible();
  });

  test.describe('link navigation', () => {
    NAVIGATION_MAP.forEach(({ name, path }) => {
      test(`Validate navigation to ${name}`, async ({ page, landingPage }) => {
        await landingPage.navigateToLink(name);
        await expect(page).toHaveURL(new RegExp(`${path}`));
      });
    });
  });
});
