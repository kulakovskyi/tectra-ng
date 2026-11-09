import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { trackPage } from './helpers';
import { PAGES } from './pages';

const STYLES = ['soft', 'edge', 'paper'] as const;

const THEMED_PAGES = [
  '/theming',
  '/components/button',
  '/components/input',
  '/components/select',
  '/components/checkbox',
  '/components/toggle-switch',
  '/components/tag',
  '/components/message',
  '/components/tabs',
  '/components/datepicker',
  '/components/table',
  '/components/paginator',
  '/components/menu',
  '/components/dialog',
  '/components/toast',
  '/components/card',
  '/components/stepper',
  '/components/filters-panel',
  '/components/kanban',
];

const pages = process.env['TX_E2E_ALL_STYLES'] ? PAGES.filter((path) => path !== '/') : THEMED_PAGES;

for (const style of STYLES) {
  for (const mode of ['light', 'dark'] as const) {
    for (const path of pages) {
      test(`${style} ${mode} ${path}: renders without errors or a11y violations`, async ({ page }) => {
        await page.addInitScript(
          (choice) => localStorage.setItem('tx-docs-theme', JSON.stringify(choice)),
          { style, primary: 'blue', surface: 'ink', ripple: true, mode },
        );
        const report = await trackPage(page);
        await page.goto(path);
        await page.locator('main h1').first().waitFor();
        await expect(page.locator('html')).toHaveAttribute('data-tx-theme', mode);
        await page.waitForTimeout(400);

        const { errors } = await report();
        expect(errors, 'console errors').toEqual([]);

        const axe = await new AxeBuilder({ page }).include('main').analyze();
        const serious = axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
        expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
      });
    }
  }
}
