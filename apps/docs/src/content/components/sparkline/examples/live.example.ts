import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSparkline } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-live-example',
  imports: [TxSparkline, TxButton],
  template: `
    <div class="wrap">
      <tx-sparkline tone="info" [values]="load()" />
      <p class="latest">Latest: {{ load()[load().length - 1] }}% CPU</p>
      <button txButton label="Add a reading" variant="outlined" (click)="add()"></button>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      justify-items: start;
      width: 100%;
      max-width: 320px;
    }
    tx-sparkline {
      justify-self: stretch;
    }
    .latest {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineLiveExample {
  private readonly readings = [34, 41, 38, 52, 47, 63, 58, 44, 39, 55, 61, 49, 42, 57];
  private next = 0;
  readonly load = signal([22, 28, 25, 31, 36, 30, 34, 41]);

  add(): void {
    const reading = this.readings[this.next % this.readings.length];
    this.next += 1;
    this.load.update((values) => [...values.slice(-11), reading]);
  }
}
