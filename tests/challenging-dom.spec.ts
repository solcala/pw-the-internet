import { test, expect } from '@fixtures';
import { TAGS } from '@config/test-tags';

test.describe('Challenging DOM', () => {
  test.beforeEach(async ({ challengingDomPage }) => {
    await challengingDomPage.open();
  });

  test.describe('Button interactions', () => {
    test(`updates action button label on click ${TAGS.SMOKE}`, async ({ challengingDomPage }) => {
      const initialLabel = (await challengingDomPage.firstActionButton.textContent()) ?? '';

      // Labels are random; the same value can repeat — retry clicks until it changes.
      await expect
        .poll(
          async () => {
            await challengingDomPage.clickFirstActionButton();
            return challengingDomPage.firstActionButton.textContent();
          },
          { timeout: 10_000 },
        )
        .not.toBe(initialLabel);
    });
  });

  test.describe('Table assertions', () => {
    test(`displays expected row data ${TAGS.REGRESSION}`, async ({ challengingDomPage }) => {
      await expect(challengingDomPage.tableRow(0)).toBeVisible();
      await expect(challengingDomPage.tableRow(0)).toContainText('Iuvaret0');
      await expect(challengingDomPage.tableRow(0)).toContainText('Apeirian0');
    });
  });

  test.describe('Canvas rendering', () => {
    test(`renders canvas element ${TAGS.REGRESSION}`, async ({ challengingDomPage }) => {
      await expect(challengingDomPage.canvas).toBeVisible();
    });
  });
});
