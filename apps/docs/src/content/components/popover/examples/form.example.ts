import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxAmount } from '@tectra-ng/ui/amount';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxPopover, TxPopoverFooter, TxPopoverTrigger } from '@tectra-ng/ui/popover';

@Component({
  selector: 'popover-form-example',
  imports: [
    TxPopover,
    TxPopoverTrigger,
    TxPopoverFooter,
    TxButton,
    TxField,
    TxInputNumber,
    TxAmount,
    FormsModule,
  ],
  template: `
    <div class="row">
      <span>Budget: <tx-amount [amount]="budget()" currency="USD" [strong]="true" /></span>
      <button txButton size="small" severity="secondary" [text]="true" [txPopoverTrigger]="edit">
        Change
      </button>
    </div>
    <tx-popover #edit header="Monthly budget" (opened)="draft = budget()">
      <tx-field label="Amount" hint="Applies from the next month.">
        <tx-input-number mode="currency" currency="USD" [min]="0" [(ngModel)]="draft" />
      </tx-field>
      <div txPopoverFooter>
        <button txButton size="small" severity="secondary" [text]="true" (click)="edit.hide()">
          Cancel
        </button>
        <button txButton size="small" (click)="budget.set(draft ?? 0); edit.hide()">Save</button>
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
  draft: number | null = 1200;
}
