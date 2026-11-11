import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { TxPassThroughPart } from '@tectra-ng/core/config';
import { TxBandScale, TxChartPlot, TxChartRect } from './chart.types';

interface TxBandState {
  rect: TxChartRect | null;
  slide: boolean;
}

export function chartBandRect(band: TxBandScale, index: number, plot: TxChartPlot, horizontal = false, inset = 2): TxChartRect {
  const gap = Math.min(inset, band.step * 0.08);
  const start = band.start(index) - (band.step - band.bandwidth) / 2 + gap;
  const size = Math.max(1, band.step - gap * 2);
  return horizontal ? { x: plot.left, y: start, width: plot.width, height: size } : { x: start, y: plot.top, width: size, height: plot.height };
}

@Component({
  selector: 'g[tx-chart-hover-band]',
  template: `
    @if (state().rect; as box) {
      <svg:rect
        class="tx-chart-hover-band"
        [class.tx-chart-hover-band--on]="!!rect()"
        [class.tx-chart-hover-band--slide]="state().slide"
        [class]="part()?.class"
        [style]="part()?.style"
        [attr.x]="box.x"
        [attr.y]="box.y"
        [attr.width]="box.width"
        [attr.height]="box.height"
      />
    }
  `,
  styleUrl: './chart-hover-band.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-chart-hover-band-layer', 'aria-hidden': 'true' },
})
export class TxChartHoverBand {
  readonly rect = input<TxChartRect | null>(null, { alias: 'tx-chart-hover-band' });
  readonly part = input<TxPassThroughPart | undefined>(undefined);

  readonly state = linkedSignal<TxChartRect | null, TxBandState>({
    source: this.rect,
    computation: (next, previous) => ({ rect: next ?? previous?.value.rect ?? null, slide: !!next && !!previous?.source }),
  });
}
