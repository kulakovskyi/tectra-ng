import { Page, expect, test } from '@playwright/test';
import { layoutViewport } from './helpers';

const example = (page: Page, id: string) => page.locator(`editor-${id}-example`);
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP4z8CAFWEXHbQSACj/P8Fu7N9hAAAAAElFTkSuQmCC',
  'base64',
);

test.describe('editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/editor');
    await page.locator('main h1').first().waitFor();
  });

  test('typing with Markdown shortcuts and keys builds the document', async ({ page }) => {
    const root = example(page, 'limit');
    const textbox = root.getByRole('textbox');
    await textbox.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('## Plan');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- one');
    await page.keyboard.press('Enter');
    await page.keyboard.type('two');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Plain **bold** ');
    await page.keyboard.press('ControlOrMeta+i');
    await page.keyboard.type('italic');
    await expect(textbox.locator('h2')).toHaveText('Plan');
    await expect(textbox.locator('ul > li > ul > li')).toHaveText('two');
    await expect(textbox.locator('p strong')).toHaveText('bold');
    await expect(textbox.locator('p em')).toHaveText('italic');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(textbox.locator('p em')).toHaveCount(0);
  });

  test('the selection menu formats text and adds a link with the keyboard', async ({ page }) => {
    const root = example(page, 'basic');
    const textbox = root.getByRole('textbox');
    await textbox.getByText('new onboarding').dblclick();
    const bubble = page.locator('.tx-editor__bubble');
    await expect(bubble).toBeVisible();
    const selected = await bubble.boundingBox();
    const word = await textbox.getByText('new onboarding').boundingBox();
    expect((selected?.y ?? 0) + (selected?.height ?? 0)).toBeLessThanOrEqual((word?.y ?? 0) + 2);
    await bubble.getByRole('button', { name: 'Italic' }).click();
    await expect(textbox.locator('em')).toHaveCount(1);
    await page.keyboard.press('ControlOrMeta+k');
    const field = page.getByRole('textbox', { name: 'Link address' });
    await expect(field).toBeFocused();
    await field.fill('example.org/docs');
    await page.keyboard.press('Enter');
    await expect(textbox.locator('a[href="https://example.org/docs"]')).toHaveAttribute('target', '_blank');
    await expect(root.locator('tx-editor-content a[href="https://example.org/docs"]')).toBeVisible();
  });

  test('mentions open a list that the keys drive', async ({ page }) => {
    const root = example(page, 'mentions');
    await root.getByRole('textbox').click();
    await page.keyboard.type('Hi @an');
    const list = page.getByRole('listbox');
    await expect(list.getByRole('option')).toHaveText([/Anna Kovalenko/, /Ivan Bondar/]);
    await page.keyboard.press('ArrowDown');
    await expect(list.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(root.locator('[data-type="mention"]')).toHaveText('@Ivan Bondar');
    await expect(root.getByText('Last mentioned: Ivan Bondar')).toBeVisible();
    await expect(list).toHaveCount(0);
  });

  test('quill format writes Quill markup back', async ({ page }) => {
    const root = example(page, 'quill');
    await root.getByRole('textbox').getByText('Traffic grew').click();
    await page.keyboard.press('End');
    await page.keyboard.type(' fast');
    await expect(root.locator('pre')).toContainText('<li data-list="bullet">Traffic grew fast</li>');
    await expect(root.locator('pre')).toContainText('class="ql-align-center"');
  });

  test('images come in through the button and checklists toggle', async ({ page }) => {
    const root = example(page, 'images');
    await root.getByRole('textbox').click();
    await root.locator('input[type=file]').setInputFiles({ name: 'dot.png', mimeType: 'image/png', buffer: png });
    await expect(root.getByRole('textbox').locator('img[src^="data:image/png"]')).toBeVisible();
    const basic = example(page, 'basic');
    const box = basic.getByRole('textbox').getByRole('checkbox', { name: 'Checklist' }).nth(1);
    await box.click();
    await expect(box).toBeChecked();
    await expect(basic.locator('tx-editor-content [data-checked="true"]')).toHaveCount(2);
  });

  test('the full view fills the screen in a dialog and closes with Escape', async ({ page }) => {
    const root = example(page, 'full-view');
    await root.getByRole('button', { name: 'Open in full view' }).click();
    const dialog = page.getByRole('dialog', { name: 'Full view' });
    const frame = dialog.locator('.tx-editor__frame');
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();
    const viewport = await layoutViewport(page);
    expect(box?.width ?? 0).toBeGreaterThan(viewport.width - 4);
    expect(box?.height ?? 0).toBeGreaterThan(viewport.height - 4);
    await expect(frame.getByRole('textbox')).toBeFocused();
    await page.keyboard.type(' Still editing.');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(root.locator('.tx-editor__frame')).toBeVisible();
    await expect(root.getByRole('textbox')).toContainText('Still editing.');
  });

  test('an image resizes with its handle and moves by dragging', async ({ page }) => {
    const root = example(page, 'images');
    const textbox = root.getByRole('textbox');
    await textbox.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('Tail paragraph');
    await textbox.locator('p').click({ position: { x: 1, y: 5 } });
    const wide = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="#8b5cf6"/></svg>');
    await root.locator('input[type=file]').setInputFiles({ name: 'wide.svg', mimeType: 'image/svg+xml', buffer: wide });
    const image = textbox.locator('.tx-editor__image img');
    await expect(image).toBeVisible();
    await image.click();
    const handle = textbox.locator('.tx-editor__image-handle[data-side="right"]');
    await expect(handle).toBeVisible();
    const box = await handle.boundingBox();
    const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    const before = (await image.boundingBox())?.width ?? 0;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 40, startY, { steps: 5 });
    await page.mouse.up();
    await expect.poll(async () => (await image.boundingBox())?.width ?? 0).toBeLessThan(before - 30);
    await expect(image).toHaveCSS('width', `${Math.round(before - 40)}px`);
    await expect.poll(() => textbox.evaluate((element) => Array.from(element.children).map((child) => child.tagName))).toEqual(['DIV', 'P']);
    const imageBox = await image.boundingBox();
    const tailBox = await textbox.locator('p').last().boundingBox();
    await page.mouse.move((imageBox?.x ?? 0) + 40, (imageBox?.y ?? 0) + 40);
    await page.mouse.down();
    await page.mouse.move((tailBox?.x ?? 0) + 60, (tailBox?.y ?? 0) + (tailBox?.height ?? 0) + 6, { steps: 8 });
    await expect(root.locator('.tx-editor__drop-cursor')).toBeVisible();
    await page.mouse.up();
    await expect.poll(() => textbox.evaluate((element) => Array.from(element.children).map((child) => child.tagName))).toEqual(['P', 'DIV']);
  });

  test('the slash menu inserts a table that the table menu edits', async ({ page }) => {
    const root = example(page, 'slash-menu');
    const textbox = root.getByRole('textbox');
    await textbox.locator('p').last().click();
    await page.keyboard.type('/');
    const list = page.getByRole('listbox', { name: 'Insert block' });
    await expect(list.getByRole('option').first()).toBeVisible();
    await page.keyboard.type('tab');
    await expect(list.getByRole('option').first()).toContainText('Table');
    await page.keyboard.press('Enter');
    const table = textbox.locator('table');
    await expect(table.locator('tr')).toHaveCount(3);
    await page.keyboard.type('Name');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Score');
    await expect(table.locator('th').nth(1)).toHaveText('Score');
    await page.locator('.tx-editor__bubble').getByRole('button', { name: 'Add row below' }).click();
    await expect(table.locator('tr')).toHaveCount(4);
    await page.locator('.tx-editor__bubble').getByRole('button', { name: 'Delete table' }).click();
    await expect(textbox.locator('table')).toHaveCount(0);
  });

  test('emoji and typography appear while typing', async ({ page }) => {
    const root = example(page, 'slash-menu');
    const textbox = root.getByRole('textbox');
    await textbox.locator('p').last().click();
    await page.keyboard.type('Ship it :fir');
    await expect(page.getByRole('listbox', { name: 'Emoji' }).getByRole('option').first()).toContainText(':fire:');
    await page.keyboard.press('Enter');
    await page.keyboard.type(' -> "done"...');
    await expect(textbox.locator('p').last()).toHaveText('Ship it 🔥 → “done”…');
    await page.keyboard.press('Backspace');
    await expect(textbox.locator('p').last()).toHaveText('Ship it 🔥 → “done”...');
  });

  test('an AI action streams into the selection and can be kept', async ({ page }) => {
    const root = example(page, 'ai-actions');
    const paragraph = root.getByRole('textbox').locator('p');
    await paragraph.click({ clickCount: 3 });
    const bubble = page.locator('.tx-editor__bubble');
    await bubble.getByRole('button', { name: 'Improve with AI' }).click();
    await page.getByRole('menuitem', { name: 'Make shorter' }).click();
    await expect(root.locator('.tx-editor__ai-pending')).toBeVisible();
    await expect(root.locator('.tx-editor__ai-result')).toBeVisible();
    await expect(paragraph).toHaveText('Select this sentence about the new…');
    await page.locator('.tx-editor__bubble').getByRole('button', { name: 'Undo' }).click();
    await expect(paragraph).toContainText('pick an AI action from the menu above it.');
  });

  test('the callout marker changes the tone', async ({ page }) => {
    const callout = example(page, 'callouts').locator('[data-type="callout"]').first();
    await expect(callout).toHaveAttribute('data-tone', 'info');
    await callout.getByRole('button', { name: 'Change the callout colour' }).click();
    await expect(callout).toHaveAttribute('data-tone', 'success');
  });

  test('a draft comes back after a reload and is cleared when sent', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('docs-editor-draft'));
    const root = () => example(page, 'drafts');
    await root().getByRole('textbox').click();
    await page.keyboard.type('Half-written reply');
    await page.waitForTimeout(600);
    await page.reload();
    await page.locator('main h1').first().waitFor();
    await expect(root().getByRole('textbox')).toHaveText('Half-written reply');
    await expect(root().getByText('Draft restored')).toBeVisible();
    await root().getByRole('button', { name: 'Send' }).click();
    await expect(root().getByRole('textbox')).toHaveText('');
    expect(await page.evaluate(() => localStorage.getItem('docs-editor-draft'))).toBeNull();
  });
});

test('editor content opens images in a preview', async ({ page }) => {
  await page.goto('/components/editor-content');
  await page.locator('main h1').first().waitFor();
  const image = page.locator('editor-content-images-example img');
  await image.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Sunset gradient' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
