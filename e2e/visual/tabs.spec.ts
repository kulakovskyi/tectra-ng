import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tabs');
    await page.locator('main h1').first().waitFor();
  });

  test('moves with the arrow keys and picks with Enter', async ({ page }) => {
    const frame = example(page, 'Basic');
    const tabs = frame.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('Enter');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(frame.getByText('Active: traffic · changes: 1')).toBeVisible();
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.first()).toBeFocused();
  });

  test('segmented tabs share the width of the track', async ({ page }) => {
    const tabs = example(page, 'Basic').getByRole('tab');
    const widths = await tabs.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  });

  test('draws the line bar under the active tab and slides it to the next one', async ({ page }) => {
    const frame = example(page, 'Variants');
    const list = frame.locator('tx-tab-list[data-variant="line"]');
    const bar = list.locator('.tx-tab-list__active-bar');
    const offset = async (name: string) => {
      const tab = await list.getByRole('tab', { name }).boundingBox();
      const box = await bar.boundingBox();
      return Math.max(
        Math.abs((box?.x ?? 0) - (tab?.x ?? 0)),
        Math.abs((box?.width ?? 0) - (tab?.width ?? 0)),
        Math.abs((box?.y ?? 0) + (box?.height ?? 0) - (tab?.y ?? 0) - (tab?.height ?? 0)),
      );
    };
    const check = (name: string) => expect.poll(() => offset(name)).toBeLessThan(1);
    await check('Week');
    await list.getByRole('tab', { name: 'Year' }).click();
    await check('Year');
  });

  test('scrolls the active tab into view and pages with the navigator buttons', async ({ page }) => {
    const list = example(page, 'Scrollable').locator('tx-tab-list[data-variant="line"]');
    const content = list.getByRole('tablist');
    const active = list.getByRole('tab', { name: 'Report 12' });
    const contentBox = await content.boundingBox();
    const activeBox = await active.boundingBox();
    expect(activeBox?.x ?? 0).toBeGreaterThanOrEqual(contentBox?.x ?? 0);
    expect((activeBox?.x ?? 0) + (activeBox?.width ?? 0)).toBeLessThanOrEqual((contentBox?.x ?? 0) + (contentBox?.width ?? 0) + 1);
    const previous = list.locator('.tx-tab-list__nav--previous');
    const next = list.locator('.tx-tab-list__nav--next');
    await expect(previous).toBeVisible();
    const before = await content.evaluate((element) => element.scrollLeft);
    await previous.click();
    await expect.poll(() => content.evaluate((element) => element.scrollLeft)).toBeLessThan(before);
    await expect(next).toBeVisible();
  });

  test('stacks vertical tabs and moves with Up / Down', async ({ page }) => {
    const tabs = example(page, 'Vertical').getByRole('tab');
    const boxes = await tabs.evaluateAll((items) => items.map((item) => item.getBoundingClientRect()));
    expect(Math.abs(boxes[1].x - boxes[0].x)).toBeLessThan(1);
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
    await tabs.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(tabs.nth(1)).toBeFocused();
  });

  test('skips disabled tabs', async ({ page }) => {
    const tabs = example(page, 'Disabled').getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(2)).toBeFocused();
    await tabs.nth(1).click({ force: true });
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  });
});
