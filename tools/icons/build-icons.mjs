import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;
const root = join(here, '../..');
const NAMES = 'address-book align-center align-justify align-left align-right angle-double-down angle-double-left angle-double-right angle-double-up angle-down angle-left angle-right angle-up arrow-circle-down arrow-circle-left arrow-circle-right arrow-circle-up arrow-down-left-and-arrow-up-right-to-center arrow-down-left arrow-down-right arrow-down arrow-left arrow-right-arrow-left arrow-right arrow-u-turn-up-left arrow-u-turn-up-right arrow-up-left arrow-up-right-and-arrow-down-left-from-center arrow-up-right arrow-up arrows-alt arrows-h arrows-v asterisk at backward ban barcode bars bell-slash bell bitcoin block-quote bold bolt book bookmark-fill bookmark box briefcase building-columns building bullseye calculator calendar-clock calendar-minus calendar-plus calendar-times calendar camera car caret-down caret-left caret-right caret-up cart-arrow-down cart-minus cart-plus case-sensitive chart-bar chart-line chart-pie chart-scatter check-circle check-square check chevron-circle-down chevron-circle-left chevron-circle-right chevron-circle-up chevron-down chevron-left chevron-right chevron-up circle-fill circle clipboard clock clone cloud-download cloud-upload cloud code-branch code cog columns-2 comment comments compass compress copy credit-card crown database delete-left desktop directions-alt directions dollar dot download eject ellipsis-h ellipsis-v envelope equals eraser euro exclamation-circle exclamation-triangle expand external-link eye-dropper eye-slash eye face-smile fast-backward fast-forward file-arrow-up file-check file-edit file-excel file-export file-import file-o file-pdf file-plus file-word file filter-fill filter-slash filter flag-fill flag folder-open folder-plus folder forward gauge gift globe graduation-cap grid-2 grip-horizontal grip-vertical grip hammer hashtag heading-1 heading-2 heading-3 heading-4 heading-5 heading-6 heading headphones heart-fill heart highlighter history home horizontal-rule hourglass id-card image images inbox indent indian-rupee info-circle info italic key language lightbulb link list-check list-ol list-tree list lock-open lock map-marker map mars megaphone microchip-ai microchip microphone minus-circle minus mobile money-bill moon note-sticky objects-column outdent palette paperclip paragraph-left paragraph-right pause-circle pause pen-line pen-to-square pencil percentage phone play-circle play plus-circle plus pound power-off print qrcode question-circle question receipt rectangle-xmark refresh replay reply rows-2 save search-minus search-plus search send server share-alt shield shop shopping-bag shopping-cart sidebar sign-in sign-out signature sitemap slash sliders-h sliders-v sort-alpha-down-alt sort-alpha-down sort-alpha-up-alt sort-alpha-up sort-alt-slash sort-alt sort-amount-down-alt sort-amount-down sort-amount-up-alt sort-amount-up sort-down-fill sort-down sort-numeric-down-alt sort-numeric-down sort-numeric-up-alt sort-numeric-up sort-up-fill sort-up sort sparkles spinner-dotted spinner square stamp star-fill star-half-fill star-half star step-backward-alt step-backward step-forward-alt step-forward stop-circle stop stopwatch strikethrough subscript sun superscript sync table tablet tag tags text-color text th-large thumbs-down-fill thumbs-down thumbs-up-fill thumbs-up thumbtack ticket times-circle times trash trophy truck turkish-lira underline undo unlock upload user-edit user-minus user-plus user users venus verified video volume-down volume-off volume-up wallet warehouse wave-pulse wifi window-maximize window-minimize wrench'.split(' ');

const icons = {};
for (const file of readdirSync(join(here, 'defs')).filter((f) => f.endsWith('.mjs')).sort()) {
  const defs = (await import(join(here, 'defs', file))).default;
  for (const [name, paths] of Object.entries(defs)) {
    if (icons[name]) {
      throw new Error(`duplicate icon ${name} in ${file}`);
    }
    icons[name] = [paths].flat(Infinity);
  }
}

const unknown = Object.keys(icons).filter((name) => !NAMES.includes(name));
const missing = NAMES.filter((name) => !icons[name]);
const ordered = NAMES.filter((name) => icons[name]);

const serialize = (p) => (typeof p === 'string' ? JSON.stringify(p) : `{ d: ${JSON.stringify(p.d)}, fill: true }`);
const body = ordered.map((name) => `  '${name}': [${icons[name].map(serialize).join(', ')}],`).join('\n');
writeFileSync(
  join(root, 'packages/icons/src/icons.ts'),
  `import { TxIconPath } from './icon.types';\n\nexport type TxIconName =\n${ordered.map((n) => `  | '${n}'`).join('\n')};\n\nexport const TX_ICONS: Record<TxIconName, TxIconPath[]> = {\n${body}\n};\n`,
);

const sheetDir = process.env.ICON_SHEET_DIR;
if (sheetDir) {
  const cols = 12;
  const cell = 96;
  const groups = process.argv.slice(2).length ? process.argv.slice(2) : ['all'];
  for (const group of groups) {
    const list = group === 'all' ? ordered : ordered.filter((n) => n.startsWith(group) || group.split(',').includes(n));
    const rows = Math.ceil(list.length / cols);
    const cells = list.map((name, i) => {
      const x = (i % cols) * cell;
      const y = Math.floor(i / cols) * cell;
      const paths = icons[name]
        .map((p) => (typeof p === 'string' ? `<path d="${p}"/>` : `<path d="${p.d}" fill="black"/>`))
        .join('');
      return `<g transform="translate(${x + 24},${y + 8}) scale(2)" fill="none" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="24" height="24" fill="#f3f4f6" stroke="none"/>${paths}</g><text x="${x + cell / 2}" y="${y + cell - 16}" font-size="9" text-anchor="middle" font-family="sans-serif">${name.slice(0, 22)}</text>`;
    });
    writeFileSync(join(sheetDir, `${group.replace(/,/g, '_').slice(0, 40)}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * cell}"><rect width="100%" height="100%" fill="white"/>${cells.join('')}</svg>`);
  }
}

console.log(`icons: ${ordered.length} of ${NAMES.length}; unknown: ${unknown.join(', ') || '—'}`);
console.log(`missing (${missing.length}): ${missing.join(' ')}`);
