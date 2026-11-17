import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { layoutViewport } from './helpers';

const CAP = 300;

const groups = (page: Page) => page.locator('select-groups-example tx-select');
const panel = (page: Page) => page.locator('.cdk-overlay-container .tx-select__panel');
const rect = (locator: Locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON() as DOMRect);

async function openNear(page: Page, field: Locator, style: Record<string, string>): Promise<{ field: DOMRect; panel: DOMRect }> {
  await field.evaluate((element, values) => {
    Object.assign((element as HTMLElement).style, values);
    element.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -160);
  }, style);
  await field.locator('.tx-select__box').click();
  await expect(panel(page)).toBeVisible();
  await expect.poll(() => panel(page).evaluate((element) => element.getAnimations().length)).toBe(0);
  return { field: await rect(field.locator('.tx-select__box')), panel: await rect(panel(page)) };
}

test.beforeEach(async ({ page }) => {
  await page.goto('/components/select');
  await expect(page.locator('docs-example-frame').first()).toBeVisible();
});

test('a narrow select opens wider than its field, up to the cap, and keeps that width while filtering', async ({ page }) => {
  const { field, panel: box } = await openNear(page, groups(page), { width: '150px' });
  expect(box.width).toBeGreaterThan(field.width + 1);
  expect(box.width).toBeLessThanOrEqual(CAP);
  expect(Math.abs(box.left - field.left)).toBeLessThan(1);
  await page.keyboard.type('lisb');
  await expect(panel(page).getByRole('option')).toHaveCount(1);
  expect((await rect(panel(page))).width).toBeCloseTo(box.width, 0);
});

test('a field wider than the cap gives the panel its own width', async ({ page }) => {
  const { field, panel: box } = await openNear(page, groups(page), {});
  expect(field.width).toBeGreaterThan(CAP);
  expect(Math.abs(box.width - field.width)).toBeLessThan(1);
  expect(Math.abs(box.left - field.left)).toBeLessThan(1);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test('a select near the right edge opens inside the layout viewport, lined up with the end of its field', async ({ page }) => {
    const { field, panel: box } = await openNear(page, groups(page), { width: '140px', marginInlineStart: 'auto' });
    const viewport = await layoutViewport(page);
    expect(box.width).toBeGreaterThan(field.width + 1);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(viewport.width);
    expect(Math.abs(box.right - field.right)).toBeLessThan(1);
  });

  test('a panel wider than the screen shrinks to the screen minus its margins', async ({ page }) => {
    await page.addStyleTag({ content: '.tx-select__option-label { letter-spacing: 1em }' });
    const { panel: box } = await openNear(page, groups(page), { width: '140px', marginInlineStart: 'auto' });
    const viewport = await layoutViewport(page);
    expect(box.left).toBeGreaterThanOrEqual(8 - 0.5);
    expect(box.right).toBeLessThanOrEqual(viewport.width - 8 + 0.5);
    expect(box.width).toBeLessThanOrEqual(viewport.width - 16 + 0.5);
  });
});
