import { test, expect } from '@fixtures';
import { TAGS } from '@config/test-tags';

test.describe('Add/Remove Elements', () => {
  test(`adds and removes dynamic elements ${TAGS.SMOKE}`, async ({ addRemoveElementsPage }) => {
    await addRemoveElementsPage.open();
    await addRemoveElementsPage.addElements(3);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);

    await addRemoveElementsPage.removeAllElements();
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
  });
});
