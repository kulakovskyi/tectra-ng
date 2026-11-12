import { Rule, SchematicContext, SchematicsException, Tree, chain, noop } from '@angular-devkit/schematics';
import {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  ProjectDefinition,
  WorkspaceDefinition,
  addDependency,
  addRootProvider,
  readWorkspace,
} from '@schematics/angular/utility';
import { TectraNgAddOptions } from './ng-add.types';

export const MIN_ANGULAR_MAJOR = 22;

export const ANGULAR_PEERS = ['@angular/cdk', '@angular/forms', '@angular/router'];

export const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com" />',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=JetBrains+Mono:wght@400;500&display=swap" />',
];

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function ngAdd(options: TectraNgAddOptions): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    const projectName = resolveProject(workspace, options.project);
    const project = workspace.projects.get(projectName) as ProjectDefinition;
    const angularRange = readAngularRange(tree);
    return chain([
      addPeers(tree, angularRange, options.skipInstall === true),
      addProvider(tree, projectName, project, options),
      options.fonts === false ? noop() : addFonts(project),
    ]);
  };
}

export function presetOptions({ style = 'tectra', primary = 'blue', surface = 'ink' }: TectraNgAddOptions): string {
  return [style !== 'tectra' ? `style: '${style}'` : '', `primary: '${primary}'`, surface !== 'ink' ? `surface: '${surface}'` : '']
    .filter(Boolean)
    .join(', ');
}

export function resolveProject(workspace: WorkspaceDefinition, requested: string | undefined): string {
  const applications = [...workspace.projects.entries()].filter(([, project]) => project.extensions['projectType'] === 'application').map(([name]) => name);
  if (requested) {
    if (!applications.includes(requested)) {
      throw new SchematicsException(`"${requested}" is not an application of this workspace. Applications: ${applications.join(', ') || 'none'}.`);
    }
    return requested;
  }
  if (applications.length === 1) {
    return applications[0];
  }
  if (applications.length === 0) {
    throw new SchematicsException('This workspace has no application. Create one with "ng generate application" and run "ng add tectra-ng" again.');
  }
  throw new SchematicsException(`This workspace has several applications (${applications.join(', ')}). Pick one with --project.`);
}

export function readAngularRange(tree: Tree): string {
  const manifest = tree.readJson('/package.json') as PackageManifest;
  const range = manifest.dependencies?.['@angular/core'] ?? manifest.devDependencies?.['@angular/core'];
  if (!range) {
    throw new SchematicsException('No @angular/core in package.json. tectra is added to an Angular application.');
  }
  const major = Number(/\d+/.exec(range)?.[0]);
  if (!(major >= MIN_ANGULAR_MAJOR)) {
    throw new SchematicsException(`tectra needs Angular ${MIN_ANGULAR_MAJOR} or newer; this application uses @angular/core ${range}.`);
  }
  return range;
}

function addPeers(tree: Tree, range: string, skipInstall: boolean): Rule {
  const manifest = tree.readJson('/package.json') as PackageManifest;
  const missing = ANGULAR_PEERS.filter((name) => !manifest.dependencies?.[name] && !manifest.devDependencies?.[name]);
  return chain(
    missing.map((name) =>
      addDependency(name, range, {
        type: DependencyType.Default,
        existing: ExistingBehavior.Skip,
        install: skipInstall ? InstallBehavior.None : InstallBehavior.Auto,
      }),
    ),
  );
}

function addProvider(tree: Tree, projectName: string, project: ProjectDefinition, options: TectraNgAddOptions): Rule {
  const existing = findProvider(tree, sourceRoot(project));
  if (existing) {
    return (_tree: Tree, context: SchematicContext) => {
      context.logger.info(`provideTectra is already set up in ${existing}; left as it is.`);
    };
  }
  return chain([
    addRootProvider(projectName, ({ code, external }) => {
      const provideTectra = external('provideTectra', '@tectra-ng/core/config');
      const createTectraPreset = external('createTectraPreset', '@tectra-ng/themes');
      return code`${provideTectra}({ preset: ${createTectraPreset}({ ${presetOptions(options)} }) })`;
    }),
    (_tree: Tree, context: SchematicContext) => {
      context.logger.info(`tectra is set up with createTectraPreset({ ${presetOptions(options)} }).`);
      context.logger.info("Next: import a component, for example import { TxButton } from '@tectra-ng/ui/button'. Docs: https://tectra-ng.com/getting-started");
    },
  ]);
}

function findProvider(tree: Tree, root: string): string | undefined {
  let found: string | undefined;
  tree.getDir(root).visit((path) => {
    if (!found && path.endsWith('.ts') && !path.endsWith('.spec.ts') && tree.readText(path).includes('provideTectra(')) {
      found = path;
    }
  });
  return found;
}

function sourceRoot(project: ProjectDefinition): string {
  return project.sourceRoot ?? `${project.root ? `${project.root}/` : ''}src`;
}

export function indexPath(project: ProjectDefinition): string {
  const index = project.targets.get('build')?.options?.['index'];
  if (typeof index === 'string') {
    return index;
  }
  if (index && typeof index === 'object' && 'input' in index && typeof index['input'] === 'string') {
    return index['input'];
  }
  return `${sourceRoot(project)}/index.html`;
}

export function insertFontLinks(html: string): string | undefined {
  const at = html.indexOf('</head>');
  if (at < 0) {
    return undefined;
  }
  const lineStart = html.lastIndexOf('\n', at - 1) + 1;
  const closeIndent = html.slice(lineStart, at);
  if (closeIndent.trim() !== '') {
    return `${html.slice(0, at)}${FONT_LINKS.join('')}${html.slice(at)}`;
  }
  const previous = html.slice(0, lineStart).trimEnd().split('\n').pop() ?? '';
  const indent = previous.trim().startsWith('<head') ? `${closeIndent}  ` : previous.slice(0, previous.length - previous.trimStart().length);
  return `${html.slice(0, lineStart)}${FONT_LINKS.map((link) => `${indent}${link}\n`).join('')}${html.slice(lineStart)}`;
}

function addFonts(project: ProjectDefinition): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const path = indexPath(project);
    if (!tree.exists(path)) {
      context.logger.warn(`No ${path}; add the fonts by hand: ${FONT_LINKS.join(' ')}`);
      return;
    }
    const html = tree.readText(path);
    if (html.includes('family=Onest')) {
      context.logger.info(`The fonts are already in ${path}.`);
      return;
    }
    const updated = insertFontLinks(html);
    if (!updated) {
      context.logger.warn(`${path} has no </head>; add the fonts by hand: ${FONT_LINKS.join(' ')}`);
      return;
    }
    tree.overwrite(path, updated);
  };
}
