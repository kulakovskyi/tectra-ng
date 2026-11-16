import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton, TxButtonSeverity } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-severities-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="grid">
      @for (severity of severities; track severity) {
        <tx-button-group [attr.aria-label]="severity + ' actions'">
          <button txButton [severity]="severity" [icon]="'download'">Export</button>
          <button txButton [severity]="severity" [icon]="'print'">Print</button>
          <button txButton [severity]="severity" [icon]="'share-alt'">Share</button>
        </tx-button-group>
      }
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupSeveritiesExample {
  readonly severities: TxButtonSeverity[] = [
    'primary',
    'secondary',
    'success',
    'danger',
    'contrast',
  ];
}
