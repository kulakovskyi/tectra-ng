import { expect, test } from '@playwright/test';

test('popup menu opens from the keyboard, moves with arrows and closes with Escape', async ({ page }) => {
  await page.goto('/components/menu');
  const trigger = page.locator('menu-popup-example').getByRole('button', { name: 'Sort by' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'Sort by' });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('menuitem', { name: 'Title' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Due date' })).toBeFocused();
  await page.keyboard.press('p');
  await expect(menu.getByRole('menuitem', { name: 'Priority' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('row menu runs the chosen action', async ({ page }) => {
  await page.goto('/components/menu');
  const example = page.locator('menu-popup-example');
  await example.getByRole('button', { name: 'Actions for Write release notes' }).click();
  await page.getByRole('menu', { name: 'Task actions' }).getByRole('menuitem', { name: 'Mark as done' }).click();
  await expect(page.getByRole('menu', { name: 'Task actions' })).toHaveCount(0);
  await expect(example.locator('li.done')).toHaveCount(2);
});

test('tiered menu opens sub-menus on hover and with the keyboard', async ({ page }) => {
  await page.goto('/components/menu');
  const example = page.locator('menu-tiered-example');
  const inline = example.getByRole('menu', { name: 'Message' });
  const moveTo = inline.getByRole('menuitem', { name: 'Move to' });
  await moveTo.hover();
  const submenu = page.locator('tx-menu-list[data-panel="submenu"]');
  await expect(submenu).toBeVisible();
  await expect(moveTo).toHaveAttribute('aria-expanded', 'true');
  const [parent, child] = await Promise.all([moveTo, submenu].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(child.left).toBeGreaterThanOrEqual(parent.right - 1);
  await submenu.getByRole('menuitem', { name: 'Projects' }).hover();
  await expect(submenu).toHaveCount(2);
  await submenu.last().getByRole('menuitem', { name: 'Atlas' }).click();
  await expect(example).toContainText('Last action: Atlas');
  await expect(submenu).toHaveCount(0);

  await moveTo.focus();
  await page.keyboard.press('ArrowRight');
  await expect(submenu.getByRole('menuitem', { name: 'Inbox' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(submenu).toHaveCount(0);
  await expect(moveTo).toBeFocused();
});

test('sub-menu flips to the left at the edge of the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await page.goto('/components/menu');
  const trigger = page.locator('menu-tiered-example').getByRole('button', { name: 'More' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((element) => {
    element.style.position = 'fixed';
    element.style.right = '8px';
    element.style.top = '200px';
  });
  await trigger.click();
  const more = page.getByRole('menu', { name: 'More' });
  const moveTo = more.getByRole('menuitem', { name: 'Move to' });
  await moveTo.focus();
  await page.keyboard.press('ArrowRight');
  const submenu = page.locator('tx-menu-list[data-panel="submenu"]');
  await expect(submenu).toBeVisible();
  const [parent, child] = await Promise.all([moveTo, submenu].map((locator) => locator.evaluate((element) => element.getBoundingClientRect().toJSON())));
  expect(child.right).toBeLessThanOrEqual(parent.left + 1);
});

test('context menu opens at the pointer and from the keyboard', async ({ page }) => {
  await page.goto('/components/menu');
  const example = page.locator('menu-context-menu-example');
  const row = example.getByRole('row', { name: /Logo\.svg/ });
  const box = await row.boundingBox();
  await row.click({ button: 'right', position: { x: 40, y: 10 } });
  const menu = page.getByRole('menu', { name: 'File actions' });
  await expect(menu).toBeVisible();
  const panel = await menu.boundingBox();
  expect(Math.abs((panel?.x ?? 0) - ((box?.x ?? 0) + 40))).toBeLessThan(2);
  await menu.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(example.getByRole('row', { name: /Logo\.svg/ })).toHaveCount(0);

  await example.getByRole('row', { name: /Roadmap/ }).focus();
  await page.keyboard.press('Shift+F10');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Open' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
});
