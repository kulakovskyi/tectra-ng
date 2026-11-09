import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`wizard-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/wizard');
    await page.locator('main h1').first().waitFor();
  });

  test('next and back move through the steps, the progress and the stage caption follow', async ({ page }) => {
    const root = example(page, 'basic');
    await root.scrollIntoViewIfNeeded();
    const segments = root.locator('.tx-wizard-progress__segment');
    await expect(segments.nth(0)).toHaveAttribute('aria-current', 'step');
    await expect(root.getByRole('button', { name: 'Back' })).toHaveCount(0);
    await root.getByRole('button', { name: 'Next' }).click();
    await expect(root.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    await expect(segments.nth(1)).toHaveAttribute('aria-current', 'step');
    await expect(root.locator('.tx-wizard-stage__number')).toHaveText('02');
    await root.getByLabel('Full name').fill('Olena Koval');
    await expect(root.locator('.tx-wizard-scene strong')).toHaveText('Olena Koval');
    await root.getByRole('button', { name: 'Next' }).click();
    await expect(root.getByRole('button', { name: 'Skip' })).toBeVisible();
    await root.getByRole('button', { name: 'Back' }).click();
    await expect(root.locator('tx-wizard-stage')).toHaveAttribute('data-direction', 'back');
    await expect(root.getByRole('heading', { name: 'Your profile' })).toBeVisible();
  });

  test('the finish shows a loading button and starts over', async ({ page }) => {
    const root = example(page, 'basic');
    for (let step = 0; step < 3; step++) {
      await root.locator('tx-wizard-footer button').last().click();
    }
    const finish = root.getByRole('button', { name: 'Finish' });
    await expect(finish).toBeVisible();
    await finish.click();
    await expect(finish).toHaveAttribute('aria-busy', 'true');
    await expect(root.getByRole('heading', { name: 'Welcome to Acme' })).toBeVisible({ timeout: 4000 });
  });

  test('the stage sits beside the step on a desktop and above it in the phone frame', async ({ page }) => {
    const basic = example(page, 'basic');
    const panel = await box(basic.locator('.tx-wizard-layout__panel'));
    const visual = await box(basic.locator('.tx-wizard-layout__visual'));
    expect(visual.x).toBeGreaterThan(panel.x + panel.width - 1);

    const responsive = example(page, 'responsive');
    await responsive.scrollIntoViewIfNeeded();
    const phonePanel = await box(responsive.locator('.tx-wizard-layout__panel'));
    const phoneVisual = await box(responsive.locator('.tx-wizard-layout__visual'));
    expect(phoneVisual.y + phoneVisual.height).toBeLessThanOrEqual(phonePanel.y + 1);
    await expect(responsive.locator('.tx-wizard-stage__caption')).toBeHidden();
    await responsive.getByRole('tab', { name: 'Desktop' }).click();
    await expect.poll(async () => (await box(responsive.locator('.tx-wizard-layout__visual'))).x > (await box(responsive.locator('.tx-wizard-layout__panel'))).x).toBe(true);
    await expect(responsive.locator('.tx-wizard-stage__caption')).toBeVisible();
  });
});
