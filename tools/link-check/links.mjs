export const SITE_HOSTS = new Set(['tectra-ng.com', 'www.tectra-ng.com']);
export const REPO_PREFIX = 'https://github.com/kulakovskyi/tectra-ng/';

const PLACEHOLDER_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$|(^|\.)(example\.(com|org|net)|[a-z0-9-]+\.(example|invalid|test|localhost|local))$|^example\.[a-z]+$/;
const SKIPPED_SCHEMES = /^(mailto|tel|javascript|data|blob|about|chrome|file|vscode):/i;

function blankLines(text) {
  return text.replace(/[^\n]/g, ' ');
}

function hideCode(markdown) {
  const fenced = markdown.replace(/^( {0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^\1\2[`~]*[ \t]*$|(?![\s\S]))/gm, blankLines);
  const comments = fenced.replace(/<!--[\s\S]*?-->/g, blankLines);
  return comments.replace(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g, blankLines);
}

function lineAt(text, index) {
  let line = 1;
  for (let position = text.indexOf('\n'); position !== -1 && position < index; position = text.indexOf('\n', position + 1)) {
    line++;
  }
  return line;
}

export function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function collect(text, patterns) {
  const found = new Map();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const url = decodeEntities(match[1].trim()).replace(/[.,;:!?]+$/, '');
      if (!url) {
        continue;
      }
      const line = lineAt(text, match.index);
      found.set(`${line} ${url}`, { url, line });
    }
  }
  return [...found.values()].sort((a, b) => a.line - b.line);
}

export function markdownLinks(markdown) {
  return collect(hideCode(markdown), [
    /!?\[(?:[^[\]]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    /<(https?:\/\/[^>\s]+)>/g,
    /^ {0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+.*)?$/gm,
    /\b(?:href|src)\s*=\s*"([^"]+)"/g,
    /(?<![("'<=\w/])(https?:\/\/[^\s<>()"'`\]|]+)/g,
  ]);
}

export function htmlLinks(html) {
  const visible = html.replace(/<!--[\s\S]*?-->/g, blankLines).replace(/<link\b[^>]*\brel="(?:preconnect|dns-prefetch)"[^>]*>/g, blankLines);
  return collect(visible, [/<(?:a|link|img|script|source|iframe|area)\b[^>]*?\s(?:href|src)="([^"]*)"/g]);
}

export function slugify(heading) {
  return heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

export function markdownAnchors(markdown) {
  const anchors = new Set();
  const counts = new Map();
  const text = hideCode(markdown);
  for (const match of text.matchAll(/^ {0,3}#{1,6}[ \t]+(.+?)[ \t#]*$/gm)) {
    const base = slugify(match[1]);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count ? `${base}-${count}` : base);
  }
  for (const match of text.matchAll(/\b(?:id|name)\s*=\s*"([^"]+)"/g)) {
    anchors.add(match[1]);
  }
  return anchors;
}

export function htmlAnchors(html) {
  return new Set(Array.from(html.matchAll(/\s(?:id|name)="([^"]+)"/g), (match) => decodeEntities(match[1])));
}

export function classify(raw) {
  const url = raw.trim();
  if (!url || url === '#') {
    return { kind: 'skip' };
  }
  if (SKIPPED_SCHEMES.test(url) || /[{}$]|%7B|<|>/i.test(url)) {
    return { kind: 'skip' };
  }
  if (url.startsWith('//')) {
    return classify(`https:${url}`);
  }
  if (/^https?:\/\//i.test(url)) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return { kind: 'invalid' };
    }
    const host = parsed.hostname.toLowerCase();
    if (PLACEHOLDER_HOSTS.test(host)) {
      return { kind: 'skip' };
    }
    if (SITE_HOSTS.has(host)) {
      return { kind: 'site', path: decodeURIComponent(parsed.pathname), hash: decodeURIComponent(parsed.hash.slice(1)) };
    }
    const repo = url.match(/^https:\/\/github\.com\/kulakovskyi\/tectra-ng\/(?:blob|tree)\/main\/([^?#]*)(?:\?[^#]*)?(?:#(.*))?$/);
    if (repo) {
      return { kind: 'repo', path: decodeURIComponent(repo[1]).replace(/\/$/, ''), hash: repo[2] ? decodeURIComponent(repo[2]) : '' };
    }
    parsed.hash = '';
    return { kind: 'external', url: parsed.href };
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return { kind: 'skip' };
  }
  const [beforeHash, hash = ''] = url.split('#');
  const path = beforeHash.split('?')[0];
  if (/(^|\/)missing-[^/]*$/.test(path)) {
    return { kind: 'skip' };
  }
  return { kind: 'relative', path: decodeURIComponent(path), hash: decodeURIComponent(hash) };
}

export function sitePathCandidates(path) {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) {
    return ['index.html'];
  }
  return [clean, `${clean}.html`, `${clean}/index.html`];
}

export function probeUrl(url) {
  const npm = url.match(/^https:\/\/(?:www\.)?npmjs\.com\/package\/((?:@[^/]+\/)?[^/?#]+)(?:\/v\/([^/?#]+))?\/?(?:[?#].*)?$/);
  if (npm) {
    return `https://registry.npmjs.org/${npm[1].replace('/', '%2F')}${npm[2] ? `/${npm[2]}` : ''}`;
  }
  return url;
}

export function groupByUrl(items) {
  const groups = new Map();
  for (const { at, url, reason } of items) {
    const key = `${url}\n${reason}`;
    const group = groups.get(key) ?? { url, reason, places: [] };
    group.places.push(at);
    groups.set(key, group);
  }
  return [...groups.values()];
}
