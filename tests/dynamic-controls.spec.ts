import { test, expect } from '@fixtures';
import { TAGS } from '@config/test-tags';

test.describe('Dynamic Controls', () => {
  test.beforeEach(async ({ dynamicControlsPage }) => {
    await dynamicControlsPage.open();
  });

  test.describe('Input enable/disable', () => {
    test(`enables input when Enable is clicked ${TAGS.SMOKE}`, async ({ dynamicControlsPage }) => {
      await dynamicControlsPage.enableInput();
      await expect(dynamicControlsPage.input).toBeEnabled();
    });

    test(`disables input when Disable is clicked ${TAGS.REGRESSION}`, async ({
      dynamicControlsPage,
    }) => {
      await dynamicControlsPage.enableInput();
      await dynamicControlsPage.disableInput();
      await expect(dynamicControlsPage.input).toBeDisabled();
    });
  });

  test.describe('Checkbox visibility', () => {
    test(`shows checkbox after Add is clicked ${TAGS.SMOKE}`, async ({ dynamicControlsPage }) => {
      await dynamicControlsPage.removeCheckbox();
      await expect(dynamicControlsPage.checkbox).toBeHidden();
      await dynamicControlsPage.addCheckbox();
      await expect(dynamicControlsPage.checkbox).toBeVisible();
    });

    test(`hides checkbox after Remove is clicked ${TAGS.REGRESSION}`, async ({
      dynamicControlsPage,
    }) => {
      await dynamicControlsPage.removeCheckbox();
      await expect(dynamicControlsPage.checkbox).toBeHidden();
    });
  });
});
