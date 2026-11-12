import { BrowserContext, Page, expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { appDir, docsPort, stackblitzDir } from './workdir.mjs';

const EXAMPLES = [
  { page: 'button', id: 'severity' },
  { page: 'carousel', id: 'basic' },
  { page: 'editor', id: 'basic' },
  { page: 'code-diff', id: 'basic' },
  { page: 'app-footer', id: 'basic' },
  { page: 'http', id: 'retry' },
  { page: 'country-select', id: 'basic' },
];

const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function capture(page: Page, context: BrowserContext, path: string, id: string): Promise<Record<string, string>> {
  const sent = new Promise<Record<string, string>>((resolve) => {
    void context.route('https://stackblitz.com/**', async (route) => {
      const fields = new URLSearchParams(route.request().postData() ?? '');
      resolve(
        Object.fromEntries(
          [...fields.entries()].filter(([name]) => name.startsWith('project[files][')).map(([name, value]) => [name.slice(15, -1), value.replace(/\r\n/g, '\n')]),
        ),
      );
      await route.fulfill({ contentType: 'text/html', body: '' });
    });
  });
  await page.goto(`http://localhost:${docsPort}/components/${path}`);
  await page.waitForFunction(() => !document.querySelector('[ngh]'));
  const example = page.locator(`section#${id}`);
  await example.scrollIntoViewIfNeeded();
  await example.getByRole('button', { name: /in StackBlitz$/ }).click();
  const files = await sent;
  await context.unroute('https://stackblitz.com/**');
  return files;
}

function write(project: string, files: Record<string, string>): void {
  rmSync(project, { recursive: true, force: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(project, path)), { recursive: true });
    writeFileSync(join(project, path), text);
  }
  symlinkSync(join(appDir, 'node_modules'), join(project, 'node_modules'), 'dir');
}

test.describe('StackBlitz projects of the docs examples', () => {
  test.describe.configure({ timeout: 180_000 });

  for (const { page: path, id } of EXAMPLES) {
    test(`${path} / ${id} installs, builds and runs`, async ({ page, context }) => {
      const files = await capture(page, context, path, id);
      const project = join(stackblitzDir, `${path}-${id}`);
      write(project, files);

      const { dependencies, devDependencies } = JSON.parse(files['package.json']) as Record<string, Record<string, string>>;
      for (const name of Object.keys({ ...dependencies, ...devDependencies })) {
        expect(existsSync(join(appDir, 'node_modules', name, 'package.json')), `${name} is a real package`).toBe(true);
      }

      execFileSync(process.execPath, [join(appDir, 'node_modules/@angular/cli/bin/ng.js'), 'build'], {
        cwd: project,
        env: { ...process.env, NG_CLI_ANALYTICS: 'false', CI: '1' },
        stdio: 'pipe',
      });

      const output = join(project, 'dist/example/browser');
      const errors: string[] = [];
      page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
      page.on('pageerror', (error) => errors.push(error.message));
      await context.route('http://stackblitz.test/**', async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const file = join(output, pathname === '/' || !extname(pathname) ? 'index.html' : pathname);
        await (existsSync(file)
          ? route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' })
          : route.fulfill({ status: 404, body: '' }));
      });
      await page.goto('http://stackblitz.test/');
      await expect(page.locator('app-root > *').first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
