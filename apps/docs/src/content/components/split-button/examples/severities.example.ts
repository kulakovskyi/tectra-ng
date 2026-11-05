import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButtonSeverity } from '@tectra/ui/button';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSplitButton } from '@tectra/ui/split-button';

@Component({
  selector: 'split-button-severities-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      @for (severity of severities; track severity) {
        <tx-split-button [label]="severity" [severity]="severity" [model]="items" />
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonSeveritiesExample {
  readonly severities: TxButtonSeverity[] = [
    'primary',
    'secondary',
    'success',
    'info',
    'warn',
    'danger',
    'help',
    'contrast',
  ];
  readonly items: TxMenuItem[] = [{ label: 'Option one' }, { label: 'Option two' }];
}
