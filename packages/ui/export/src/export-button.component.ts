import { ChangeDetectionStrategy, Component, Directive, computed, input } from '@angular/core';
import { TxPassThrough, injectPassThrough } from '@tectra-ng/core/config';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_EXPORT_ICONS, TxExportAction } from './export-action.directive';
import { TxExportFormat, TxExportPart, TxExportRow } from './export.types';

const TEMPLATE = `
  <button
    txButton
    type="button"
    [icon]="icon()"
    [label]="label()"
    [severity]="severity()"
    [variant]="variant()"
    [size]="size()"
    [loading]="busy()"
    [disabled]="disabled()"
    [unstyled]="unstyled()"
    [txTooltip]="resolvedTooltip()"
    [attr.aria-label]="ariaLabel()"
    [attr.aria-busy]="busy() || null"
    [class]="passThrough().button?.class"
    [style]="passThrough().button?.style"
    (click)="run(resolvedFormat())"
  ></button>
`;

const HOST = {
  '[class]': 'passThrough().root?.class',
  '[style]': 'passThrough().root?.style',
  '[attr.data-format]': 'resolvedFormat()',
};

@Directive()
abstract class TxExportButtonBase<T = TxExportRow> extends TxExportAction<T> {
  readonly pt = input<TxPassThrough<TxExportPart, TxExportButtonBase<T>> | undefined>(undefined);
  readonly passThrough = injectPassThrough('export', this, this.pt, this.ptOptions);

  abstract readonly resolvedFormat: () => TxExportFormat;

  readonly icon = computed(() => (this.copied() ? 'check' : TX_EXPORT_ICONS[this.resolvedFormat()]));
  readonly resolvedTooltip = computed(() => (this.copied() ? this.translations().exportCopied : (this.tooltip() ?? this.formatLabel(this.resolvedFormat()))));
  readonly ariaLabel = computed(() => (this.label() ? null : this.resolvedTooltip()));
}

@Component({
  selector: 'tx-export-button',
  imports: [TxButton, TxTooltip],
  template: TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-export tx-export-button', ...HOST },
})
export class TxExportButton<T = TxExportRow> extends TxExportButtonBase<T> {
  readonly format = input<TxExportFormat>('csv');
  readonly resolvedFormat = computed(() => this.format());
}

@Component({
  selector: 'tx-export-csv',
  imports: [TxButton, TxTooltip],
  template: TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-export tx-export-csv', ...HOST },
})
export class TxExportCsv<T = TxExportRow> extends TxExportButtonBase<T> {
  readonly resolvedFormat = () => 'csv' as const;
}

@Component({
  selector: 'tx-export-excel',
  imports: [TxButton, TxTooltip],
  template: TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-export tx-export-excel', ...HOST },
})
export class TxExportExcel<T = TxExportRow> extends TxExportButtonBase<T> {
  readonly resolvedFormat = () => 'excel' as const;
}

@Component({
  selector: 'tx-export-word',
  imports: [TxButton, TxTooltip],
  template: TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-export tx-export-word', ...HOST },
})
export class TxExportWord<T = TxExportRow> extends TxExportButtonBase<T> {
  readonly resolvedFormat = () => 'word' as const;
}

@Component({
  selector: 'tx-export-pdf',
  imports: [TxButton, TxTooltip],
  template: TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-export tx-export-pdf', ...HOST },
})
export class TxExportPdf<T = TxExportRow> extends TxExportButtonBase<T> {
  readonly resolvedFormat = () => 'pdf' as const;
}
