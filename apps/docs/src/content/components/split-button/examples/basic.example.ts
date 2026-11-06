import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'split-button-basic-example',
  imports: [TxSplitButton],
  template: `
    <tx-split-button
      label="Save"
      icon="check"
      [model]="items"
      (clicked)="toast.success('Changes saved')"
      (itemSelected)="run($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonBasicExample {
  readonly toast = inject(TxToastService);
  readonly items: TxMenuItem[] = [
    { label: 'Save as draft', icon: 'file', data: 'Draft saved' },
    { label: 'Save as template', icon: 'copy', data: 'Template saved' },
    { separator: true },
    { label: 'Discard changes', icon: 'trash', severity: 'danger', data: 'Changes discarded' },
  ];

  run(event: TxMenuItemEvent): void {
    const text = String(event.item.data);
    if (event.item.severity === 'danger') this.toast.info(text);
    else this.toast.success(text);
  }
}
