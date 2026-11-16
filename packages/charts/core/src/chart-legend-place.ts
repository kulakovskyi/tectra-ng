import { DestroyRef, ElementRef, Signal, afterNextRender, computed, inject, signal } from '@angular/core';
import { TxChartLegendPosition } from './chart.types';

/** Width of a chart below which a legend on the left or right moves under the plot, in px. */
export const TX_CHART_NARROW_WIDTH = 420;

/**
 * Where a legend goes for the chart width: a `left` or `right` legend moves to the `bottom` when the
 * chart is narrower than `narrowWidth`; an unknown width keeps the asked position.
 */
export function chartLegendPlace(position: TxChartLegendPosition, width: number | null, narrowWidth = TX_CHART_NARROW_WIDTH): TxChartLegendPosition {
  return (position === 'left' || position === 'right') && width !== null && width < narrowWidth ? 'bottom' : position;
}

/**
 * Width of the host element of the current component, measured in the browser after the first render
 * and on every resize; `null` on the server and before the first measure.
 */
export function injectHostWidth(): Signal<number | null> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const destroyRef = inject(DestroyRef);
  const width = signal<number | null>(null);
  afterNextRender(() => {
    const measure = () => {
      const next = Math.round(host.getBoundingClientRect().width);
      if (next > 0 && next !== width()) {
        width.set(next);
      }
    };
    measure();
    const view = host.ownerDocument.defaultView;
    if (view && 'ResizeObserver' in view) {
      const observer = new view.ResizeObserver(() => measure());
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    }
  });
  return width.asReadonly();
}

/**
 * Legend position of the chart in the current injection context that follows its width: a side legend
 * moves under the plot on a narrow chart (see `chartLegendPlace`).
 */
export function injectLegendPlace(position: () => TxChartLegendPosition): Signal<TxChartLegendPosition> {
  const width = injectHostWidth();
  return computed(() => chartLegendPlace(position(), width()));
}
