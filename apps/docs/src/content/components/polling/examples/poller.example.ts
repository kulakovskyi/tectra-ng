import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxPoller } from '@tectra-ng/utils/polling';
import { defer, delay, of, throwError } from 'rxjs';

interface Deploy {
  state: 'building' | 'live';
  step: number;
}

@Component({
  selector: 'polling-poller-example',
  imports: [TxButton, TxMessage, TxTag],
  template: `
    <div class="stack">
      <div class="flex">
        <button txButton label="Deploy" [disabled]="poller.isPolling()" (click)="deploy()"></button>
        <button
          txButton
          label="Restart"
          severity="secondary"
          [disabled]="!poller.error()"
          (click)="poller.restart()"
        ></button>
        <button
          txButton
          label="Stop"
          severity="secondary"
          [disabled]="!poller.isPolling()"
          (click)="poller.stop()"
        ></button>
      </div>
      <div class="flex">
        <tx-tag
          [value]="poller.isLoading() ? 'Loading' : poller.isPolling() ? 'Polling' : 'Idle'"
          [severity]="poller.isPolling() ? 'info' : 'secondary'"
        />
        @if (state(); as current) {
          <tx-tag
            [value]="current.state + ' · step ' + current.step"
            [severity]="current.state === 'live' ? 'success' : 'warn'"
          />
        }
      </div>
      @if (poller.error(); as error) {
        <tx-message severity="danger" [text]="error.status + ': ' + error.message" />
      }
    </div>
  `,
  styles: `
    .stack {
      max-width: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PollingPollerExample {
  private readonly destroyRef = inject(DestroyRef);
  private checks = 0;

  readonly state = signal<Deploy | null>(null);
  readonly poller = new TxPoller<string, Deploy>({
    request: ({ attempt }) =>
      defer(() => {
        this.checks++;
        if (this.checks === 3) {
          return throwError(
            () => new HttpErrorResponse({ status: 502, error: { error: 'Build agent went away' } }),
          );
        }
        return of<Deploy>({ state: attempt >= 4 ? 'live' : 'building', step: attempt + 1 }).pipe(
          delay(400),
        );
      }),
    isActive: (deploy) => deploy.state === 'building',
    delay: 700,
    retry: false,
  });

  deploy(): void {
    this.checks = 0;
    this.state.set(null);
    this.poller
      .watch('main')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((deploy) => this.state.set(deploy));
  }
}
