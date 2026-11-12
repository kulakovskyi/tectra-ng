import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { classify, decodeEntities, groupByUrl, htmlAnchors, htmlLinks, markdownAnchors, markdownLinks, probeUrl, sitePathCandidates, slugify } from './links.mjs';

const urls = (links) => links.map(({ url }) => url);

describe('markdownLinks', () => {
  it('finds inline, image, reference, angle and bare links with their lines', () => {
    const markdown = [
      'See [the guide](docs/guide.md "Guide") and ![logo](logo.svg).',
      'Visit <https://angular.dev> or https://tectra-ng.com/theming.',
      '',
      '[ref]: https://example.org/ref',
      '<a href="CONTRIBUTING.md#setup"><img src="badge.svg" /></a>',
      'A [nested [label]](nested.md) link.',
    ].join('\n');
    assert.deepEqual(markdownLinks(markdown), [
      { url: 'docs/guide.md', line: 1 },
      { url: 'logo.svg', line: 1 },
      { url: 'https://angular.dev', line: 2 },
      { url: 'https://tectra-ng.com/theming', line: 2 },
      { url: 'https://example.org/ref', line: 4 },
      { url: 'CONTRIBUTING.md#setup', line: 5 },
      { url: 'badge.svg', line: 5 },
      { url: 'nested.md', line: 6 },
    ]);
  });

  it('skips links in fenced code, inline code and comments but keeps the line numbers', () => {
    const markdown = ['```ts', "import x from 'https://code.invalid/a';", '```', 'Run `curl https://inline.invalid` first.', '<!-- [old](old.md) -->', '[kept](kept.md)'].join('\n');
    assert.deepEqual(markdownLinks(markdown), [{ url: 'kept.md', line: 6 }]);
  });

  it('drops trailing punctuation from bare links', () => {
    assert.deepEqual(urls(markdownLinks('Docs: https://tectra-ng.com/docs, then https://angular.dev.')), ['https://tectra-ng.com/docs', 'https://angular.dev']);
  });
});

describe('htmlLinks', () => {
  it('reads href and src of links, images and scripts and decodes entities', () => {
    const html = '<a href="/docs?a=1&amp;b=2">Docs</a>\n<img src="logo.svg"><script src="main.js"></script><link rel="stylesheet" href="styles.css">';
    assert.deepEqual(htmlLinks(html), [
      { url: '/docs?a=1&b=2', line: 1 },
      { url: 'logo.svg', line: 2 },
      { url: 'main.js', line: 2 },
      { url: 'styles.css', line: 2 },
    ]);
  });

  it('ignores comments and connection hints', () => {
    const html = '<!-- <a href="/gone">x</a> --><link rel="preconnect" href="https://fonts.gstatic.com"><a href="/kept">k</a>';
    assert.deepEqual(urls(htmlLinks(html)), ['/kept']);
  });
});

describe('anchors', () => {
  it('slugs headings the way GitHub does', () => {
    assert.equal(slugify('Quick start'), 'quick-start');
    assert.equal(slugify('`provideTectra()` & [links](x.md)'), 'providetectra--links');
    assert.equal(slugify('Ünïcode Wörds'), 'ünïcode-wörds');
    assert.equal(slugify('Install <code>tectra</code> <img src="x.svg"> now'), 'install-tectra--now');
    assert.equal(slugify('a < b'), 'a--b');
  });

  it('numbers repeated headings and adds explicit ids, not headings in code', () => {
    const markdown = ['# API', '## Inputs', '## Inputs', '```', '# Not a heading', '```', '<a id="custom"></a>'].join('\n');
    assert.deepEqual([...markdownAnchors(markdown)].sort(), ['api', 'custom', 'inputs', 'inputs-1']);
  });

  it('reads ids and names from html', () => {
    assert.deepEqual([...htmlAnchors('<h2 id="usage">Usage</h2><a name="top"></a><div id="a&amp;b"></div>')], ['usage', 'top', 'a&b']);
  });
});

