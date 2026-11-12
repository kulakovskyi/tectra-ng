import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appDir, workdir } from '../../e2e/ng-add/workdir.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const budgetsPath = join(here, 'budgets.json');
const scenariosDir = join(workdir, 'bundle-size');
const update = process.argv.includes('--update');
const headroom = 0.02;

const PROVIDER = ['provideTectra', '@tectra-ng/core/config', 'createTectraPreset', '@tectra-ng/themes'];

const SCENARIOS = [
  { name: 'angular', what: 'An empty Angular app, for reference', provider: false, components: [] },
  { name: 'provider', what: 'provideTectra with a preset, no component', provider: true, components: [] },
  { name: 'button', what: 'TxButton', provider: true, components: [['TxButton', '@tectra-ng/ui/button']] },
  { name: 'select', what: 'TxSelect', provider: true, components: [['TxSelect', '@tectra-ng/ui/select']] },
  { name: 'table', what: 'TxTable', provider: true, components: [['TxTable', '@tectra-ng/ui/table']] },
  { name: 'datepicker', what: 'TxDatePicker', provider: true, components: [['TxDatePicker', '@tectra-ng/ui/datepicker']] },
  { name: 'dialog', what: 'TxDialog', provider: true, components: [['TxDialog', '@tectra-ng/ui/dialog']] },
  { name: 'line-chart', what: 'TxLineChart', provider: true, components: [['TxLineChart', '@tectra-ng/charts/line']] },
  { name: 'editor', what: 'TxEditor (rich text)', provider: true, components: [['TxEditor', '@tectra-ng/editor']] },
  { name: 'code-editor', what: 'TxCodeEditor', provider: true, components: [['TxCodeEditor', '@tectra-ng/code-editor']] },
];

