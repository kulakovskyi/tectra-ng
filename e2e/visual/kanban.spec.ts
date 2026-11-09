import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`kanban-${id}-example`);
const column = (root: Locator, title: string) =>
  root.locator('.tx-kanban__column', { has: root.page().locator('.tx-kanban__title, .section-name', { hasText: title }) });
const task = (root: Locator, id: string) => root.locator(`[data-kanban-card="${id}"] .task`);

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element is not visible');
  }
  return rect;
}

test.describe('kanban', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/kanban');
    await page.locator('main h1').first().waitFor();
  });

  test('Alt and the arrows move a card between columns and keep the focus on it', async ({ page }) => {
    const root = example(page, 'basic');
    await task(root, 't2').focus();
    await page.keyboard.press('Alt+ArrowRight');
    await expect(column(root, 'In progress').locator('[data-kanban-card="t2"]')).toBeVisible();
    await expect(task(root, 't2')).toBeFocused();
    await page.keyboard.press('Alt+ArrowUp');
    await expect(column(root, 'In progress').locator('.tx-kanban__card').first()).toHaveAttribute('data-kanban-card', 't2');
  });

  test('a card dragged with the pointer lands in another column', async ({ page }) => {
    const root = example(page, 'basic');
    const card = root.locator('[data-kanban-card="t1"]');
    const target = column(root, 'Done').locator('.tx-kanban__list');
    const from = await box(card);
    const to = await box(target);
    await page.mouse.move(from.x + 20, from.y + 20);
    await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y + 40, { steps: 5 });
    await page.mouse.move(to.x + 30, to.y + to.height - 10, { steps: 15 });
    await page.mouse.up();
    await expect(column(root, 'Done').locator('[data-kanban-card="t1"]')).toBeVisible();
    await expect(column(root, 'Done').locator('tx-pill').first()).toHaveText('2');
  });

  test('a column moves with its handle and the keyboard', async ({ page }) => {
    const root = example(page, 'basic');
    const titles = () => root.locator('.section-name').allTextContents();
    await root.locator('[data-kanban-handle="todo"]').focus();
    await page.keyboard.press('Alt+ArrowRight');
    await expect.poll(titles).toEqual(['In progress', 'To do', 'Done']);
  });

  test('a fixed board scrolls inside its columns and shows more cards on request', async ({ page }) => {
    const root = example(page, 'fixed-height');
    const list = column(root, 'New').locator('.tx-kanban__list');
    await expect(list.locator('.tx-kanban__card')).toHaveCount(6);
    const more = column(root, 'New').getByRole('button', { name: 'Show 8 more' });
    const [moreBox, listBox] = [await box(more), await box(list)];
    expect(Math.abs(moreBox.width - (listBox.width - 7))).toBeLessThanOrEqual(1);
    await more.click();
    await expect(list.locator('.tx-kanban__card')).toHaveCount(12);
    expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    const first = await box(list.locator('.tx-kanban__card').nth(6));
    const view = await box(list);
    expect(first.y).toBeGreaterThanOrEqual(view.y - 1);
    expect(first.y + first.height).toBeLessThanOrEqual(view.y + view.height + 1);
  });

  test('column rings stay inside the scroll area of the board', async ({ page }) => {
    for (const id of ['basic', 'fixed-height', 'templates', 'design-tokens']) {
      const root = example(page, id);
      const board = await box(root.locator('.tx-kanban__board'));
      const first = await box(root.locator('.tx-kanban__column').first());
      expect(first.x - board.x).toBeGreaterThanOrEqual(2);
      expect(first.y - board.y).toBeGreaterThanOrEqual(2);
    }
  });

  test('quick add puts a task on top or at the bottom and a new section after the last one', async ({ page }) => {
    const root = example(page, 'basic');
    const todo = column(root, 'To do');
    await todo.getByRole('button', { name: 'Add task', exact: true }).click();
    const field = root.locator('#kanban-quick-add-todo');
    await expect(field).toBeFocused();
    await field.fill('Bottom task');
    await field.press('Enter');
    await expect(todo.locator('.task-name').last()).toHaveText('Bottom task');
    await field.press('Escape');
    await expect(field).toHaveCount(0);
    await todo.getByRole('button', { name: 'Add task to To do' }).click();
    await expect(field).toBeFocused();
    await field.fill('Top task');
    await field.press('Enter');
    await expect(todo.locator('.task-name').first()).toHaveText('Top task');
    await field.press('Escape');
    await root.getByRole('button', { name: 'Add section' }).click();
    await root.locator('#kanban-quick-add-section').fill('Review');
    await root.locator('#kanban-quick-add-section').press('Enter');
    await expect(root.locator('.section-name').last()).toHaveText('Review');
  });
});
