import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

async function scrollInto(page: Page, selector: string, share: number): Promise<void> {
  await page.evaluate(
    ({ selector, share }) => {
      const element = document.querySelector(selector) as HTMLElement;
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + Math.max(element.offsetHeight - document.documentElement.clientHeight, 0) * share);
    },
    { selector, share },
  );
}

const progress = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => Number((element as HTMLElement).style.getPropertyValue('--p')));

test.describe('landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('h1').waitFor();
  });

  test('the heading names the kit and cycles through what it builds', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/Angular UI\s+for your\s+whole app/);
    await expect(page.locator('.hero__word')).toHaveCount(8);
    const track = page.locator('.hero__track');
    await expect(track).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => track.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');
  });

  test('the mosaic scatters as the page scrolls', async ({ page }) => {
    const before = await progress(page, '.hero');
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(() => progress(page, '.hero')).toBeGreaterThan(before);
  });

  test('the questions pile up, then fall away for the answer', async ({ page }) => {
    const chips = page.locator('.chip--on');
    await scrollInto(page, '.questions', 0.1);
    const early = await chips.count();
    await scrollInto(page, '.questions', 0.55);
    await expect.poll(() => chips.count()).toBeGreaterThan(early);
    await scrollInto(page, '.questions', 0.9);
    await expect(page.locator('.questions')).toHaveClass(/questions--answered/);
    await expect(page.getByText("That's why tectra exists.")).toBeVisible();
  });

  test('the feature cards stack and load live components', async ({ page }) => {
    const cards = page.locator('.card');
    await cards.nth(1).scrollIntoViewIfNeeded();
    await expect(page.getByRole('table', { name: 'Accounts' })).toBeVisible();
    await scrollInto(page, '.features__stack', 0.5);
    await expect.poll(() => cards.first().evaluate((element) => Number((element as HTMLElement).style.getPropertyValue('--c')))).toBeGreaterThan(0.9);
    await expect(page.getByRole('combobox', { name: 'Plan' })).toBeAttached();
  });

  test('the theme card recolours the whole page', async ({ page }) => {
    await page.locator('.card').nth(4).scrollIntoViewIfNeeded();
    await page.locator('docs-landing-theme-demo').waitFor();
    const primary = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tx-primary-base').trim());
    const before = await primary();
    await page.getByRole('button', { name: 'emerald' }).click();
    await expect(page.getByRole('button', { name: 'emerald' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(primary).not.toBe(before);
    await page.getByRole('button', { name: 'Soft' }).click();
    await expect(page.getByRole('button', { name: 'Soft' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the libraries merge into one kit', async ({ page }) => {
    await scrollInto(page, '.glue', 0.2);
    await expect
      .poll(() =>
        page
          .locator('.library')
          .first()
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeGreaterThan(0.5);
    await scrollInto(page, '.glue', 0.95);
    await expect
      .poll(() =>
        page
          .locator('.library')
          .first()
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.05);
    await expect.poll(() => page.locator('.glue__merge').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  });

  test('the numbers count up to their values', async ({ page }) => {
    await page.locator('.stats__grid').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 400));
    await expect(page.locator('.stat__value').nth(1)).toHaveText('334');
  });

  test('the catalog counts the components of each group', async ({ page }) => {
    const charts = page.locator('.tile', { hasText: 'Charts' });
    await expect(charts.locator('.tile__note')).toHaveText(/^\d+ · /);
    await charts.click();
    await expect(page).toHaveURL(/\/components\/line-chart$/);
  });

  test('the questions open one at a time', async ({ page }) => {
    const free = page.getByRole('button', { name: 'Is tectra free?' });
    const ssr = page.getByRole('button', { name: 'Does it work with server rendering?' });
    await free.scrollIntoViewIfNeeded();
    await free.click();
    await expect(free).toHaveAttribute('aria-expanded', 'true');
    await ssr.click();
    await expect(ssr).toHaveAttribute('aria-expanded', 'true');
    await expect(free).toHaveAttribute('aria-expanded', 'false');
  });

  test('leads into getting started', async ({ page }) => {
    await page.locator('.closing').getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/getting-started$/);
  });
});
