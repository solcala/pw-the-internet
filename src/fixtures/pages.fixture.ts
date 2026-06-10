import { test as base } from '@playwright/test';
import { AddRemoveElementsPage } from '@pages/the-internet/add-remove-elements.page';
import { ChallengingDomPage } from '@pages/the-internet/challenging-dom.page';
import { DynamicControlsPage } from '@pages/the-internet/dynamic-controls.page';
import { LandingPage } from '@pages/the-internet/landing.page';

type PageFixtures = {
  landingPage: LandingPage;
  addRemoveElementsPage: AddRemoveElementsPage;
  dynamicControlsPage: DynamicControlsPage;
  challengingDomPage: ChallengingDomPage;
};

export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  addRemoveElementsPage: async ({ page }, use) => {
    await use(new AddRemoveElementsPage(page));
  },
  dynamicControlsPage: async ({ page }, use) => {
    await use(new DynamicControlsPage(page));
  },
  challengingDomPage: async ({ page }, use) => {
    await use(new ChallengingDomPage(page));
  },
});

export { expect } from '@playwright/test';
