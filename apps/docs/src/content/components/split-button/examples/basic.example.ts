import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';

@Component({
  selector: 'split-button-basic-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      <tx-split-button
        label="Save"
        icon="check"
        [model]="items"
        (clicked)="status.set('Saved')"
        (itemSelected)="status.set($event.item.label ?? '')"
      />
      <span class="status">{{ status() }}</span>
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
export default class SplitButtonBasicExample {
  readonly status = signal('Not saved');
  readonly items: TxMenuItem[] = [
    { label: 'Save as draft', icon: 'file' },
    { label: 'Save as template', icon: 'copy' },
    { separator: true },
    { label: 'Discard changes', icon: 'trash', severity: 'danger' },
  ];
}
