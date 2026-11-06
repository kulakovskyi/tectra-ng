import { DOCUMENT, Injectable, InjectionToken, Provider, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxExportFont, TxExportFormat, TxExportOptions, TxExportRequest, TxExportResult, TxExportTable } from './export.types';
import { TxExportTextContext, buildExportTable, downloadBlob, withExtension } from './export.utils';
import { writeDocx } from './writers/docx';
import { writePdf } from './writers/pdf';
import { printHtml } from './writers/print';
import { htmlTable, printPageCss, writeCsv, writeHtml, writeJson, writeMarkdown, writeTsv } from './writers/text';
import { writeXlsx } from './writers/xlsx';

export const TX_EXPORT_OPTIONS = new InjectionToken<TxExportOptions>('TX_EXPORT_OPTIONS', { providedIn: 'root', factory: () => ({}) });

export function provideTxExport(options: TxExportOptions): Provider {
  return { provide: TX_EXPORT_OPTIONS, useValue: options };
}

export const TX_EXPORT_EXTENSIONS: Record<TxExportFormat, string | null> = {
  csv: 'csv',
  excel: 'xlsx',
  word: 'docx',
  pdf: 'pdf',
  json: 'json',
  html: 'html',
  markdown: 'md',
  copy: null,
  print: null,
};

const FORMAT_KEYS = ['csv', 'excel', 'word', 'pdf', 'json', 'html', 'markdown', 'copy', 'print'] as const;

export function mergeExportOptions(...layers: (TxExportOptions | undefined)[]): TxExportOptions {
  const merged: Record<string, unknown> = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (value === undefined) continue;
      merged[key] = (FORMAT_KEYS as readonly string[]).includes(key) ? { ...(merged[key] as object), ...(value as object) } : value;
    }
  }
  return merged as TxExportOptions;
}

export function loadDefaultExportFont(): Promise<TxExportFont> {
  return import('@tectra-ng/ui/export-font').then((module) => module.TX_EXPORT_FONT);
}

@Injectable({ providedIn: 'root' })
export class TxExportService {
  private document = inject(DOCUMENT);
  private defaults = inject(TX_EXPORT_OPTIONS);
  private locale = inject(TxLocaleService);

  async export<T>(request: TxExportRequest<T>): Promise<TxExportResult> {
    const options = mergeExportOptions(this.defaults, request.options);
    const table = buildExportTable(request.rows, request.fields, request.format);
    const context = this.textContext(options);
    if (request.format === 'copy') {
      await this.copy(table, options, context);
      return { format: 'copy', filename: null, rows: table.rows.length };
    }
    if (request.format === 'print') {
      await this.print(table, options, context);
      return { format: 'print', filename: null, rows: table.rows.length };
    }
    const file = await this.file(request.format, table, options, context);
    downloadBlob(this.document, file.blob, file.filename);
    return { format: request.format, filename: file.filename, rows: table.rows.length };
  }

  async file(format: Exclude<TxExportFormat, 'copy' | 'print'>, table: TxExportTable, options: TxExportOptions = {}, context = this.textContext(options)): Promise<{ blob: Blob; filename: string }> {
    const filename = withExtension(options.filename || 'ExportedData', TX_EXPORT_EXTENSIONS[format] as string);
    const document = { title: options.title, subtitle: options.subtitle, showDate: options.showDate };
    const now = new Date();
    switch (format) {
      case 'csv': {
        const csv = writeCsv(table, options.csv);
        return { filename, blob: new Blob([options.csv?.bom === false ? '' : '\ufeff', csv], { type: 'text/csv;charset=utf-8' }) };
      }
      case 'excel':
        return { filename, blob: await writeXlsx(table, { title: options.title, ...options.excel }, now) };
      case 'word':
        return { filename, blob: await writeDocx(table, { ...document, ...options.word }, context, now) };
      case 'pdf': {
        const pdf = { ...document, ...options.pdf };
        return { filename, blob: await writePdf(table, pdf, await (pdf.font ?? loadDefaultExportFont)(), context, now) };
      }
      case 'json':
        return { filename, blob: new Blob([writeJson(table, options.json)], { type: 'application/json;charset=utf-8' }) };
      case 'html':
        return { filename, blob: new Blob([writeHtml(table, { ...document, ...options.html, lang: this.lang(options) }, context, now)], { type: 'text/html;charset=utf-8' }) };
      case 'markdown':
        return { filename, blob: new Blob([writeMarkdown(table, { title: options.title, ...options.markdown }, context)], { type: 'text/markdown;charset=utf-8' }) };
    }
  }

  textContext(options: TxExportOptions = {}): TxExportTextContext {
    const translations = this.locale.translations();
    return { locale: options.locale ?? this.locale.locale().intl, yes: translations.yes, no: translations.no };
  }

  private lang(options: TxExportOptions): string | undefined {
    return options.locale ?? this.locale.locale().intl;
  }

  private async copy(table: TxExportTable, options: TxExportOptions, context: TxExportTextContext): Promise<void> {
    const header = options.copy?.header !== false;
    const text = writeTsv(table, context, header);
    const clipboard = this.document.defaultView?.navigator?.clipboard;
    if (!clipboard) throw new Error('Clipboard is not available');
    const Item = this.document.defaultView?.ClipboardItem;
    if (options.copy?.html !== false && Item && clipboard.write) {
      const html = `<meta charset="utf-8">${htmlTable(table, context, header)}`;
      await clipboard.write([new Item({ 'text/plain': new Blob([text], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })]);
      return;
    }
    await clipboard.writeText(text);
  }

  private async print(table: TxExportTable, options: TxExportOptions, context: TxExportTextContext): Promise<void> {
    const print = { title: options.title, subtitle: options.subtitle, showDate: options.showDate, ...options.print };
    const html = writeHtml(table, { ...print, lang: this.lang(options), page: printPageCss(print, table.columns.length) }, context);
    await printHtml(this.document, html);
  }
}
