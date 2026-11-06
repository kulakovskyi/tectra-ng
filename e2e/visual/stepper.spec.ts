import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('stepper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/stepper');
    await page.locator('main h1').first().waitFor();
  });

  test('moves through the panels and colours the separator before the active step', async ({ page }) => {
    const frame = example(page, 'Basic');
    const tabs = frame.getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await frame.getByLabel('Workspace name').fill('Design');
    await frame.getByRole('button', { name: 'Next' }).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(frame.getByRole('tabpanel')).toHaveCount(1);
    const separator = frame.locator('.tx-stepper__separator').first();
    await expect(separator).toHaveCSS('height', '2px');
    const active = await frame.locator('.tx-step--active .tx-step__number').evaluate((node) => getComputedStyle(node).color);
    expect(await separator.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(active);
    await frame.getByRole('button', { name: 'Next' }).click();
    await expect(frame.getByText('Create Design')).toBeVisible();
  });

  test('keeps the header locked in linear mode', async ({ page }) => {
    const frame = example(page, 'Linear');
    const tabs = frame.getByRole('tab');
    await expect(tabs.nth(1)).toBeDisabled();
    const continueButton = frame.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();
    await frame.getByLabel('I accept the terms of service').check();
    await continueButton.click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.first()).toBeDisabled();
  });

  test('moves focus with the arrow keys and skips the disabled step', async ({ page }) => {
    const frame = example(page, 'Disabled step');
    const tabs = frame.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('opens the vertical panels under their step', async ({ page }) => {
    const frame = example(page, 'Vertical');
    const panels = frame.locator('tx-step-panel');
    const firstHeight = async () => (await panels.first().boundingBox())?.height ?? 0;
    expect(await firstHeight()).toBeGreaterThan(20);
    await frame.getByRole('button', { name: 'Next' }).click();
    await expect.poll(firstHeight).toBeLessThan(1);
    await expect.poll(async () => (await panels.nth(1).boundingBox())?.height ?? 0).toBeGreaterThan(20);
    const number = await frame.locator('.tx-step__number').first().boundingBox();
    const line = await frame.locator('.tx-step-panel__separator').first().boundingBox();
    const numberCenter = (number?.x ?? 0) + (number?.width ?? 0) / 2;
    const lineCenter = (line?.x ?? 0) + (line?.width ?? 0) / 2;
    expect(Math.abs(numberCenter - lineCenter)).toBeLessThan(1.5);
  });

  test('stacks the track in a column when it is narrow', async ({ page }) => {
    const frame = example(page, 'Track');
    const steps = frame.locator('tx-steps');
    const markers = steps.locator('.tx-steps__number');
    const wide = [await markers.nth(0).boundingBox(), await markers.nth(1).boundingBox()];
    expect(Math.abs((wide[0]?.y ?? 0) - (wide[1]?.y ?? 0))).toBeLessThan(1);
    await expect(steps.locator('.tx-steps__line').first()).toBeVisible();
    await steps.evaluate((node) => (node.style.width = '400px'));
    const narrow = [await markers.nth(0).boundingBox(), await markers.nth(1).boundingBox()];
    expect((narrow[1]?.y ?? 0) - (narrow[0]?.y ?? 0)).toBeGreaterThan(20);
    expect(Math.abs((narrow[0]?.x ?? 0) - (narrow[1]?.x ?? 0))).toBeLessThan(1);
    await expect(steps.locator('.tx-steps__line').first()).toBeHidden();
  });

  test('makes a clickable step current and runs its command', async ({ page }) => {
    const frame = example(page, 'Clickable steps');
    await frame.getByRole('button', { name: 'Seat' }).click();
    await expect(frame.getByText('Seat selection opened')).toBeVisible();
    await expect(frame.getByRole('button', { name: 'Seat' })).toHaveAttribute('aria-current', 'step');
    await expect(frame.getByRole('button', { name: 'Payment' })).toHaveCount(0);
  });
});
