import { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('preferences', () => {
  test('the theme button switches the page theme and its label', async ({ page }) => {
    await page.goto('/components/switch-theme');
    const button = page.locator('switch-theme-basic-example tx-switch-theme button');
    await expect(button).toHaveAccessibleName('Switch to dark theme');
    await button.click();
    await expect(page.locator('html')).toHaveAttribute('data-tx-theme', 'dark');
    await expect(button).toHaveAccessibleName('Switch to light theme');
    await expect(page.locator('switch-theme-basic-example .hint')).toHaveText('Now: dark');
    await expect(page.locator('html')).not.toHaveClass(/tx-theme-reveal/);
  });

  test('the language switch moves its thumb and sets the locale from the keyboard', async ({ page }) => {
    await page.goto('/components/switch-language');
    const root = page.locator('switch-language-basic-example');
    const english = root.getByRole('radio', { name: 'English' });
    await english.focus();
    await page.keyboard.press('ArrowRight');
    const ukrainian = root.getByRole('radio', { name: 'Українська' });
    await expect(ukrainian).toBeFocused();
    await expect(ukrainian).toHaveAttribute('aria-checked', 'true');
    await expect(root.getByRole('radiogroup')).toHaveAccessibleName('Мова');
    await expect(root.locator('.hint')).toContainText(/понеділок|вівторок|середа|четвер|пʼятниця|п’ятниця|субота|неділя/i);
    await expect.poll(async () => Math.round((await box(root.locator('.tx-switch-language__thumb'))).x - (await box(ukrainian)).x)).toBe(0);
  });

  test('the capsule keeps the controls at 31px with a 3px inset', async ({ page }) => {
    await page.goto('/components/topbar-preferences');
    const capsule = page.locator('topbar-preferences-basic-example .tx-topbar-preferences__capsule').first();
    const theme = capsule.locator('tx-switch-theme button');
    const group = capsule.getByRole('radiogroup');
    const [capsuleBox, themeBox, groupBox] = [await box(capsule), await box(theme), await box(group)];
    expect(Math.round(themeBox.height)).toBe(31);
    expect(Math.round(groupBox.height)).toBe(31);
    expect(Math.round(groupBox.x - capsuleBox.x)).toBe(3);
    expect(Math.round(capsuleBox.height)).toBe(37);
  });
});
