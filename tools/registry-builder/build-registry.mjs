import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSync } from 'esbuild';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { format, resolveConfig } from 'prettier';

const root = new URL('../../', import.meta.url).pathname;
const contentDir = join(root, 'apps/docs/src/content/components');
const outDir = join(root, 'apps/docs/src/generated');

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const tsFiles = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts')).map((file) => join(dir, file)) : [];
const titleCase = (id) => id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
const highlightAs = (language, code) => hljs.highlight(code, { language }).value;
const prettierOptions = { ...(await resolveConfig(join(root, '.prettierrc.json'))), parser: 'typescript' };

function dedent(code) {
  const lines = code.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length));
  return lines.map((line) => line.slice(indent)).join('\n');
}

function toLines(html) {
  const open = [];
  const lines = [];
  let line = '';
  for (const token of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
    if (token === '\n') {
      lines.push(`<span class="line">${line}${'</span>'.repeat(open.length)}</span>`);
      line = open.join('');
    } else {
      if (token.startsWith('<span')) {
        open.push(token);
      } else if (token === '</span>') {
        open.pop();
      }
      line += token;
    }
  }
  lines.push(`<span class="line">${line}</span>`);
  return lines;
}

function templateFold(source, lines) {
  const sourceLines = source.split('\n');
  const start = sourceLines.findIndex((line) => /template:\s*`\s*$/.test(line));
  const end = sourceLines.findIndex((line, index) => index > start && /^\s*`/.test(line));
  if (start < 0 || end < 0) {
    return null;
  }
  return {
    before: lines.slice(0, start + 1).join(''),
    inner: lines.slice(start + 1, end).join(''),
    after: lines.slice(end).join(''),
    lines: end - start - 1,
    indent: sourceLines[start + 1].match(/^\s*/)[0].length,
    resumeAt: end,
  };
}

async function exampleFiles(raw) {
  const source = (await format(raw, prettierOptions)).trim();
  const template = source.match(/(template:\s*`)([\s\S]*?)(`)/);
  if (!template) {
    return [{ label: 'TypeScript', source, html: toLines(highlightAs('typescript', source)).join(''), fold: null }];
  }
  const start = template.index + template[1].length;
  const end = start + template[2].length;
  const markup = template[2];
  const tick = '<span class="hljs-string">`</span>';
  const typescriptLines = toLines(
    [
      highlightAs('typescript', source.slice(0, start - 1)),
      tick,
      highlightAs('xml', markup),
      tick,
      highlightAs('typescript', source.slice(end + 1)),
    ].join(''),
  );
  const html = dedent(markup);
  return [
    { label: 'HTML', source: html, html: toLines(highlightAs('xml', html)).join(''), fold: null },
    { label: 'TypeScript', source, html: typescriptLines.join(''), fold: templateFold(source, typescriptLines) },
  ];
}

const plainText = (markdown) =>
  marked
    .parseInline(markdown)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const firstParagraph = (body) =>
  body
    .replace(/^#\s+.+\n/m, '')
    .trim()
    .split(/\n\s*\n/)[0] ?? '';

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { meta: {}, body: markdown };
  }
  const meta = Object.fromEntries(
    match[1].split('\n').map((line) => line.split(':').map((part) => part.trim())).filter(([key]) => key),
  );
  return { meta, body: markdown.slice(match[0].length) };
}

const API_SECTIONS = ['pipes', 'functions', 'methods', 'options', 'constants', 'providers'];

function parseReadmeTables(readme) {
  const sections = {};
  let current = null;
  for (const line of readme.split('\n')) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      sections[current] = [];
      continue;
    }
    if (!current || !line.trim().startsWith('|') || /^\|\s*-/.test(line.trim())) {
      continue;
    }
    const cells = line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim().replace(/\\\|/g, '|'));
    sections[current].push(cells);
  }
  return Object.fromEntries(Object.entries(sections).map(([name, rows]) => [name, rows.slice(1)]));
}

