import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTimeline, TxTimelineContent } from '@tectra-ng/ui/timeline';
import { retryHttpReads } from '@tectra-ng/utils/http';
import { defer, of, throwError } from 'rxjs';

interface Attempt {
  status: string;
  time: string;
}

@Component({
  selector: 'http-retry-example',
  imports: [TxButton, TxTimeline, TxTimelineContent],
  template: `
    <div class="layout">
      <div class="flex">
        <button txButton label="Load (503, 503, 200)" (click)="load([503, 503, 200])"></button>
        <button txButton label="Load (404)" severity="secondary" (click)="load([404])"></button>
      </div>
      <tx-timeline [value]="attempts()">
        <ng-template txTimelineContent let-item>{{ item.status }} · {{ item.time }}</ng-template>
      </tx-timeline>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HttpRetryExample {
  private readonly destroyRef = inject(DestroyRef);

  readonly attempts = signal<Attempt[]>([]);

  load(answers: number[]): void {
    const started = Date.now();
    let call = 0;
    this.attempts.set([]);
    const note = (status: string) =>
      this.attempts.update((items) => [
        ...items,
        { status, time: `+${((Date.now() - started) / 1000).toFixed(1)} s` },
      ]);
    defer(() => {
      const status = answers[Math.min(call++, answers.length - 1)];
      note(`Attempt ${call}: ${status}`);
      return status >= 400
        ? throwError(() => new HttpErrorResponse({ status, url: '/api/report' }))
        : of('done');
    })
      .pipe(retryHttpReads({ baseDelayMs: 400 }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => note('Loaded'),
        error: (error: HttpErrorResponse) => note(`Failed with ${error.status}`),
      });
  }
}
