import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, injectPassThrough } from '@tectra-ng/core/config';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';
import { TX_EXPORT_ICONS, TxExportAction } from './export-action.directive';
import { TxExportFormat, TxExportRow } from './export.types';

export type TxExportMenuPart = 'root' | 'button';

const FORMAT_NAMES: Partial<Record<TxExportFormat, string>> = {
  csv: 'CSV',
  excel: 'Excel (.xlsx)',
  word: 'Word (.docx)',
  pdf: 'PDF',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown',
};

export const TX_EXPORT_FORMATS: readonly TxExportFormat[] = ['excel', 'csv', 'word', 'pdf', 'json', 'html', 'markdown', 'copy', 'print'];

@Component({
  selector: 'tx-export',
  imports: [TxSplitButton],
  template: `
    <tx-split-button
      [label]="resolvedLabel()"
      [icon]="mainIcon()"
      [model]="items()"
      [severity]="severity()"
      [size]="size()"
      [outlined]="variant() === 'outlined'"
      [text]="variant() === 'text'"
      [loading]="busy()"
      [disabled]="disabled()"
      [unstyled]="unstyled()"
      [menuAriaLabel]="translations().exportFormats"
      [class]="passThrough().button?.class"
      [style]="passThrough().button?.style"
      (clicked)="run(mainFormat())"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-export tx-export-menu',
    '[class]': 'passThrough().root?.class',
    '[style]': 'passThrough().root?.style',
  },
})
export class TxExport<T = TxExportRow> extends TxExportAction<T> {
  readonly formats = input<readonly TxExportFormat[]>(TX_EXPORT_FORMATS);
  readonly pt = input<TxPassThrough<TxExportMenuPart, TxExport<T>> | undefined>(undefined);
  readonly passThrough = injectPassThrough('export', this, this.pt, this.ptOptions);

  readonly mainFormat = computed(() => this.formats()[0] ?? 'excel');
  readonly mainIcon = computed(() => (this.copied() && this.mainFormat() === 'copy' ? 'check' : 'download'));
  readonly resolvedLabel = computed(() => this.label() ?? this.translations().export);
  readonly items = computed<TxMenuItem[]>(() => {
    const translations = this.translations();
    return this.formats().map((format) => ({
      id: format,
      data: format,
      icon: TX_EXPORT_ICONS[format],
      label: format === 'copy' ? translations.exportCopy : format === 'print' ? translations.exportPrint : (FORMAT_NAMES[format] ?? format),
      command: () => void this.run(format),
    }));
  });
}
