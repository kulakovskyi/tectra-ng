import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { iconConstant } from './icon-constant.mjs';

const root = join(new URL('.', import.meta.url).pathname, '../..');
const check = process.argv.includes('--check');
const PACKAGES = ['ui', 'blocks', 'charts', 'utils', 'editor', 'code-editor'];

const iconsSource = readFileSync(join(root, 'packages/icons/src/icons.ts'), 'utf8');
const ICON_NAMES = new Set([...iconsSource.matchAll(/^ {2}\| '([^']+)'/gm)].map((match) => match[1]));

const upper = (name) => name.replace(/-/g, '_').toUpperCase();

function entryPoints(dir) {
  const found = existsSync(join(dir, 'ng-package.json')) ? [dir] : [];
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
    return /\.(ts|html)$/.test(child) && !child.endsWith('.spec.ts') && !child.endsWith('.icons.ts') ? [path] : [];
  });
}

function decorators(text) {
  const found = [];
  for (const match of text.matchAll(/@(Component|Directive)\(\{\n/g)) {
    const end = text.indexOf('\n})', match.index);
    const after = /^\s*(export )?(abstract )?class (\w+)/.exec(text.slice(end + 3));
    found.push({ kind: match[1], start: match.index, end, name: after?.[3] });
  }
  return found;
}

function iconFile(entry, names) {
  const name = basename(entry);
  const constant = `${upper(name)}_ICON_DEFAULTS`;
  const imports = names.map(iconConstant);
  const body = names.map((icon) => `  ${/^[a-z][a-z0-9]*$/.test(icon) ? icon : `'${icon}'`}: ${iconConstant(icon)},`).join('\n');
  return {
    constant,
    path: join(entry, existsSync(join(entry, 'src')) ? 'src' : '', `${name}.icons.ts`),
    text: `import { TxIconSet, ${imports.join(', ')} } from '@tectra-ng/icons';\n\nexport const ${constant}: TxIconSet = {\n${body}\n};\n`,
  };
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
    const names = new Set();
    for (const file of files) {
      for (const match of readFileSync(file, 'utf8').matchAll(/['"`]([a-z0-9-]+)['"`]/g)) {
        if (ICON_NAMES.has(match[1])) {
          names.add(match[1]);
        }
      }
    }
    const sorted = [...names].sort();
    const generated = iconFile(entry, sorted);
    const provider = `provideTxIconDefaults(${generated.constant})`;

    if (!sorted.length) {
      if (existsSync(generated.path)) {
        problems.push(`${relative(root, generated.path)} is left over; the entry point uses no icon`);
        if (!check) {
          rmSync(generated.path);
        }
      }
      continue;
    }
    const current = existsSync(generated.path) ? readFileSync(generated.path, 'utf8') : '';
    if (current !== generated.text) {
      problems.push(`${relative(root, generated.path)} is out of date`);
      if (!check) {
        writeFileSync(generated.path, generated.text);
        written++;
      }
    }

    for (const file of files.filter((path) => path.endsWith('.ts'))) {
      const text = readFileSync(file, 'utf8');
      let updated = text;
      for (const decorator of decorators(text).reverse()) {
        const block = updated.slice(decorator.start, decorator.end);
        if (block.includes(provider)) {
          continue;
        }
        problems.push(`${relative(root, file)}: ${decorator.name ?? decorator.kind} does not provide ${generated.constant}`);
        const key = decorator.kind === 'Component' ? 'viewProviders' : 'providers';
        const existing = new RegExp(`\\n  ${key}: \\[`).exec(block);
        const insert = existing
          ? `${block.slice(0, existing.index + existing[0].length)}${provider}, ${block.slice(existing.index + existing[0].length)}`
          : `${block.replace(/,?$/, ',')}\n  ${key}: [${provider}],`;
        updated = `${updated.slice(0, decorator.start)}${insert}${updated.slice(decorator.end)}`;
      }
      if (updated !== text && !check) {
        let withImports = addImport(updated, 'provideTxIconDefaults', '@tectra-ng/icons');
        const fromFile = relative(dirname(file), generated.path).replace(/\.ts$/, '');
        withImports = addImport(withImports, generated.constant, fromFile.startsWith('.') ? fromFile : `./${fromFile}`);
        writeFileSync(file, withImports);
        written++;
      }
    }
  }
}

if (check) {
  if (problems.length) {
    console.error(problems.map((problem) => `error: ${problem}`).join('\n'));
    console.error('\nRun npm run icons:defaults and commit the result.');
    process.exit(1);
  }
  console.log('icon defaults: up to date');
} else {
  console.log(`icon defaults: ${written} file(s) written${problems.length ? `, ${problems.length} change(s)` : ''}`);
}
