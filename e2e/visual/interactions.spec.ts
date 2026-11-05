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

test('API tab shows a type and a default for every input', async ({ page }) => {
  for (const name of ['button', 'select', 'toggle-button', 'badge']) {
    await page.goto(`/components/${name}`);
    await page.getByRole('tab', { name: 'API' }).click();
    const rows = page.locator('docs-table').first().locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const types = await rows.locator('td:nth-child(2)').allInnerTexts();
    expect(types.length).toBeGreaterThan(0);
    expect(types.filter((type) => type.trim() === '—'), `${name}: inputs without a type`).toEqual([]);
  }
});

test('fields share the form-field look: filled and invalid', async ({ page }) => {
  await page.goto('/components/input');
  const outlined = page.getByRole('textbox', { name: 'Outlined', exact: true });
  const filled = page.getByRole('textbox', { name: 'Filled', exact: true });
  const background = (locator: typeof outlined) => locator.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(filled)).not.toBe(await background(outlined));

  const email = page.getByRole('textbox', { name: 'Email', exact: true });
  await expect(email).not.toHaveAttribute('aria-invalid');
  await email.focus();
  await email.blur();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  const danger = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tx-danger-base').trim());
  const probe = await page.evaluate((color) => {
    const element = document.createElement('span');
    element.style.color = color;
    document.body.appendChild(element);
    const value = getComputedStyle(element).color;
    element.remove();
    return value;
  }, danger);
  await expect.poll(() => email.evaluate((element) => getComputedStyle(element).borderTopColor)).toBe(probe);
});

test('icon field makes room for icons and the clear button works', async ({ page }) => {
  await page.goto('/components/icon-field');
  const search = page.getByRole('textbox', { name: 'Search' }).first();
  const plain = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tx-form-field-padding-x')));
  const paddingLeft = await search.evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft));
  expect(paddingLeft).toBeGreaterThan(plain + 10);

  const field = page.locator('icon-field-clear-example');
  await field.getByRole('button', { name: 'Clear' }).click();
  await expect(field.getByText('Value: —')).toBeVisible();
  await expect(field.getByRole('button', { name: 'Clear' })).toHaveCount(0);
});

test('key filter blocks typing and cleans paste', async ({ page }) => {
  await page.goto('/components/key-filter');
  const pint = page.getByRole('textbox', { name: 'pint', exact: true });
  await pint.click();
  await page.keyboard.type('1a2-b3');
  await expect(pint).toHaveValue('123');

  const positive = page.getByRole('textbox', { name: 'Positive' });
  await positive.click();
  await page.keyboard.type('12.5.7');
  await expect(positive).toHaveValue('12.57');

  const latin = page.getByRole('textbox', { name: 'Latin' });
  await latin.focus();
  await latin.evaluate((element) => {
    const event = new ClipboardEvent('paste', { clipboardData: new DataTransfer(), cancelable: true, bubbles: true });
    event.clipboardData?.setData('text', 'ab-c1д_e');
    element.dispatchEvent(event);
  });
  await expect(latin).toHaveValue('ab-c_e');
});

test('input group joins borders', async ({ page }) => {
  await page.goto('/components/input-group');
  const input = page.getByRole('textbox', { name: 'Site' });
  const radii = await input.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.borderTopLeftRadius, style.borderTopRightRadius];
  });
  expect(radii).toEqual(['0px', '0px']);
});

test('input group quantity stepper changes the value', async ({ page }) => {
  await page.goto('/components/input-group');
  const quantity = page.getByRole('textbox', { name: 'Quantity' });
  await expect(quantity).toHaveValue('3');
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('button', { name: 'More' }).click();
  await expect(quantity).toHaveValue('5');
  await page.getByRole('button', { name: 'Less' }).click();
  await expect(quantity).toHaveValue('4');
  await page.getByRole('textbox', { name: 'Keyword' }).fill('tectra');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('Searched: tectra')).toBeVisible();
});
