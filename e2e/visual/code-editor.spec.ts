import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, name: string, id: string) => page.locator(`${name}-${id}-example`);
const lines = (root: ReturnType<Page['locator']>) => root.locator('.cm-line').allTextContents();

test.describe('code editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/code-editor');
    await page.locator('main h1').first().waitFor();
  });

  test('typing closes tags and brackets, keeps indents and undoes in steps', async ({ page }) => {
    const root = example(page, 'code-editor', 'basic');
    await root.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('<div class="box');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('>');
    expect(await lines(root)).toEqual(['<div class="box"></div>']);
    await page.keyboard.press('Enter');
    await page.keyboard.type('f(a');
    expect(await lines(root)).toEqual(['<div class="box">', '  f(a)', '</div>']);
    await expect(root.locator('.tx-code-tok-tag').first()).toHaveText('div');
    await page.keyboard.press('ControlOrMeta+z');
    expect(await lines(root)).toEqual(['<div class="box">', '  ', '</div>']);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect(await lines(root)).toEqual(['<div class="box">', '  f(a)', '</div>']);
    await page.keyboard.press('ControlOrMeta+/');
    expect(await lines(root)).toEqual(['<div class="box">', '  <!-- f(a) -->', '</div>']);
    await expect(root.locator('.meta')).toHaveText('40 characters');
  });

  test('search counts, steps through and replaces matches', async ({ page }) => {
    const root = example(page, 'code-editor', 'search');
    await root.getByRole('button', { name: 'Replace', exact: true }).first().click();
    const find = root.getByRole('textbox', { name: 'Find' });
    const replace = root.getByRole('textbox', { name: 'Replace' });
    await expect(replace).toBeFocused();
    await find.fill('#1d4ed8');
    await expect(root.locator('.tx-code-editor__search-count')).toHaveText('1 of 4');
    await expect(root.locator('.tx-code-editor__match')).toHaveCount(4);
    await find.press('Enter');
    await expect(root.locator('.tx-code-editor__search-count')).toHaveText('2 of 4');
    await root.getByRole('button', { name: 'Match whole word' }).click();
    await root.getByRole('button', { name: 'Use regular expression' }).click();
    await find.fill('color');
    await expect(root.locator('.tx-code-editor__search-count')).toHaveText(/ of 4$/);
    await replace.fill('fill');
    await replace.press('ControlOrMeta+Enter');
    await expect(root.locator('.tx-code-editor__search-count')).toHaveText('No results');
    await find.press('Escape');
    await expect(root.locator('.tx-code-editor__search')).toHaveCount(0);
    await expect(root.locator('.cm-content')).toBeFocused();
    expect((await lines(root)).filter((line) => line.includes('fill:'))).toHaveLength(4);
  });

  test('the diff scrolls only itself to the first change, not the page', async ({ page }) => {
    await page.reload();
    await page.locator('main h1').first().waitFor();
    await expect(example(page, 'code-editor', 'diff-mode').locator('.cm-editor')).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('Escape and then Tab moves focus out of the editor', async ({ page }) => {
    const root = example(page, 'code-editor', 'options');
    const content = root.locator('.cm-content');
    await content.click();
    await page.keyboard.press('Tab');
    await expect(content).toBeFocused();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');
    await expect(content).not.toBeFocused();
  });

  test('wrapped lines continue at their indent', async ({ page }) => {
    const root = example(page, 'code-editor', 'options');
    const line = root.locator('.cm-line', { hasText: 'Hello from the edge' });
    const box = await line.boundingBox();
    const rects = await line.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()].map((rect) => ({ left: rect.left, top: rect.top }));
    });
    const firstTop = Math.min(...rects.map((rect) => rect.top));
    const wrapped = rects.filter((rect) => rect.top > firstTop + 2);
    expect(wrapped.length).toBeGreaterThan(0);
    expect(box).not.toBeNull();
    expect(Math.min(...wrapped.map((rect) => rect.left)) - (box?.x ?? 0)).toBeGreaterThan(10);
  });
});

test.describe('code diff', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/code-diff');
    await page.locator('main h1').first().waitFor();
  });

  test('both sides of the split view scroll together', async ({ page }) => {
    const root = example(page, 'code-diff', 'side-by-side');
    const scrollers = root.locator('.cm-scroller');
    await expect(scrollers).toHaveCount(2);
    await root.locator('tx-code-diff').evaluate((element: HTMLElement) => (element.style.height = '120px'));
    await scrollers.nth(1).evaluate((element) => (element.scrollTop = 60));
    await expect.poll(() => scrollers.nth(0).evaluate((element) => element.scrollTop)).toBe(60);
    const top = async (index: number) => (await root.locator('.cm-content').nth(index).locator('.cm-line').last().boundingBox())?.y;
    expect(await top(0)).toBe(await top(1));
  });

  test('editing updates the diff and the counts', async ({ page }) => {
    const root = example(page, 'code-diff', 'editable');
    await expect(root.locator('tx-tag').first()).toHaveText('+3');
    await root.getByRole('button', { name: 'Revert' }).click();
    await expect(root.locator('tx-tag').first()).toHaveText('+0');
    await expect(root.locator('.tx-code-diff__line--inserted')).toHaveCount(0);
    await root.locator('.cm-line').nth(1).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' /* new */');
    await expect(root.locator('tx-tag').first()).toHaveText('+1');
    await expect(root.locator('.tx-code-diff__text--inserted')).toHaveText(' /* new */');
  });

  test('next and previous jump between changes', async ({ page }) => {
    const root = example(page, 'code-diff', 'navigation');
    await root.getByRole('button', { name: 'Next' }).click();
    await expect(root.locator('.cm-activeLine')).toContainText('sold out');
    await root.getByRole('button', { name: 'Next' }).click();
    await expect(root.locator('.cm-activeLine')).toContainText('class="new"');
    await root.getByRole('button', { name: 'Previous' }).click();
    await expect(root.locator('.cm-activeLine')).toContainText('sold out');
  });
});