function readSource(packageDir) {
  const own = `/${packageDir.split('/').pop()}.`;
  const files = tsFiles(join(packageDir, 'src')).sort((a, b) => Number(b.includes(own)) - Number(a.includes(own)));
  const source = files.map((file) => read(file)).join('\n');
  const styles = existsSync(join(packageDir, 'src'))
    ? readdirSync(join(packageDir, 'src')).filter((file) => file.endsWith('.scss')).map((file) => read(join(packageDir, 'src', file))).join('\n')
    : '';

  const aliases = Object.fromEntries([...source.matchAll(/export type (\w+) = ([^;{]+);/g)].map((m) => [m[1], m[2].trim()]));
  const resolveType = (type) => aliases[type] ?? type;

  const members = {};
  for (const m of source.matchAll(/^\s*(?:(?:readonly|protected|public|private)\s+)*(\w+)\s*=\s*(input|model)(\.required)?(?:<(.+?)>)?\(([^)]*)\);/gm)) {
    const [, field, kind, required, generic, args] = m;
    const name = args.match(/alias:\s*'(\w+)'/)?.[1] ?? field;
    const type = (generic ?? 'unknown').replace(/,\s*unknown$/, '');
    const fallback = args.split(/,\s*\{/)[0].trim();
    members[name] ??= { type: resolveType(type), default: required ? 'required' : fallback || '—' };
    if (kind === 'model') {
      members[`${name}Change`] ??= { type: `EventEmitter<${resolveType(type)}>`, default: '—' };
    }
  }
  for (const m of source.matchAll(/^\s*(?:(?:readonly|protected|public|private)\s+)*(\w+)\s*=\s*output(?:<(.+?)>)?\(\)/gm)) {
    members[m[1]] ??= { type: `EventEmitter<${m[2] ?? 'void'}>`, default: '—' };
  }

  const tokens = [...source.matchAll(/\w+:\s*'(--tx-[\w-]+)'/g)].map((m) => {
    const value = styles.match(new RegExp(`${m[1]}:\\s*([^;]+);`));
    return { name: m[1], value: value ? value[1].trim() : '—' };
  });
  const selector = source.match(/selector:\s*'([^']+)'/)?.[1] ?? '';

  const imported = Object.fromEntries(
    [...source.matchAll(/import \{([^}]+)\} from '@tectra-ng\/ui\/([\w-]+)'/g)].flatMap((m) => m[1].split(',').map((name) => [name.trim(), m[2]])),
  );
  for (const m of source.matchAll(/directive:\s*(\w+),\s*inputs:\s*\[([^\]]*)\]/g)) {
    const hostPackage = imported[m[1]];
    if (!hostPackage) {
      continue;
    }
    const hostMembers = readSource(join(root, 'packages/ui', hostPackage)).members;
    for (const entry of m[2].split(',').map((item) => item.trim().replace(/'/g, '')).filter(Boolean)) {
      const [original, alias] = entry.split(':').map((part) => part.trim());
      if (hostMembers[original] && !members[alias ?? original]) {
        members[alias ?? original] = hostMembers[original];
      }
    }
  }

  for (const base of new Set([...source.matchAll(/extends (\w+)(?:<.*?>)? \{/g)].map((m) => imported[m[1]]).filter(Boolean))) {
    for (const [baseName, baseMember] of Object.entries(readSource(join(root, 'packages/ui', base)).members)) {
      members[baseName] ??= baseMember;
    }
  }

  return { members, tokens, selector };
}

const themesBundle = buildSync({
  stdin: { contents: "export { Tectra, toCssVariables } from '@tectra-ng/themes';", resolveDir: root, loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  tsconfig: join(root, 'tsconfig.base.json'),
  logLevel: 'error',
});
const themes = await import(`data:text/javascript;base64,${Buffer.from(themesBundle.outputFiles[0].text).toString('base64')}`);
const camel = (name) => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

function presetTokens(name, keys) {
  const kebab = (key) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const found = (keys ?? [camel(name)]).filter((key) => themes.Tectra.components[key]);
  return found.length ? found.flatMap((key) => themes.toCssVariables(themes.Tectra.components[key], `--tx-${kebab(key)}`)) : null;
}

const coreMembers = readdirSync(join(root, 'packages/core'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .reduce((all, entry) => ({ ...all, ...readSource(join(root, 'packages/core', entry.name)).members }), {});

async function buildComponent(name) {
  const dir = join(contentDir, name);
  const { meta, body } = parseFrontMatter(read(join(dir, 'overview.md')));
  const title = body.match(/^#\s+(.+)/m)?.[1] ?? titleCase(name);
  const packageDir = meta.source ? join(root, meta.source) : join(root, 'packages/ui', name);
  const readmePath = meta.readme ? join(root, meta.readme) : join(packageDir, 'README.md');
  const tables = parseReadmeTables(read(readmePath));
  const { members: ownMembers, tokens, selector } = readSource(packageDir);
  const members = { ...coreMembers, ...ownMembers };
  const withSource = (rows) =>
    (rows ?? []).map(([memberName, description]) => ({
      name: memberName,
      type: members[memberName]?.type ?? '—',
      default: members[memberName]?.default ?? '—',
      description: marked.parseInline(description ?? ''),
    }));

  const examplesDir = join(dir, 'examples');
  const order = (meta.examples ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  const exampleIds = readdirSync(examplesDir)
    .filter((file) => file.endsWith('.example.ts'))
    .map((file) => file.replace('.example.ts', ''))
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));

  return {
    name,
    title,
    readme: readmePath.slice(root.length),
    category: meta.category ?? 'Other',
    summary: plainText(firstParagraph(body)),
    selector,
    importPath: meta.package ?? `@tectra-ng/ui/${name}`,
    importName: meta.import ?? `Tx${title.replace(/\s+/g, '')}`,
    descriptionHtml: marked.parse(body.replace(/^#\s+.+\n/m, '')),
    api: {
      inputs: withSource(tables.inputs),
      outputs: withSource(tables.outputs),
      slots: (tables.slots ?? []).map(([slotName, description]) => ({ name: slotName, description: marked.parseInline(description ?? '') })),
      sections: Object.keys(tables).filter((section) => API_SECTIONS.includes(section) && tables[section].length).map((section) => ({
        title: titleCase(section),
        rows: tables[section].map(([memberName, description]) => ({ name: memberName, description: marked.parseInline(description ?? '') })),
      })),
    },
    keyboard: (tables.keyboard ?? []).map(([key, action]) => ({ key, action: marked.parseInline(action ?? '') })),
    tokens: presetTokens(name, meta.tokens?.split(',').map((key) => key.trim())) ?? tokens,
    examples: await Promise.all(
      exampleIds.map(async (id) => ({
        id,
        title: titleCase(id),
        descriptionHtml: marked.parse(read(join(examplesDir, `${id}.md`))),
        files: await exampleFiles(read(join(examplesDir, `${id}.example.ts`))),
        importPath: `../../content/components/${name}/examples/${id}.example`,
      })),
    ),
  };
}

const unresolved = (component) => [...component.api.inputs, ...component.api.outputs].filter((member) => member.type === '—').map((member) => `${component.name}.${member.name}`);

const components = (
  await Promise.all(
    readdirSync(contentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => buildComponent(entry.name)),
  )
).sort((a, b) => a.title.localeCompare(b.title));

const componentModule = ({ examples, ...component }) => {
  const exampleCode = examples
    .map(({ importPath, ...example }) => {
      const data = JSON.stringify(example).slice(0, -1);
      return `${data}, load: () => import('${importPath}').then((m) => m.default) }`;
    })
    .join(',\n    ');
  return `import { DocComponent } from '../../app/types/doc-component.interface';\n\nexport const DOC: DocComponent = {\n  ...${JSON.stringify({ ...component, readme: undefined })},\n  examples: [\n    ${exampleCode}\n  ],\n};\n`;
};

const index = components
  .map(({ name, title, category, summary }) => `  { name: ${JSON.stringify(name)}, title: ${JSON.stringify(title)}, category: ${JSON.stringify(category)}, summary: ${JSON.stringify(summary)}, load: () => import('./components/${name}').then((m) => m.DOC) }`)
  .join(',\n');

const missing = components.flatMap(unresolved);
if (missing.length) {
  throw new Error(`registry: no type found in the source for ${missing.join(', ')} — check the README names and the member declarations`);
}

const componentsDir = join(outDir, 'components');
rmSync(componentsDir, { recursive: true, force: true });
mkdirSync(componentsDir, { recursive: true });
for (const component of components) {
  writeFileSync(join(componentsDir, `${component.name}.ts`), componentModule(component));
}
writeFileSync(
  join(outDir, 'components.json'),
  JSON.stringify(
    components.map(({ name, title, category, summary, importPath, importName, selector, readme, examples }) => ({
      name,
      title,
      category,
      summary,
      importPath,
      importName,
      selector,
      readme,
      examples: examples.map(({ id, title: exampleTitle }) => ({ id, title: exampleTitle })),
    })),
    null,
    2,
  ),
);
writeFileSync(
  join(outDir, 'registry.ts'),
  `import { DocComponentEntry } from '../app/types/doc-component.interface';\n\nexport const DOC_COMPONENTS: DocComponentEntry[] = [\n${index}\n];\n`,
);
const { version } = JSON.parse(readFileSync(join(root, 'packages/tectra-ng/package.json'), 'utf8'));
writeFileSync(join(outDir, 'version.ts'), `export const TECTRA_VERSION = ${JSON.stringify(version)};\n`);
console.log(`registry: ${components.length} components, ${components.reduce((sum, c) => sum + c.examples.length, 0)} examples`);
