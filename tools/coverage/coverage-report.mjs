import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'coverage';
const metrics = ['statements', 'branches', 'functions', 'lines'];
const goal = 95;

if (!existsSync(root)) {
  console.error('No coverage folder. Run npm run test first.');
  process.exit(1);
}

const packages = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'coverage-summary.json')))
  .map((entry) => ({ name: entry.name, total: JSON.parse(readFileSync(join(root, entry.name, 'coverage-summary.json'), 'utf8')).total }))
  .sort((a, b) => a.name.localeCompare(b.name));

if (packages.length === 0) {
  console.error('No coverage-summary.json under coverage/. Run npm run test first.');
  process.exit(1);
}

const all = Object.fromEntries(
  metrics.map((metric) => {
    const total = packages.reduce((sum, { total: t }) => sum + t[metric].total, 0);
    const covered = packages.reduce((sum, { total: t }) => sum + t[metric].covered, 0);
    return [metric, { total, covered, pct: total ? Math.round((covered / total) * 10000) / 100 : 100 }];
  }),
);

const cell = (value) => `${value.pct.toFixed(2)}%${value.pct < goal ? ' ⚠️' : ''}`;
const rows = [...packages, { name: '**all packages**', total: all }].map(
  ({ name, total }) => `| ${name} | ${metrics.map((metric) => cell(total[metric])).join(' | ')} |`,
);
const summary = [
  '## Unit test coverage',
  '',
  `Goal: ${goal}% of each metric in every package (⚠️ below it). The \`coverageThresholds\` of each \`test\` target fail the run when a package drops.`,
  '',
  `| Package | ${metrics.map((metric) => metric[0].toUpperCase() + metric.slice(1)).join(' | ')} |`,
  `|---|${metrics.map(() => '---:').join('|')}|`,
  ...rows,
  '',
].join('\n');

console.log(summary);
if (process.env['GITHUB_STEP_SUMMARY']) {
  appendFileSync(process.env['GITHUB_STEP_SUMMARY'], summary);
}

const lines = all.lines.pct;
const color = lines >= goal ? 'brightgreen' : lines >= 85 ? 'yellow' : 'orange';
mkdirSync(join(root, 'badge'), { recursive: true });
writeFileSync(
  join(root, 'badge', 'coverage.json'),
  `${JSON.stringify({ schemaVersion: 1, label: 'coverage', message: `${Math.floor(lines)}%`, color })}\n`,
);
