import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class DynamicControlsPage extends BasePage {
  readonly checkbox: Locator;
  readonly input: Locator;

  constructor(page: Page) {
    super(page);
    this.checkbox = page.getByRole('checkbox');
    this.input = page.getByRole('textbox');
  }

  async open(): Promise<void> {
    await this.goto('/dynamic_controls');
  }

  async removeCheckbox(): Promise<void> {
    await this.page.getByRole('button', { name: 'Remove' }).click();
  }

  async addCheckbox(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  async enableInput(): Promise<void> {
    await this.page.getByRole('button', { name: 'Enable' }).click();
  }

  async disableInput(): Promise<void> {
    await this.page.getByRole('button', { name: 'Disable' }).click();
  }
}
