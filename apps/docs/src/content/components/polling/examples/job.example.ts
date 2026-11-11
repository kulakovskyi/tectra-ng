import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TxButton } from '@tectra-ng/ui/button';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';
import { poll } from '@tectra-ng/utils/polling';
import { defer, delay, of } from 'rxjs';

interface ExportJob {
  status: 'running' | 'done';
  progress: number;
}

@Component({
  selector: 'polling-job-example',
  imports: [TxButton, TxProgressBar],
  template: `
    <div class="stack">
      <div>
        <button
          txButton
          label="Export 12 000 rows"
          [loading]="running()"
          (click)="start()"
        ></button>
      </div>
      <tx-progress-bar [value]="job()?.progress ?? 0" />
      <span class="hint">{{ status() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PollingJobExample {
  private readonly destroyRef = inject(DestroyRef);

  readonly job = signal<ExportJob | null>(null);
  readonly running = signal(false);
  readonly status = signal('Not started.');

  start(): void {
    let progress = 0;
    let requests = 0;
    this.running.set(true);
    poll<ExportJob>({
      request: () =>
        defer(() => {
          requests++;
          progress = Math.min(100, progress + 15 + Math.round(Math.random() * 20));
          return of<ExportJob>({ status: progress >= 100 ? 'done' : 'running', progress }).pipe(
            delay(150),
          );
        }),
      isActive: (job) => job.status === 'running',
      delay: { startMs: 500, factor: 1.3, maxMs: 1500 },
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (job) => {
          this.job.set(job);
          this.status.set(`${job.progress}% · request ${requests}`);
        },
        complete: () => {
          this.running.set(false);
          this.status.set(`Done after ${requests} requests.`);
        },
      });
  }
}
