import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTable, TxTableColumn, TxTableEmpty } from '@tectra-ng/ui/table';

interface Worker {
  id: number;
  name: string;
  region: string;
  schedule: string;
}

const REGIONS = ['Europe', 'North America', 'Asia'];
const SCHEDULES = ['Every hour', 'Every day', 'Every 15 minutes'];

@Component({
  selector: 'empty-state-basic-example',
  imports: [TxEmptyState, TxButton, TxTable, TxTableEmpty],
  template: `
    <div class="column">
      <tx-table ariaLabel="Workers" dataKey="id" [value]="workers()" [columns]="columns">
        <ng-template txTableEmpty>
          <tx-empty-state
            icon="bolt"
            title="No workers yet"
            text="Create the first worker to start."
          >
            <button txButton icon="plus" (click)="add()">Create worker</button>
          </tx-empty-state>
        </ng-template>
      </tx-table>
      @if (workers().length) {
        <div class="row">
          <button txButton icon="plus" size="small" (click)="add()">Add worker</button>
          <button txButton severity="secondary" outlined size="small" (click)="workers.set([])">
            Remove all
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .row {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateBasicExample {
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Worker' },
    { field: 'region', header: 'Region' },
    { field: 'schedule', header: 'Schedule' },
  ];
  readonly workers = signal<Worker[]>([]);

  add(): void {
    this.workers.update((workers) => {
      const id = workers.length + 1;
      return [
        ...workers,
        {
          id,
          name: `Worker ${id}`,
          region: REGIONS[id % REGIONS.length],
          schedule: SCHEDULES[id % SCHEDULES.length],
        },
      ];
    });
  }
}
