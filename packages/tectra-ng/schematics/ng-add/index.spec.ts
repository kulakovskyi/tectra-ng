import { logging } from '@angular-devkit/core';
import { Schematic, SchematicContext, Tree, callRule } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectDefinition } from '@schematics/angular/utility';
import { TECTRA_STYLES } from '@tectra-ng/themes';
import { PRIMARY_ORDER, SURFACE_PALETTES } from '@tectra-ng/tokens';
import { lastValueFrom, of } from 'rxjs';
import collection from '../collection.json';
import { FONT_LINKS, MIN_ANGULAR_MAJOR, indexPath, insertFontLinks, ngAdd, presetOptions } from './index';
import { TectraNgAddOptions } from './ng-add.types';
import schema from './schema.json';

const runner = new SchematicTestRunner('schematics', new URL('collection.json', import.meta.resolve('@schematics/angular/package.json')).pathname);

async function workspace(): Promise<UnitTestTree> {
  return runner.runExternalSchematic('@schematics/angular', 'workspace', { name: 'workspace', newProjectRoot: 'projects', version: `${MIN_ANGULAR_MAJOR}.2.0` });
}

async function application(tree?: UnitTestTree, name = 'app', options: Record<string, unknown> = {}): Promise<UnitTestTree> {
  return runner.runExternalSchematic('@schematics/angular', 'application', { name, skipTests: true, ...options }, tree ?? (await workspace()));
}

async function run(tree: Tree, options: TectraNgAddOptions = {}): Promise<{ tree: UnitTestTree; logs: logging.LogEntry[]; tasks: string[] }> {
  const logs: logging.LogEntry[] = [];
  const tasks: string[] = [];
  const logger = new logging.Logger('ng-add');
  logger.subscribe((entry) => logs.push(entry));
  const context: SchematicContext = {
    ...runner.engine.createContext({ description: { name: 'ng-add' } } as Schematic<object, object>),
    logger,
    addTask: (task) => {
      tasks.push(task.toConfiguration().name);
      return { id: tasks.length };
    },
  };
  const result = await lastValueFrom(callRule(ngAdd(options), of(tree), context));
  return { tree: new UnitTestTree(result), logs, tasks };
}

function messages(logs: logging.LogEntry[], level: logging.LogLevel): string[] {
  return logs.filter((entry) => entry.level === level).map((entry) => entry.message);
}

function editPackage(tree: Tree, edit: (manifest: { dependencies: Record<string, string>; devDependencies?: Record<string, string> }) => void): void {
  const manifest = tree.readJson('/package.json') as { dependencies: Record<string, string> };
  edit(manifest);
  tree.overwrite('/package.json', JSON.stringify(manifest, null, 2));
}

function count(text: string, part: string): number {
  return text.split(part).length - 1;
}

