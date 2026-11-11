import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'radial-bar-live-example',
  imports: [TxRadialBar, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Next day" variant="outlined" (click)="next()"></button>
      </div>
      <tx-radial-bar
        [items]="items()"
        totalLabel="Average"
        [height]="280"
        ariaLabel="Daily goals"
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
export default class RadialBarLiveExample {
  private day = 0;
  readonly items = signal<TxRadialBarItem[]>(this.build(0));

  next(): void {
    this.day += 1;
    this.items.set(this.build(this.day));
  }

  private build(day: number): TxRadialBarItem[] {
    const value = (offset: number) => 15 + ((day * 37 + offset) % 86);
    return [
      { label: 'Move', value: value(0) },
      { label: 'Exercise', value: value(29) },
      { label: 'Stand', value: value(61) },
    ];
  }
}
