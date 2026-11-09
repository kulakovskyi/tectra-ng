import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`page-header-${id}-example`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('page header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/page-header');
    await page.locator('main h1').first().waitFor();
  });

  test('actions sit next to the title and wrap under it on a narrow screen', async ({ page }) => {
    const root = example(page, 'actions');
    const title = root.locator('.tx-page-header__title');
    const actions = root.locator('.tx-page-header__actions');
    const wideTitle = await box(title);
    expect((await box(actions)).x).toBeGreaterThan(wideTitle.x + wideTitle.width);

    await page.setViewportSize({ width: 420, height: 900 });
    await root.scrollIntoViewIfNeeded();
    const narrowTitle = await box(title);
    expect((await box(actions)).y).toBeGreaterThan(narrowTitle.y + narrowTitle.height);
  });

  test('a solid secondary action gets one card border that stays on hover, an outlined one keeps its own', async ({ page }) => {
    const root = example(page, 'actions');
    const look = (name: string) =>
      root.getByRole('button', { name }).evaluate((button) => {
        const style = getComputedStyle(button);
        const card = getComputedStyle(document.documentElement).getPropertyValue('--tx-surface-card').trim();
        const probe = document.createElement('div');
        probe.style.background = card;
        document.body.appendChild(probe);
        const cardColor = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const border = getComputedStyle(document.documentElement).getPropertyValue('--tx-surface-border').trim();
        probe.style.background = border;
        document.body.appendChild(probe);
        const borderColor = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return { background: style.backgroundColor, cardColor, borderColor, border: style.borderTopColor, shadow: style.boxShadow };
      });
    const back = await look('Back');
    expect(back.background).toBe(back.cardColor);
    expect(back.border).toBe(back.borderColor);
    expect(back.shadow).toBe('none');
    await root.getByRole('button', { name: 'Back' }).hover();
    await expect.poll(async () => (await look('Back')).border).toBe(back.borderColor);
    const download = await look('Download');
    expect(download.background).not.toBe(back.cardColor);
  });
});
