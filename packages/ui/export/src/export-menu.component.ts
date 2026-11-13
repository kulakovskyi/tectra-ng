import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, injectPassThrough } from '@tectra-ng/core/config';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';
import { TX_EXPORT_ICONS, TxExportAction } from './export-action.directive';
import { TxExportFormat, TxExportRow } from './export.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { EXPORT_ICON_DEFAULTS } from './export.icons';

/** Names of the parts of `tx-export` that `pt` can style. */
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

/** Every format in the order the `tx-export` menu lists them by default. */
export const TX_EXPORT_FORMATS: readonly TxExportFormat[] = ['excel', 'csv', 'word', 'pdf', 'json', 'html', 'markdown', 'copy', 'print'];

/** Split button with a menu of export formats; the main button runs the first format. */
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
  viewProviders: [provideTxIconDefaults(EXPORT_ICON_DEFAULTS)],
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
