import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { setDarkMode, trackPage } from './helpers';
import { PAGES } from './pages';

for (const path of PAGES) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${path} — ${mode}: renders without errors, shifts or a11y violations`, async ({ page }) => {
      const report = await trackPage(page);
      await page.goto(path);
      await page.locator('main h1').first().waitFor();
      if (mode === 'dark') {
        await setDarkMode(page);
      }
      await page.waitForTimeout(400);

      const { errors, layoutShift } = await report();
      expect(errors, 'console errors').toEqual([]);
      expect(layoutShift, 'cumulative layout shift').toBeLessThan(0.02);

      const axe = await new AxeBuilder({ page }).include('main').analyze();
      const serious = axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
      expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }
}
