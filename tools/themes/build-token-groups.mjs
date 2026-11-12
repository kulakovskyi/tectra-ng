import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

const root = join(new URL('.', import.meta.url).pathname, '../..');
const check = process.argv.includes('--check');
const PACKAGES = ['core', 'ui', 'blocks', 'charts', 'utils', 'editor', 'code-editor'];

const registry = readFileSync(join(root, 'packages/themes/src/components/component-tokens.ts'), 'utf8');
const GROUPS = [...registry.slice(registry.indexOf('export const COMPONENT_TOKENS')).matchAll(/^ {2}(\w+): (\w+),/gm)].map(([, key, constant]) => ({
  key,
  constant,
  kebab: key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
}));
const BY_LENGTH = [...GROUPS].sort((a, b) => b.kebab.length - a.kebab.length);

const camel = (name) => name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
const upper = (name) => name.replace(/-/g, '_').toUpperCase();

function entryPoints(dir) {
  const found = existsSync(join(dir, 'ng-package.json')) && existsSync(join(dir, 'index.ts')) ? [dir] : [];
  for (const child of readdirSync(dir)) {
    const path = join(dir, child);
    if (child !== 'node_modules' && statSync(path).isDirectory()) {
      found.push(...entryPoints(path));
    }
  }
  return found;
}

function sourceFiles(entry, dir = entry) {
  return readdirSync(dir).flatMap((child) => {
    const path = join(dir, child);
    if (statSync(path).isDirectory()) {
      return path !== entry && existsSync(join(path, 'ng-package.json')) ? [] : sourceFiles(entry, path);
    }
    return /\.(ts|html|scss)$/.test(child) && !child.endsWith('.spec.ts') && !/\.(icons|theme)\.ts$/.test(child) ? [path] : [];
  });
}

function scssImports(file, seen = new Set()) {
  if (seen.has(file)) {
    return [];
  }
  seen.add(file);
  const text = readFileSync(file, 'utf8');
  const found = [];
  for (const [, target] of text.matchAll(/@(?:use|forward|import) '([^']+)'/g)) {
    const base = join(dirname(file), target);
    const candidates = [`${base}.scss`, join(dirname(base), `_${basename(base)}.scss`)];
    const resolved = candidates.find((candidate) => existsSync(candidate));
    if (resolved) {
      found.push(resolved, ...scssImports(resolved, seen));
    }
  }
  return found;
}

function groupsIn(text) {
  const found = new Set();
  for (const [, name] of text.matchAll(/--tx-([a-z0-9-]+)/g)) {
    const group = BY_LENGTH.find(({ kebab }) => name === kebab || name.startsWith(`${kebab}-`));
    if (group) {
      found.add(group);
    }
  }
  return found;
}

function decorators(text) {
  return [...text.matchAll(/@(Component|Directive)\(\{\n/g)].map((match) => {
    const end = text.indexOf('\n})', match.index);
    const head = /^\s*(export )?(abstract )?class (\w+)[^{]*?(?:extends (\w+))?[^{]*\{/.exec(text.slice(end + 3));
    return head && { name: head[3], base: head[4], bodyStart: end + 3 + head.index + head[0].length };
  }).filter(Boolean);
}

function addImport(text, symbol, from) {
  const existing = [...text.matchAll(/import \{([^}]*)\} from '([^']+)';/g)].find((match) => match[2] === from);
  if (existing) {
    const symbols = existing[1].split(',').map((part) => part.trim()).filter(Boolean);
    return symbols.includes(symbol) ? text : text.replace(existing[0], `import { ${[...symbols, symbol].sort((a, b) => a.localeCompare(b)).join(', ')} } from '${from}';`);
  }
  const lastImport = [...text.matchAll(/^import [^;]+;\n/gm)].pop();
  const at = lastImport ? lastImport.index + lastImport[0].length : 0;
  return `${text.slice(0, at)}import { ${symbol} } from '${from}';\n${text.slice(at)}`;
}

const problems = [];
let written = 0;

for (const pkg of PACKAGES) {
  for (const entry of entryPoints(join(root, 'packages', pkg))) {
    const files = sourceFiles(entry);
    const groups = new Set();
    for (const file of files) {
      const texts = [file, ...(file.endsWith('.scss') ? scssImports(file) : [])].map((path) => readFileSync(path, 'utf8'));
      for (const text of texts) {
        for (const group of groupsIn(text)) {
          groups.add(group);
        }
      }
    }
    const sorted = [...groups].sort((a, b) => a.key.localeCompare(b.key));
    const name = basename(entry);
    const constant = `${upper(name)}_THEME`;
    const path = join(entry, existsSync(join(entry, 'src')) ? 'src' : '', `${name}.theme.ts`);
    const text = `import { ${sorted.map(({ constant: tokens }) => tokens).join(', ')} } from '@tectra-ng/themes';\n\nexport const ${constant} = {\n${sorted.map(({ key, constant: tokens }) => `  ${key}: ${tokens},`).join('\n')}\n};\n`;
    const decorated = files.filter((file) => file.endsWith('.ts')).map((file) => ({ file, text: readFileSync(file, 'utf8') }));
    const hasClasses = decorated.some(({ text: source }) => decorators(source).length);

    if (!sorted.length || !hasClasses) {
      if (existsSync(path)) {
        problems.push(`${relative(root, path)} is left over`);
        if (!check) {
          rmSync(path);
        }
      }
      continue;
    }
    if ((existsSync(path) ? readFileSync(path, 'utf8') : '') !== text) {
      problems.push(`${relative(root, path)} is out of date`);
      if (!check) {
        writeFileSync(path, text);
        written++;
      }
    }

    const field = `${camel(name)}Theme`;
    const registration = `injectTokens(${constant})`;
    const classNames = new Set(decorated.flatMap(({ text: source }) => decorators(source).map((decorator) => decorator.name)));
    for (const { file, text: source } of decorated) {
      let updated = source;
      for (const decorator of decorators(source).reverse()) {
        if (decorator.base && classNames.has(decorator.base)) {
          continue;
        }
        const body = updated.slice(decorator.bodyStart, updated.indexOf('\n}', decorator.bodyStart));
        if (body.includes(registration)) {
          continue;
        }
        problems.push(`${relative(root, file)}: ${decorator.name} does not register ${constant}`);
        updated = `${updated.slice(0, decorator.bodyStart)}\n  private readonly ${field} = ${registration};\n${updated.slice(decorator.bodyStart)}`;
      }
      if (updated !== source && !check) {
        let withImports = addImport(updated, 'injectTokens', '@tectra-ng/core/config');
        const fromFile = relative(dirname(file), path).replace(/\.ts$/, '');
        withImports = addImport(withImports, constant, fromFile.startsWith('.') ? fromFile : `./${fromFile}`);
        writeFileSync(file, withImports);
        written++;
      }
    }
  }
}

if (check) {
  if (problems.length) {
    console.error(problems.map((problem) => `error: ${problem}`).join('\n'));
    console.error('\nRun npm run themes:groups and commit the result.');
    process.exit(1);
  }
  console.log('token groups: up to date');
} else {
  console.log(`token groups: ${written} file(s) written${problems.length ? `, ${problems.length} change(s)` : ''}`);
}
