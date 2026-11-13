import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { injectTokens, TxPassThroughPart } from '@tectra-ng/core/config';
import { TxBandScale, TxChartPlot, TxChartRect } from './chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CORE_ICON_DEFAULTS } from './core.icons';
import { CORE_THEME } from './core.theme';

/** Last shown band of `tx-chart-hover-band` and whether it slides from the previous one. */
interface TxBandState {
  /** Band rectangle kept while the band fades out. */
  rect: TxChartRect | null;
  /** `true` when the band moves from an earlier position instead of fading in. */
  slide: boolean;
}

/** Rectangle of the hover band behind the category at `index`; `inset` is the gap at its sides in px. */
export function chartBandRect(band: TxBandScale, index: number, plot: TxChartPlot, horizontal = false, inset = 2): TxChartRect {
  const gap = Math.min(inset, band.step * 0.08);
  const start = band.start(index) - (band.step - band.bandwidth) / 2 + gap;
  const size = Math.max(1, band.step - gap * 2);
  return horizontal ? { x: plot.left, y: start, width: plot.width, height: size } : { x: start, y: plot.top, width: size, height: plot.height };
}

/**
 * The soft band under the hovered category of a bar-like chart; it fades in and slides between
 * categories.
 */
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
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartHoverBand {
  private readonly coreTheme = injectTokens(CORE_THEME);

  readonly rect = input<TxChartRect | null>(null, { alias: 'tx-chart-hover-band' });
  readonly part = input<TxPassThroughPart | undefined>(undefined);

  readonly state = linkedSignal<TxChartRect | null, TxBandState>({
    source: this.rect,
    computation: (next, previous) => ({ rect: next ?? previous?.value.rect ?? null, slide: !!next && !!previous?.source }),
  });
}
