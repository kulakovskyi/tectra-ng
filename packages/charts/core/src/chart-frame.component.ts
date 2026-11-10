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
import { TxIcon, TxIconName } from '@tectra-ng/icons';
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
} from './chart.types';
import { chartBoxHeight } from './chart-size';

const TOOLTIP_OFFSET = 10;

@Component({
  selector: 'tx-chart-frame',
  imports: [NgTemplateOutlet, TxChartLegend, TxIcon, TxSkeleton],
  templateUrl: './chart-frame.component.html',
  styleUrl: './chart-frame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-chart-frame',
    '[attr.data-legend]': 'legendVisible() ? legendPosition() : null',
    '[attr.data-styled]': 'styled() || null',
    '[class.tx-chart-frame--fill]': 'fills()',
    '[class.tx-chart-frame--interactive]': 'interactive()',
    '[style.height]': 'cssHeight()',
  },
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
  readonly plotHeight = input<number | null>(null);

  readonly pointer = output<TxChartPointerEvent>();
  readonly navigate = output<KeyboardEvent>();
  readonly legendToggled = output<string>();
  readonly legendHovered = output<string | null>();
  readonly tooltipClosed = output<void>();

  protected readonly plotRef = viewChild<ElementRef<HTMLElement>>('plot');
  protected readonly anchorRef = viewChild<ElementRef<HTMLElement>>('anchor');
  protected readonly tooltipPanel = viewChild<TemplateRef<unknown>>('tooltipPanel');

  readonly hintId = uniqueId('tx-chart-hint');
  readonly shown = signal<TxChartTooltipData | null>(null);
  readonly measured = signal(false);
  private ref: TxOverlayRef | null = null;
  private openPlacement: TxPlacement | null = null;
  readonly activeRef = signal<TxOverlayRef | null>(null);
  readonly side = computed(() => parsePlacement(this.activeRef()?.placement() ?? this.openPlacement ?? this.tooltipPlacement()).side);
  readonly arrowOffset = computed(() => txArrowOffset(this.activeRef()?.placement() ?? 'top', { width: 0, height: 0 }));

  readonly fills = computed(() => typeof this.height() === 'string');
  readonly cssHeight = computed(() => {
    const height = this.height();
    return typeof height === 'number' ? `${height}px` : height;
  });
  readonly legendVisible = computed(() => this.showLegend() && !this.empty() && !this.loading() && this.legendItems().length > 0);
  readonly viewBox = computed(() => `0 0 ${this.size().width} ${this.size().height}`);
  readonly placeholderHeight = computed(() => chartBoxHeight(this.height(), this.legendVisible() ? this.legendPosition() : null));

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
    this.pointer.emit({ x: event.clientX - box.left, y: event.clientY - box.top, type, target: event.target as Element | null });
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) {
      return;
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'].includes(event.key)) {
      event.preventDefault();
      this.navigate.emit(event);
    }
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
    const placement: TxPlacement = data.placement ?? this.tooltipPlacement();
    anchor.style.transform = `translate(${Math.round(data.x)}px, ${Math.round(data.y)}px)`;
    if (this.ref && this.openPlacement !== placement) {
      this.closeTooltip();
    }
    this.shown.set(data);
    if (this.ref) {
      this.ref.updatePosition();
      return;
    }
    const ref = this.overlay.open(template, {
      origin: anchor,
      viewContainerRef: this.viewContainerRef,
      placement,
      offset: TOOLTIP_OFFSET,
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

  private closeTooltip(): void {
    if (this.ref) {
      const ref = this.ref;
      this.ref = null;
      this.activeRef.set(null);
      ref.close('api');
    }
  }
}
