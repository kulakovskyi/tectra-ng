import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-icon-only-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [icon]="'pencil'" [size]="'small'" aria-label="Edit"></button>
      <button
        txButton
        [icon]="'trash'"
        [size]="'small'"
        [severity]="'danger'"
        aria-label="Delete"
      ></button>
      <button txButton [icon]="'refresh'" [severity]="'secondary'" aria-label="Refresh"></button>
      <button txButton [icon]="'filter'" [outlined]="true" aria-label="Filters"></button>
      <button
        txButton
        [icon]="'times'"
        [text]="true"
        [rounded]="true"
        [severity]="'secondary'"
        aria-label="Close"
      ></button>
      <button txButton [icon]="'plus'" [rounded]="true" [size]="'large'" aria-label="Add"></button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonIconOnlyExample {}
