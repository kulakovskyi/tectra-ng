import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyze, buildIndex, documentDeclarations, missingDocs, shiftSourceMap } from './api-docs.mjs';

const root = new URL('../../', import.meta.url).pathname;
const dist = join(root, 'dist/packages');
const content = join(root, 'apps/docs/src/content/components');
const site = 'https://tectra-ng.com/components';
const check = process.argv.includes('--check');
const verbose = process.argv.includes('--verbose');
const strict = process.argv.includes('--strict');
const listPath = process.argv.find((arg) => arg.startsWith('--list='))?.slice('--list='.length);

function frontMatter(text, key) {
  return text.match(new RegExp(`^${key}:\\s*(\\S+)`, 'm'))?.[1];
}

function docsPages() {
  const pages = new Map();
  for (const name of readdirSync(content).sort()) {
    const overview = join(content, name, 'overview.md');
    if (!existsSync(overview)) {
      continue;
    }
    const text = readFileSync(overview, 'utf8');
    const source = frontMatter(text, 'source') ?? `packages/ui/${name}`;
    const list = pages.get(source) ?? [];
    list.push({ url: `${site}/${name}`, readme: frontMatter(text, 'readme'), mainClass: frontMatter(text, 'import') });
    pages.set(source, list);
  }
  return pages;
}

function readmesOf(source) {
  const list = pages.get(source) ?? [];
  const extras = list
    .filter((page) => page.readme && existsSync(join(root, page.readme)))
    .map((page) => ({ text: readFileSync(join(root, page.readme), 'utf8'), docsUrl: page.url, mainClass: page.mainClass, defaultScope: page.mainClass, label: page.readme }));
  const readmePath = join(root, source, 'README.md');
  const page = list.find((candidate) => !candidate.readme);
  const main = existsSync(readmePath) ? [{ text: readFileSync(readmePath, 'utf8'), docsUrl: page?.url, mainClass: page?.mainClass, label: `${source}/README.md` }] : [];
  return [...extras, ...main];
}

function entryPoints() {
  const entries = [];
  for (const folder of readdirSync(dist)) {
    const packagePath = join(dist, folder, 'package.json');
    if (!existsSync(packagePath)) {
      continue;
    }
    const { exports = {} } = JSON.parse(readFileSync(packagePath, 'utf8'));
    for (const [key, target] of Object.entries(exports)) {
      const types = typeof target === 'object' ? target.types : undefined;
      const typesPath = types?.endsWith('.d.ts') ? join(dist, folder, types) : null;
      if (!typesPath || !existsSync(typesPath)) {
        continue;
      }
      const source = ['packages', folder, key === '.' ? '' : key.replace(/^\.\//, '')].filter(Boolean).join('/');
      const text = readFileSync(typesPath, 'utf8');
      entries.push({ source, typesPath, text, analysis: analyze(text, typesPath) });
    }
  }
  return entries;
}

if (!existsSync(dist)) {
  console.error('No dist/packages: run the package build first.');
  process.exit(1);
}

const pages = docsPages();
const entries = entryPoints();
const index = buildIndex(entries.map((entry) => entry.analysis));
const totals = { entries: 0, documented: 0, unmatched: [], undocumented: [], missing: [] };

for (const entry of entries) {
  const readmes = readmesOf(entry.source);
  if (!readmes.length) {
    totals.missing.push(...missingDocs(entry.text, entry.typesPath).map((item) => ({ source: entry.source, types: entry.typesPath.slice(root.length), ...item })));
    continue;
  }
  const result = documentDeclarations(entry.text, readmes, { file: entry.typesPath, analysis: entry.analysis, index });
  totals.entries += 1;
  totals.documented += result.documented;
  totals.unmatched.push(...result.unmatched.map((row) => `${entry.source} — ${row}`));
  totals.undocumented.push(...result.undocumented.map((member) => `${entry.source} — ${member}`));
  totals.missing.push(...missingDocs(result.text, entry.typesPath).map((item) => ({ source: entry.source, types: entry.typesPath.slice(root.length), ...item })));
  if (!result.documented) {
    continue;
  }
  writeFileSync(entry.typesPath, result.text);
  const mapPath = `${entry.typesPath}.map`;
  if (existsSync(mapPath)) {
    writeFileSync(mapPath, shiftSourceMap(readFileSync(mapPath, 'utf8'), result.inserted));
  }
}

console.log(`API docs: ${totals.documented} declarations documented from the READMEs of ${totals.entries} entry points`);
if (totals.unmatched.length) {
  console.log(`\nREADME rows that name nothing in the published types (${totals.unmatched.length}):`);
  console.log(totals.unmatched.map((row) => `  ${row}`).join('\n'));
}
if (totals.undocumented.length) {
  console.log(`\nPublic inputs and outputs without a README row (${totals.undocumented.length}):`);
  console.log((verbose ? totals.undocumented : totals.undocumented.slice(0, 10)).map((row) => `  ${row}`).join('\n'));
  if (!verbose && totals.undocumented.length > 10) {
    console.log('  … --verbose lists them all');
  }
}
if (totals.missing.length) {
  const counts = Object.entries(Object.groupBy(totals.missing, (item) => item.kind)).map(([kind, items]) => `${items.length} ${kind}`);
  console.log(`\nPublic declarations without JSDoc (${totals.missing.length}): ${counts.join(', ')}`);
  if (verbose || strict) {
    console.log(totals.missing.map((item) => `  ${item.types}:${item.line} — ${item.kind} ${item.name}`).join('\n'));
  }
}
if (listPath) {
  writeFileSync(listPath, JSON.stringify(totals.missing, null, 2));
}
if (strict && totals.missing.length) {
  process.exit(1);
}
if (check && totals.unmatched.length) {
  process.exit(1);
}
