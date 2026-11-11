import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBulletChart, TxBulletItem } from '@tectra-ng/charts/bullet';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'bullet-chart-live-example',
  imports: [TxBulletChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-bullet-chart
        [items]="items()"
        [ranges]="[50, 80]"
        [max]="100"
        ariaLabel="Shuffled data"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BulletChartLiveExample {
  private step = 0;
  readonly items = signal<TxBulletItem[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.items.set(this.build(this.step));
  }

  private build(step: number): TxBulletItem[] {
    const value = (offset: number) => 20 + ((step * 37 + offset) % 75);
    return [
      { label: 'North', value: value(0), target: 70 },
      { label: 'South', value: value(23), target: 60 },
      { label: 'East', value: value(51), target: 80 },
    ];
  }
}
