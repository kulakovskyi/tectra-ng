import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxField } from '@tectra/ui/field';
import { TxInput } from '@tectra/ui/input';
import { TxPopover, TxPopoverFooter, TxPopoverTrigger } from '@tectra/ui/popover';

@Component({
  selector: 'popover-form-example',
  imports: [TxPopover, TxPopoverTrigger, TxPopoverFooter, TxButton, TxField, TxInput, FormsModule],
  template: `
    <div class="row">
      <span
        >Budget: <strong>{{ budget() }} USD</strong></span
      >
      <button txButton size="small" severity="secondary" [text]="true" [txPopoverTrigger]="edit">
        Change
      </button>
    </div>
    <tx-popover #edit header="Monthly budget" (opened)="draft = budget()">
      <tx-field label="Amount, USD" hint="Applies from the next month.">
        <input txInput type="number" min="0" [(ngModel)]="draft" />
      </tx-field>
      <div txPopoverFooter>
        <button txButton size="small" severity="secondary" [text]="true" (click)="edit.hide()">
          Cancel
        </button>
        <button txButton size="small" (click)="budget.set(draft); edit.hide()">Save</button>
      </div>
    </tx-popover>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverFormExample {
  readonly budget = signal(1200);
  draft = 1200;
}
