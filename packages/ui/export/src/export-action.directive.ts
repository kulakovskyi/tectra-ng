import { Directive, booleanAttribute, computed, inject, input, model, output, signal } from '@angular/core';
import { TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxButtonSeverity, TxButtonSize, TxButtonVariant } from '@tectra-ng/ui/button';
import { TX_EXPORT_OPTIONS, TxExportService, mergeExportOptions } from './export.service';
import { TxExportFetch, TxExportField, TxExportFormat, TxExportOptions, TxExportRow, TxExportedEvent } from './export.types';

const COPIED_FOR = 1600;

/** Icon name of every export format. */
export const TX_EXPORT_ICONS: Record<TxExportFormat, string> = {
  csv: 'file',
  excel: 'file-excel',
  word: 'file-word',
  pdf: 'file-pdf',
  json: 'code',
  html: 'code',
  markdown: 'file-edit',
  copy: 'copy',
  print: 'print',
};

/** Base of the export buttons: the data, fields and options, the run of an export and its state. */
@Directive()
export abstract class TxExportAction<T = TxExportRow> {
  private exporter = inject(TxExportService);
  private defaults = inject(TX_EXPORT_OPTIONS);
  private announcer = inject(TxAnnouncer);
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  readonly data = model<readonly T[]>([]);
  readonly fields = input<readonly TxExportField<T>[]>([]);
  readonly fetchData = input<TxExportFetch<T> | undefined>(undefined);
  readonly options = input<TxExportOptions | undefined>(undefined);
  readonly filename = input<string | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly tooltip = input<string | undefined>(undefined);
  readonly severity = input<TxButtonSeverity>('primary');
  readonly variant = input<TxButtonVariant | undefined>(undefined);
  readonly size = input<TxButtonSize>('medium');
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly exported = output<TxExportedEvent<T>>();
  readonly failed = output<unknown>();

  readonly translations = injectTranslations();
  readonly exporting = signal(false);
  readonly copied = signal(false);
  readonly busy = computed(() => this.loading() || this.exporting());

  formatLabel(format: TxExportFormat): string {
    const translations = this.translations();
    return {
      csv: translations.exportCsv,
      excel: translations.exportExcel,
      word: translations.exportWord,
      pdf: translations.exportPdf,
      json: translations.exportJson,
      html: translations.exportHtml,
      markdown: translations.exportMarkdown,
      copy: translations.exportCopy,
      print: translations.exportPrint,
    }[format];
  }

  async run(format: TxExportFormat): Promise<void> {
    if (this.busy() || this.disabled()) return;
    this.exporting.set(true);
    try {
      const fetch = this.fetchData();
      if (fetch) {
        const rows = await fetch();
        if (!rows) return;
        this.data.set(rows);
      }
      const data = this.data();
      const options = mergeExportOptions(this.defaults, this.options(), { filename: this.filename() || undefined, title: this.title() || undefined });
      const result = await this.exporter.export({ format, rows: data, fields: this.fields(), options });
      if (format === 'copy') this.markCopied();
      this.exported.emit({ ...result, data });
    } catch (error) {
      this.failed.emit(error);
    } finally {
      this.exporting.set(false);
    }
  }

  private markCopied(): void {
    this.copied.set(true);
    void this.announcer.announce(this.translations().exportCopied);
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_FOR);
  }
}
