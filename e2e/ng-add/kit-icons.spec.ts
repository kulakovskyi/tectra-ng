import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { appDir, workdir } from './workdir.mjs';

const project = join(workdir, 'kit-icons');

const FILES: Record<string, string> = {
  'angular.json': JSON.stringify({
    version: 1,
    cli: { analytics: false },
    newProjectRoot: 'projects',
    projects: {
      icons: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            builder: '@angular/build:application',
            options: { browser: 'src/main.ts', index: 'src/index.html', tsConfig: 'tsconfig.json', outputHashing: 'none' },
          },
        },
      },
    },
  }),
  'tsconfig.json': JSON.stringify({
    compilerOptions: { strict: true, skipLibCheck: true, isolatedModules: true, target: 'ES2022', module: 'preserve', types: [] },
    angularCompilerOptions: { strictTemplates: true },
    include: ['src/**/*.ts'],
  }),
  'src/index.html': '<!doctype html>\n<html lang="en">\n  <head><meta charset="utf-8" /><title>icons</title><base href="/" /></head>\n  <body><app-root></app-root></body>\n</html>\n',
  'src/main.ts': `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTectra } from '@tectra-ng/core/config';
import { createTectraPreset } from '@tectra-ng/themes';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxPassword } from '@tectra-ng/ui/password';
import { TxRating } from '@tectra-ng/ui/rating';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';

@Component({
  selector: 'app-root',
  imports: [FormsModule, TxCheckbox, TxDatePicker, TxInputNumber, TxMessage, TxPassword, TxRating, TxSelect, TxTable],
  template: \`
    <main>
      <h1>Icons of the kit</h1>
      <tx-select ariaLabel="City" [options]="cities" [ngModel]="'Lviv'" />
      <tx-datepicker ariaLabel="Date" [showIcon]="true" />
      <tx-message severity="warn" text="Check the dates" />
      <tx-checkbox binary ariaLabel="Done" [ngModel]="true" />
      <tx-rating [ngModel]="3" />
      <tx-input-number ariaLabel="Count" showButtons [ngModel]="1" />
      <tx-password ariaLabel="Password" toggleMask [ngModel]="'secret'" />
      <tx-table ariaLabel="Rows" [value]="rows" [columns]="columns" [paginator]="true" [rows]="2" />
    </main>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class App {
  readonly cities = ['Kyiv', 'Lviv', 'Odesa'];
  readonly rows = [{ name: 'Desk' }, { name: 'Chair' }, { name: 'Lamp' }];
  readonly columns: TxTableColumn[] = [{ field: 'name', header: 'Name', sortable: true, filter: true }];
}

bootstrapApplication(App, { providers: [provideTectra({ preset: createTectraPreset() })] }).catch((error) => console.error(error));
`,
};

const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

test('kit components draw their own icons when the app registers none', async ({ page, context }) => {
  test.setTimeout(180_000);
  rmSync(project, { recursive: true, force: true });
  for (const [path, text] of Object.entries(FILES)) {
    mkdirSync(dirname(join(project, path)), { recursive: true });
    writeFileSync(join(project, path), text);
  }
  symlinkSync(join(appDir, 'node_modules'), join(project, 'node_modules'), 'dir');
  execFileSync(process.execPath, [join(appDir, 'node_modules/@angular/cli/bin/ng.js'), 'build'], {
    cwd: project,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false', CI: '1' },
    stdio: 'pipe',
  });
  const output = join(project, 'dist/icons/browser');

  const messages: string[] = [];
  page.on('console', (message) => ['error', 'warning'].includes(message.type()) && messages.push(message.text()));
  page.on('pageerror', (error) => messages.push(error.message));
  await context.route('http://icons.test/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const file = join(output, pathname === '/' || !extname(pathname) ? 'index.html' : pathname);
    await (existsSync(file)
      ? route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' })
      : route.fulfill({ status: 404, body: '' }));
  });
  await page.goto('http://icons.test/');
  await expect(page.locator('tx-table tbody tr')).toHaveCount(2);

  const icons = await page.locator('tx-icon').evaluateAll((elements) =>
    elements.map((element) => ({ name: element.getAttribute('data-icon'), paths: element.querySelectorAll('path').length })),
  );
  expect(icons.length).toBeGreaterThan(10);
  expect(icons.filter((icon) => icon.paths === 0)).toEqual([]);

  await page.getByRole('combobox', { name: 'City' }).click();
  await expect(page.getByRole('option', { name: 'Lviv' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Filter Name' }).click();
  await expect(page.locator('.tx-table-filter')).toBeVisible();

  const empty = await page.locator('tx-icon').evaluateAll((elements) => elements.filter((element) => !element.querySelector('path')).map((element) => element.getAttribute('data-icon')));
  expect(empty).toEqual([]);
  expect(messages).toEqual([]);
});
