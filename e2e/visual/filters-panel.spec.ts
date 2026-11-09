import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`filters-panel-${id}-example`);
const menu = (page: Page) => page.locator('.tx-filters-panel-menu');
const row = (page: Page, label: string) => menu(page).getByRole('menuitemcheckbox', { name: label });

test.describe('filters panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/filters-panel');
    await page.locator('main h1').first().waitFor();
    await page.evaluate(() => localStorage.clear());
  });

  test('the menu shows and hides fields and the choice survives a reload', async ({ page }) => {
    const root = example(page, 'customizable');
    await expect(root.locator('[txfilterfield="assignee"]')).toBeHidden();
    await root.getByRole('button', { name: /^Show filters/ }).click();
    await expect(menu(page)).toBeVisible();
    await expect(row(page, 'Status')).toHaveAttribute('aria-disabled', 'true');
    await row(page, 'Assignee').click();
    await row(page, 'Search').click();
    await expect(row(page, 'Assignee')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(root.locator('[txfilterfield="assignee"]')).toBeVisible();
    await expect(root.locator('[txfilterfield="search"]')).toBeHidden();

    await page.reload();
    const again = example(page, 'customizable');
    await expect(again.locator('[txfilterfield="assignee"]')).toBeVisible();
    await expect(again.locator('[txfilterfield="search"]')).toBeHidden();
    await again.getByRole('button', { name: 'Reset layout' }).click();
    await expect(again.locator('[txfilterfield="search"]')).toBeVisible();
  });

  test('dragging a row and Alt + arrows reorder the fields', async ({ page }) => {
    const root = example(page, 'customizable');
    const order = () => root.locator('.tx-filters-panel__fields > :not([hidden])').evaluateAll((nodes) =>
      nodes
        .map((node) => ({ key: node.getAttribute('txfilterfield'), left: node.getBoundingClientRect().left, top: node.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top || a.left - b.left)
        .map((node) => node.key),
    );
    await expect.poll(order).toEqual(['search', 'status', 'priority']);
    await root.getByRole('button', { name: /^Show filters/ }).click();
    const handle = menu(page).locator('.tx-filters-panel-menu__row').nth(2).locator('.tx-filters-panel-menu__handle');
    const target = menu(page).locator('.tx-filters-panel-menu__row').first();
    await handle.hover();
    const from = await handle.boundingBox();
    const to = await target.boundingBox();
    if (!from || !to) {
      throw new Error('menu is not visible');
    }
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2, to.y + 4, { steps: 8 });
    await page.mouse.move(from.x + from.width / 2, to.y + 2, { steps: 4 });
    await page.mouse.up();
    await expect.poll(order).toEqual(['priority', 'search', 'status']);

    await row(page, 'Status').focus();
    await page.keyboard.press('Alt+ArrowUp');
    await expect.poll(order).toEqual(['priority', 'status', 'search']);
    await expect(row(page, 'Status')).toBeFocused();
  });

  test('below 1024px the fields fold behind a button and an outside click closes them', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    const root = example(page, 'actions');
    await root.scrollIntoViewIfNeeded();
    const toggle = root.getByRole('button', { name: /Filters/ });
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText('1');
    await expect(root.locator('.tx-filters-panel__fields')).toBeHidden();
    await expect(root.locator('[txfiltersreset]')).toBeHidden();
    await expect(root.getByRole('button', { name: 'New invoice' })).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(root.locator('.tx-filters-panel__fields')).toBeVisible();
    await root.getByRole('combobox', { name: 'State' }).click();
    await page.getByRole('option', { name: 'Paid' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await root.locator('.tx-filters-panel__panel-footer').getByRole('button', { name: 'Clear filters' }).click();
    await expect(toggle).not.toContainText('1');

    await page.locator('main h1').first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(root.getByText('panel closed')).toBeVisible();
  });

  test('collapse="always" folds the fields on a wide screen too', async ({ page }) => {
    const root = example(page, 'mobile');
    const toggle = root.getByRole('button', { name: /Filters/ });
    await expect(toggle).toContainText('2');
    await expect(root.locator('.tx-filters-panel__fields')).toBeHidden();
    await toggle.click();
    await expect(root.locator('.tx-filters-panel__fields')).toBeVisible();
    const field = await root.locator('[txfilterfield="search"]').boundingBox();
    const input = await root.locator('#mobile-search').boundingBox();
    expect(Math.round(input?.width ?? 0)).toBe(Math.round(field?.width ?? -1));
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('the folded panel fades out on close instead of vanishing', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const root = example(page, 'mobile');
    const toggle = root.getByRole('button', { name: /Filters/ });
    const panel = root.locator('.tx-filters-panel__panel');
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
    const during = await root.locator('tx-filters-panel').evaluate(async (host) => {
      host.querySelector<HTMLButtonElement>('.tx-filters-panel__toggle')?.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const element = host.querySelector('.tx-filters-panel__panel') as HTMLElement;
      return { closing: host.classList.contains('tx-filters-panel--closing'), display: getComputedStyle(element).display, animations: element.getAnimations().length };
    });
    expect(during).toEqual({ closing: true, display: 'flex', animations: 1 });
    await expect(panel).toBeHidden();
    await expect(root.locator('tx-filters-panel')).not.toHaveClass(/tx-filters-panel--closing/);
  });

  test('busy turns the fields into skeletons of the same size', async ({ page }) => {
    const root = example(page, 'busy');
    const field = root.locator('[txfilterfield="zone"]');
    const shape = () =>
      field.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        control: element.lastElementChild?.getBoundingClientRect().height,
        skeleton: getComputedStyle(element, '::after').height,
        visibility: getComputedStyle(element.lastElementChild as Element).visibility,
      }));
    const before = await shape();
    expect(before.visibility).toBe('visible');
    await root.getByRole('button', { name: 'Reload' }).click();
    await expect(root.locator('tx-filters-panel')).toHaveAttribute('aria-busy', 'true');
    const during = await shape();
    expect(during.visibility).toBe('hidden');
    expect(during.height).toBe(before.height);
    expect(parseFloat(during.skeleton)).toBe(before.control);
    await expect(root.locator('tx-filters-panel')).not.toHaveAttribute('aria-busy', 'true');
  });
});
