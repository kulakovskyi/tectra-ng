import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'radar-chart-live-example',
  imports: [TxRadarChart, TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
        <tx-toggle-switch label="Circle" [(ngModel)]="circle" />
        <tx-toggle-switch label="Fill" [(ngModel)]="fill" />
      </div>
      <tx-radar-chart
        [series]="series()"
        [categories]="axes"
        [shape]="circle() ? 'circle' : 'polygon'"
        [fill]="fill()"
        [height]="320"
        ariaLabel="Shuffled profile"
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
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartLiveExample {
  readonly axes = ['Strength', 'Speed', 'Agility', 'Stamina', 'Focus', 'Balance'];
  readonly circle = signal(false);
  readonly fill = signal(true);
  private readonly step = signal(0);

  readonly series = computed<TxChartSeries[]>(() => {
    const step = this.step();
    const profile = (offset: number) =>
      this.axes.map((_, index) => 30 + ((index * 23 + step * 37 + offset) % 70));
    return [
      { name: 'Before', data: profile(0) },
      { name: 'After', data: profile(19) },
    ];
  });

  shuffle(): void {
    this.step.update((step) => step + 1);
  }
}
