import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { setDarkMode } from './helpers';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.beforeEach(async ({ page }) => {
  await page.goto('/components/color-picker');
  await page.locator('main h1').first().waitFor();
});

for (const mode of ['light', 'dark'] as const) {
  test(`open colour popover is accessible — ${mode}`, async ({ page }) => {
    if (mode === 'dark') {
      await setDarkMode(page);
    }
    await example(page, 'Presets').getByRole('button', { name: /^Label colour/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Label colour' });
    await expect(dialog).toBeVisible();
    const axe = await new AxeBuilder({ page }).include('.tx-color-picker__panel').analyze();
    expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical').map((violation) => violation.id)).toEqual([]);
  });
}

test('dragging the area and the hue changes the colour', async ({ page }) => {
  const frame = example(page, 'Inline');
  const area = frame.getByRole('slider', { name: 'Saturation and brightness' });
  const box = await area.boundingBox();
  if (!box) {
    throw new Error('no area');
  }
  await page.mouse.move(box.x + box.width - 2, box.y + 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect(area).toHaveAttribute('aria-valuetext', /Saturation (49|50|51)%, brightness (49|50|51)%/);
  const hue = frame.getByRole('slider', { name: 'Hue' });
  await hue.focus();
  await page.keyboard.press('Home');
  await expect(frame.getByRole('textbox', { name: 'Hex colour' })).toHaveValue(/^#[89][0-9a-f]{5}$/);
});

test('keyboard opens the popover, picks a preset and Escape returns focus', async ({ page }) => {
  const frame = example(page, 'Presets');
  const button = frame.getByRole('button', { name: /^Label colour/ });
  await button.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Label colour' });
  await expect(dialog.getByRole('slider', { name: 'Saturation and brightness' })).toBeFocused();
  await dialog.getByRole('button', { name: '#22c55e' }).click();
  await expect(dialog.getByRole('button', { name: '#22c55e' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(frame.getByText('Value: #22c55e')).toBeVisible();
});
