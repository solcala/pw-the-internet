import { expect, type Locator, type Page } from '@playwright/test';

export class AddRemoveElementsPage {
  readonly page: Page;
  readonly addElementButton: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addElementButton = page.getByRole('button', { name: 'Add Element' });
    this.deleteButtons = page.getByRole('button', { name: 'Delete' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/add_remove_elements/');
    await expect(this.addElementButton).toBeVisible();
  }

  async addElements(times: number): Promise<void> {
    for (let index = 0; index < times; index += 1) {
      await this.addElementButton.click();
    }
  }

  async removeAllElements(): Promise<void> {
    const totalDeleteButtons = await this.deleteButtons.count();

    for (let index = 0; index < totalDeleteButtons; index += 1) {
      await this.deleteButtons.first().click();
    }
  }
}
