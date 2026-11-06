import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'split-button-nested-example',
  imports: [TxSplitButton],
  template: `
    <tx-split-button
      label="Export"
      icon="download"
      severity="secondary"
      [outlined]="true"
      menuAriaLabel="Export formats"
      [model]="formats"
      (clicked)="exported('CSV')"
      (itemSelected)="exported($event.item.label ?? '')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonNestedExample {
  private readonly toast = inject(TxToastService);
  readonly formats: TxMenuItem[] = [
    { label: 'Excel', icon: 'file-excel' },
    { label: 'PDF', icon: 'file-pdf' },
    { label: 'Image', icon: 'image', items: [{ label: 'PNG' }, { label: 'SVG' }] },
  ];

  exported(format: string): void {
    this.toast.success(`Exported as ${format}`);
  }
}
