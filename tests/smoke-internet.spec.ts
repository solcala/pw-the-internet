import { test, expect } from '@fixtures';

test.describe('Smoke - The Internet', () => {
  test('adds and removes dynamic elements', async ({ addRemoveElementsPage }) => {
    await addRemoveElementsPage.open();
    await addRemoveElementsPage.addElements(3);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);

    await addRemoveElementsPage.removeAllElements();
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
  });
});
