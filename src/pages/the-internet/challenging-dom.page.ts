import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ChallengingDomPage extends BasePage {
  readonly firstActionButton: Locator;
  readonly canvas: Locator;

  constructor(page: Page) {
    super(page);
    // SELECTOR EXCEPTION: demo uses random link text and UUID ids; scope to .example a.button.
    this.firstActionButton = page.locator('.example a.button').first();
    // SELECTOR EXCEPTION: canvas has no ARIA role or accessible name.
    this.canvas = page.locator('#canvas');
  }

  async open(): Promise<void> {
    await this.goto('/challenging_dom');
  }

  async clickFirstActionButton(): Promise<void> {
    await this.firstActionButton.click();
  }

  tableRow(rowIndex: number): Locator {
    return this.page.getByRole('row').filter({ hasText: `Iuvaret${rowIndex}` });
  }
}
