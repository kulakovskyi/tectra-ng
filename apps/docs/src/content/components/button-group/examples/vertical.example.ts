import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-vertical-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="row">
      <tx-button-group orientation="vertical" aria-label="Move the layer">
        <button txButton [icon]="'arrow-up'" (click)="move('Moved up')">Move up</button>
        <button txButton [icon]="'arrow-down'" (click)="move('Moved down')">Move down</button>
        <button txButton [icon]="'trash'" [severity]="'danger'" (click)="move('Removed')">
          Remove
        </button>
      </tx-button-group>
      <tx-button-group orientation="vertical" aria-label="Zoom">
        <button
          txButton
          [outlined]="true"
          [severity]="'secondary'"
          [icon]="'plus'"
          aria-label="Zoom in"
          (click)="move('Zoomed in')"
        ></button>
        <button
          txButton
          [outlined]="true"
          [severity]="'secondary'"
          [icon]="'minus'"
          aria-label="Zoom out"
          (click)="move('Zoomed out')"
        ></button>
      </tx-button-group>
      <span class="status" aria-live="polite">{{ last() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: flex-start;
      gap: 24px;
    }
    .status {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupVerticalExample {
  readonly last = signal('');

  move(action: string): void {
    this.last.set(action);
  }
}
