import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'paginator-states-example',
  imports: [TxPaginator, TxToggleSwitch, FormsModule],
  template: `
    <tx-toggle-switch label="Disabled" [(ngModel)]="disabled" />
    <tx-paginator
      [disabled]="disabled()"
      [rows]="10"
      [totalRecords]="120"
      [rowsPerPageOptions]="[10, 20]"
    />
    <tx-paginator [alwaysShow]="false" [rows]="10" [totalRecords]="8" />
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorStatesExample {
  readonly disabled = signal(true);
}
