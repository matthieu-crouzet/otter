import {
  O3rElement,
} from '@o3r/testing/core';
import {
  expect,
  test,
} from '@playwright/test';
import {
  AppFixtureComponent,
} from '../../src/app/app.fixture';
import {
  TrainingFixtureComponent,
} from '../../src/components/training/training.fixture';

interface PageInformation {
  beforeNavigation?: () => Promise<void>;
  afterNavigation?: () => Promise<void>;
  url: string;
  screenshot: string;
}

test.describe.serial('Sanity test', () => {
  test('Visual comparison for each page', async ({ browserName, page }) => {
    await page.clock.install({ time: new Date('2000-01-01T00:00:00') });
    await page.goto(process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/');
    const appFixture = new AppFixtureComponent(new O3rElement({ element: page.locator('app-root'), page }));

    const pagesInformation: PageInformation[] = [
      { url: '**/home', screenshot: 'home.png' },
      { url: '**/run-app-locally', screenshot: 'run-app-locally.png', beforeNavigation: () => appFixture.navigateToRunAppLocally() },
      { url: '**/configuration', screenshot: 'configuration.png', beforeNavigation: () => appFixture.navigateToConfiguration() },
      { url: '**/localization', screenshot: 'localization.png', beforeNavigation: () => appFixture.navigateToLocalization() },
      { url: '**/dynamic-content', screenshot: 'dynamic-content.png', beforeNavigation: () => appFixture.navigateToDynamicContent() },
      { url: '**/rules-engine', screenshot: 'rules-engine.png', beforeNavigation: () => appFixture.navigateToRulesEngine() },
      { url: '**/component-replacement', screenshot: 'component-replacement.png', beforeNavigation: () => appFixture.navigateToComponentReplacement() },
      { url: '**/design-token', screenshot: 'design-token.png', beforeNavigation: () => appFixture.navigateToDesignToken() },
      { url: '**/sdk', screenshot: 'sdk-generator.png', beforeNavigation: () => appFixture.navigateToSDKGenerator(), afterNavigation: async () => {
        await page.waitForResponse('**/petstore3.swagger.io/**');
      } },
      { url: '**/placeholder', screenshot: 'placeholder.png', beforeNavigation: () => appFixture.navigateToPlaceholder() },
      { url: '**/sdk-intro', screenshot: 'sdk-intro.png', beforeNavigation: () => appFixture.navigateToSDKIntro() },
      { url: '**/sdk-training*', screenshot: 'sdk-training.png', beforeNavigation: () => appFixture.navigateToSDKTraining() },
      ...(Array.from({ length: 9 }).map((_, i) => ({
        url: `**/sdk-training#${i}`, screenshot: `sdk-training-step${i + 1}.png`, beforeNavigation: async () => {
          const trainingFixture = new TrainingFixtureComponent(new O3rElement({ element: page.locator('o3r-training'), page }));
          await trainingFixture.clickOnNextStep();
        }
      })))
    ];

    for (const { beforeNavigation, afterNavigation, url, screenshot } of pagesInformation) {
      if (beforeNavigation) {
        await beforeNavigation();
      }
      await page.waitForURL(url);
      if (afterNavigation) {
        await afterNavigation();
      }
      // Using `expect.soft` to not stop the test on the first screenshot failure
      await expect.soft(page).toHaveScreenshot([browserName, screenshot], { fullPage: true, mask: [page.locator('.visual-testing-ignore')] });
    }
  });
});
