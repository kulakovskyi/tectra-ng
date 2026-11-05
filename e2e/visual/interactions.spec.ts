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

test('example code shows the template and the full file in tabs', async ({ page }) => {
  await page.goto('/components/key-filter');
  const example = page.locator('docs-example-frame', { hasText: 'More presets' });
  await example.getByRole('button', { name: 'Show code' }).click();
  const htmlTab = example.getByRole('tab', { name: 'HTML' });
  await expect(htmlTab).toHaveAttribute('aria-selected', 'true');
  const panel = example.getByRole('tabpanel');
  await expect(panel).toContainText('<tx-fluid');
  await expect(panel).not.toContainText('@Component');
  await expect(panel.locator('.hljs-name').first()).toBeVisible();
  await htmlTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(example.getByRole('tab', { name: 'TypeScript' })).toBeFocused();
  await expect(panel).toContainText('@Component');
  await expect(panel).not.toContainText('<tx-fluid');
  await panel.getByRole('button', { name: /Show template/ }).click();
  await expect(panel).toContainText('<tx-fluid');
  const widest = await panel.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(widest).toBeLessThanOrEqual(0);
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
  const headerBottom = await page.locator('.header').evaluate((header) => header.getBoundingClientRect().bottom);
  await origin.evaluate((element, top) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - top), headerBottom + 16);
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

test('select panel never covers the sticky header', async ({ page }) => {
  await page.goto('/theming');
  const trigger = page.locator('tx-select .tx-select__trigger').first();
  const panel = page.locator('.tx-select__panel');
  const headerBottom = await page.locator('.header').evaluate((header) => header.getBoundingClientRect().bottom);
  const scrollTriggerTo = (top: number) =>
    trigger.evaluate((element, target) => window.scrollBy(0, element.getBoundingClientRect().top - target), top);

  await scrollTriggerTo(headerBottom + 8);
  await trigger.click();
  await expect(panel).toBeVisible();
  const panelTop = await panel.evaluate((element) => element.getBoundingClientRect().top);
  expect(panelTop).toBeGreaterThanOrEqual(headerBottom);

  await scrollTriggerTo(headerBottom - 60);
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('select panel stays clear of the stuck tab bar', async ({ page }) => {
  await page.goto('/components/select');
  await page.mouse.wheel(0, 700);
  const tabsBar = page.locator('.tabs-bar');
  await expect.poll(() => tabsBar.evaluate((bar) => Math.round(bar.getBoundingClientRect().top))).toBe(56);
  const chromeBottom = await tabsBar.evaluate((bar) => bar.getBoundingClientRect().bottom);
  const trigger = page.locator('docs-example-frame').nth(1).locator('.tx-select__trigger').first();
  const panel = page.locator('.tx-select__panel');
  const scrollTriggerTo = (top: number) =>
    trigger.evaluate((element, target) => window.scrollBy(0, element.getBoundingClientRect().top - target), top);

  await scrollTriggerTo(chromeBottom + 8);
  await trigger.click();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(chromeBottom);

  await scrollTriggerTo(chromeBottom - 60);
  await expect(panel).toHaveCount(0);
});

test('message closes and field errors are linked to their fields', async ({ page }) => {
  await page.goto('/components/message');
  const closable = page.locator('message-closable-example');
  await closable.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(closable.locator('tx-message')).toHaveCount(0);
  await expect(closable.getByRole('button', { name: 'Show again' })).toBeVisible();

  const form = page.locator('message-field-error-example');
  const email = form.locator('#error-email');
  await form.getByRole('button', { name: 'Create account' }).click();
  const error = form.locator('tx-field-error').first();
  await expect(error).toHaveText('This field is required');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  const errorId = await error.getAttribute('id');
  await expect(email).toHaveAttribute('aria-describedby', new RegExp(`\\b${errorId}\\b`));
  await email.fill('ann@site.dev');
  await expect(error.locator('.tx-field-message__text')).toHaveCount(0);
});

test('field wires label, hint and error to the control it contains', async ({ page }) => {
  await page.goto('/components/field');
  const horizontal = page.locator('field-horizontal-example');
  await horizontal.getByText('Display name').click();
  await expect(horizontal.locator('input')).toBeFocused();
  const labelRight = await horizontal.locator('tx-label').first().evaluate((element) => element.getBoundingClientRect().right);
  const inputLeft = await horizontal.locator('input').evaluate((element) => element.getBoundingClientRect().left);
  expect(labelRight).toBeLessThanOrEqual(inputLeft);

  const form = page.locator('field-validation-example');
  await form.getByRole('button', { name: 'Continue' }).click();
  const trigger = form.getByRole('combobox');
  await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  const errorId = await form.locator('tx-field-error').nth(1).getAttribute('id');
  await expect(trigger).toHaveAttribute('aria-describedby', new RegExp(`\\b${errorId}\\b`));
  await expect(form.locator('tx-field-error').nth(1)).toHaveText('This field is required');
});

test('textarea grows with the text, stops at its limit and counts characters', async ({ page }) => {
  await page.goto('/components/textarea');
  const field = page.locator('textarea-auto-resize-example textarea');
  const start = await field.evaluate((element) => element.getBoundingClientRect().height);
  await field.fill('one\ntwo\nthree\nfour');
  await expect.poll(() => field.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(start);
  await field.fill(Array.from({ length: 30 }, (_, index) => `line ${index}`).join('\n'));
  await expect.poll(() => field.evaluate((element) => Math.round(element.getBoundingClientRect().height))).toBe(220);
  await expect(field).toHaveCSS('overflow-y', 'auto');

  const counter = page.locator('textarea-counter-example');
  await counter.locator('textarea').fill('Hello');
  await expect(counter.locator('tx-textarea-counter')).toHaveText('5 / 160');
});

test('checkbox toggles with Space and its label; select all fills the group', async ({ page }) => {
  await page.goto('/components/checkbox');
  const basic = page.locator('checkbox-basic-example');
  const box = basic.getByRole('checkbox', { name: 'Remember me on this device' });
  await expect(box).toBeChecked();
  await basic.getByText('Remember me on this device').click();
  await expect(box).not.toBeChecked();
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();

  const group = page.locator('checkbox-group-example');
  const selectAll = group.getByRole('checkbox', { name: 'Select all' });
  expect(await selectAll.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true);
  await selectAll.click();
  for (const name of ['View pages', 'Edit pages', 'Publish', 'Manage billing']) {
    await expect(group.getByRole('checkbox', { name })).toBeChecked();
  }
  await expect(group.locator('.hint')).toContainText('"view", "edit", "publish", "billing"');

  const tile = page.locator('checkbox-tiles-example tx-checkbox').first();
  await tile.locator('.tx-checkbox__description').click();
  await expect(tile.getByRole('checkbox')).toBeChecked();
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

test('float label moves up on focus and stays up with a value', async ({ page }) => {
  await page.goto('/components/label');
  const input = page.locator('#float-over');
  const label = page.locator('label[for="float-over"]');
  const restingTop = await label.evaluate((element) => element.getBoundingClientRect().top);
  await input.focus();
  await expect.poll(() => label.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(restingTop - 10);
  await input.fill('Ann');
  await input.blur();
  await expect(input).toHaveClass(/tx-input--filled/);
  await expect.poll(() => label.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(restingTop - 10);
});

test('resting float labels sit in the middle of their field and hosts hug the field', async ({ page }) => {
  await page.goto('/components/label');
  await expect(page.locator('#label-select-city')).toBeVisible();
  const layout = await page.evaluate(() =>
    ['float-over', 'float-on', 'label-select-city'].map((id) => {
      const field = document.getElementById(id) as HTMLElement;
      const host = field.closest('tx-float-label') as HTMLElement;
      const label = host.querySelector(':scope > label') as HTMLElement;
      const fieldBox = (field.closest('tx-select') ?? field).getBoundingClientRect();
      const labelBox = label.getBoundingClientRect();
      return {
        id,
        hostExtra: host.getBoundingClientRect().height - fieldBox.height,
        offset: labelBox.top + labelBox.height / 2 - (fieldBox.top + fieldBox.height / 2),
        fieldHeight: fieldBox.height,
      };
    }),
  );
  for (const item of layout) {
    expect(Math.abs(item.hostExtra), item.id).toBeLessThan(1);
    expect(Math.abs(item.offset), item.id).toBeLessThan(1.5);
    expect(item.fieldHeight, item.id).toBeCloseTo(layout[0].fieldHeight, 0);
  }
});

test('labels name their fields', async ({ page }) => {
  await page.goto('/components/label');
  await page.getByText('Full name', { exact: true }).click();
  await expect(page.locator('#label-basic-name')).toBeFocused();
  await expect(page.getByRole('combobox', { name: 'City' })).toBeVisible();
});
