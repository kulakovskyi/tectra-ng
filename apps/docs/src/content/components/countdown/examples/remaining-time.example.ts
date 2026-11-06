import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxRemainingTimePipe } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-remaining-time-example',
  imports: [TxRemainingTimePipe],
  template: `
    <ul class="list">
      @for (job of jobs; track job.name) {
        <li>
          <span>{{ job.name }}</span>
          <code>{{ left(job.at) | txRemainingTime }}</code>
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: grid;
      gap: 6px;
      max-width: 320px;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 14px;
    }
    li {
      display: flex;
      justify-content: space-between;
    }
    code {
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownRemainingTimeExample {
  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), 1000);
  private readonly stop = inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  readonly jobs = [
    { name: 'Backup', at: Date.now() + 42000 },
    { name: 'Report', at: Date.now() + 25 * 60000 },
    { name: 'Rotation', at: Date.now() + 2 * 3600000 + 5 * 60000 },
  ];

  left(at: number): number {
    return at - this.now();
  }
}
