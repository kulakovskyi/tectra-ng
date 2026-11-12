import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxAnnouncer, uniqueId } from '@tectra-ng/core/a11y';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlay, TxOverlayRef, TxPlacement, parsePlacement, txArrowOffset } from '@tectra-ng/core/overlay';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { TxChartLegend } from './chart-legend.component';
import {
  TxChartHeight,
  TxChartLegendAlign,
  TxChartLegendContext,
  TxChartLegendItem,
  TxChartLegendPosition,
  TxChartLegendVariant,
  TxChartPart,
  TxChartPointerEvent,
  TxChartSize,
  TxChartTable,
  TxChartTooltipData,
  TxChartTooltipTemplateContext,
  TxChartPanEvent,
  TxChartZoomEvent,
} from './chart.types';
import { chartBoxHeight } from './chart-size';
import { TxChartExportFormat, chartCsv, chartFileName, chartPngBlob, chartSvgString, downloadChartFile } from './chart-export';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxChartMenu, TxChartMenuItem } from './chart-menu.component';
import { CORE_ICON_DEFAULTS } from './core.icons';

const TOOLTIP_OFFSET = 10;
const ARROW_ROOM = 16;
const NAVIGATION_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'];
const ACTION_KEYS = ['Enter', ' ', 'Backspace'];
const ZOOM_KEYS = ['+', '=', '-', '_', '0'];
const WHEEL_ZOOM = 0.0025;
const FOLLOW_PLACEMENT: TxPlacement = 'right';
const FOLLOW_OFFSET = 14;

