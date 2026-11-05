import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-label-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [label]="'Save'" [icon]="'check'"></button>
      <button txButton [icon]="'check'">Save</button>
      <button txButton [severity]="'secondary'" [icon]="'plus'" [label]="count() || ''" aria-label="Add" (click)="count.update((n) => n + 1)"></button>
      <span class="hint">The last one is square until clicked</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonLabelExample {
  count = signal(0);
}
