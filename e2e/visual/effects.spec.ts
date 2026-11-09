import { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('confetti', () => {
  test('pieces land where they are told, around the middle of the box', async ({ page }) => {
    await page.goto('/components/confetti');
    const root = page.locator('confetti-basic-example tx-confetti');
    const frame = await box(root);
    const piece = await box(root.locator('.tx-confetti__piece').first());
    const centre = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
    expect(Math.round(piece.x + piece.width / 2 - centre.x)).toBeCloseTo(-150, -1);
    expect(Math.round(piece.y + piece.height / 2 - centre.y)).toBeCloseTo(-90, -1);
    await expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(await root.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe('none');
  });

  test('appears with a delay after the success state', async ({ page }) => {
    await page.goto('/components/confetti');
    const root = page.locator('confetti-with-delay-example');
    await root.getByRole('button', { name: 'Confirm e-mail' }).click();
    await expect(root.locator('tx-confetti')).toHaveCSS('--tx-confetti-delay', '380ms');
    await expect(root.locator('.tx-confetti__piece')).toHaveCount(10);
  });
});

test.describe('hover effect', () => {
  test('tilts towards the mouse and settles back', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/components/hover-effect');
    const root = page.locator('hover-effect-basic-example tx-hover-effect');
    const layer = root.locator('.tx-hover-effect__layer');
    const rect = await box(root);
    await page.mouse.move(rect.x + rect.width - 4, rect.y + 4, { steps: 6 });
    await expect.poll(() => layer.evaluate((element) => parseFloat(element.style.getPropertyValue('--tx-hover-effect-y')))).toBeGreaterThan(1);
    expect(await layer.evaluate((element) => parseFloat(element.style.getPropertyValue('--tx-hover-effect-x')))).toBeGreaterThan(0);
    await page.mouse.move(2, 2);
    await expect(layer).toHaveClass(/tx-hover-effect__layer--resting/);
    await expect.poll(() => layer.evaluate((element) => getComputedStyle(element).transform)).toBe('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -0.01, 0, 0, 0, 1)');
  });
});
