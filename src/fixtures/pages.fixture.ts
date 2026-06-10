import { test as base } from '@playwright/test';
import { AddRemoveElementsPage } from '@pages/the-internet/add-remove-elements.page';
import { LandingPage } from '@pages/the-internet/landing.page';

type PageFixtures = {
  landingPage: LandingPage;
  addRemoveElementsPage: AddRemoveElementsPage;
};

export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  addRemoveElementsPage: async ({ page }, use) => {
    await use(new AddRemoveElementsPage(page));
  },
});

export { expect } from '@playwright/test';
