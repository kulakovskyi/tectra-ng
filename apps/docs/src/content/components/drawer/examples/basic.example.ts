import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxCheckbox } from '@tectra/ui/checkbox';
import { TxDialogClose } from '@tectra/ui/dialog';
import { TxDrawer, TxDrawerFooter } from '@tectra/ui/drawer';

@Component({
  selector: 'drawer-basic-example',
  imports: [TxDrawer, TxDrawerFooter, TxDialogClose, TxButton, TxCheckbox, FormsModule],
  template: `
    <div class="row">
      <button
        txButton
        icon="filter"
        severity="secondary"
        [outlined]="true"
        (click)="visible.set(true)"
      >
        Filters
      </button>
      <span class="summary">{{ summary() }}</span>
    </div>
    <tx-drawer header="Filters" [(visible)]="visible">
      <fieldset class="group">
        <legend>Status</legend>
        @for (status of statuses; track status) {
          <tx-checkbox [label]="status" [binary]="true" [(ngModel)]="checked[status]" />
        }
      </fieldset>
      <div txDrawerFooter>
        <button txButton severity="secondary" [text]="true" (click)="reset()">Reset</button>
        <button txButton txDialogClose (click)="apply()">Apply</button>
      </div>
    </tx-drawer>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .summary {
      color: var(--tx-text-muted);
    }
    .group {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group legend {
      margin-bottom: 8px;
      font-weight: var(--tx-font-weight-semibold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerBasicExample {
  readonly visible = signal(false);
  readonly statuses = ['Draft', 'In review', 'Published', 'Archived'];
  checked: Record<string, boolean> = { Published: true };
  readonly summary = signal('Published');

  reset(): void {
    this.checked = {};
  }

  apply(): void {
    const chosen = this.statuses.filter((status) => this.checked[status]);
    this.summary.set(chosen.length ? chosen.join(', ') : 'All statuses');
  }
}
