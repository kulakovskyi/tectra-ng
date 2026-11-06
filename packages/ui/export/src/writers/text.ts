import { TxExportCsvOptions, TxExportHtmlOptions, TxExportJsonOptions, TxExportMarkdownOptions, TxExportPrintOptions, TxExportTable } from '../export.types';
import { TxExportTextContext, cellText, csvCell, escapeXml, localIso } from '../export.utils';
import { dateLine, pageGeometry } from './page';

export function writeCsv(table: TxExportTable, options: TxExportCsvOptions = {}): string {
  const separator = options.separator ?? ',';
  const cell = (value: unknown) => csvCell(value, separator, { quoteAll: options.quoteAll, formulaGuard: options.formulaGuard });
  const lines = table.rows.map((row) => row.map((value, index) => cell(localIso(value, table.columns[index].type))).join(separator));
  if (options.header !== false) lines.unshift(table.columns.map((column) => cell(column.title)).join(separator));
  return lines.join(options.lineEnding ?? '\r\n');
}

export function writeTsv(table: TxExportTable, context: TxExportTextContext, header = true): string {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, ' ');
  const lines = table.rows.map((row) => table.columns.map((column, index) => clean(cellText(row[index], column, context))).join('\t'));
  if (header) lines.unshift(table.columns.map((column) => clean(column.title)).join('\t'));
  return lines.join('\n');
}

export function writeJson(table: TxExportTable, options: TxExportJsonOptions = {}): string {
  const keys = table.columns.map((column) => (options.keys === 'title' ? column.title : column.key));
  const objects = table.rows.map((row) => Object.fromEntries(keys.map((key, index) => [key, row[index] === undefined ? null : localIso(row[index], table.columns[index].type)])));
  return JSON.stringify(objects, null, options.indent ?? 2);
}

function escapeHtml(text: string): string {
  return escapeXml(text).replace(/\n/g, '<br>');
}

export function htmlTable(table: TxExportTable, context: TxExportTextContext, header = true): string {
  const align = (value: string) => (value === 'end' ? ' style="text-align:right"' : value === 'center' ? ' style="text-align:center"' : '');
  const head = header ? `<thead><tr>${table.columns.map((column) => `<th${align(column.align)}>${escapeHtml(column.title)}</th>`).join('')}</tr></thead>` : '';
  const body = table.rows.map((row) => `<tr>${table.columns.map((column, index) => `<td${align(column.align)}>${escapeHtml(cellText(row[index], column, context))}</td>`).join('')}</tr>`).join('');
  return `<table>${head}<tbody>${body}</tbody></table>`;
}

const DOCUMENT_STYLES = `
  body { margin: 24px; color: #1d2939; font: 13px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 20px; }
  .subtitle, .date { margin: 0 0 4px; color: #667085; }
  .date { font-size: 12px; }
  table { width: 100%; margin-top: 16px; border-collapse: collapse; }
  th, td { padding: 6px 10px; border: 1px solid #d0d5dd; text-align: left; vertical-align: top; }
  th { background: #f2f4f7; font-weight: 600; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
`;

export function writeHtml(table: TxExportTable, options: TxExportHtmlOptions & { lang?: string; page?: string } = {}, context: TxExportTextContext, date = new Date()): string {
  const title = options.title ? `<h1>${escapeHtml(options.title)}</h1>` : '';
  const subtitle = options.subtitle ? `<p class="subtitle">${escapeHtml(options.subtitle)}</p>` : '';
  const stamp = dateLine(options, context, date);
  const when = stamp ? `<p class="date">${escapeHtml(stamp)}</p>` : '';
  const lang = options.lang ? ` lang="${escapeXml(options.lang)}"` : '';
  return `<!doctype html>\n<html${lang}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(options.title ?? 'Export')}</title><style>${DOCUMENT_STYLES}${options.page ?? ''}${options.styles ?? ''}</style></head><body>${title}${subtitle}${when}${htmlTable(table, context, options.header !== false)}</body></html>\n`;
}

export function printPageCss(options: TxExportPrintOptions, columns: number): string {
  const page = pageGeometry(options.pageSize, options.orientation, options.margin, columns);
  const [top, right, bottom, left] = page.margin;
  return `@page { size: ${page.width}pt ${page.height}pt; margin: ${top}pt ${right}pt ${bottom}pt ${left}pt; } @media print { body { margin: 0; } }`;
}

export function writeMarkdown(table: TxExportTable, options: TxExportMarkdownOptions = {}, context: TxExportTextContext): string {
  const clean = (text: string) => text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  const lines: string[] = [];
  if (options.title) lines.push(`# ${options.title}`, '');
  const titles = table.columns.map((column) => clean(column.title) || ' ');
  lines.push(`| ${options.header === false ? table.columns.map(() => ' ').join(' | ') : titles.join(' | ')} |`);
  lines.push(`| ${table.columns.map((column) => (column.align === 'end' ? '---:' : column.align === 'center' ? ':---:' : '---')).join(' | ')} |`);
  for (const row of table.rows) lines.push(`| ${table.columns.map((column, index) => clean(cellText(row[index], column, context))).join(' | ')} |`);
  return `${lines.join('\n')}\n`;
}
