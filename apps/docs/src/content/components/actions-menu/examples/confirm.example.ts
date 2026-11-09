import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxActionsMenu, TxActionsMenuItem } from '@tectra-ng/blocks/actions-menu';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxConfirmService } from '@tectra-ng/ui/confirm';
import { TxToastService } from '@tectra-ng/ui/toast';

interface Job {
  id: string;
  name: string;
  schedule: string;
  paused: boolean;
}

@Component({
  selector: 'actions-menu-confirm-example',
  imports: [TxActionsMenu, TxTable, TxTableCell],
  template: `
    <tx-table ariaLabel="Scheduled jobs" dataKey="id" [value]="jobs()" [columns]="columns">
      <ng-template txTableCell="schedule" let-job>
        {{ job.paused ? 'Paused' : job.schedule }}
      </ng-template>
      <ng-template txTableCell="menu" let-job>
        <tx-actions-menu
          size="small"
          [tooltip]="job.name + ' actions'"
          [items]="actionsFor(job)"
          (itemSelect)="run(job, $event)"
        />
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionsMenuConfirmExample {
  private readonly confirm = inject(TxConfirmService);
  private readonly toast = inject(TxToastService);

  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Job' },
    { field: 'schedule', header: 'Schedule' },
    { field: 'menu', header: 'Actions', align: 'end', width: '90px' },
  ];
  readonly jobs = signal<Job[]>([
    { id: 'j1', name: 'Nightly backup', schedule: 'Every day at 02:00', paused: false },
    { id: 'j2', name: 'Usage report', schedule: 'Mondays at 09:00', paused: false },
    { id: 'j3', name: 'Cache warm-up', schedule: 'Every 15 minutes', paused: true },
  ]);

  actionsFor(job: Job): TxActionsMenuItem[] {
    return [
      job.paused
        ? { id: 'resume', label: 'Resume', icon: 'play' }
        : { id: 'pause', label: 'Pause', icon: 'pause' },
      { id: 'delete', label: 'Delete job', icon: 'trash', danger: true },
    ];
  }

  async run(job: Job, action: string): Promise<void> {
    if (action === 'delete') {
      const ok = await this.confirm.dialog({
        title: `Delete “${job.name}”?`,
        message: 'The job stops and its run history is removed.',
        severity: 'danger',
      });
      if (ok) {
        this.jobs.update((jobs) => jobs.filter((other) => other.id !== job.id));
        this.toast.success(`“${job.name}” deleted`);
      }
      return;
    }
    this.jobs.update((jobs) =>
      jobs.map((other) => (other.id === job.id ? { ...other, paused: action === 'pause' } : other)),
    );
  }
}
