import { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('public header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/public-header');
    await page.locator('main h1').first().waitFor();
  });

  test('stays on top of its scrolling page with everything in one row', async ({ page }) => {
    const root = page.locator('public-header-basic-example');
    const screen = root.locator('.screen');
    const bar = root.locator('.tx-public-header__bar');
    await expect(root.getByRole('button', { name: 'Open menu' })).toBeHidden();
    const before = await box(bar);
    expect(Math.round(before.height)).toBe(57);
    await screen.evaluate((element) => (element.scrollTop = 160));
    await expect.poll(async () => Math.round((await box(bar)).y - before.y)).toBe(0);
    const [link, prefs, action] = [await box(root.getByRole('link', { name: 'Pricing' })), await box(root.locator('tx-topbar-preferences')), await box(root.getByRole('button', { name: 'Get started' }))];
    expect(Math.abs(link.y + link.height / 2 - (prefs.y + prefs.height / 2))).toBeLessThan(2);
    expect(prefs.x).toBeLessThan(action.x);
    const signIn = await box(root.getByRole('button', { name: 'Sign in' }));
    expect(Math.round(action.x - (signIn.x + signIn.width))).toBe(7);
  });

  test('the burger panel fades out on close', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const root = page.locator('public-header-responsive-example');
    const panel = root.locator('.tx-public-header__panel');
    await root.getByRole('button', { name: 'Open menu' }).click();
    await expect(panel).toBeVisible();
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
    const during = await root.locator('tx-public-header').evaluate(async (host) => {
      host.querySelector<HTMLButtonElement>('.tx-public-header__toggle')?.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const element = host.querySelector('.tx-public-header__panel') as HTMLElement;
      return { closing: host.classList.contains('tx-public-header--closing'), display: getComputedStyle(element).display, animations: element.getAnimations().length };
    });
    expect(during).toEqual({ closing: true, display: 'flex', animations: 1 });
    await expect(panel).toBeHidden();
  });

  test('folds into a burger on a phone and closes on Escape', async ({ page }) => {
    const root = page.locator('public-header-responsive-example');
    const burger = root.getByRole('button', { name: 'Open menu' });
    await expect(burger).toBeVisible();
    await expect(root.getByRole('link', { name: 'Pricing' })).toBeHidden();
    await burger.click();
    const panel = root.locator('.tx-public-header__panel');
    await expect(panel).toBeVisible();
    await expect(root.locator('.tx-topbar-preferences__label')).toHaveText(['Language', 'Theme']);
    const [screen, action] = [await box(root.locator('.screen')), await box(root.getByRole('button', { name: 'Get started' }))];
    expect(action.width).toBeGreaterThan(screen.width - 60);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(root.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await root.getByRole('tab', { name: 'Desktop' }).click();
    await expect(root.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(root.getByRole('button', { name: 'Open menu' })).toBeHidden();
  });
});

test.describe('cookie notice', () => {
  test('hides on "Got it", stays hidden after a reload and comes back with show()', async ({ page }) => {
    await page.goto('/components/cookie-notice');
    const root = page.locator('cookie-notice-basic-example');
    const notice = root.getByRole('region', { name: 'Cookie notice' });
    await expect(notice).toBeVisible();
    const [frame, card] = [await box(root.locator('.screen')), await box(notice)];
    expect(Math.round(card.x - frame.x)).toBe(22);
    expect(Math.round(card.width)).toBe(336);
    await notice.getByRole('button', { name: 'Got it' }).click();
    await expect(notice).toHaveCount(0);
    await page.reload();
    await expect(root.getByRole('button', { name: 'Show the notice again' })).toBeVisible();
    await expect(notice).toHaveCount(0);
    await root.getByRole('button', { name: 'Show the notice again' }).click();
    await expect(notice).toBeVisible();
  });
});
