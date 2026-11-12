import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist/packages';
const repo = 'https://github.com/kulakovskyi/tectra-ng';
const banner = 'https://tectra-ng.com/images/social-preview.png';

function header(name) {
  const encoded = encodeURIComponent(name);
  return `<p align="center">
  <a href="https://tectra-ng.com">
    <img src="${banner}" alt="tectra — Angular UI component library" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/${name}"><img src="https://img.shields.io/npm/v/${encoded}?color=2560e4&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/${name}"><img src="https://img.shields.io/npm/dm/${encoded}?color=2560e4" alt="npm downloads" /></a>
  <a href="${repo}/actions/workflows/ci.yml"><img src="${repo}/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="${repo}/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-2560e4" alt="MIT license" /></a>
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-22-dd0031?logo=angular&logoColor=white" alt="Angular 22" /></a>
  <a href="https://www.bestpractices.dev/projects/16576"><img src="https://www.bestpractices.dev/projects/16576/badge" alt="OpenSSF Best Practices" /></a>
</p>

<p align="center">
  <a href="https://tectra-ng.com"><b>Documentation</b></a>
  &nbsp;·&nbsp;
  <a href="https://tectra-ng.com/getting-started">Getting started</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/tectra-ng">The whole kit: tectra-ng</a>
  &nbsp;·&nbsp;
  <a href="${repo}">GitHub</a>
</p>

`;
}

function sortIgnoreFile(path) {
  if (!existsSync(path)) {
    return;
  }
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  const comments = lines.filter((line) => line.startsWith('#'));
  const entries = lines.filter((line) => !line.startsWith('#')).sort();
  writeFileSync(path, [...comments, ...entries].join('\n') + '\n');
}

for (const folder of readdirSync(dist)) {
  sortIgnoreFile(join(dist, folder, '.npmignore'));
  const readmePath = join(dist, folder, 'README.md');
  const packagePath = join(dist, folder, 'package.json');
  if (!existsSync(readmePath) || !existsSync(packagePath)) {
    continue;
  }
  const readme = readFileSync(readmePath, 'utf8');
  if (readme.includes(banner)) {
    continue;
  }
  const { name } = JSON.parse(readFileSync(packagePath, 'utf8'));
  writeFileSync(readmePath, header(name) + readme);
}