describe('ng add tectra-ng', () => {
  describe('schema', () => {
    const properties = schema.properties;

    it('offers every style, primary colour and surface of the kit', () => {
      expect(properties.style.enum).toEqual(Object.keys(TECTRA_STYLES));
      expect(properties.primary.enum).toEqual([...PRIMARY_ORDER]);
      expect(properties.surface.enum).toEqual(Object.keys(SURFACE_PALETTES));
    });

    it('defaults to the default preset', () => {
      expect([properties.style.default, properties.primary.default, properties.surface.default]).toEqual(['tectra', 'blue', 'ink']);
      expect(properties.fonts.default).toBe(true);
    });

    it('is the ng-add entry of the collection', () => {
      expect(collection.schematics['ng-add']).toMatchObject({ factory: './ng-add/index#ngAdd', schema: './ng-add/schema.json' });
    });
  });

  describe('preset options', () => {
    it('keeps only what differs from the defaults, with the primary colour always written', () => {
      expect(presetOptions({})).toBe("primary: 'blue'");
      expect(presetOptions({ style: 'soft', primary: 'violet', surface: 'slate' })).toBe("style: 'soft', primary: 'violet', surface: 'slate'");
      expect(presetOptions({ style: 'tectra', primary: 'noir', surface: 'ink' })).toBe("primary: 'noir'");
    });
  });

  describe('standalone application', () => {
    it('provides tectra with the default preset in app.config.ts', async () => {
      const { tree, logs } = await run(await application());
      const config = tree.readContent('/projects/app/src/app/app.config.ts');
      expect(config).toContain("import { provideTectra } from '@tectra-ng/core/config';");
      expect(config).toContain("import { createTectraPreset } from '@tectra-ng/themes';");
      expect(config).toContain("provideTectra({ preset: createTectraPreset({ primary: 'blue' }) })");
      expect(messages(logs, 'info').join('\n')).toContain("createTectraPreset({ primary: 'blue' })");
    });

    it('writes the chosen style, primary colour and surface', async () => {
      const { tree } = await run(await application(), { style: 'edge', primary: 'emerald', surface: 'stone' });
      expect(tree.readContent('/projects/app/src/app/app.config.ts')).toContain(
        "provideTectra({ preset: createTectraPreset({ style: 'edge', primary: 'emerald', surface: 'stone' }) })",
      );
    });

    it('adds the fonts once, indented like the rest of <head>', async () => {
      const { tree } = await run(await application());
      const html = tree.readContent('/projects/app/src/index.html');
      const indent = /\n([ \t]*)<meta charset/.exec(html)?.[1];
      for (const link of FONT_LINKS) {
        expect(html).toContain(`\n${indent}${link}\n`);
      }
      expect(html.indexOf('family=Onest')).toBeLessThan(html.indexOf('</head>'));
    });

    it('leaves index.html alone without fonts', async () => {
      const app = await application();
      const before = app.readContent('/projects/app/src/index.html');
      const { tree } = await run(app, { fonts: false });
      expect(tree.readContent('/projects/app/src/index.html')).toBe(before);
    });

    it('changes nothing on a second run', async () => {
      const first = await run(await application(), { primary: 'rose' });
      const config = first.tree.readContent('/projects/app/src/app/app.config.ts');
      const html = first.tree.readContent('/projects/app/src/index.html');
      const second = await run(first.tree, { primary: 'teal' });
      expect(second.tree.readContent('/projects/app/src/app/app.config.ts')).toBe(config);
      expect(second.tree.readContent('/projects/app/src/index.html')).toBe(html);
      expect(count(html, 'family=Onest')).toBe(1);
      const info = messages(second.logs, 'info').join('\n');
      expect(info).toContain('provideTectra is already set up in /projects/app/src/app/app.config.ts');
      expect(info).toContain('The fonts are already in projects/app/src/index.html');
      expect(info).not.toContain('tectra is set up');
    });

    it('ignores provideTectra in a spec file', async () => {
      const app = await application();
      app.create('/projects/app/src/app/theme.spec.ts', 'provideTectra({});');
      const { tree } = await run(app);
      expect(tree.readContent('/projects/app/src/app/app.config.ts')).toContain('provideTectra(');
    });
  });

  describe('NgModule application', () => {
    it('provides tectra in the root module', async () => {
      const { tree } = await run(await application(undefined, 'app', { standalone: false }));
      const module = tree.readContent('/projects/app/src/app/app-module.ts');
      expect(module).toContain("provideTectra({ preset: createTectraPreset({ primary: 'blue' }) })");
    });
  });

  describe('peer packages', () => {
    it('adds @angular/cdk at the Angular version of the app and installs', async () => {
      const app = await application();
      const angular = (app.readJson('/package.json') as { dependencies: Record<string, string> }).dependencies['@angular/core'];
      const { tree, tasks } = await run(app);
      const dependencies = (tree.readJson('/package.json') as { dependencies: Record<string, string> }).dependencies;
      expect(dependencies['@angular/cdk']).toBe(angular);
      expect(tasks).toContain('node-package');
    });

    it('keeps peers the app already has, also in devDependencies', async () => {
      const app = await application();
      editPackage(app, (manifest) => {
        manifest.dependencies['@angular/cdk'] = '~22.0.1';
        manifest.devDependencies = { ...manifest.devDependencies, '@angular/router': '~22.0.2' };
        delete manifest.dependencies['@angular/router'];
      });
      const { tree, tasks } = await run(app);
      const manifest = tree.readJson('/package.json') as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
      expect(manifest.dependencies['@angular/cdk']).toBe('~22.0.1');
      expect(manifest.dependencies['@angular/router']).toBeUndefined();
      expect(manifest.devDependencies['@angular/router']).toBe('~22.0.2');
      expect(tasks).not.toContain('node-package');
    });

    it('does not install with skipInstall', async () => {
      const { tree, tasks } = await run(await application(), { skipInstall: true });
      expect((tree.readJson('/package.json') as { dependencies: Record<string, string> }).dependencies['@angular/cdk']).toBeDefined();
      expect(tasks).not.toContain('node-package');
    });

    it('reads @angular/core from devDependencies too', async () => {
      const app = await application();
      editPackage(app, (manifest) => {
        manifest.devDependencies = { ...manifest.devDependencies, '@angular/core': manifest.dependencies['@angular/core'] };
        delete manifest.dependencies['@angular/core'];
      });
      await expect(run(app)).resolves.toBeDefined();
    });

    it('stops without @angular/core', async () => {
      const app = await application();
      editPackage(app, (manifest) => delete manifest.dependencies['@angular/core']);
      await expect(run(app)).rejects.toThrow('No @angular/core in package.json');
    });

    it(`stops below Angular ${MIN_ANGULAR_MAJOR}`, async () => {
      const app = await application();
      editPackage(app, (manifest) => (manifest.dependencies['@angular/core'] = `^${MIN_ANGULAR_MAJOR - 1}.0.0`));
      await expect(run(app)).rejects.toThrow(`tectra needs Angular ${MIN_ANGULAR_MAJOR} or newer`);
    });

    it('stops on a version it cannot read', async () => {
      const app = await application();
      editPackage(app, (manifest) => (manifest.dependencies['@angular/core'] = 'latest'));
      await expect(run(app)).rejects.toThrow(`tectra needs Angular ${MIN_ANGULAR_MAJOR} or newer`);
    });
  });

  describe('projects', () => {
    it('sets up the application given with --project', async () => {
      const both = await application(await application(undefined, 'admin'), 'shop');
      const { tree } = await run(both, { project: 'shop' });
      expect(tree.readContent('/projects/shop/src/app/app.config.ts')).toContain('provideTectra(');
      expect(tree.readContent('/projects/admin/src/app/app.config.ts')).not.toContain('provideTectra(');
    });

    it('asks for --project when there are several applications', async () => {
      const both = await application(await application(undefined, 'admin'), 'shop');
      await expect(run(both)).rejects.toThrow('several applications (admin, shop). Pick one with --project');
    });

    it('refuses a project that is not an application', async () => {
      const tree = await runner.runExternalSchematic('@schematics/angular', 'library', { name: 'lib' }, await application());
      await expect(run(tree, { project: 'lib' })).rejects.toThrow('"lib" is not an application of this workspace. Applications: app.');
    });

    it('refuses an unknown project in a workspace without applications', async () => {
      await expect(run(await workspace(), { project: 'nope' })).rejects.toThrow('Applications: none.');
    });

    it('stops in a workspace without applications', async () => {
      await expect(run(await workspace())).rejects.toThrow('This workspace has no application');
    });
  });

  describe('index.html', () => {
    it('warns when index.html is missing', async () => {
      const app = await application();
      app.delete('/projects/app/src/index.html');
      const { logs } = await run(app);
      expect(messages(logs, 'warn')[0]).toContain('No projects/app/src/index.html; add the fonts by hand');
    });

    it('warns when index.html has no </head>', async () => {
      const app = await application();
      app.overwrite('/projects/app/src/index.html', '<app-root></app-root>');
      const { tree, logs } = await run(app);
      expect(messages(logs, 'warn')[0]).toContain('has no </head>');
      expect(tree.readContent('/projects/app/src/index.html')).toBe('<app-root></app-root>');
    });

    it('reads the index option as a path, an object or the default', () => {
      const project = (options: Record<string, unknown> | undefined, sourceRoot?: string, root = 'apps/web') =>
        ({ root, sourceRoot, targets: new Map(options ? [['build', { options }]] : []) }) as unknown as ProjectDefinition;
      expect(indexPath(project({ index: 'web/index.html' }))).toBe('web/index.html');
      expect(indexPath(project({ index: { input: 'web/shell.html', output: 'index.html' } }))).toBe('web/shell.html');
      expect(indexPath(project({ index: { output: 'index.html' } }, 'apps/web/source'))).toBe('apps/web/source/index.html');
      expect(indexPath(project({ index: false }))).toBe('apps/web/src/index.html');
      expect(indexPath(project(undefined, undefined, ''))).toBe('src/index.html');
    });

    it('inserts the links on one line into a minified head', () => {
      expect(insertFontLinks('<html><head><title>x</title></head><body></body></html>')).toBe(
        `<html><head><title>x</title>${FONT_LINKS.join('')}</head><body></body></html>`,
      );
    });

    it('indents the links one level deeper than an empty head', () => {
      expect(insertFontLinks('<html>\n\t<head>\n\t</head>\n</html>')).toBe(
        `<html>\n\t<head>\n${FONT_LINKS.map((link) => `\t  ${link}\n`).join('')}\t</head>\n</html>`,
      );
    });

    it('works when </head> is on the first line', () => {
      expect(insertFontLinks('</head>')).toBe(`${FONT_LINKS.map((link) => `${link}\n`).join('')}</head>`);
    });
  });
});