describe('classify', () => {
  it('sorts links into what can be checked offline and what needs a request', () => {
    assert.deepEqual(classify('https://tectra-ng.com/components/button#api'), { kind: 'site', path: '/components/button', hash: 'api' });
    assert.deepEqual(classify('https://github.com/kulakovskyi/tectra-ng/blob/main/packages/ui/README.md#install'), {
      kind: 'repo',
      path: 'packages/ui/README.md',
      hash: 'install',
    });
    assert.deepEqual(classify('https://github.com/kulakovskyi/tectra-ng/tree/main/packages/ui/'), { kind: 'repo', path: 'packages/ui', hash: '' });
    assert.deepEqual(classify('https://angular.dev/guide#signals'), { kind: 'external', url: 'https://angular.dev/guide' });
    assert.deepEqual(classify('//cdn.jsdelivr.net/npm/x'), { kind: 'external', url: 'https://cdn.jsdelivr.net/npm/x' });
    assert.deepEqual(classify('../ROADMAP.md?plain=1#stage-14'), { kind: 'relative', path: '../ROADMAP.md', hash: 'stage-14' });
    assert.deepEqual(classify('#usage'), { kind: 'relative', path: '', hash: 'usage' });
    assert.deepEqual(classify('https://exa mple.com'), { kind: 'invalid' });
  });

  it('skips placeholders, other schemes and assets broken on purpose', () => {
    for (const url of ['', '#', 'mailto:a@b.c', 'data:image/png;base64,x', 'http://localhost:4300', 'https://api.example.com/x', 'https://shop.invalid', 'https://${host}/x', 'ftp://files', 'images/missing-photo.png']) {
      assert.deepEqual(classify(url), { kind: 'skip' }, url);
    }
  });
});

describe('sitePathCandidates', () => {
  it('maps a route to its file, its .html and its index.html', () => {
    assert.deepEqual(sitePathCandidates('/'), ['index.html']);
    assert.deepEqual(sitePathCandidates('/components/button/'), ['components/button', 'components/button.html', 'components/button/index.html']);
  });
});

describe('probeUrl', () => {
  it('asks the npm registry for package pages, which refuse automated requests', () => {
    assert.equal(probeUrl('https://www.npmjs.com/package/tectra-ng'), 'https://registry.npmjs.org/tectra-ng');
    assert.equal(probeUrl('https://www.npmjs.com/package/@tectra-ng/ui/v/0.3.0'), 'https://registry.npmjs.org/@tectra-ng%2Fui/0.3.0');
    assert.equal(probeUrl('https://angular.dev/guide'), 'https://angular.dev/guide');
  });
});

describe('groupByUrl', () => {
  it('lists every place of one broken address together', () => {
    assert.deepEqual(
      groupByUrl([
        { at: 'a.md:1', url: 'https://x.dev', reason: 'HTTP 404' },
        { at: 'b.md:2', url: 'https://x.dev', reason: 'HTTP 404' },
        { at: 'c.md:3', url: 'https://y.dev', reason: 'HTTP 410' },
      ]),
      [
        { url: 'https://x.dev', reason: 'HTTP 404', places: ['a.md:1', 'b.md:2'] },
        { url: 'https://y.dev', reason: 'HTTP 410', places: ['c.md:3'] },
      ],
    );
  });
});

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    assert.equal(decodeEntities('a&amp;b &lt;c&gt; &quot;d&quot; &#39;e&#39; &#x41;&#66;'), `a&b <c> "d" 'e' AB`);
  });
});

describe('check-links.mjs', () => {
  const script = new URL('./check-links.mjs', import.meta.url).pathname;

  it('reports broken pages and anchors of the built docs and fails', () => {
    const docs = mkdtempSync(join(tmpdir(), 'tx-links-'));
    try {
      writeFileSync(join(docs, 'index.html'), '<base href="/"><h1 id="top">Home</h1><a href="/docs">Docs</a><a href="/gone">Gone</a><a href="#top">Top</a><a href="#nope">Nope</a>');
      writeFileSync(join(docs, 'docs.html'), '<a href="/#top">Home</a>');
      const run = spawnSync(process.execPath, [script, '--offline', '--only', 'docs', '--docs', docs], { encoding: 'utf8' });
      assert.equal(run.status, 1, run.stdout + run.stderr);
      assert.match(run.stdout, /\*\*2 broken\*\*/);
      assert.match(run.stdout, /no page or file \/gone in the built docs/);
      assert.match(run.stdout, /no #nope in /);
    } finally {
      rmSync(docs, { recursive: true, force: true });
    }
  });

  it('asks for a docs build when there is none', () => {
    const run = spawnSync(process.execPath, [script, '--offline', '--docs', join(tmpdir(), 'tx-links-none')], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Build them first/);
  });
});
