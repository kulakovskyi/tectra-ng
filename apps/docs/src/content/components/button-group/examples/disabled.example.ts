import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-disabled-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group aria-label="Pages">
      <button
        txButton
        [severity]="'secondary'"
        [outlined]="true"
        [icon]="'angle-left'"
        [disabled]="page() === 1"
        (click)="page.set(page() - 1)"
      >
        Previous
      </button>
      <button txButton [severity]="'secondary'" [outlined]="true" [disabled]="true">
        Page {{ page() }} of {{ pages }}
      </button>
      <button
        txButton
        [severity]="'secondary'"
        [outlined]="true"
        [icon]="'angle-right'"
        [iconPos]="'right'"
        [disabled]="page() === pages"
        (click)="page.set(page() + 1)"
      >
        Next
      </button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupDisabledExample {
  readonly pages = 5;
  readonly page = signal(1);
}