@Component({
  selector: 'tx-chart-frame',
  imports: [NgTemplateOutlet, TxChartLegend, TxIcon, TxSkeleton, TxButton, TxPopover, TxPopoverTrigger, TxChartMenu],
  templateUrl: './chart-frame.component.html',
  styleUrl: './chart-frame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-chart-frame',
    '[attr.data-legend]': 'legendVisible() ? legendPosition() : null',
    '[attr.data-toolbar]': 'toolbarRow()',
    '[attr.data-styled]': 'styled() || null',
    '[class.tx-chart-frame--fill]': 'fills()',
    '[class.tx-chart-frame--interactive]': 'interactive()',
    '[style.height]': 'cssHeight()',
  },
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartFrame {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private injector = inject(Injector);
  private announcer = inject(TxAnnouncer);
  readonly translations = injectTranslations();

  readonly height = input<TxChartHeight>(350);
  readonly size = model<TxChartSize>({ width: 640, height: 320 });
  readonly legendItems = input<readonly TxChartLegendItem[]>([]);
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendPosition = input<TxChartLegendPosition>('top');
  readonly legendAlign = input<TxChartLegendAlign>('start');
  readonly legendVariant = input<TxChartLegendVariant>('dot');
  readonly legendToggle = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly legendTemplate = input<TemplateRef<TxChartLegendContext> | null | undefined>(null);
  readonly empty = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyIcon = input<TxIconName>('chart-line');
  readonly summary = input('');
  readonly table = input<TxChartTable | null>(null);
  readonly tooltip = input<TxChartTooltipData | null>(null);
  readonly tooltipTemplate = input<TemplateRef<TxChartTooltipTemplateContext> | null | undefined>(null);
  readonly tooltipPlacement = input<TxPlacement>('top');
  readonly panelStyle = input<Record<string, string>>({});
  readonly parts = input<TxResolvedPassThrough<TxChartPart>>({});
  readonly styled = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly interactive = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly actionKeys = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly zoomable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly zoomedIn = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly plotHeight = input<number | null>(null);
  readonly toolbar = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly exportName = input('');

  readonly pointer = output<TxChartPointerEvent>();
  readonly navigate = output<KeyboardEvent>();
  readonly legendToggled = output<string>();
  readonly legendHovered = output<string | null>();
  readonly tooltipClosed = output<void>();
  readonly zoomed = output<TxChartZoomEvent>();
  readonly panned = output<TxChartPanEvent>();
  readonly zoomReset = output<void>();

  protected readonly plotRef = viewChild<ElementRef<HTMLElement>>('plot');
  protected readonly anchorRef = viewChild<ElementRef<HTMLElement>>('anchor');
  protected readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('chartSvg');
  protected readonly tooltipPanel = viewChild<TemplateRef<unknown>>('tooltipPanel');

  readonly hintId = uniqueId('tx-chart-hint');
  readonly shown = signal<TxChartTooltipData | null>(null);
  readonly following = signal(false);
  private cursor: { x: number; y: number } | null = null;
  private readonly touches = new Map<number, { x: number; y: number }>();
  readonly measured = signal(false);
  private ref: TxOverlayRef | null = null;
  private openPlacement: TxPlacement | null = null;
  readonly activeRef = signal<TxOverlayRef | null>(null);
  readonly side = computed(() => parsePlacement(this.activeRef()?.placement() ?? this.openPlacement ?? this.tooltipPlacement()).side);
  readonly arrowOffset = computed(() => txArrowOffset(this.activeRef()?.placement() ?? 'top', { width: ARROW_ROOM * 2, height: ARROW_ROOM * 2 }));

  readonly fills = computed(() => typeof this.height() === 'string');
  readonly cssHeight = computed(() => {
    const height = this.height();
    return typeof height === 'number' ? `${height}px` : height;
  });
  readonly legendVisible = computed(() => this.showLegend() && !this.empty() && !this.loading() && this.legendItems().length > 0);
  readonly viewBox = computed(() => `0 0 ${this.size().width} ${this.size().height}`);
  readonly placeholderHeight = computed(() => chartBoxHeight(this.height(), this.legendVisible() ? this.legendPosition() : null, this.toolbar()));
  readonly toolbarRow = computed(() => (!this.toolbar() ? null : this.legendVisible() && this.legendPosition() === 'top' ? 'legend' : 'own'));
  readonly canExport = computed(() => !this.empty() && !this.loading());
  readonly popoverTokens = { content: { padding: '0' } };
  readonly exportItems = computed<TxChartMenuItem[]>(() => {
    const t = this.translations();
    return [
      { id: 'svg', label: t.chartDownloadSvg, icon: 'image' },
      { id: 'png', label: t.chartDownloadPng, icon: 'image' },
      ...(this.table() ? [{ id: 'csv', label: t.chartDownloadCsv, icon: 'file' }] : []),
    ];
  });

  constructor() {
    afterNextRender(() => this.observe());
    effect(() => {
      const data = this.tooltip();
      untracked(() => this.syncTooltip(data));
    });
    inject(DestroyRef).onDestroy(() => this.ref?.close('api'));
  }

  announce(message: string): void {
    void this.announcer.announce(message);
  }

  onPointer(event: PointerEvent | MouseEvent, type: TxChartPointerEvent['type']): void {
    const plot = this.plotRef()?.nativeElement;
    if (!plot || !this.interactive()) {
      return;
    }
    const box = plot.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (this.zoomable() && this.pinch(event, type, x, y)) return;
    this.cursor = type !== 'leave' && followsPointer(event) ? { x, y } : null;
    this.pointer.emit({ x, y, type, target: event.target as Element | null, buttons: event.buttons, pointerType: 'pointerType' in event ? event.pointerType : 'mouse' });
    if (this.cursor && this.ref && this.following()) {
      this.placeAnchor(this.cursor.x, this.cursor.y - ARROW_ROOM, 0, ARROW_ROOM * 2);
      this.ref.updatePosition();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) {
      return;
    }
    this.cursor = null;
    if (NAVIGATION_KEYS.includes(event.key) || (this.actionKeys() && ACTION_KEYS.includes(event.key)) || (this.zoomable() && ZOOM_KEYS.includes(event.key))) {
      event.preventDefault();
      this.navigate.emit(event);
    }
  }

  onWheel(event: WheelEvent): void {
    const plot = this.plotRef()?.nativeElement;
    if (!plot || !this.zoomable() || !this.interactive()) return;
    const box = plot.getBoundingClientRect();
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      this.zoomed.emit({ x: event.clientX - box.left, factor: Math.exp(event.deltaY * WHEEL_ZOOM) });
    } else if (this.zoomedIn() && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      event.preventDefault();
      this.panned.emit({ dx: -event.deltaX });
    }
  }

  onDoubleClick(): void {
    if (this.zoomable() && this.zoomedIn()) this.zoomReset.emit();
  }

  private pinch(event: PointerEvent | MouseEvent, type: TxChartPointerEvent['type'], x: number, y: number): boolean {
    if (!('pointerType' in event) || event.pointerType !== 'touch') return false;
    const before = [...this.touches.values()];
    if (type === 'up' || type === 'leave') {
      this.touches.delete(event.pointerId);
      return before.length > 1;
    }
    if (type === 'down' || this.touches.has(event.pointerId)) this.touches.set(event.pointerId, { x, y });
    const after = [...this.touches.values()];
    if (after.length < 2) return false;
    if (before.length >= 2 && type === 'move') {
      const spread = (points: { x: number; y: number }[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const middle = (points: { x: number; y: number }[]) => (points[0].x + points[1].x) / 2;
      const factor = spread(before) / Math.max(1, spread(after));
      if (Math.abs(factor - 1) > 0.002) this.zoomed.emit({ x: middle(after), factor });
      const dx = middle(after) - middle(before);
      if (dx) this.panned.emit({ dx });
    }
    this.pointer.emit({ x: 0, y: 0, type: 'leave', target: null });
    return true;
  }

  private observe(): void {
    const plot = this.plotRef()?.nativeElement;
    if (!plot) {
      return;
    }
    const measure = () => {
      const width = Math.round(plot.clientWidth);
      const height = Math.round(plot.clientHeight);
      if (width > 0 && height > 0) {
        const current = this.size();
        if (current.width !== width || current.height !== height) {
          this.size.set({ width, height });
        }
        this.measured.set(true);
      }
    };
    measure();
    const view = this.host.nativeElement.ownerDocument.defaultView;
    if (view && 'ResizeObserver' in view) {
      const observer = new view.ResizeObserver(() => measure());
      observer.observe(plot);
      this.injector.get(DestroyRef).onDestroy(() => observer.disconnect());
    }
  }

  private syncTooltip(data: TxChartTooltipData | null): void {
    const anchor = this.anchorRef()?.nativeElement;
    const template = this.tooltipPanel();
    if (!data) {
      this.closeTooltip();
      return;
    }
    if (!anchor || !template) {
      return;
    }
    const cursor = this.cursor;
    const placement: TxPlacement = cursor ? FOLLOW_PLACEMENT : (data.placement ?? this.tooltipPlacement());
    if (cursor) {
      this.placeAnchor(cursor.x, cursor.y - ARROW_ROOM, 0, ARROW_ROOM * 2);
    } else {
      const vertical = parsePlacement(placement).side === 'top' || parsePlacement(placement).side === 'bottom';
      const width = vertical ? ARROW_ROOM * 2 : 0;
      const height = vertical ? 0 : ARROW_ROOM * 2;
      this.placeAnchor(data.x - width / 2, data.y - height / 2, width, height);
    }
    if (this.ref && (this.openPlacement !== placement || this.following() !== !!cursor)) {
      this.closeTooltip();
    }
    this.following.set(!!cursor);
    this.shown.set(data);
    if (this.ref) {
      this.ref.updatePosition();
      return;
    }
    const ref = this.overlay.open(template, {
      origin: anchor,
      viewContainerRef: this.viewContainerRef,
      placement,
      offset: cursor ? FOLLOW_OFFSET : TOOLTIP_OFFSET,
      layer: 'tooltip',
      closeOnOutsideClick: false,
      restoreFocus: false,
      motion: 'pop',
    });
    ref.element.style.pointerEvents = 'none';
    ref.closed.subscribe((reason) => {
      if (this.ref === ref) {
        this.ref = null;
        this.activeRef.set(null);
      }
      if (reason !== 'api') {
        this.tooltipClosed.emit();
      }
    });
    this.ref = ref;
    this.openPlacement = placement;
    this.activeRef.set(ref);
  }

  onExport(id: string): void {
    if (id === 'svg' || id === 'png' || id === 'csv') {
      this.download(id);
    }
  }

  download(format: TxChartExportFormat): void {
    const document = this.host.nativeElement.ownerDocument;
    const name = chartFileName(this.exportName() || this.translations().chartDataTable, format);
    if (format === 'csv') {
      const table = this.table();
      if (table) {
        downloadChartFile(document, new Blob([chartCsv(table, this.translations().chartCategory)], { type: 'text/csv;charset=utf-8' }), name);
      }
      return;
    }
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const style = document.defaultView?.getComputedStyle(this.host.nativeElement);
    const markup = chartSvgString(svg, {
      legend: this.showLegend() ? this.legendItems().map((item) => ({ ...item, color: this.resolveColor(item.color) })) : [],
      background: style?.getPropertyValue('--tx-surface-card').trim() || '#ffffff',
      textColor: style?.color,
      fontFamily: style?.fontFamily,
    });
    if (format === 'svg') {
      downloadChartFile(document, new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), name);
      return;
    }
    chartPngBlob(document, markup)
      .then((blob) => downloadChartFile(document, blob, name))
      .catch(() => undefined);
  }

  private resolveColor(color: string): string {
    const host = this.host.nativeElement;
    const view = host.ownerDocument.defaultView;
    if (!view || !color.includes('var(')) return color;
    const probe = host.ownerDocument.createElement('span');
    probe.style.color = color;
    host.appendChild(probe);
    const resolved = view.getComputedStyle(probe).color;
    probe.remove();
    return resolved || color;
  }

  private placeAnchor(x: number, y: number, width: number, height: number): void {
    const anchor = this.anchorRef()?.nativeElement;
    if (!anchor) return;
    anchor.style.width = `${width}px`;
    anchor.style.height = `${height}px`;
    anchor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  private closeTooltip(): void {
    if (this.ref) {
      const ref = this.ref;
      this.ref = null;
      this.activeRef.set(null);
      ref.close('api');
    }
  }
}

function followsPointer(event: PointerEvent | MouseEvent): boolean {
  return 'pointerType' in event && (event.pointerType === 'mouse' || event.pointerType === 'pen');
}
