import { expect, test } from '@playwright/test';

test('select panel is opaque and selects with the keyboard', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.locator('tx-select .tx-select__trigger').first();
  await trigger.click();
  const panel = page.locator('.tx-select__panel');
  await expect(panel).toBeVisible();
  const background = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Lviv');
});

test('example code opens without moving the preview', async ({ page }) => {
  await page.goto('/components/button');
  const example = page.locator('docs-example-frame').first();
  const preview = example.locator('.example__preview');
  const before = await preview.boundingBox();
  await example.getByRole('button', { name: 'Show code' }).click();
  await expect(example.locator('.example__code')).toHaveClass(/example__code--open/);
  await expect(example.locator('pre')).toBeVisible();
  expect(await preview.boundingBox()).toEqual(before);
});

test('navigation keeps the page heading in place', async ({ page }) => {
  await page.goto('/components/button');
  const heading = page.locator('main h1');
  const start = await heading.boundingBox();
  for (const link of ['Select', 'Installation', 'Badge']) {
    await page.getByRole('link', { name: link, exact: true }).first().click();
    await expect(heading).toHaveText(link);
    await page.waitForTimeout(300);
    const box = await heading.boundingBox();
    expect(Math.round(box?.y ?? 0)).toBe(Math.round(start?.y ?? 0));
  }
});

test('icon-only buttons are square', async ({ page }) => {
  await page.goto('/components/button');
  const sizes = await page.locator('.tx-button--icon-only').evaluateAll((buttons) =>
    buttons.map((button) => ({ width: Math.round(button.getBoundingClientRect().width), height: Math.round(button.getBoundingClientRect().height) })),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width).toBe(size.height);
  }
});

test('theme toggle switches to dark', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-tx-theme', 'dark');
});

test('overlay opens on the asked side and closes on Escape', async ({ page }) => {
  await page.goto('/core/overlay');
  const origin = page.getByRole('button', { name: 'top', exact: true });
  await origin.click();
  const panel = page.locator('.tx-overlay-pane .panel');
  await expect(panel).toHaveAttribute('data-placement', 'top');
  const originBox = await origin.boundingBox();
  const panelBox = await panel.boundingBox();
  expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeLessThanOrEqual(originBox?.y ?? 0);
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.getByText('Last close:')).toContainText('escape');
});

test('overlay flips when there is no room', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 520 });
  await page.goto('/core/overlay');
  const origin = page.getByRole('button', { name: 'top', exact: true });
  await origin.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 24));
  await origin.dispatchEvent('click');
  await expect(page.locator('.tx-overlay-pane .panel')).toHaveAttribute('data-placement', 'bottom');
});

test('locale switches built-in texts at runtime', async ({ page }) => {
  await page.goto('/core/locale');
  await page.getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'Українська (ua)' }).click();
  await expect(page.locator('.facts').first()).toContainText('з 42');
  await page.getByRole('combobox', { name: /Open me/ }).click();
  await expect(page.locator('.tx-select__empty')).toHaveText('Нічого не знайдено');
});

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('overlay ends its enter animation exactly where it stays', async ({ page }) => {
    await page.goto('/core/overlay');
    await page.getByRole('button', { name: 'bottom', exact: true }).click();
    const pane = page.locator('.tx-overlay-pane');
    const [nearEnd, final] = await pane.evaluate((element) => {
      const [animation] = element.getAnimations();
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) - 1;
      const before = element.getBoundingClientRect().top;
      animation.finish();
      return [before, element.getBoundingClientRect().top];
    });
    expect(Math.abs(nearEnd - final)).toBeLessThan(1);
  });

  test('overlay fades out before it is removed', async ({ page }) => {
    await page.goto('/core/overlay');
    await page.getByRole('button', { name: 'bottom', exact: true }).click();
    const panel = page.locator('.tx-overlay-pane');
    await expect(panel).toHaveCount(1);
    await page.waitForTimeout(250);
    await page.keyboard.press('Escape');
    const leaving = await panel.evaluate((element) => element.getAnimations().some((animation) => animation.playState === 'running'));
    expect(leaving).toBe(true);
    await expect(panel).toHaveCount(0);
  });

  test('select panel fades out before it is removed', async ({ page }) => {
    await page.goto('/components/select');
    await page.locator('tx-select .tx-select__trigger').first().click();
    const panel = page.locator('.tx-select__panel');
    await expect(panel).toBeVisible();
    await page.waitForTimeout(250);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(1);
    await expect(panel).toHaveCount(0);
  });
});
