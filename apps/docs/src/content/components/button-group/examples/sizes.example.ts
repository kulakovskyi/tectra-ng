import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton, TxButtonSize } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-sizes-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="stack">
      @for (size of sizes; track size) {
        <tx-button-group [attr.aria-label]="size + ' group'">
          <button txButton [size]="size" [severity]="'secondary'" [outlined]="true">Back</button>
          <button txButton [size]="size" [severity]="'secondary'" [outlined]="true">Skip</button>
          <button txButton [size]="size">Next</button>
        </tx-button-group>
      }
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupSizesExample {
  readonly sizes: TxButtonSize[] = ['small', 'medium', 'large'];
}