const ANGULAR_JSON = {
  version: 1,
  cli: { analytics: false },
  newProjectRoot: 'projects',
  projects: {
    size: {
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
};

const TSCONFIG = {
  compilerOptions: { strict: true, skipLibCheck: true, isolatedModules: true, target: 'ES2022', module: 'preserve', types: [] },
  angularCompilerOptions: { strictTemplates: true },
  include: ['src/**/*.ts'],
};

function sources({ provider, components }) {
  const imports = components.map(([symbol, from]) => `import { ${symbol} } from '${from}';`);
  const providers = provider ? `[${PROVIDER[0]}({ preset: ${PROVIDER[2]}() })]` : '[]';
  const providerImports = provider ? [`import { ${PROVIDER[0]} } from '${PROVIDER[1]}';`, `import { ${PROVIDER[2]} } from '${PROVIDER[3]}';`] : [];
  return {
    'angular.json': JSON.stringify(ANGULAR_JSON, null, 2),
    'tsconfig.json': JSON.stringify(TSCONFIG, null, 2),
    'src/index.html': '<!doctype html>\n<html lang="en">\n  <head><meta charset="utf-8" /><title>size</title><base href="/" /></head>\n  <body><app-root></app-root></body>\n</html>\n',
    'src/main.ts': `import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
${[...providerImports, ...imports].join('\n')}

@Component({
  selector: 'app-root',
  imports: [NgComponentOutlet],
  template: '@for (component of components; track $index) { <ng-container *ngComponentOutlet="component" /> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class App {
  protected readonly components: Type<unknown>[] = [${components.map(([symbol]) => symbol).join(', ')}];
}

bootstrapApplication(App, { providers: ${providers} }).catch((error) => console.error(error));
`,
  };
}

function entryPoint(input) {
  const match = /(?:^|\/)node_modules\/(?:@tectra-ng\/[^/]+|tectra-ng)\/fesm2022\/tectra-ng-(.+)\.mjs$/.exec(input);
  return match?.[1];
}

function measure(scenario) {
  const dir = join(scenariosDir, scenario.name);
  rmSync(dir, { recursive: true, force: true });
  for (const [path, text] of Object.entries(sources(scenario))) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  symlinkSync(join(appDir, 'node_modules'), join(dir, 'node_modules'), 'dir');
  execFileSync(process.execPath, [join(appDir, 'node_modules/@angular/cli/bin/ng.js'), 'build', '--stats-json'], {
    cwd: dir,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false', CI: '1' },
    stdio: 'pipe',
  });
  const stats = JSON.parse(readFileSync(join(dir, 'dist/size/browser-stats.json'), 'utf8'));
  const outputs = Object.entries(stats.outputs).filter(([name]) => name.endsWith('.js'));
  const initial = new Set(outputs.filter(([, output]) => output.entryPoint?.endsWith('src/main.ts')).map(([name]) => name));
  for (const name of initial) {
    for (const imported of stats.outputs[name].imports ?? []) {
      if (imported.kind === 'import-statement') {
        initial.add(imported.path);
      }
    }
  }
  const result = { total: 0, kit: 0, lazy: 0, entryPoints: new Set() };
  for (const [name, output] of outputs) {
    const isInitial = initial.has(name);
    if (isInitial) {
      result.total += output.bytes;
    }
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      const entry = entryPoint(input);
      if (!entry) {
        continue;
      }
      if (isInitial) {
        result.kit += bytesInOutput;
        result.entryPoints.add(entry);
      } else {
        result.lazy += bytesInOutput;
      }
    }
  }
  return { ...result, entryPoints: [...result.entryPoints].sort() };
}

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;

if (!existsSync(join(appDir, 'node_modules/tectra-ng/package.json'))) {
  console.error(`No app with the packed packages in ${appDir}. Run npm run build:packages and npm run e2e:ng-add first.`);
  process.exit(1);
}

const budgets = existsSync(budgetsPath) ? JSON.parse(readFileSync(budgetsPath, 'utf8')) : {};
const next = {};
const failures = [];
const notes = [];
const rows = [];

for (const scenario of SCENARIOS) {
  const result = measure(scenario);
  const budget = budgets[scenario.name];
  next[scenario.name] = { what: scenario.what, kitBytes: Math.ceil((result.kit * (1 + headroom)) / 1000) * 1000, entryPoints: result.entryPoints };
  rows.push(`| ${scenario.name} | ${scenario.what} | ${kb(result.kit)} | ${budget ? kb(budget.kitBytes) : '—'} | ${kb(result.total)} | ${result.lazy ? kb(result.lazy) : '—'} |`);
  console.log(
    `${scenario.name.padEnd(12)} kit ${kb(result.kit).padStart(9)}  budget ${(budget ? kb(budget.kitBytes) : '—').padStart(9)}  initial JS ${kb(result.total).padStart(9)}  lazy kit ${kb(result.lazy).padStart(9)}`,
  );
  if (update) {
    continue;
  }
  if (!budget) {
    failures.push(`${scenario.name}: no budget yet — run npm run size:update and commit tools/bundle-size/budgets.json`);
    continue;
  }
  if (result.kit > budget.kitBytes) {
    failures.push(`${scenario.name}: the kit takes ${kb(result.kit)}, over its budget of ${kb(budget.kitBytes)}`);
  } else if (result.kit < budget.kitBytes * (1 - 3 * headroom)) {
    notes.push(`${scenario.name}: ${kb(result.kit)} is well under the budget of ${kb(budget.kitBytes)} — lower it with npm run size:update`);
  }
  const added = result.entryPoints.filter((entry) => !budget.entryPoints.includes(entry));
  const removed = budget.entryPoints.filter((entry) => !result.entryPoints.includes(entry));
  if (added.length) {
    failures.push(`${scenario.name}: now pulls in ${added.join(', ')}`);
  }
  if (removed.length) {
    notes.push(`${scenario.name}: no longer pulls in ${removed.join(', ')} — record it with npm run size:update`);
  }
}

const summary = [
  '### Bundle size',
  '',
  'Production `ng build` of a new Angular app per scenario. "Kit" is the minified JavaScript of `@tectra-ng/*` loaded at start, "initial JS" all of it with Angular, "lazy" the kit code loaded only on use.',
  '',
  '| Scenario | What the app uses | Kit | Budget | Initial JS | Lazy |',
  '|---|---|---|---|---|---|',
  ...rows,
  '',
  ...failures.map((failure) => `- ❌ ${failure}`),
  ...notes.map((note) => `- ${note}`),
  '',
].join('\n');
if (process.env['GITHUB_STEP_SUMMARY']) {
  appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
}

if (update) {
  writeFileSync(budgetsPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`\nBudgets written to ${budgetsPath} (measured + ${headroom * 100}%).`);
} else {
  for (const note of notes) {
    console.log(`note: ${note}`);
  }
  for (const failure of failures) {
    console.error(`error: ${failure}`);
  }
  if (failures.length) {
    console.error('\nA budget grew. Make the change smaller, or raise the budget on purpose with npm run size:update and say why in the pull request.');
    process.exit(1);
  }
}
