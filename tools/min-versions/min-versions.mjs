import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('../../', import.meta.url).pathname);
const install = process.argv.includes('--install');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function lowestVersion(range) {
  const match = range.trim().match(/^(?:\^|~|>=\s*)?v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/);
  if (!match) {
    throw new Error(`min-versions: cannot read the lowest version of "${range}"`);
  }
  const part = (value) => (value === undefined || value === 'x' || value === '*' ? '0' : value);
  return `${match[1]}.${part(match[2])}.${part(match[3])}`;
}

export function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

export function minimumVersions(manifests, rootManifest) {
  const lowest = new Map();
  for (const manifest of manifests) {
    for (const section of ['peerDependencies', 'dependencies']) {
      for (const [name, range] of Object.entries(manifest[section] ?? {})) {
        if (name.startsWith('@tectra-ng/') || name === 'tslib') {
          continue;
        }
        const version = lowestVersion(range);
        const current = lowest.get(name);
        if (!current || compareVersions(version, current) > 0) {
          lowest.set(name, version);
        }
      }
    }
  }
  const rootVersions = { ...rootManifest.dependencies, ...rootManifest.devDependencies };
  const clean = (range) => range?.replace(/^[\^~]/, '');
  const families = [
    { leader: '@angular/core', member: (name) => name.startsWith('@angular/') && !name.startsWith('@angular/cdk') },
    { leader: '@angular/cdk', member: (name) => name.startsWith('@angular/cdk') },
  ];
  for (const { leader, member } of families) {
    const target = lowest.get(leader);
    const family = clean(rootVersions[leader]);
    if (!target || !family) {
      continue;
    }
    for (const [name, range] of Object.entries(rootVersions)) {
      if (member(name) && clean(range) === family && !lowest.has(name)) {
        lowest.set(name, target);
      }
    }
  }
  return new Map([...lowest].sort(([a], [b]) => a.localeCompare(b)));
}

function packageManifests() {
  return readdirSync(join(root, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, 'packages', entry.name, 'package.json'))
    .filter((path) => {
      try {
        readFileSync(path);
        return true;
      } catch {
        return false;
      }
    })
    .map(readJson);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const versions = minimumVersions(packageManifests(), readJson(join(root, 'package.json')));
  const specs = [...versions].map(([name, version]) => `${name}@${version}`);
  console.log(['Lowest versions the packages accept:', ...specs.map((spec) => `  ${spec}`)].join('\n'));
  if (install) {
    execFileSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', ...specs], { cwd: root, stdio: 'inherit' });
    const installed = specs.map((spec) => {
      const name = spec.slice(0, spec.lastIndexOf('@'));
      return `${name}@${readJson(join(root, 'node_modules', name, 'package.json')).version}`;
    });
    const wrong = installed.filter((spec, index) => spec !== specs[index]);
    if (wrong.length) {
      console.error(`Not installed at the lowest version: ${wrong.join(', ')}`);
      process.exit(1);
    }
    console.log('Installed.');
  }
}
