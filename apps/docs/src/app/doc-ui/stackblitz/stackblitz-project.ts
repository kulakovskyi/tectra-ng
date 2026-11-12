import { StackblitzExample, StackblitzProject, StackblitzSetup, StackblitzTheme } from './stackblitz.types';

const SEPARATE_PACKAGES = ['@tectra-ng/editor', '@tectra-ng/code-editor'];

const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com" />',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=JetBrains+Mono:wght@400;500&display=swap" />',
];

const ASSET_PATTERN = /(?<=["'`(/])images\/[\w/-]+\.svg|(?<=["'`(])\/favicon\.svg/g;

const BASE_STYLES = `*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  background: var(--tx-surface-0);
  color: var(--tx-text-primary);
  font: var(--tx-font-size-md) / 1.6 var(--tx-font-family);
  -webkit-font-smoothing: antialiased;
}

:root[data-tx-theme='dark'] body {
  background: color-mix(in srgb, var(--tx-surface-900) 70%, var(--tx-surface-950));
}

body {
  padding: 36px;
}

a {
  color: var(--tx-primary-base);
}

code {
  font-family: var(--tx-font-mono);
  font-size: 0.88em;
}
`;

const ANGULAR_JSON = {
  $schema: './node_modules/@angular/cli/lib/config/schema.json',
  version: 1,
  cli: { packageManager: 'npm', analytics: false },
  newProjectRoot: 'projects',
  projects: {
    example: {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      prefix: 'app',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: {
            browser: 'src/main.ts',
            tsConfig: 'tsconfig.json',
            assets: [{ glob: '**/*', input: 'public' }],
            styles: ['src/styles.css'],
          },
          configurations: {
            development: { optimization: false, extractLicenses: false, sourceMap: true },
          },
          defaultConfiguration: 'development',
        },
        serve: {
          builder: '@angular/build:dev-server',
          configurations: { development: { buildTarget: 'example:build:development' } },
          defaultConfiguration: 'development',
        },
      },
    },
  },
};

const TSCONFIG = {
  compileOnSave: false,
  compilerOptions: {
    strict: true,
    noImplicitOverride: true,
    noPropertyAccessFromIndexSignature: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    skipLibCheck: true,
    isolatedModules: true,
    experimentalDecorators: true,
    importHelpers: true,
    target: 'ES2022',
    module: 'preserve',
    types: [],
  },
  angularCompilerOptions: {
    strictInjectionParameters: true,
    strictInputAccessModifiers: true,
    strictTemplates: true,
  },
  include: ['src/**/*.ts'],
};

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function exampleAssets(source: string): string[] {
  return [...new Set(source.match(ASSET_PATTERN) ?? [])].map((path) => path.replace(/^\//, '')).sort();
}

export function exampleDependencies(source: string, setup: StackblitzSetup): Record<string, string> {
  const separate = SEPARATE_PACKAGES.filter((name) => source.includes(`from '${name}'`) || source.includes(`from '${name}/`));
  const kit = Object.fromEntries(['tectra-ng', ...separate].map((name) => [name, setup.kitVersion]));
  return Object.fromEntries(Object.entries({ ...setup.dependencies, ...kit }).sort(([a], [b]) => a.localeCompare(b)));
}

export function presetCall({ style, primary, surface }: StackblitzTheme): string {
  const options = [style !== 'tectra' ? `style: '${style}'` : '', `primary: '${primary}'`, surface !== 'ink' ? `surface: '${surface}'` : ''].filter(Boolean);
  return `createTectraPreset({ ${options.join(', ')} })`;
}

function appConfig(theme: StackblitzTheme): string {
  const options = [`preset: ${presetCall(theme)}`, theme.mode === 'dark' ? "mode: 'dark'" : '', theme.ripple ? 'ripple: true' : ''].filter(Boolean);
  return `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTxBrandIcons } from '@tectra-ng/brand-icons';
import { provideTectra } from '@tectra-ng/core/config';
import { loadTxFlag } from '@tectra-ng/flags';
import { createTectraPreset } from '@tectra-ng/themes';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([{ path: '**', children: [] }]),
    provideTectra({ ${options.join(', ')} }),
    provideTxBrandIcons(),
    provideTxFlags(txFlagImages(loadTxFlag)),
  ],
};
`;
}

function appComponent(file: string): string {
  return `import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import Example from './${file.replace(/\.ts$/, '')}';

@Component({
  selector: 'app-root',
  imports: [NgComponentOutlet],
  template: '<ng-container [ngComponentOutlet]="example" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly example = Example;
}
`;
}

function indexHtml(title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
${FONT_LINKS.map((link) => `    ${link}`).join('\n')}
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`;
}

export function stackblitzProject(
  example: StackblitzExample,
  theme: StackblitzTheme,
  setup: StackblitzSetup,
  assets: Record<string, string> = {},
): StackblitzProject {
  const file = `${example.id}.example.ts`;
  const title = `${example.page}: ${example.title} — tectra`;
  const packageJson = {
    name: `tectra-${example.id}-example`,
    private: true,
    scripts: { ng: 'ng', start: 'ng serve', build: 'ng build' },
    dependencies: exampleDependencies(example.source, setup),
    devDependencies: setup.devDependencies,
  };
  return {
    title,
    description: `The "${example.title}" example of the ${example.page} page of the tectra docs, as an Angular CLI project.`,
    template: 'node',
    openFile: `src/app/${file}`,
    files: {
      '.stackblitzrc': json({ installDependencies: true, startCommand: 'npm start' }),
      'package.json': json(packageJson),
      'angular.json': json(ANGULAR_JSON),
      'tsconfig.json': json(TSCONFIG),
      'src/index.html': indexHtml(title),
      'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((error) => console.error(error));
`,
      'src/styles.css': `${BASE_STYLES}\n${setup.styles}`,
      'src/app/app.config.ts': appConfig(theme),
      'src/app/app.ts': appComponent(file),
      [`src/app/${file}`]: example.source,
      ...Object.fromEntries(Object.entries(assets).map(([path, content]) => [`public/${path}`, content])),
    },
  };
}
