import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TX_ORG_CHART_COMPACT_WIDTH, TX_ORG_CHART_MINIMAP, TX_ORG_CHART_MINIMAP_COMPACT } from './org-chart-view';
import { TxOrgChartMinimapLayout, TxOrgChartPoint, TxOrgChartRect, TxOrgChartSize, TxOrgChartView } from './org-chart.types';

@Component({
  selector: 'tx-org-chart-minimap',
  template: `
    @if (scale()) {
      <div
        class="tx-org-chart__map"
        [style.width.px]="mapWidth()"
        [style.height.px]="mapHeight()"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
      >
        @for (item of layout().items; track $index) {
          <span
            class="tx-org-chart__map-item"
            [attr.data-tone]="item.tone"
            [style.left.px]="item.x * scale()"
            [style.top.px]="item.y * scale() + offsetY()"
            [style.width.px]="item.width * scale()"
            [style.height.px]="item.height * scale()"
          ></span>
        }
        @let rect = viewportRect();
        @if (rect.width >= 4 && rect.height >= 4) {
          <span
            class="tx-org-chart__map-viewport"
            [style.left.px]="rect.x"
            [style.top.px]="rect.y"
            [style.width.px]="rect.width"
            [style.height.px]="rect.height"
          ></span>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart-minimap',
    'data-drag-ignore': '',
    'aria-hidden': 'true',
  },
})
export class TxOrgChartMinimap {
  readonly layout = input.required<TxOrgChartMinimapLayout>();
  readonly viewport = input.required<TxOrgChartSize>();
  readonly view = input.required<TxOrgChartView>();

  readonly navigate = output<TxOrgChartPoint>();

  private pointerId: number | null = null;

  readonly box = computed(() => (this.viewport().width && this.viewport().width < TX_ORG_CHART_COMPACT_WIDTH ? TX_ORG_CHART_MINIMAP_COMPACT : TX_ORG_CHART_MINIMAP));
  readonly scale = computed(() => {
    const layout = this.layout();
    if (!layout.width || !layout.height) return 0;
    return Math.min(this.box().width / layout.width, this.box().height / layout.height);
  });
  readonly mapWidth = computed(() => this.layout().width * this.scale());
  readonly mapHeight = computed(() => Math.max(this.box().minHeight, this.layout().height * this.scale()));
  readonly offsetY = computed(() => (this.mapHeight() - this.layout().height * this.scale()) / 2);
  readonly viewportRect = computed<TxOrgChartRect>(() => {
    const scale = this.scale();
    const { x, y, zoom } = this.view();
    const viewport = this.viewport();
    const left = (-x / zoom) * scale;
    const top = (-y / zoom) * scale + this.offsetY();
    const right = left + (viewport.width / zoom) * scale;
    const bottom = top + (viewport.height / zoom) * scale;
    const clampX = (value: number) => Math.min(this.mapWidth(), Math.max(0, value));
    const clampY = (value: number) => Math.min(this.mapHeight(), Math.max(0, value));
    return { x: clampX(left), y: clampY(top), width: Math.max(0, clampX(right) - clampX(left)), height: Math.max(0, clampY(bottom) - clampY(top)) };
  });

  onPointerDown(event: PointerEvent): void {
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.emitPoint(event);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerId === event.pointerId) this.emitPoint(event);
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.pointerId = null;
  }

  private emitPoint(event: PointerEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scale = this.scale();
    this.navigate.emit({ x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top - this.offsetY()) / scale });
  }
}
