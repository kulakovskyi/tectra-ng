import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-live-example',
  imports: [TxProgressBar, TxButton],
  template: `
    <div class="list">
      <tx-progress-bar
        [value]="progress()"
        [showValue]="true"
        [severity]="progress() === 100 ? 'success' : 'primary'"
        ariaLabel="Upload"
      />
      <button txButton size="small" icon="upload" [disabled]="running()" (click)="start()">
        Upload
      </button>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      justify-items: start;
      gap: 12px;
      max-width: 420px;
    }

    tx-progress-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarLiveExample {
  readonly progress = signal(0);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(): void {
    this.progress.set(0);
    this.running.set(true);
    this.timer = setInterval(() => {
      this.progress.update((value) => Math.min(100, value + 12));
      if (this.progress() === 100) {
        this.stop();
      }
    }, 300);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.running.set(false);
  }
}
