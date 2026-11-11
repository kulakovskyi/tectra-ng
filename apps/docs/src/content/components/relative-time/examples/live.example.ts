import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxRelativeTimePipe } from '@tectra-ng/utils/relative-time';

@Component({
  selector: 'relative-time-live-example',
  imports: [TxButton, TxRelativeTimePipe],
  template: `
    <div class="stack start">
      <button txButton label="Post a message" (click)="posted.set(now())"></button>
      <span class="hint">
        @if (posted(); as at) {
          Posted {{ at | txRelativeTime: { now: now(), numeric: 'always' } }}
        } @else {
          Nothing posted yet.
        }
      </span>
    </div>
  `,
  styles: `
    .start {
      align-items: flex-start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RelativeTimeLiveExample {
  readonly now = signal(Date.now());
  readonly posted = signal<number | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
