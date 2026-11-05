import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSplitButton } from '@tectra/ui/split-button';

@Component({
  selector: 'split-button-nested-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      <tx-split-button
        label="Export"
        icon="download"
        severity="secondary"
        [outlined]="true"
        menuAriaLabel="Export formats"
        [model]="formats"
        (clicked)="last.set('CSV')"
        (itemSelected)="last.set($event.item.label ?? '')"
      />
      <span class="status">Last export: {{ last() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .status {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonNestedExample {
  readonly last = signal('—');
  readonly formats: TxMenuItem[] = [
    { label: 'Excel', icon: 'file-excel' },
    { label: 'PDF', icon: 'file-pdf' },
    { label: 'Image', icon: 'image', items: [{ label: 'PNG' }, { label: 'SVG' }] },
  ];
}
