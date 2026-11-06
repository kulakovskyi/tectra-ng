import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCountdown } from '@tectra-ng/ui/countdown';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';

@Component({
  selector: 'countdown-ending-soon-example',
  imports: [TxCountdown, TxButton, TxProgressBar],
  template: `
    <div class="card">
      @switch (state()) {
        @case ('waiting') {
          <div class="row">
            <span>
              <strong>Auto-apply</strong><br />
              <span class="hint">The payment is marked as paid when the time is up.</span>
            </span>
            <tx-countdown
              class="timer"
              suffix="s"
              [value]="20"
              [endingSoon]="5000"
              (tick)="left.set($event)"
              (completed)="state.set('applied')"
            />
          </div>
          <tx-progress-bar
            ariaLabel="Time left"
            [value]="left() / 200"
            [severity]="left() <= 5000 ? 'danger' : 'primary'"
          />
          <div class="actions">
            <button
              txButton
              label="Cancel"
              severity="secondary"
              (click)="state.set('cancelled')"
            ></button>
            <button txButton label="Apply now" icon="bolt" (click)="state.set('applied')"></button>
          </div>
        }
        @default {
          <div class="row">
            <span>{{ state() === 'applied' ? 'Applied.' : 'Cancelled.' }}</span>
            <button
              txButton
              label="Try again"
              variant="outlined"
              size="small"
              (click)="reset()"
            ></button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .card {
      display: grid;
      gap: 12px;
      max-width: 420px;
      font-size: 14px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .hint {
      color: var(--tx-text-muted);
      font-size: 13px;
    }
    .timer {
      font-size: 22px;
      font-weight: 600;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownEndingSoonExample {
  readonly state = signal<'waiting' | 'applied' | 'cancelled'>('waiting');
  readonly left = signal(20000);

  reset(): void {
    this.left.set(20000);
    this.state.set('waiting');
  }
}
