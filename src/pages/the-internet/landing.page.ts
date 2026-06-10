import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class LandingPage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly examplesHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome to the-internet' });
    this.examplesHeading = page.getByRole('heading', { name: 'Available Examples' });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  linkByName(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  async navigateToLink(name: string): Promise<void> {
    await this.linkByName(name).click();
  }
}
