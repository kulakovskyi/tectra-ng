import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`console-layout-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('console layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/console-layout');
    await page.locator('main h1').first().waitFor();
  });

  test('rail sections switch the page and the crumbs, the header and rail stay while the page scrolls', async ({ page }) => {
    const root = example(page, 'basic');
    const rail = root.locator('tx-console-rail');
    await expect(rail.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    await rail.getByRole('button', { name: 'Domains' }).click();
    await expect(rail.getByRole('button', { name: 'Domains' })).toHaveAttribute('aria-current', 'page');
    await expect(root.locator('.tx-console-layout__crumb--current')).toHaveText('Domains');
    await expect(root.getByRole('heading', { name: 'Domains', level: 1 })).toBeVisible();

    const screen = root.locator('.screen');
    const header = root.locator('.tx-console-layout__header');
    const before = { header: await box(header), rail: await box(rail) };
    await screen.evaluate((element) => element.scrollTo({ top: 200 }));
    await expect.poll(async () => (await box(header)).y).toBeCloseTo(before.header.y, 0);
    expect((await box(rail)).y).toBeCloseTo(before.rail.y, 0);
  });

  test('router sections are links, the current one follows the address without scrolling the page', async ({ page }) => {
    const root = example(page, 'router');
    await root.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0);
    expect(before).toBeGreaterThan(100);
    await root.getByRole('link', { name: 'Workers' }).click();
    await expect(page).toHaveURL(/console=workers/);
    expect(Math.abs((await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)) - before)).toBeLessThan(2);
    await expect(page).toHaveURL(/console=workers/);
    await expect(root.getByRole('link', { name: 'Workers' })).toHaveAttribute('aria-current', 'page');
    await expect(root.locator('.tx-console-layout__crumb--current')).toHaveText('Workers');
  });

  test('a link to another docs page still opens it at the top', async ({ page }) => {
    await example(page, 'design-tokens').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href="/components/page-header"]')?.click());
    await expect(page).toHaveURL(/\/components\/page-header$/);
    await expect.poll(() => page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBeLessThan(2);
  });

  test('a panel moves the footer under its page and becomes a bar below 1024px', async ({ page }) => {
    const root = example(page, 'panel');
    await expect(root.locator('.tx-console-layout__footer')).toHaveCount(0);
    await expect(root.locator('tx-console-panel tx-app-footer')).toBeVisible();
    const aside = root.locator('tx-console-panel aside');
    const content = root.locator('.tx-console-panel__content');
    expect((await box(content)).x).toBeGreaterThan((await box(aside)).x + 200);

    await page.setViewportSize({ width: 900, height: 900 });
    await root.scrollIntoViewIfNeeded();
    expect((await box(content)).y).toBeGreaterThan((await box(aside)).y + (await box(aside)).height - 1);
  });

  test('below 768px the rail becomes a row under the header and the crumbs hide', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 900 });
    const root = example(page, 'basic');
    await root.scrollIntoViewIfNeeded();
    const header = await box(root.locator('.tx-console-layout__header'));
    const rail = await box(root.locator('tx-console-rail nav'));
    expect(rail.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
    expect(rail.width).toBeGreaterThan(rail.height);
    await expect(root.locator('.tx-console-layout__crumb').first()).toBeHidden();
  });

  test('without an app switcher the brand moves to the edge', async ({ page }) => {
    const withApps = example(page, 'basic');
    const withoutApps = example(page, 'router');
    const offset = async (root: Locator) => (await box(root.locator('.tx-console-layout__brand'))).x - (await box(root.locator('tx-console-layout'))).x;
    expect(await offset(withApps)).toBeGreaterThan(84);
    expect(Math.round(await offset(withoutApps))).toBe(21);
    await expect(withoutApps.locator('.tx-console-layout__apps')).toBeHidden();
  });

  test('the console follows its own width in the device frames', async ({ page }) => {
    const root = example(page, 'responsive');
    const rail = root.locator('tx-console-rail nav');
    const aside = root.locator('tx-console-panel aside');
    const content = root.locator('.tx-console-panel__content');
    await expect.poll(async () => (await box(rail)).width > (await box(rail)).height).toBe(true);
    await root.getByRole('tab', { name: 'Tablet' }).click();
    await expect.poll(async () => (await box(rail)).height > (await box(rail)).width).toBe(true);
    expect((await box(content)).y).toBeGreaterThan((await box(aside)).y + (await box(aside)).height - 1);
    await root.getByRole('tab', { name: 'Desktop' }).click();
    await expect.poll(async () => (await box(content)).x > (await box(aside)).x + 200).toBe(true);
    await root.locator('tx-console-panel [role="treeitem"]', { hasText: 'Blog' }).click();
    await expect(root.locator('.tx-console-layout__crumb--current')).toHaveText('Blog');
    await root.locator('tx-console-rail').getByRole('button', { name: 'Reports' }).click();
    await expect(root.locator('tx-console-panel')).toHaveCount(0);
    await expect(root.getByRole('status')).toContainText('Nothing in reports yet');
  });

  test('below 1024px the panel folds behind a button that opens and closes its list', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    const root = example(page, 'panel');
    await root.scrollIntoViewIfNeeded();
    const toggle = root.locator('.tx-console-panel__toggle');
    const shop = root.locator('tx-console-panel [role="treeitem"]', { hasText: 'Shop' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(shop).toBeHidden();
    await toggle.click();
    await expect(shop).toBeVisible();
    await expect(root.locator('tx-console-panel [role="treeitem"]', { hasText: 'Website' })).toHaveAttribute('aria-current', 'page');
    await shop.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(root.locator('.tx-console-layout__crumb--current')).toHaveText('Shop');
    await expect(shop).toHaveAttribute('aria-current', 'page');
    await toggle.click();
    await expect(shop).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});
