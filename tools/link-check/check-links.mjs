import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { classify, groupByUrl, htmlAnchors, htmlLinks, markdownAnchors, markdownLinks, probeUrl, sitePathCandidates } from './links.mjs';

const root = resolve(new URL('../../', import.meta.url).pathname);
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const offline = args.includes('--offline');
const only = option('--only', 'all');
const docsDir = resolve(root, option('--docs', 'dist/apps/docs/browser'));
const concurrency = Number(option('--concurrency', '8'));
const timeoutMs = Number(option('--timeout', '20000'));

const WARN_STATUSES = new Set([401, 403, 429, 999]);
const USER_AGENT = 'Mozilla/5.0 (compatible; tectra-link-check; +https://tectra-ng.com)';

if (!existsSync(join(docsDir, 'index.html'))) {
  console.error(`No built docs in ${relative(root, docsDir)}. Build them first: npx nx run docs:build`);
  process.exit(1);
}

const markdownFiles =
  only === 'docs'
    ? []
    : execFileSync('git', ['ls-files', '*.md'], { cwd: root, encoding: 'utf8' })
        .split('\n')
        .filter((file) => file && !file.startsWith('apps/docs/src/content/'))
        .map((file) => join(root, file));

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return htmlFiles(path);
    }
    return entry.name.endsWith('.html') ? [path] : [];
  });
}
const pages = only === 'markdown' ? [] : htmlFiles(docsDir);

const texts = new Map();
const read = (path) => {
  if (!texts.has(path)) {
    texts.set(path, readFileSync(path, 'utf8'));
  }
  return texts.get(path);
};
const anchorCache = new Map();
const anchorsOf = (path) => {
  if (!anchorCache.has(path)) {
    anchorCache.set(path, extname(path) === '.md' ? markdownAnchors(read(path)) : htmlAnchors(read(path)));
  }
  return anchorCache.get(path);
};
const isFile = (path) => existsSync(path) && statSync(path).isFile();

const broken = [];
const warnings = [];
const external = new Map();
let checked = 0;

const where = (source, line) => `${relative(root, source)}:${line}`;

function checkAnchor(target, hash, source, line, url) {
  if (!hash || /^L\d+(-L\d+)?$/.test(hash) || !['.md', '.html'].includes(extname(target))) {
    return;
  }
  if (!anchorsOf(target).has(hash)) {
    broken.push({ at: where(source, line), url, reason: `no #${hash} in ${relative(root, target)}` });
  }
}

function checkFile(target, hash, source, line, url) {
  if (!existsSync(target)) {
    broken.push({ at: where(source, line), url, reason: `no file ${relative(root, target)}` });
    return;
  }
  checkAnchor(target, hash, source, line, url);
}

function checkSite(path, hash, source, line, url) {
  const target = sitePathCandidates(path)
    .map((candidate) => join(docsDir, candidate))
    .find(isFile);
  if (!target) {
    broken.push({ at: where(source, line), url, reason: `no page or file ${path || '/'} in the built docs` });
    return;
  }
  checkAnchor(target, hash, source, line, url);
}

function addExternal(url, source, line) {
  const uses = external.get(url) ?? [];
  uses.push(where(source, line));
  external.set(url, uses);
}

for (const file of markdownFiles) {
  for (const { url, line } of markdownLinks(read(file))) {
    const link = classify(url);
    checked++;
    if (link.kind === 'invalid') {
      broken.push({ at: where(file, line), url, reason: 'not a valid URL' });
    } else if (link.kind === 'site') {
      checkSite(link.path, link.hash, file, line, url);
    } else if (link.kind === 'repo') {
      checkFile(join(root, link.path), link.hash, file, line, url);
    } else if (link.kind === 'relative') {
      const target = link.path ? (link.path.startsWith('/') ? join(root, link.path) : resolve(dirname(file), link.path)) : file;
      checkFile(target, link.hash, file, line, url);
    } else if (link.kind === 'external') {
      addExternal(link.url, file, line);
    } else {
      checked--;
    }
  }
}

for (const page of pages) {
  for (const { url, line } of htmlLinks(read(page))) {
    const link = classify(url);
    checked++;
    if (link.kind === 'invalid') {
      broken.push({ at: where(page, line), url, reason: 'not a valid URL' });
    } else if (link.kind === 'site') {
      checkSite(link.path, link.hash, page, line, url);
    } else if (link.kind === 'repo') {
      checkFile(join(root, link.path), link.hash, page, line, url);
    } else if (link.kind === 'relative') {
      if (link.path) {
        checkSite(link.path, link.hash, page, line, url);
      } else {
        checkAnchor(page, link.hash, page, line, url);
      }
    } else if (link.kind === 'external') {
      addExternal(link.url, page, line);
    } else {
      checked--;
    }
  }
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/json,*/*;q=0.8' },
  });
  await response.body?.cancel();
  return response.status;
}

async function probe(url) {
  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const head = await request(url, 'HEAD');
      if (head < 400) {
        return { status: head };
      }
      const get = await request(url, 'GET');
      if (get < 500 || attempt === 2) {
        return { status: get };
      }
      lastError = `HTTP ${get}`;
    } catch (error) {
      lastError = error instanceof Error ? (error.cause?.code ?? error.name) : String(error);
    }
    await new Promise((done) => setTimeout(done, 1000 * (attempt + 1)));
  }
  return { error: lastError };
}

async function checkExternal() {
  const byHost = new Map();
  for (const url of external.keys()) {
    const host = new URL(url).host;
    byHost.set(host, [...(byHost.get(host) ?? []), url]);
  }
  const hosts = [...byHost.values()];
  const worker = async () => {
    for (let urls = hosts.shift(); urls; urls = hosts.shift()) {
      for (const url of urls) {
        const result = await probe(probeUrl(url));
        const uses = external.get(url);
        if (result.error) {
          uses.forEach((at) => broken.push({ at, url, reason: `unreachable (${result.error})` }));
        } else if (WARN_STATUSES.has(result.status)) {
          uses.forEach((at) => warnings.push({ at, url, reason: `HTTP ${result.status}, the site refuses automated checks` }));
        } else if (result.status >= 400) {
          uses.forEach((at) => broken.push({ at, url, reason: `HTTP ${result.status}` }));
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
}

if (!offline) {
  await checkExternal();
}

const scope = `${markdownFiles.length} Markdown files and ${pages.length} docs pages: ${checked} links, ${external.size} external addresses${offline ? ' (not requested: --offline)' : ''}`;
const places = (list) => [...list.slice(0, 3).map((at) => `\`${at}\``), ...(list.length > 3 ? [`and ${list.length - 3} more`] : [])].join(', ');
const rows = (items) => groupByUrl(items).map(({ url, reason, places: list }) => `| ${url.replace(/\|/g, '%7C')} | ${reason} | ${places(list)} |`);
const summary = [
  '## Link check',
  '',
  scope,
  '',
  broken.length ? `**${broken.length} broken**` : 'No broken links.',
  ...(broken.length ? ['', '| Link | Problem | Where |', '|---|---|---|', ...rows(broken)] : []),
  ...(warnings.length ? ['', `${warnings.length} not verified:`, '', '| Link | Problem | Where |', '|---|---|---|', ...rows(warnings)] : []),
  '',
].join('\n');

console.log(summary);
if (process.env['GITHUB_STEP_SUMMARY']) {
  appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
}
process.exit(broken.length ? 1 : 0);
