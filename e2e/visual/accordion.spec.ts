import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

test.describe('accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/accordion');
    await page.locator('main h1').first().waitFor();
  });

  test('opens and closes several panels', async ({ page }) => {
    const frame = example(page, 'Basic');
    const accordion = frame.locator('tx-accordion');
    const headers = accordion.locator('.tx-accordion-header__button');
    const second = accordion.getByText('Thirty days before it expires.');
    await expect(headers.first()).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toBeHidden();
    await headers.nth(1).click();
    await expect(headers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toBeVisible();
    await expect(frame.getByText('Open: dns, ssl')).toBeVisible();
    await headers.first().click();
    await expect(accordion.getByText('Most resolvers pick up a change')).toBeHidden();
    await expect(frame.getByText('Open: ssl')).toBeVisible();
  });

  test('keeps one panel open when multiple is off', async ({ page }) => {
    const frame = example(page, 'Single');
    const headers = frame.locator('.tx-accordion-header__button');
    await headers.nth(1).click();
    await expect(headers.first()).toHaveAttribute('aria-expanded', 'false');
    await expect(frame.getByText('Open: team')).toBeVisible();
  });

  test('moves between headers with the arrows and toggles with Enter', async ({ page }) => {
    const headers = example(page, 'Disabled').locator('.tx-accordion-header__button');
    await headers.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(headers.nth(2)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(headers.nth(2)).toHaveAttribute('aria-expanded', 'true');
  });

  test('is a bordered box with rounded outer corners and tone bars', async ({ page }) => {
    const headers = example(page, 'Tones').locator('.tx-accordion-header__button');
    const first = await headers.first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { top: style.borderTopWidth, left: style.borderLeftWidth, radius: style.borderTopLeftRadius, shadow: style.boxShadow };
    });
    expect(first.top).toBe('1px');
    expect(first.left).toBe('1px');
    expect(first.radius).toBe('10px');
    expect(first.shadow).toContain('inset');
    expect(first.shadow).toContain('3px');
    const second = await headers.nth(1).evaluate((element) => getComputedStyle(element).borderTopWidth);
    expect(second).toBe('0px');
  });

  test('rounds the bottom border of the last open panel', async ({ page }) => {
    const accordion = example(page, 'Tones').locator('tx-accordion');
    await accordion.locator('.tx-accordion-header__button').last().click();
    const inner = accordion.locator('tx-accordion-panel').last().locator('.tx-accordion-content__inner');
    await expect(inner).toBeVisible();
    const style = await inner.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { width: computed.borderBottomWidth, start: computed.borderBottomLeftRadius, end: computed.borderBottomRightRadius };
    });
    expect(style).toEqual({ width: '1px', start: '10px', end: '10px' });
  });

  test('reveals an opening panel as fast as it makes room for it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const accordion = example(page, 'Basic').locator('tx-accordion');
    await accordion.evaluate((element: HTMLElement) => element.style.setProperty('--tx-accordion-expand-duration', '20s'));
    const content = accordion.locator('.tx-accordion-content').nth(1);
    await accordion.locator('.tx-accordion-header__button').nth(1).click();
    const frame = await content.evaluate((element) => {
      for (const animation of element.getAnimations()) {
        animation.pause();
        animation.currentTime = 3000;
      }
      const box = element.getBoundingClientRect();
      const inner = element.querySelector('.tx-accordion-content__inner');
      let bottom = inner?.getBoundingClientRect().bottom ?? box.top;
      for (let node = inner?.parentElement; node && node !== element.parentElement; node = node.parentElement) {
        if (getComputedStyle(node).overflowY !== 'visible') bottom = Math.min(bottom, node.getBoundingClientRect().bottom);
      }
      return { room: box.height, shown: bottom - box.top };
    });
    expect(frame.room).toBeGreaterThan(10);
    expect(Math.abs(frame.shown - frame.room)).toBeLessThan(1);
  });

  test('gives a header template the whole header up to the toggle icon', async ({ page }) => {
    const header = example(page, 'Templates').locator('.tx-accordion-header__button').first();
    const gap = await header.evaluate((element) => {
      const content = element.querySelector('.tx-accordion-header__content')?.getBoundingClientRect();
      const toggle = element.querySelector('.tx-accordion-header__toggle')?.getBoundingClientRect();
      return (toggle?.left ?? 0) - (content?.right ?? 0);
    });
    expect(gap).toBe(7);
    const space = await header.evaluate((element) => {
      const pill = element.querySelector('tx-pill')?.getBoundingClientRect();
      const toggle = element.querySelector('.tx-accordion-header__toggle')?.getBoundingClientRect();
      return (toggle?.left ?? 0) - (pill?.right ?? 0);
    });
    expect(space).toBeLessThan(8);
  });
});
