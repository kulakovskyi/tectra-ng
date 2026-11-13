import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { answers, appDir, appName, workdir } from './workdir.mjs';

const repo = resolve(import.meta.dirname, '../..');
const dist = join(repo, 'dist/packages');
const ng = join(repo, 'node_modules/@angular/cli/bin/ng.js');
const tarballs = join(workdir, 'tarballs');
const env = { ...process.env, NG_CLI_ANALYTICS: 'false', CI: '1', npm_config_legacy_peer_deps: 'false' };

function run(command, args, cwd) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, env, stdio: 'inherit' });
}

if (!existsSync(join(dist, 'tectra-ng/schematics/collection.json'))) {
  throw new Error('Build the packages first: npm run build:packages');
}

rmSync(workdir, { recursive: true, force: true });
mkdirSync(tarballs, { recursive: true });

const packed = {};
for (const folder of readdirSync(dist)) {
  const manifest = join(dist, folder, 'package.json');
  if (!existsSync(manifest)) {
    continue;
  }
  const { name } = JSON.parse(readFileSync(manifest, 'utf8'));
  const output = execFileSync('npm', ['pack', join(dist, folder), '--pack-destination', tarballs, '--silent'], { env }).toString().trim().split('\n').pop();
  packed[name] = join(tarballs, output);
}

run(process.execPath, [ng, 'new', appName, '--defaults', '--skip-git', '--skip-install', '--ssr=false', '--style=css'], workdir);

const manifestPath = join(appDir, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.overrides = Object.fromEntries(Object.entries(packed).filter(([name]) => !['tectra-ng', '@tectra-ng/editor', '@tectra-ng/code-editor'].includes(name)).map(([name, file]) => [name, `file:${file}`]));
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
run('npm', ['install', '--no-audit', '--no-fund', packed['tectra-ng'], packed['@tectra-ng/editor'], packed['@tectra-ng/code-editor']], appDir);

const { version } = JSON.parse(readFileSync(join(dist, 'tectra-ng/package.json'), 'utf8'));
const options = Object.entries(answers).map(([key, value]) => `--${key}=${value}`);
run('npx', ['ng', 'add', `tectra-ng@${version}`, '--skip-confirmation', '--skip-install', ...options], appDir);
const added = JSON.parse(readFileSync(manifestPath, 'utf8'));
const kit = Object.keys(added.overrides).filter((name) => name.startsWith('@tectra-ng/'));
const undeclared = kit.filter((name) => !added.dependencies[name]);
if (undeclared.length > 0) {
  throw new Error(`ng add did not list ${undeclared.join(', ')} in the dependencies of the app`);
}
for (const name of kit) {
  added.dependencies[name] = added.overrides[name];
}
writeFileSync(manifestPath, JSON.stringify(added, null, 2) + '\n');
run('npm', ['install', '--no-audit', '--no-fund'], appDir);
run('npx', ['ng', 'generate', 'tectra-ng:ng-add', '--primary=teal'], appDir);

writeFileSync(
  join(appDir, 'src/app/app.ts'),
  `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'app-root',
  imports: [FormsModule, TxButton, TxSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <main>
      <h1>tectra</h1>
      <button txButton label="Save" (click)="saved.set(true)"></button>
      <tx-select ariaLabel="City" placeholder="Pick a city" [options]="cities" [(ngModel)]="city" />
      <p class="state">{{ saved() ? 'Saved' : 'Not saved' }} · {{ city ?? 'No city' }}</p>
    </main>
  \`,
})
export class App {
  readonly cities = ['Kyiv', 'Lviv', 'Odesa'];
  readonly saved = signal(false);
  city: string | null = null;
}
`,
);
run('npx', ['ng', 'build'], appDir);
