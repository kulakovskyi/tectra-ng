import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`empty-state-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/empty-state');
    await page.locator('main h1').first().waitFor();
  });

  test('the action fills the list and the empty state comes back once it is empty', async ({ page }) => {
    const root = example(page, 'basic');
    await expect(root.getByRole('status')).toContainText('No workers yet');
    await root.getByRole('button', { name: 'Create worker' }).click();
    await expect(root.getByRole('status')).toHaveCount(0);
    await expect(root.getByText('Worker 1')).toBeVisible();
    await root.getByRole('button', { name: 'Remove all' }).click();
    await expect(root.getByRole('status')).toContainText('No workers yet');
  });

  test('a search without results offers a way back', async ({ page }) => {
    const root = example(page, 'no-results');
    await expect(root.getByRole('status')).toContainText('Nothing matches “Paris”');
    await root.getByRole('button', { name: 'Clear search' }).click();
    await expect(root.getByRole('cell', { name: 'Kharkiv', exact: true }).first()).toBeVisible();
    await expect(root.getByRole('status')).toHaveCount(0);
  });

  test('compact puts the icon next to the text, large makes the icon bigger', async ({ page }) => {
    const states = example(page, 'sizes').locator('tx-empty-state');
    const compactIcon = await box(states.nth(0).locator('.tx-empty-state__icon'));
    const compactBody = await box(states.nth(0).locator('.tx-empty-state__body'));
    expect(compactBody.x).toBeGreaterThan(compactIcon.x + compactIcon.width);
    expect(Math.abs(compactBody.y + compactBody.height / 2 - (compactIcon.y + compactIcon.height / 2))).toBeLessThan(4);

    const normalIcon = await box(states.nth(1).locator('.tx-empty-state__icon'));
    const normalBody = await box(states.nth(1).locator('.tx-empty-state__body'));
    expect(normalBody.y).toBeGreaterThan(normalIcon.y + normalIcon.height);

    const largeIcon = await box(states.nth(2).locator('.tx-empty-state__icon'));
    expect(largeIcon.width).toBeGreaterThan(normalIcon.width);
    expect(compactIcon.width).toBeLessThan(normalIcon.width);
  });
});
