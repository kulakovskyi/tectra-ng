import { execFileSync, execSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release';

const flags = new Set(process.argv.slice(2).filter((arg) => arg.startsWith('--')));
const [specifier = 'auto', tag = 'latest'] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const dryRun = flags.has('--dry-run');

if (!/^(auto|patch|minor|major|\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?)$/.test(specifier) || !/^(latest|next)$/.test(tag)) {
  console.error(`Invalid input: version "${specifier}" must be auto, patch, minor, major or x.y.z; dist-tag "${tag}" must be latest or next.`);
  process.exit(1);
}

const { workspaceVersion, projectsVersionData, releaseGraph } = await releaseVersion({
  specifier: specifier === 'auto' ? undefined : specifier,
  dryRun,
  gitCommit: false,
  gitTag: false,
  stageChanges: false,
});

if (!workspaceVersion) {
  console.log('Nothing to release: no feat / fix commits since the last version.');
  process.exit(0);
}

execSync('npm run build:packages', { stdio: 'inherit' });

const published = await releasePublish({ dryRun, tag, versionData: projectsVersionData, releaseGraph });
if (Object.values(published).some((result) => result.code !== 0)) {
  process.exit(1);
}

const { workspaceChangelog } = await releaseChangelog({
  version: workspaceVersion,
  versionData: projectsVersionData,
  releaseGraph,
  dryRun,
  gitCommit: false,
  gitTag: false,
  gitPush: false,
  createRelease: false,
});

if (dryRun) {
  process.exit(0);
}

const tagName = `v${workspaceVersion}`;
const branch = `release/${tagName}`;
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run('git', ['switch', '-c', branch]);
run('git', ['add', '--update']);
run('git', ['commit', '--signoff', '-m', `chore(release): ${workspaceVersion}`]);
run('git', ['tag', tagName]);
run('git', ['push', '--atomic', 'origin', branch, tagName]);
writeFileSync('release-notes.md', workspaceChangelog?.contents ?? '');

mkdirSync('release-assets', { recursive: true });
for (const name of readdirSync('dist/packages')) {
  run('npm', ['pack', `./dist/packages/${name}`, '--pack-destination', 'release-assets']);
}
run('npm', ['pkg', 'set', `version=${workspaceVersion}`]);
const sbom = execFileSync('npm', ['sbom', '--sbom-format', 'cyclonedx', '--omit', 'dev', '--package-lock-only'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
writeFileSync(join('release-assets', `tectra-ng-${workspaceVersion}.cdx.json`), sbom);
run('git', ['checkout', 'package.json']);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tagName}\nversion=${workspaceVersion}\nbranch=${branch}\n`);
} else {
  const assets = readdirSync('release-assets').map((file) => join('release-assets', file));
  run('gh', ['release', 'create', tagName, '--title', tagName, '--notes-file', 'release-notes.md', '--verify-tag', ...assets]);
  run('gh', ['pr', 'create', '--base', 'main', '--head', branch, '--title', `chore(release): ${workspaceVersion}`, '--body', `Version bump and changelog of ${tagName}.`]);
}

process.exit(0);
