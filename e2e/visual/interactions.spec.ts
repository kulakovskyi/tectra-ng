import { expect, test } from '@playwright/test';

test('select panel is opaque and selects with the keyboard', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.locator('tx-select .tx-select__trigger').first();
  await trigger.click();
  const panel = page.locator('.tx-select__panel');
  await expect(panel).toBeVisible();
  const background = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await expect(page.locator('.tx-select__option--active')).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
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

test('select panel opens clear of the sticky header and rides with its field while the page scrolls', async ({ page }) => {
  await page.goto('/theming');
  const trigger = page.locator('tx-select .tx-select__trigger').first();
  const panel = page.locator('.tx-select__panel');
  const headerBottom = await page.locator('.header').evaluate((header) => header.getBoundingClientRect().bottom);
  const scrollTriggerTo = (top: number) =>
    trigger.evaluate((element, target) => window.scrollBy(0, element.getBoundingClientRect().top - target), top);

  await scrollTriggerTo(headerBottom + 8);
  await trigger.click();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);

  const field = await trigger.elementHandle();
  const gap = () => panel.evaluate((element, origin) => element.getBoundingClientRect().top - (origin as Element).getBoundingClientRect().bottom, field);
  const opened = await gap();
  await scrollTriggerTo(headerBottom - 60);
  await expect.poll(gap).toBeCloseTo(opened, 0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('select panel opens clear of the stuck tab bar', async ({ page }) => {
  await page.goto('/components/select');
  await page.mouse.wheel(0, 700);
  const tabsBar = page.locator('.tabs-bar');
  await expect.poll(() => tabsBar.evaluate((bar) => Math.round(bar.getBoundingClientRect().top))).toBe(56);
  const chromeBottom = await tabsBar.evaluate((bar) => bar.getBoundingClientRect().bottom);
  const trigger = page.locator('docs-example-frame').nth(1).locator('.tx-select__trigger').first();
  const panel = page.locator('.tx-select__panel');
  await trigger.evaluate((element, target) => window.scrollBy(0, element.getBoundingClientRect().top - target), chromeBottom + 8);
  await trigger.click();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(chromeBottom);
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

test('radio group moves with arrow keys and is named by its field', async ({ page }) => {
  await page.goto('/components/radio-button');
  const group = page.locator('radio-button-group-example');
  const standard = group.getByRole('radio', { name: 'Standard — 3 to 5 days' });
  await standard.focus();
  await page.keyboard.press('ArrowDown');
  await expect(group.getByRole('radio', { name: 'Express — next day' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Express — next day' })).toBeFocused();
  await expect(group.locator('.hint')).toHaveText('Value: express');

  const form = page.locator('radio-button-form-example');
  await expect(form.getByRole('radiogroup', { name: 'How did you hear about us?' })).toBeVisible();
  await form.getByRole('button', { name: 'Continue' }).click();
  await expect(form.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
});

test('toggle switch is a switch that toggles with Space and its label', async ({ page }) => {
  await page.goto('/components/toggle-switch');
  const basic = page.locator('toggle-switch-basic-example');
  const wifi = basic.getByRole('switch', { name: 'Wi-Fi' });
  await expect(wifi).toBeChecked();
  await wifi.focus();
  await page.keyboard.press('Space');
  await expect(wifi).not.toBeChecked();
  await expect(basic.locator('.hint')).toHaveText('Value: false');
  await basic.getByText('Wi-Fi').click();
  await expect(wifi).toBeChecked();
  const handle = basic.locator('.tx-toggle-switch__handle');
  const track = basic.locator('.tx-toggle-switch__track');
  const handleRight = await handle.evaluate((element) => element.getBoundingClientRect().right);
  const trackRight = await track.evaluate((element) => element.getBoundingClientRect().right);
  expect(trackRight - handleRight).toBeLessThan(4);
});

test('password shows the text, grades it under the field and floats its label', async ({ page }) => {
  await page.goto('/components/password');
  const meter = page.locator('password-meter-example');
  const input = meter.getByLabel('New password');
  await input.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await input.fill('Abcdef12');
  const panel = page.locator('.tx-password__panel');
  await expect(panel.locator('.tx-password__info')).toHaveText('Strong');
  const inputBox = await input.evaluate((element) => element.getBoundingClientRect().toJSON());
  const panelBox = await panel.evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(Math.round(panelBox.width)).toBe(Math.round(inputBox.width));
  expect(panelBox.top).toBeGreaterThanOrEqual(inputBox.bottom);
  await expect(meter.locator('.hint')).toHaveText('Strength: strong');
  await meter.getByRole('button', { name: 'Show password' }).click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);

  const float = page.locator('password-float-label-example');
  const label = float.locator('label[for="password-float"]');
  const restTop = await label.evaluate((element) => element.getBoundingClientRect().top);
  await float.locator('input').fill('secret');
  await float.locator('input').blur();
  await expect.poll(() => label.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(restTop);
});

test('otp moves between cells while typing, deleting and pasting', async ({ page }) => {
  await page.goto('/components/input-otp');
  const otp = page.locator('input-otp-integer-only-example');
  const cells = otp.locator('input');
  await cells.first().focus();
  await page.keyboard.type('12x3');
  await expect(cells.nth(3)).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(cells.nth(2)).toBeFocused();
  await expect(cells.nth(2)).toHaveValue('');
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.setData('text/plain', '3 4 5 6');
    document.activeElement?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(otp.locator('.hint')).toHaveText('Completed: 123456');
  await expect(cells.nth(5)).toBeFocused();
});

test('input mask formats typing, skips literals on Backspace and clears incomplete values', async ({ page }) => {
  await page.goto('/components/input-mask');
  const phone = page.locator('input-mask-phone-example');
  const input = phone.getByLabel('Phone');
  await input.click();
  await page.keyboard.type('5012345');
  await expect(input).toHaveValue('+380 (50) 123-45-__');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(input).toHaveValue('+380 (50) 12_-__-__');
  await page.keyboard.type('34567');
  await expect(phone.locator('.hint')).toHaveText('Value: +380 (50) 123-45-67');
  await input.blur();
  await expect(input).toHaveValue('+380 (50) 123-45-67');

  const clearing = page.getByLabel('Clears when incomplete');
  await clearing.click();
  await page.keyboard.type('12');
  await clearing.blur();
  await expect(clearing).toHaveValue('');
  const keeping = page.getByLabel('Keeps partial input');
  await keeping.click();
  await page.keyboard.type('12');
  await keeping.blur();
  await expect(keeping).toHaveValue('12');
});

test('input number groups while typing, keeps the caret and repeats a held button', async ({ page }) => {
  await page.goto('/components/input-number');
  const basic = page.locator('input-number-basic-example');
  const visitors = basic.getByRole('spinbutton', { name: 'Visitors' });
  await visitors.fill('');
  await visitors.pressSequentially('1234567');
  await expect(visitors).toHaveValue('1,234,567');
  await expect(basic.locator('.hint')).toHaveText('Model: 1234567');
  await visitors.press('Home');
  await visitors.press('ArrowRight');
  await visitors.pressSequentially('9');
  await expect(visitors).toHaveValue('19,234,567');
  expect(await visitors.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(2);
  await visitors.press('ArrowUp');
  await expect(basic.locator('.hint')).toHaveText('Model: 19234568');

  const stacked = page.locator('input-number-buttons-example').getByRole('spinbutton', { name: 'Stacked' });
  const increase = page.locator('input-number-buttons-example tx-input-number').first().getByRole('button', { name: 'Increase' });
  await increase.hover();
  await page.mouse.down();
  await page.waitForTimeout(800);
  await page.mouse.up();
  const held = Number(await stacked.inputValue());
  expect(held).toBeGreaterThan(22);

  const locale = page.locator('input-number-locale-example');
  await locale.getByRole('button', { name: /Locale/ }).click();
  await expect(locale.getByRole('spinbutton')).toHaveValue('25 000,75');
  await locale.getByRole('button', { name: /Locale/ }).click();
  await expect(locale.getByRole('spinbutton')).toHaveValue('25,000.75');
});

test('rating previews on hover, rates with keys and is named by its field', async ({ page }) => {
  await page.goto('/components/rating');
  const basic = page.locator('rating-basic-example');
  const slider = basic.getByRole('slider', { name: 'Rate this article' });
  await expect(slider).toHaveAttribute('aria-valuetext', '4 of 5');
  const stars = basic.locator('.tx-rating__star');
  await stars.nth(1).hover();
  await expect(basic.locator('tx-rating')).toHaveClass(/tx-rating--preview/);
  await stars.nth(1).click();
  await expect(basic.locator('.hint')).toHaveText('Value: 2');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(basic.locator('.hint')).toHaveText('Value: 4');
  await page.keyboard.press('Delete');
  await expect(basic.locator('.hint')).toHaveText('Value: none');

  const half = page.locator('rating-half-example');
  const third = half.locator('.tx-rating__star').nth(2);
  const box = await third.evaluate((element) => element.getBoundingClientRect().toJSON());
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  await expect(half.locator('.hint')).toHaveText('Value: 2.5');

  await expect(page.locator('rating-form-example').getByRole('slider', { name: 'How was your support chat?' })).toBeVisible();
});

test('knob follows a drag along the dial, steps with keys and stops at its limit', async ({ page }) => {
  await page.goto('/components/knob');
  const basic = page.locator('knob-basic-example');
  const knob = basic.getByRole('slider', { name: 'Volume' });
  const box = await knob.evaluate((element) => element.getBoundingClientRect().toJSON());
  await page.mouse.move(box.x + box.width / 2, box.y + 4);
  await page.mouse.down();
  await expect(basic.locator('.hint')).toHaveText('Value: 50');
  await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(basic.locator('.hint')).toHaveText(/Value: 8[2-4]/);
  await knob.focus();
  await page.keyboard.press('Home');
  await expect(basic.locator('.hint')).toHaveText('Value: 0');
  await page.keyboard.press('PageUp');
  await expect(knob).toHaveAttribute('aria-valuenow', '10');

  const limit = page.locator('knob-limit-example').getByRole('slider');
  await limit.focus();
  await page.keyboard.press('End');
  await expect(limit).toHaveAttribute('aria-valuenow', '20');
});

test('slider follows a drag, jumps to a track click and keeps a range in order', async ({ page }) => {
  await page.goto('/components/slider');
  const basic = page.locator('slider-basic-example');
  const track = basic.locator('.tx-slider__track');
  const box = await track.evaluate((element) => element.getBoundingClientRect().toJSON());
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
  await expect(basic.locator('.hint')).toHaveText('Value: 75');
  const handle = basic.getByRole('slider', { name: 'Volume' });
  await expect(handle).toBeFocused();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect(basic.locator('.hint')).toHaveText('Value: 20');
  const handleCenter = await handle.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
  });
  expect(Math.abs(handleCenter - (box.x + box.width * 0.2))).toBeLessThan(2);

  const range = page.locator('slider-range-example');
  const from = range.getByRole('slider', { name: 'Price, from' });
  await from.focus();
  await page.keyboard.press('End');
  await expect(range.locator('.hint')).toHaveText('$600 – $650');
  await page.keyboard.press('Home');
  await expect(range.locator('.hint')).toHaveText('$0 – $650');
});

test('password generator fills and reveals the password field', async ({ page }) => {
  await page.goto('/components/password-generator');
  const example = page.locator('password-generator-password-example');
  const input = example.getByLabel('New password');
  await expect(input).toHaveAttribute('type', 'password');
  await example.getByRole('button', { name: 'Generate' }).click();
  await expect(input).toHaveAttribute('type', 'text');
  const first = await input.inputValue();
  expect(first).toHaveLength(16);
  await example.getByRole('button', { name: 'Generate' }).click();
  await expect(input).not.toHaveValue(first);
  const token = page.locator('password-generator-control-example');
  await token.getByRole('button', { name: 'New token' }).click();
  await expect(token.getByLabel('API token')).toHaveValue(/^[A-Za-z2-9]{32}$/);
});

test('overlay badge sits on the corner and is read with its button', async ({ page }) => {
  await page.goto('/components/overlay-badge');
  const example = page.locator('overlay-badge-basic-example');
  const inbox = example.getByRole('button', { name: 'Inbox' });
  await expect(inbox).toHaveAccessibleDescription('unread messages');
  const badge = example.locator('tx-badge').first();
  const [button, mark] = await Promise.all([inbox, badge].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(Math.abs(mark.x + mark.width / 2 - (button.x + button.width))).toBeLessThan(2);
  expect(Math.abs(mark.y + mark.height / 2 - button.y)).toBeLessThan(2);
  await example.getByRole('button', { name: 'Add message' }).click();
  await expect(badge).toHaveText('5');
});

test('pill is removed from its button with the keyboard', async ({ page }) => {
  await page.goto('/components/pill');
  const example = page.locator('pill-removable-example');
  await expect(example.locator('tx-pill')).toHaveCount(4);
  await example.getByRole('button', { name: 'Remove design' }).focus();
  await page.keyboard.press('Delete');
  await expect(example.locator('tx-pill')).toHaveCount(3);
  await example.getByRole('button', { name: 'Remove frontend' }).click();
  await expect(example.locator('tx-pill')).toHaveCount(2);
  await expect(example.locator('tx-pill').first()).toHaveText(/accessibility/);
});

test('tag copies its text and chip is removed with the keyboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/tag');
  const tags = page.locator('tag-copyable-example');
  await tags.getByRole('button', { name: 'Copy' }).first().click();
  await expect(tags.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(tags.locator('.hint')).toHaveText('Copied ord_8F2KQ1');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('ord_8F2KQ1');

  await page.goto('/components/chip');
  const chips = page.locator('chip-removable-example');
  await chips.getByRole('button', { name: 'Remove taras@example.com' }).focus();
  await page.keyboard.press('Backspace');
  await expect(chips.locator('tx-chip')).toHaveCount(2);
  await expect(chips.locator('tx-chip').nth(1)).toHaveText(/team@example.com/);
});

test('progress bar grows with the value and reports it', async ({ page }) => {
  await page.goto('/components/progress-bar');
  const live = page.locator('progress-bar-live-example');
  const bar = live.getByRole('progressbar', { name: 'Upload' });
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  await live.getByRole('button', { name: 'Upload' }).click();
  await expect(bar).toHaveAttribute('aria-valuenow', '100', { timeout: 5000 });
  await expect(bar).toHaveAttribute('data-severity', 'success');
  await expect.poll(() => bar.evaluate((element) => {
    const track = element.querySelector('.tx-progress-bar__track') as HTMLElement;
    const value = element.querySelector('.tx-progress-bar__value') as HTMLElement;
    return Math.round((value.getBoundingClientRect().width / track.getBoundingClientRect().width) * 100);
  })).toBe(100);
  await expect(page.locator('progress-bar-indeterminate-example').getByRole('progressbar')).toHaveAttribute('aria-busy', 'true');
});

test('skeleton stands in while content loads and is hidden from screen readers', async ({ page }) => {
  await page.goto('/components/skeleton');
  const example = page.locator('skeleton-loading-example');
  await example.getByRole('button', { name: 'Reload' }).click();
  await expect(example.locator('.box')).toHaveAttribute('aria-busy', 'true');
  await expect(example.locator('tx-skeleton').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(example.getByRole('heading', { name: 'Quarterly report' })).toBeVisible({ timeout: 4000 });
  await expect(example.locator('tx-skeleton')).toHaveCount(0);
});

test('avatar falls back to initials and a group shows +N', async ({ page }) => {
  await page.goto('/components/avatar');
  const fallback = page.locator('avatar-fallback-example');
  await expect(fallback.locator('.hint')).toHaveText('The photo failed — initials instead');
  await expect(fallback.getByRole('img', { name: 'Kateryna Moroz' })).toHaveText('KM');
  const group = page.locator('avatar-group-example').getByRole('group', { name: 'Project members' });
  await expect(group.getByRole('img')).toHaveCount(5);
  await expect(group.getByRole('img', { name: '3 more' })).toHaveText('+3');
  await expect(group.getByRole('button', { name: 'Invite' })).toBeVisible();
});

test('panel collapses by click and keyboard and hides its content', async ({ page }) => {
  await page.goto('/components/panel');
  const example = page.locator('panel-toggleable-example');
  const region = example.getByRole('region', { name: 'Advanced settings' });
  const toggle = region.getByRole('button', { name: 'Advanced settings' });
  const content = region.getByText('Cache lifetime, request limits and webhooks.');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(content).toBeHidden();
  const controls = await toggle.getAttribute('aria-controls');
  await expect(region.locator(`#${controls}`)).toHaveAttribute('inert', '');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(content).toBeVisible();
  await expect(example.locator('.status')).toHaveText('Expanded');
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => region.locator(`#${controls}`).evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('fieldset collapses from its legend and keeps the legend naming the group', async ({ page }) => {
  await page.goto('/components/fieldset');
  const example = page.locator('fieldset-toggleable-example');
  const group = example.getByRole('group', { name: 'Billing address' });
  const toggle = group.getByRole('button', { name: 'Billing address' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(group.getByRole('textbox', { name: 'Street' })).toBeVisible();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(example.locator('.status')).toHaveText('Collapsed');
  await expect(group.getByRole('textbox', { name: 'Street' })).toBeHidden();
  await toggle.click();
  await expect(group.getByRole('textbox', { name: 'Street' })).toBeVisible();
});

test('divider is a separator with its orientation', async ({ page }) => {
  await page.goto('/components/divider');
  const vertical = page.locator('divider-vertical-example').getByRole('separator').first();
  await expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
  const box = await vertical.boundingBox();
  expect(box?.height).toBeGreaterThan(30);
});

test('highlight text follows the search and ignores accents', async ({ page }) => {
  await page.goto('/components/highlight-text');
  const example = page.locator('highlight-text-basic-example');
  await expect(example.locator('mark')).toHaveText(['Café', 'cafe', 'café']);
  await example.getByLabel('Search').fill('RIVER');
  await expect(example.locator('mark')).toHaveText(['river']);
  const list = page.locator('highlight-text-search-list-example');
  await list.getByLabel('Search cities').fill('kh');
  await expect(list.getByRole('listitem')).toHaveText(['Kharkiv']);
  await expect(list.locator('mark')).toHaveText('Kh');
});

test('link copies itself, opens web links in a new tab and router links in the app', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/link');
  const basic = page.locator('link-basic-example').getByRole('link', { name: /docs\.example\.com/ });
  await expect(basic).toHaveAttribute('href', 'https://docs.example.com');
  await expect(basic).toHaveAttribute('target', '_blank');
  await expect(basic).toHaveAccessibleName('docs.example.com (opens in a new tab)');
  const copy = page.locator('link-copy-example');
  await copy.getByRole('button', { name: 'Copy email' }).click();
  await expect(copy.locator('.status')).toHaveText('Copied billing@example.com');
  await expect(copy.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('billing@example.com');
  const nav = page.locator('link-icon-links-example').getByRole('navigation', { name: 'Account' });
  await expect(nav.getByRole('link', { name: 'Link' })).toHaveAttribute('aria-current', 'page');
  await page.locator('link-router-link-example').getByRole('link', { name: 'avatars' }).click();
  await expect(page).toHaveURL(/\/components\/avatar$/);
  await expect(page.locator('main h1').first()).toHaveText('Avatar');
});

test('amount and status icon read well in tables', async ({ page }) => {
  await page.goto('/components/amount');
  const table = page.locator('amount-in-a-table-example').getByRole('table', { name: 'Orders' });
  await expect(table.getByRole('row').nth(1)).toContainText('$1,290.00');
  await expect(table.locator('[data-sign="negative"]')).toHaveText('-12');
  await page.goto('/components/status-icon');
  const domains = page.locator('status-icon-in-a-table-example').getByRole('table', { name: 'Domains' });
  const row = domains.getByRole('row').nth(2);
  await expect(row.getByRole('img', { name: 'Yes', exact: true })).toBeVisible();
  await expect(row.getByRole('img', { name: 'No certificate' })).toHaveAttribute('title', 'No certificate');
});

test('sidebar searches, collapses groups and keeps the current page in view', async ({ page }) => {
  await page.goto('/components/panel');
  const sidebar = page.getByRole('navigation', { name: 'Documentation' });
  const current = sidebar.getByRole('link', { name: 'Panel' });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toBeInViewport();
  const form = sidebar.getByRole('button', { name: /Form/ });
  await form.click();
  await expect(form).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toBeHidden();
  await page.reload();
  await expect(sidebar.getByRole('button', { name: /Form/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar.getByRole('link', { name: 'Panel' })).toBeInViewport();
  await page.locator('main h1').first().click();
  await page.keyboard.press('/');
  const search = sidebar.getByRole('searchbox', { name: 'Search docs' });
  await expect(search).toBeFocused();
  await search.fill('progress');
  await expect(sidebar.locator('.docs-nav__status')).toHaveText('2 results');
  await expect(sidebar.getByRole('link')).toHaveText(['ProgressBar', 'ProgressSpinner']);
  await search.press('Enter');
  await expect(page).toHaveURL(/\/components\/progress-bar$/);
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await sidebar.getByRole('button', { name: /Form/ }).click();
  await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toBeVisible();
});

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('overlay ends its enter animation exactly where it stays', async ({ page }) => {
    await page.goto('/core/overlay');
    await page.getByRole('button', { name: 'bottom', exact: true }).click();
    const pane = page.locator('.tx-overlay-pane');
    const [nearEnd, final] = await pane.evaluate((element) => {
      const [animation] = element.getAnimations({ subtree: true });
      animation.pause();
      animation.currentTime = Number(animation.effect?.getComputedTiming().duration) - 1;
      const before = element.getBoundingClientRect().top;
      animation.finish();
      return [before, element.getBoundingClientRect().top];
    });
    expect(Math.abs(nearEnd - final)).toBeLessThan(1);
  });

  test('tooltip grows out of its arrow, which stays on the middle of the button', async ({ page }) => {
    await page.goto('/components/tooltip');
    const button = page.locator('tooltip-icon-buttons-example').getByRole('button', { name: 'Duplicate', exact: true });
    await expect(button).toBeVisible();
    await page.evaluate(() => {
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (this: Element, ...args: Parameters<Element['animate']>) {
        const animation = animate.apply(this, args);
        if (this.localName === 'tx-tooltip') {
          animation.pause();
          (window as unknown as { txPop: Animation }).txPop = animation;
        }
        return animation;
      };
    });
    await button.hover();
    const tooltip = page.locator('tx-tooltip');
    await expect(tooltip).toHaveCount(1);
    await page.waitForFunction(() => !!(window as unknown as { txPop?: Animation }).txPop);
    const frames = await tooltip.evaluate((element, origin) => {
      const animation = (window as unknown as { txPop: Animation }).txPop;
      const duration = Number(animation.effect?.getComputedTiming().duration);
      const center = (target: Element) => {
        const box = target.getBoundingClientRect();
        return { x: box.left + box.width / 2, bottom: box.bottom };
      };
      const arrow = element.querySelector('.tx-tooltip__arrow') as Element;
      const samples = [0.1, 0.3, 0.6, 1].map((part) => {
        animation.currentTime = duration * part;
        return center(arrow);
      });
      animation.finish();
      return { samples, origin: center(origin as Element) };
    }, await button.elementHandle());
    for (const sample of frames.samples) {
      expect(Math.abs(sample.x - frames.origin.x)).toBeLessThan(0.5);
    }
    const settled = frames.samples[frames.samples.length - 1].bottom;
    for (const sample of frames.samples) {
      expect(Math.abs(sample.bottom - settled)).toBeLessThan(1);
    }
  });

  test('flipped tooltip keeps its arrow side while it fades out', async ({ page }) => {
    await page.goto('/components/tooltip');
    const origin = page.locator('tooltip-placements-example').getByRole('button', { name: 'bottom', exact: true });
    await expect(origin).toBeVisible();
    await origin.evaluate((element) =>
      window.scrollTo({ top: element.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 12, behavior: 'instant' }),
    );
    await expect.poll(() => origin.evaluate((element) => window.innerHeight - element.getBoundingClientRect().bottom)).toBeLessThan(14);
    const box = await origin.boundingBox();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    const tooltip = page.locator('tx-tooltip');
    await expect(tooltip).toHaveAttribute('data-side', 'top');
    await page.waitForTimeout(250);
    await page.mouse.move(0, 0);
    const sides = await tooltip.evaluate(
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
    expect(sides.length).toBeGreaterThan(1);
    expect(new Set(sides)).toEqual(new Set(['top']));
  });

  for (const how of ['mask', 'Escape'] as const) {
    test(`drawer slides out when it is closed with the ${how}`, async ({ page }) => {
      await page.goto('/components/drawer');
      await page.locator('drawer-basic-example').getByRole('button').first().click();
      const panel = page.locator('.tx-dialog');
      await expect(panel).toBeVisible();
      await page.waitForTimeout(400);
      const watch = panel.evaluate(
        (element) =>
          new Promise<number[]>((resolve) => {
            const lefts: number[] = [];
            const tick = () => {
              if (!element.isConnected) {
                resolve(lefts);
                return;
              }
              lefts.push(element.getBoundingClientRect().left);
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.waitForTimeout(50);
      if (how === 'mask') {
        await page.mouse.click(40, 450);
      } else {
        await page.keyboard.press('Escape');
      }
      const lefts = await watch;
      const moving = new Set(lefts.map(Math.round));
      expect(moving.size).toBeGreaterThan(3);
      await expect(panel).toHaveCount(0);
    });
  }

  test('overlay fades out before it is removed', async ({ page }) => {
    await page.goto('/core/overlay');
    await page.getByRole('button', { name: 'bottom', exact: true }).click();
    const panel = page.locator('.tx-overlay-pane');
    await expect(panel).toHaveCount(1);
    await page.waitForTimeout(250);
    await panel.evaluate((pane) => {
      const animate = Element.prototype.animate;
      const fades: number[] = [];
      (window as unknown as { txFades: number[] }).txFades = fades;
      Element.prototype.animate = function (this: Element, ...args: Parameters<Element['animate']>) {
        const [keyframes] = args;
        if (pane.contains(this) && Array.isArray(keyframes) && keyframes.length) {
          fades.push(Number(keyframes[keyframes.length - 1].opacity ?? 1));
        }
        return animate.apply(this, args);
      };
    });
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { txFades: number[] }).txFades)).toContain(0);
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
