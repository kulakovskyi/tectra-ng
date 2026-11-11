import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`app-layout-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('app layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/app-layout');
    await page.locator('main h1').first().waitFor();
  });

  test('the rail opens over the page on hover without moving it', async ({ page }) => {
    const root = example(page, 'rail');
    await root.scrollIntoViewIfNeeded();
    const sidebar = root.locator('aside');
    const content = root.locator('.tx-app-layout__content');
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(74);
    await expect(root.locator('tx-panel-menu')).toHaveClass(/tx-panel-menu--collapsed/);
    const before = (await box(content)).x;
    await sidebar.hover();
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(224);
    await expect(root.locator('tx-panel-menu')).not.toHaveClass(/tx-panel-menu--collapsed/);
    expect((await box(content)).x).toBe(before);
    await page.mouse.move(5, 5);
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(74);
  });

  test('after the pin is clicked the unpinned rail folds as soon as the pointer leaves', async ({ page }) => {
    const root = example(page, 'basic');
    const sidebar = root.locator('aside');
    await root.getByRole('button', { name: 'Let the menu fold' }).click();
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(224);
    await page.mouse.move(5, 5);
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(74);
  });

  test('keyboard focus opens the rail and leaving it folds it', async ({ page }) => {
    const root = example(page, 'rail');
    const sidebar = root.locator('aside');
    await root.locator('.tx-app-layout__brand').focus();
    await page.keyboard.press('Tab');
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(224);
    await root.getByRole('button', { name: 'Notifications' }).focus();
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(74);
  });

  test('the pin button folds the pinned sidebar and moves the page back', async ({ page }) => {
    const root = example(page, 'basic');
    const content = root.locator('.tx-app-layout__content');
    const anchor = root.getByRole('button', { name: 'Let the menu fold' });
    const pinned = (await box(content)).x;
    await anchor.click();
    await page.mouse.move(5, 5);
    await expect.poll(async () => (await box(content)).x).toBeLessThan(pinned - 100);
    await root.locator('aside').hover();
    await root.getByRole('button', { name: 'Keep the menu open' }).click();
    await expect.poll(async () => Math.round((await box(content)).x)).toBe(Math.round(pinned));
  });

  test('on a phone the menu button slides the menu in and a pick closes it', async ({ page }) => {
    const root = example(page, 'responsive');
    await root.scrollIntoViewIfNeeded();
    const button = root.locator('.tx-app-layout__menu-button');
    const sidebar = root.locator('aside');
    await expect(button).toBeVisible();
    await expect(sidebar).toHaveAttribute('inert', '');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(root.locator('.tx-app-layout__mask')).toBeVisible();
    await expect.poll(async () => (await box(sidebar)).x).toBeGreaterThanOrEqual((await box(root.locator('.screen'))).x - 1);
    await sidebar.locator('[role="treeitem"]', { hasText: 'Reports' }).click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(root.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await root.getByRole('tab', { name: 'Desktop' }).click();
    await expect(button).toBeHidden();
  });

  test('without the sidebar the brand sits in the top bar', async ({ page }) => {
    const root = example(page, 'plain');
    await expect(root.locator('aside')).toHaveCount(0);
    await expect(root.locator('.tx-app-layout__topbar .tx-app-layout__name')).toHaveText('Reports');
  });

  test('nested sections open like an accordion and the current item opens its parents', async ({ page }) => {
    const root = example(page, 'nested');
    const item = (label: string) => root.locator('aside [role="treeitem"]', { hasText: label }).first();
    await expect(item('Transfers')).toHaveAttribute('aria-current', 'page');
    await expect(item('Domains')).toHaveAttribute('aria-expanded', 'true');
    await expect(item('Reports')).toHaveAttribute('aria-expanded', 'false');
    await item('Reports').click();
    await expect(item('Reports')).toHaveAttribute('aria-expanded', 'true');
    await item('Revenue').click();
    await expect(item('Revenue')).toHaveAttribute('aria-current', 'page');
    await expect(root.getByRole('heading', { name: 'Revenue' })).toBeVisible();
    await expect(item('Domains')).toHaveAttribute('aria-expanded', 'false');
    await item('Domains').click();
    await item('DNS').click();
    await expect(item('Records')).toBeVisible();
  });

  test('a long menu scrolls inside the sidebar under a fixed header', async ({ page }) => {
    const root = example(page, 'long-menu');
    const menu = root.locator('.tx-app-layout__menu');
    const header = root.locator('.tx-app-layout__sidebar-header');
    const before = await box(header);
    expect(await menu.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await menu.evaluate((element) => element.scrollTo({ top: 400 }));
    await expect.poll(() => menu.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
    expect((await box(header)).y).toBe(before.y);
  });

  test('items keep their rows while the rail opens over nested sections', async ({ page }) => {
    const root = example(page, 'nested');
    await root.getByRole('button', { name: 'Let the menu fold' }).click();
    await page.mouse.move(5, 5);
    const sidebar = root.locator('aside');
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(74);
    await sidebar.evaluate((aside) => {
      const items = [...aside.querySelectorAll<HTMLElement>('[role="treeitem"]')];
      const tops = () => items.map((item) => Math.round(item.getBoundingClientRect().top));
      const start = tops().join();
      const state = window as unknown as { railFrames: boolean[] };
      state.railFrames = [];
      const begin = performance.now();
      const tick = () => {
        state.railFrames.push(tops().join() === start);
        if (performance.now() - begin < 450) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
    await sidebar.hover({ position: { x: 30, y: 300 } });
    await expect.poll(async () => Math.round((await box(sidebar)).width)).toBe(224);
    await page.waitForTimeout(200);
    const frames = await page.evaluate(() => (window as unknown as { railFrames: boolean[] }).railFrames);
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.every(Boolean)).toBe(true);
  });

  test('menu icons stand on the logo axis and stay put while the rail opens and folds', async ({ page }) => {
    const root = example(page, 'rail');
    await root.scrollIntoViewIfNeeded();
    const sidebar = root.locator('aside');
    const menu = root.locator('tx-panel-menu');
    await expect(menu).toHaveClass(/tx-panel-menu--collapsed/);
    const logo = await box(root.locator('.tx-app-layout__brand .tx-app-layout__logo'));
    const axis = logo.x + logo.width / 2;
    const centres = await menu.locator('.tx-panel-menu__icon').evaluateAll((icons) =>
      icons.filter((icon) => (icon as HTMLElement).offsetParent).map((icon) => icon.getBoundingClientRect().left + icon.getBoundingClientRect().width / 2),
    );
    expect(centres.length).toBeGreaterThan(3);
    for (const centre of centres) {
      expect(Math.abs(centre - axis)).toBeLessThanOrEqual(0.5);
    }
    const watch = () =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const icon = document.querySelector('app-layout-rail-example .tx-panel-menu__icon') as HTMLElement;
            const start = icon.getBoundingClientRect().left;
            let drift = 0;
            const began = performance.now();
            const tick = () => {
              drift = Math.max(drift, Math.abs(icon.getBoundingClientRect().left - start));
              if (performance.now() - began < 600) requestAnimationFrame(tick);
              else resolve(drift);
            };
            requestAnimationFrame(tick);
          }),
      );
    const rail = await box(sidebar);
    const opening = watch();
    await page.mouse.move(rail.x + 30, rail.y + 200);
    expect(await opening).toBeLessThanOrEqual(0.5);
    await expect(menu).not.toHaveClass(/tx-panel-menu--collapsed/);
    const folding = watch();
    await page.mouse.move(5, 5);
    expect(await folding).toBeLessThanOrEqual(0.5);
    await expect(menu).toHaveClass(/tx-panel-menu--collapsed/);
  });
});
