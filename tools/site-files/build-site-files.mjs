import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const site = 'https://tectra-ng.com';
const outDir = join(root, 'dist/apps/docs/browser');
const contentDir = join(root, 'apps/docs/src/content/components');

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const components = JSON.parse(read(join(root, 'apps/docs/src/generated/components.json')));
const { routes } = JSON.parse(read(join(root, 'dist/apps/docs/prerendered-routes.json')));
const { version } = JSON.parse(read(join(root, 'packages/tectra-ng/package.json')));

const description =
  'Open-source Angular UI kit: standalone components on signals (zoneless, OnPush), its own design tokens as CSS variables, light and dark themes, an SVG icon set, brand logos, country flags and a rich text editor. Keyboard and screen reader friendly, MIT licensed.';

const pages = [
  { title: 'tectra', path: '/', text: 'What tectra is: the kit at a glance' },
  { title: 'Introduction', path: '/docs', text: 'A tour of the components' },
  { title: 'Installation', path: '/getting-started', text: 'npm packages, provideTectra, first component' },
  { title: 'Theming', path: '/theming', text: 'design tokens, presets, light and dark mode, theme designer' },
  { title: 'Icons', path: '/icons', text: 'the icon set and TxIcon' },
  { title: 'Overlay', path: '/core/overlay', text: 'TxOverlay: placements, motion, scroll strategies, focus' },
  { title: 'Locale', path: '/core/locale', text: 'translations and Intl formatting with TxLocaleService' },
];

function section(markdown, heading) {
  const match = markdown.match(new RegExp(`^## ${heading}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  return match ? match[1].trim() : '';
}

const install = section(read(join(root, 'README.md')), 'Install');

const demote = (markdown) => markdown.replace(/^(#{1,5}) /gm, '#$1 ');

function componentMarkdown(component, withExamples) {
  const readme = read(join(root, component.readme)).replace(/^# .+\n+/, '');
  const lines = [
    `# ${component.title} — Angular component`,
    '',
    `> ${component.summary}`,
    '',
    `- Docs: ${site}/components/${component.name}`,
    `- Import: \`import { ${component.importName} } from '${component.importPath}';\``,
    ...(component.selector ? [`- Selector: \`${component.selector}\``] : []),
    '',
    demote(readme).trim(),
  ];
  if (withExamples) {
    lines.push('', '## Examples');
    for (const example of component.examples) {
      const dir = join(contentDir, component.name, 'examples');
      const text = read(join(dir, `${example.id}.md`)).trim();
      lines.push('', `### ${example.title}`, '', ...(text ? [text, ''] : []), '```ts', read(join(dir, `${example.id}.example.ts`)).trim(), '```');
    }
  }
  return `${lines.join('\n')}\n`;
}

const categories = [...new Set(components.map((component) => component.category))].sort();

const llms = [
  '# tectra',
  '',
  `> ${description}`,
  '',
  `Version ${version}. Packages: \`tectra-ng\` (everything), \`@tectra-ng/ui/<name>\` (one entry point per component), \`@tectra-ng/core\`, \`@tectra-ng/themes\`, \`@tectra-ng/tokens\`, \`@tectra-ng/icons\`, \`@tectra-ng/editor\`, \`@tectra-ng/blocks/<name>\` (ready page blocks). Selectors start with \`tx-\`, CSS variables with \`--tx-\`. Every component has \`dt\` (design tokens), \`pt\` (pass-through) and \`unstyled\`.`,
  '',
  '## Install',
  '',
  install,
  '',
  '## Docs',
  '',
  ...pages.map((page) => `- [${page.title}](${site}${page.path}): ${page.text}`),
  ...categories.flatMap((category) => [
    '',
    `## Components: ${category}`,
    '',
    ...components
      .filter((component) => component.category === category)
      .map((component) => `- [${component.title}](${site}/components/${component.name}.md): ${component.summary}`),
  ]),
  '',
  '## Optional',
  '',
  `- [All component APIs in one file](${site}/llms-full.txt)`,
  `- [Source code](https://github.com/kulakovskyi/tectra-ng)`,
  '',
].join('\n');

const llmsFull = [
  '# tectra — full component reference',
  '',
  `> ${description}`,
  '',
  '## Install',
  '',
  install,
  '',
  ...components.map((component) => demote(componentMarkdown(component, false))),
].join('\n');

for (const component of components) {
  writeFileSync(join(outDir, 'components', `${component.name}.md`), componentMarkdown(component, true));
}
writeFileSync(join(outDir, 'llms.txt'), llms);
writeFileSync(join(outDir, 'llms-full.txt'), llmsFull);

const urls = Object.keys(routes)
  .sort()
  .map((path) => `  <url><loc>${site}${path}</loc></url>`);
writeFileSync(
  join(outDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);
writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

const shell = read(join(outDir, 'index.csr.html')).replace(
  /<title>[^<]*<\/title>/,
  '<title>Page not found — tectra</title>\n    <meta name="robots" content="noindex" />',
);
writeFileSync(join(outDir, '404.html'), shell);

console.log(`site files: ${urls.length} sitemap urls, llms.txt, llms-full.txt, ${components.length} component .md, robots.txt, 404.html`);
