import { expect, test } from '@playwright/test';

test('popover moves focus in, closes with Escape and gives focus back', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.locator('popover-basic-example').getByRole('button', { name: 'Share' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share this report' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('textbox', { name: 'Report link' })).toBeFocused();
  const [origin, panel] = await Promise.all([trigger, dialog].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(panel.top).toBeGreaterThanOrEqual(origin.bottom);
  expect(Math.abs(panel.left - origin.left)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('popover closes on an outside click and when Tab leaves it', async ({ page }) => {
  await page.goto('/components/popover');
  const example = page.locator('popover-basic-example');
  const trigger = example.getByRole('button', { name: 'Share' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Share this report' });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 300);
  await expect(dialog).toHaveCount(0);

  await trigger.click();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Copy' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test('popover follows the clicked element and a nested one keeps its parent open', async ({ page }) => {
  await page.goto('/components/popover');
  const files = page.locator('popover-target-example');
  await files.getByRole('button', { name: 'Details of Q3 report.pdf' }).click();
  const details = page.getByRole('dialog', { name: 'Q3 report.pdf' });
  await expect(details).toContainText('2.4 MB');
  await files.getByRole('button', { name: 'Details of Logo.svg' }).click();
  await expect(page.getByRole('dialog', { name: 'Logo.svg' })).toContainText('Sara Lind');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.keyboard.press('Escape');

  const nested = page.locator('popover-nested-example');
  await nested.getByRole('button', { name: 'Filters' }).click();
  const filters = page.getByRole('dialog', { name: 'Filters' });
  await filters.getByRole('button', { name: 'Last 30 days' }).click();
  const period = page.getByRole('dialog', { name: 'Period' });
  await period.getByRole('button', { name: 'This quarter' }).click();
  await expect(period).toHaveCount(0);
  await expect(filters).toBeVisible();
  await expect(filters.getByRole('button', { name: 'This quarter' })).toBeVisible();
  await filters.getByRole('button', { name: 'This quarter' }).click();
  await expect(page.getByRole('dialog', { name: 'Period' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Period' })).toHaveCount(0);
  await expect(filters).toBeVisible();
});

test('popover arrow points at the middle of a centred element', async ({ page }) => {
  await page.goto('/components/popover');
  const frame = page.locator('popover-arrow-example');
  for (const name of ['top', 'bottom', 'left', 'right']) {
    const button = frame.getByRole('button', { name, exact: true });
    await button.click();
    const arrow = page.locator('.tx-popover__arrow');
    await expect(arrow).toBeVisible();
    const [origin, tip] = await Promise.all([button, arrow].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
    const vertical = name === 'top' || name === 'bottom';
    const miss = vertical ? tip.x + tip.width / 2 - (origin.x + origin.width / 2) : tip.y + tip.height / 2 - (origin.y + origin.height / 2);
    expect(Math.abs(miss)).toBeLessThan(1);
    await page.keyboard.press('Escape');
    await expect(arrow).toHaveCount(0);
  }
});

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('flipped popover keeps its side while it fades out', async ({ page }) => {
    await page.goto('/components/popover');
    const button = page.locator('popover-arrow-example').getByRole('button', { name: 'bottom', exact: true });
    await expect(button).toBeVisible();
    await expect
      .poll(() =>
        button.evaluate((element) => {
          const height = document.documentElement.clientHeight;
          window.scrollTo({ top: element.getBoundingClientRect().bottom + window.scrollY - height + 12, behavior: 'instant' });
          return height - element.getBoundingClientRect().bottom;
        }),
      )
      .toBeLessThan(14);
    const box = await button.boundingBox();
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    const popover = page.locator('.tx-popover');
    await expect(popover).toHaveAttribute('data-side', 'top');
    await page.waitForTimeout(250);
    const sides = popover.evaluate(
      (element) =>
        new Promise<string[]>((resolve) => {
          const seen: string[] = [];
          const tick = () => {
            if (!element.isConnected) {
              resolve(seen);
              return;
            }
            seen.push(element.getAttribute('data-side') ?? '');
            requestAnimationFrame(tick);
          };
          tick();
        }),
    );
    await page.keyboard.press('Escape');
    expect(new Set(await sides)).toEqual(new Set(['top']));
  });

  test('popover opened before the page scrolled fades out where it is, without a jump', async ({ page }) => {
    await page.goto('/components/popover');
    await page.locator('main h1').first().waitFor();
    await page.waitForLoadState('networkidle');
    const button = page.locator('popover-arrow-example').getByRole('button', { name: 'bottom', exact: true });
    await button.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await button.click();
    const popover = page.locator('.tx-popover');
    await expect(popover).toBeVisible();
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'instant' }));
    const origin = await button.elementHandle();
    const gaps = popover.evaluate(
      (element, anchor) =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const tick = () => {
            if (!element.isConnected) {
              resolve(seen);
              return;
            }
            seen.push(element.getBoundingClientRect().top - (anchor as Element).getBoundingClientRect().bottom);
            requestAnimationFrame(tick);
          };
          tick();
        }),
      origin,
    );
    await page.keyboard.press('Escape');
    const seen = await gaps;
    expect(seen.length).toBeGreaterThan(1);
    for (const gap of seen) {
      expect(Math.abs(gap - seen[0])).toBeLessThan(6);
    }
  });
});
