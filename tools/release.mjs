import { execSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release';

const flags = new Set(process.argv.slice(2).filter((arg) => arg.startsWith('--')));
const [specifier = 'auto', tag = 'latest'] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const dryRun = flags.has('--dry-run');

const { workspaceVersion, projectsVersionData, releaseGraph } = await releaseVersion({
  specifier: specifier === 'auto' ? undefined : specifier,
  dryRun,
  gitCommit: false,
  gitTag: false,
  stageChanges: true,
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
  gitCommit: true,
  gitTag: true,
  gitPush: false,
  createRelease: false,
});

if (dryRun) {
  process.exit(0);
}

const tagName = `v${workspaceVersion}`;
execSync('git pull --rebase origin main', { stdio: 'inherit' });
execSync(`git tag -f ${tagName}`, { stdio: 'inherit' });
execSync(`git push --atomic origin HEAD:main ${tagName}`, { stdio: 'inherit' });
writeFileSync('release-notes.md', workspaceChangelog?.contents ?? '');

mkdirSync('release-assets', { recursive: true });
for (const name of readdirSync('dist/packages')) {
  execSync(`npm pack ./dist/packages/${name} --pack-destination release-assets`, { stdio: 'inherit' });
}
execSync(`npm pkg set version=${workspaceVersion}`, { stdio: 'inherit' });
execSync(`npm sbom --sbom-format cyclonedx --omit dev --package-lock-only > release-assets/tectra-ng-${workspaceVersion}.cdx.json`, { stdio: 'inherit' });
execSync('git checkout package.json', { stdio: 'inherit' });

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tagName}\nversion=${workspaceVersion}\n`);
} else {
  execSync(`gh release create ${tagName} --title ${tagName} --notes-file release-notes.md --verify-tag release-assets/*`, { stdio: 'inherit' });
}

process.exit(0);
