import { Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page.locator('docs-example-frame').filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tree');
    await page.locator('main h1').first().waitFor();
  });

  test('walks and opens branches with the keyboard', async ({ page }) => {
    const tree = example(page, 'Basic').getByRole('tree', { name: 'Files' });
    await tree.getByRole('treeitem', { name: 'Documents' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tree.getByRole('treeitem', { name: 'Documents' })).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(tree.getByRole('treeitem', { name: 'Work' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(tree.getByRole('treeitem', { name: 'Home' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(tree.getByRole('treeitem', { name: 'Documents' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(tree.getByRole('treeitem', { name: 'Movies' })).toBeFocused();
    await page.keyboard.press('e');
    await expect(tree.getByRole('treeitem', { name: 'Events' })).toBeFocused();
  });

  test('checking a branch checks its children and marks the parent as partly checked', async ({ page }) => {
    const frame = example(page, 'Checkbox');
    const tree = frame.getByRole('tree', { name: 'Files with checkboxes' });
    await tree.getByRole('treeitem', { name: 'Expenses.xlsx' }).click();
    await expect(tree.getByRole('treeitem', { name: 'Work' })).toHaveAttribute('aria-checked', 'mixed');
    await expect(tree.getByRole('treeitem', { name: 'Documents' })).toHaveAttribute('aria-checked', 'mixed');
    await tree.getByRole('treeitem', { name: 'Documents' }).focus();
    await page.keyboard.press('Space');
    await expect(tree.getByRole('treeitem', { name: 'Resume.pdf' })).toHaveAttribute('aria-checked', 'true');
    await expect(frame.getByText('6 checked')).toBeVisible();
  });

  test('moves a node with Alt and the arrows', async ({ page }) => {
    const tree = example(page, 'Drag drop').getByRole('tree', { name: 'Inbox' });
    const items = tree.getByRole('group').getByRole('treeitem');
    await tree.getByRole('treeitem', { name: 'Team lunch' }).focus();
    await page.keyboard.press('Alt+ArrowUp');
    await expect(items.first()).toHaveAccessibleName('Team lunch');
    await expect(tree.getByRole('treeitem', { name: 'Team lunch' })).toBeFocused();
  });
});

test.describe('tree table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tree-table');
    await page.locator('main h1').first().waitFor();
  });

  test('opens rows with the arrows and keeps children indented under the parent', async ({ page }) => {
    const grid = example(page, 'Basic').getByRole('treegrid', { name: 'Files' });
    const apps = grid.getByRole('row', { name: /Applications/ });
    await apps.focus();
    await page.keyboard.press('ArrowRight');
    await expect(apps).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowRight');
    const editor = grid.getByRole('row', { name: /Editor 220/ });
    await expect(editor).toBeFocused();
    await expect(editor).toHaveAttribute('aria-level', '2');
    const parentToggle = await apps.locator('.tx-table__tree-toggle').boundingBox();
    const childToggle = await editor.locator('.tx-table__tree-toggle').boundingBox();
    expect(Math.round((childToggle?.x ?? 0) - (parentToggle?.x ?? 0))).toBe(16);
    await page.keyboard.press('ArrowLeft');
    await expect(apps).toBeFocused();
  });

  test('checking a folder checks its branch', async ({ page }) => {
    const frame = example(page, 'Checkbox');
    const grid = frame.getByRole('treegrid', { name: 'Files' });
    await grid.getByRole('row', { name: /editor\.app/ }).getByRole('checkbox').check();
    await expect(grid.getByRole('row', { name: /Editor 220/ }).getByRole('checkbox')).toHaveJSProperty('indeterminate', true);
    await grid.getByRole('row', { name: /Applications/ }).getByRole('checkbox').check();
    await expect(frame.getByText('5 checked')).toBeVisible();
  });
});

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  const watchHeights = (page: Page, selector: string) =>
    page.evaluate(
      (target) =>
        new Promise<number[]>((resolve) => {
          const heights: number[] = [];
          const start = performance.now();
          const tick = () => {
            const element = document.querySelector(target);
            heights.push(element ? element.getBoundingClientRect().height : 0);
            if (performance.now() - start < 700) requestAnimationFrame(tick);
            else resolve(heights);
          };
          requestAnimationFrame(tick);
        }),
      selector,
    );

  test('a tree branch opens like an accordion', async ({ page }) => {
    await page.goto('/components/tree');
    const tree = example(page, 'Basic').getByRole('tree', { name: 'Files' });
    const movies = tree.getByRole('treeitem', { name: 'Movies' });
    await movies.scrollIntoViewIfNeeded();
    const watching = watchHeights(page, 'tree-basic-example li:last-child > .tx-tree__collapse');
    await movies.locator('.tx-tree__toggler').click();
    const heights = await watching;
    const open = heights.at(-1) ?? 0;
    expect(open).toBeGreaterThan(40);
    expect(heights.some((height) => height > 1 && height < open - 1)).toBe(true);
  });

  test('tree table child rows open like an accordion', async ({ page }) => {
    await page.goto('/components/tree-table');
    const grid = example(page, 'Basic').getByRole('treegrid', { name: 'Files' });
    const cloud = grid.getByRole('row', { name: /Cloud/ });
    await cloud.scrollIntoViewIfNeeded();
    const watching = watchHeights(page, 'tree-table-basic-example tr[data-key="backup"]');
    await cloud.getByRole('button', { name: 'Expand row' }).click();
    const heights = await watching;
    const open = heights.at(-1) ?? 0;
    expect(open).toBeGreaterThan(30);
    expect(heights.some((height) => height > 1 && height < open - 1)).toBe(true);
  });
});
