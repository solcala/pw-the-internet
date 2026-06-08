import { expect, test } from '@playwright/test';
import { AddRemoveElementsPage } from '../pages/add-remove-elements.page';

test.describe('Smoke - The Internet', () => {
  test('adds and removes dynamic elements', async ({ page }) => {
    const addRemoveElementsPage = new AddRemoveElementsPage(page);

    await addRemoveElementsPage.goto();
    await addRemoveElementsPage.addElements(3);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);

    await addRemoveElementsPage.removeAllElements();
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
  });
});
