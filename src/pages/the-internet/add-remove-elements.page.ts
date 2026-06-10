import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class AddRemoveElementsPage extends BasePage {
  readonly addElementButton: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.addElementButton = page.getByRole('button', { name: 'Add Element' });
    this.deleteButtons = page.getByRole('button', { name: 'Delete' });
  }

  async open(): Promise<void> {
    await this.goto('/add_remove_elements/');
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
