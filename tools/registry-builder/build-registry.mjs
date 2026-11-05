import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import hljs from 'highlight.js';
import { marked } from 'marked';

const root = new URL('../../', import.meta.url).pathname;
const contentDir = join(root, 'apps/docs/src/content/components');
const outDir = join(root, 'apps/docs/src/generated');

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const tsFiles = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts')).map((file) => join(dir, file)) : [];
const titleCase = (id) => id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
const highlight = (code) => hljs.highlight(code.trim(), { language: 'typescript' }).value;

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
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    sections[current].push(cells);
  }
  return Object.fromEntries(Object.entries(sections).map(([name, rows]) => [name, rows.slice(1)]));
}

function readSource(packageDir) {
  const files = tsFiles(join(packageDir, 'src'));
  const source = files.map((file) => read(file)).join('\n');
  const styles = existsSync(join(packageDir, 'src'))
    ? readdirSync(join(packageDir, 'src')).filter((file) => file.endsWith('.scss')).map((file) => read(join(packageDir, 'src', file))).join('\n')
    : '';

  const aliases = Object.fromEntries([...source.matchAll(/export type (\w+) = ([^;{]+);/g)].map((m) => [m[1], m[2].trim()]));
  const resolveType = (type) => aliases[type] ?? type;

  const members = {};
  for (const m of source.matchAll(/^\s*(\w+)\s*=\s*(input|model)(\.required)?(?:<(.+?)>)?\(([^)]*)\);/gm)) {
    members[m[1]] = { type: resolveType(m[4] ?? 'unknown'), default: m[3] ? 'required' : m[5] || '—' };
  }
  for (const m of source.matchAll(/^\s*(\w+)\s*=\s*output(?:<(.+?)>)?\(\)/gm)) {
    members[m[1]] = { type: `EventEmitter<${m[2] ?? 'void'}>`, default: '—' };
  }

  const tokens = [...source.matchAll(/\w+:\s*'(--tx-[\w-]+)'/g)].map((m) => {
    const value = styles.match(new RegExp(`${m[1]}:\\s*([^;]+);`));
    return { name: m[1], value: value ? value[1].trim() : '—' };
  });
  const selector = source.match(/selector:\s*'([^']+)'/)?.[1] ?? '';

  return { members, tokens, selector };
}

function buildComponent(name) {
  const dir = join(contentDir, name);
  const { meta, body } = parseFrontMatter(read(join(dir, 'overview.md')));
  const title = body.match(/^#\s+(.+)/m)?.[1] ?? titleCase(name);
  const packageDir = join(root, 'packages/ui', name);
  const tables = parseReadmeTables(read(join(packageDir, 'README.md')));
  const { members, tokens, selector } = readSource(packageDir);
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
    category: meta.category ?? 'Other',
    selector,
    importPath: `@tectra/ui/${name}`,
    descriptionHtml: marked.parse(body.replace(/^#\s+.+\n/m, '')),
    api: {
      inputs: withSource(tables.inputs),
      outputs: withSource(tables.outputs),
      slots: (tables.slots ?? []).map(([slotName, description]) => ({ name: slotName, description: marked.parseInline(description ?? '') })),
    },
    keyboard: (tables.keyboard ?? []).map(([key, action]) => ({ key, action: marked.parseInline(action ?? '') })),
    tokens,
    examples: exampleIds.map((id) => ({
      id,
      title: titleCase(id),
      descriptionHtml: marked.parse(read(join(examplesDir, `${id}.md`))),
      sourceHtml: highlight(read(join(examplesDir, `${id}.example.ts`))),
      importPath: `../content/components/${name}/examples/${id}.example`,
    })),
  };
}

const components = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => buildComponent(entry.name))
  .sort((a, b) => a.title.localeCompare(b.title));

const body = components
  .map(({ examples, ...component }) => {
    const exampleCode = examples
      .map(({ importPath, ...example }) => {
        const data = JSON.stringify(example).slice(0, -1);
        return `${data}, load: () => import('${importPath}').then((m) => m.default) }`;
      })
      .join(',\n      ');
    return `  { ...${JSON.stringify(component)},\n    examples: [\n      ${exampleCode}\n    ] }`;
  })
  .join(',\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'registry.ts'),
  `import { DocComponent } from '../app/types/doc-component.interface';\n\nexport const DOC_COMPONENTS: DocComponent[] = [\n${body}\n];\n`,
);
console.log(`registry: ${components.length} components, ${components.reduce((sum, c) => sum + c.examples.length, 0)} examples`);
