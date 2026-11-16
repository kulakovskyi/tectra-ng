import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-basic-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="stack">
      <tx-button-group aria-label="Document actions">
        <button txButton [icon]="'check'" (click)="last.set('Saved')">Save</button>
        <button txButton [icon]="'trash'" (click)="last.set('Deleted')">Delete</button>
        <button txButton [icon]="'times'" (click)="last.set('Cancelled')">Cancel</button>
      </tx-button-group>
      <span class="status" aria-live="polite">Last action: {{ last() }}</span>
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .status {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupBasicExample {
  readonly last = signal('none');
}
