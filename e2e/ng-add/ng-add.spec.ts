import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTectraPreset } from '@tectra-ng/themes';
import { answers, appDir } from './workdir.mjs';

const read = (path: string) => readFileSync(join(appDir, path), 'utf8');
const occurrences = (text: string, part: string) => text.split(part).length - 1;

function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

test.describe('ng add tectra-ng in a new Angular app', () => {
  test('installs the kit and its peers', () => {
    const { dependencies } = JSON.parse(read('package.json')) as { dependencies: Record<string, string> };
    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(['tectra-ng', '@angular/cdk', '@angular/forms', '@angular/router']));
    expect(dependencies['@angular/cdk']).toBe(dependencies['@angular/core']);
  });

  test('provides tectra once with the chosen preset', () => {
    const config = read('src/app/app.config.ts');
    expect(config).toContain("import { provideTectra } from '@tectra-ng/core/config';");
    expect(config).toMatch(/provideTectra\(\{\s*preset: createTectraPreset\(/);
    expect(config).toContain(`createTectraPreset({ style: '${answers.style}', primary: '${answers.primary}', surface: '${answers.surface}' })`);
    expect(occurrences(config, 'provideTectra(')).toBe(1);
    expect(occurrences(config, 'provideTxIcons(TX_ICONS)')).toBe(1);
  });

  test('adds the fonts to index.html once', () => {
    const html = read('src/index.html');
    expect(occurrences(html, 'family=Onest')).toBe(1);
    expect(html.indexOf('fonts.googleapis.com')).toBeLessThan(html.indexOf('</head>'));
  });

  test('renders themed components without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');

    const button = page.getByRole('button', { name: 'Save' });
    await expect(button).toHaveClass(/tx-button/);
    const preset = createTectraPreset({ style: 'soft', primary: 'violet', surface: 'slate' } as const);
    await expect(button).toHaveCSS('background-color', rgb(preset.light.primary.base));
    expect(await page.evaluate(() => [...document.fonts].some((font) => font.family.includes('Onest')))).toBe(true);

    expect(await page.locator('tx-select .tx-icon path').count()).toBeGreaterThan(0);

    await button.click();
    await page.getByRole('combobox', { name: 'City' }).click();
    await page.getByRole('option', { name: 'Lviv' }).click();
    await expect(page.locator('.state')).toHaveText('Saved · Lviv');

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
