import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxFilterMatchMode, TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { filterBy } from '@tectra-ng/utils/filter';

const ORDERS = [
  { id: 'SO-1', total: 120 },
  { id: 'SO-2', total: 480 },
  { id: 'SO-3', total: 75 },
  { id: 'SO-4', total: 960 },
];

@Component({
  selector: 'filter-match-modes-example',
  imports: [FormsModule, TxInputNumber, TxSelect, TxTable],
  template: `
    <div class="layout">
      <div class="toolbar">
        <tx-select ariaLabel="Match mode" [options]="modes" [(ngModel)]="mode" />
        <tx-input-number ariaLabel="Total" [(ngModel)]="value" />
      </div>
      <tx-table ariaLabel="Orders" dataKey="id" [value]="orders()" [columns]="columns" />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .toolbar {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 200px));
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FilterMatchModesExample {
  readonly modes: TxFilterMatchMode[] = ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'];
  readonly mode = signal<TxFilterMatchMode>('gt');
  readonly value = signal<number | null>(100);
  readonly orders = computed(() => filterBy(ORDERS, this.value(), ['total'], this.mode()));
  readonly columns: TxTableColumn[] = [
    { field: 'id', header: 'Order' },
    { field: 'total', header: 'Total', align: 'end' },
  ];
}
