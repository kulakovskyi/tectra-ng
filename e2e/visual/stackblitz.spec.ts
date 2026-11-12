import { BrowserContext, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from './fixtures';

const root = join(__dirname, '../..');
const content = (component: string, id: string) => readFileSync(join(root, 'apps/docs/src/content/components', component, 'examples', `${id}.example.ts`), 'utf8');
const kitVersion = (JSON.parse(readFileSync(join(root, 'packages/tectra-ng/package.json'), 'utf8')) as { version: string }).version;

interface Payload {
  url: string;
  fields: URLSearchParams;
  files: Record<string, string>;
}

async function openInStackblitz(page: Page, context: BrowserContext, exampleId: string): Promise<Payload> {
  const sent = new Promise<Payload>((resolve) => {
    void context.route('https://stackblitz.com/**', async (route) => {
      const fields = new URLSearchParams(route.request().postData() ?? '');
      const files = Object.fromEntries(
        [...fields.entries()].filter(([name]) => name.startsWith('project[files][')).map(([name, value]) => [name.slice(15, -1), value.replace(/\r\n/g, '\n')]),
      );
      resolve({ url: route.request().url(), fields, files });
      await route.fulfill({ contentType: 'text/html', body: '<title>StackBlitz</title>' });
    });
  });
  const example = page.locator(`section#${exampleId}`);
  await example.scrollIntoViewIfNeeded();
  await example.getByRole('button', { name: /in StackBlitz$/ }).click();
  return sent;
}

test.describe('Open in StackBlitz', () => {
  test('sends the example as an Angular CLI project with the kit at the docs version', async ({ page, context }) => {
    await page.goto('/components/button');
    const payload = await openInStackblitz(page, context, 'severity');

    expect(payload.url).toBe('https://stackblitz.com/run?file=src%2Fapp%2Fseverity.example.ts');
    expect(payload.fields.get('project[template]')).toBe('node');
    expect(payload.fields.get('project[title]')).toBe('Button: Severity — tectra');
    expect(Object.keys(payload.files).sort()).toEqual([
      '.stackblitzrc',
      'angular.json',
      'package.json',
      'src/app/app.config.ts',
      'src/app/app.ts',
      'src/app/severity.example.ts',
      'src/index.html',
      'src/main.ts',
      'src/styles.css',
      'tsconfig.json',
    ]);
    expect(payload.files['src/app/severity.example.ts'].trimEnd()).toBe(content('button', 'severity').trimEnd());
    expect(payload.files['src/app/app.ts']).toContain("import Example from './severity.example';");

    const manifest = JSON.parse(payload.files['package.json']) as { dependencies: Record<string, string>; scripts: Record<string, string> };
    expect(manifest.dependencies['tectra-ng']).toBe(kitVersion);
    expect(manifest.dependencies['@tectra-ng/editor']).toBeUndefined();
    expect(manifest.dependencies['@angular/cdk']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.scripts['start']).toBe('ng serve');
    expect(payload.files['src/styles.css']).toContain('.flex {');
    expect(payload.files['src/index.html']).toContain('family=Onest');
    expect(payload.files['src/app/app.config.ts']).toContain("provideTectra({ preset: createTectraPreset({ primary: 'blue' }), ripple: true })");
  });

  test('carries the theme picked on the site', async ({ page, context }) => {
    await page.addInitScript(() =>
      localStorage.setItem('tx-docs-theme', JSON.stringify({ style: 'soft', primary: 'violet', surface: 'slate', mode: 'dark', ripple: false })),
    );
    await page.goto('/components/button');
    const payload = await openInStackblitz(page, context, 'severity');
    expect(payload.files['src/app/app.config.ts']).toContain(
      "provideTectra({ preset: createTectraPreset({ style: 'soft', primary: 'violet', surface: 'slate' }), mode: 'dark' })",
    );
  });

  test('includes the images an example shows', async ({ page, context }) => {
    await page.goto('/components/carousel');
    const payload = await openInStackblitz(page, context, 'basic');
    const images = Object.keys(payload.files).filter((path) => path.startsWith('public/'));
    expect(images.length).toBeGreaterThan(0);
    for (const path of images) {
      expect(path).toMatch(/^public\/images\/gallery\/[a-z]+\.svg$/);
      expect(payload.files[path]).toContain('<svg');
    }
  });

  test('adds the editor package for an editor example', async ({ page, context }) => {
    await page.goto('/components/editor');
    const payload = await openInStackblitz(page, context, 'basic');
    const manifest = JSON.parse(payload.files['package.json']) as { dependencies: Record<string, string> };
    expect(manifest.dependencies['@tectra-ng/editor']).toBe(kitVersion);
    expect(manifest.dependencies['tectra-ng']).toBe(kitVersion);
  });

  test('is a labelled button reached with the keyboard', async ({ page, context }) => {
    await page.goto('/components/button');
    const button = page.locator('section#severity').getByRole('button', { name: 'Open Severity in StackBlitz' });
    await expect(button).toHaveAttribute('title', 'Open in StackBlitz');
    await button.focus();
    const sent = new Promise<string>((resolve) => {
      void context.route('https://stackblitz.com/**', async (route) => {
        resolve(route.request().method());
        await route.fulfill({ contentType: 'text/html', body: '' });
      });
    });
    await page.keyboard.press('Enter');
    expect(await sent).toBe('POST');
  });
});
