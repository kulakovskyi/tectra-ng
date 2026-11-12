import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxOrgChartMinimap } from './org-chart-minimap.component';
import { TxOrgChartNodeView } from './org-chart-node.component';
import { TxOrgChartNodeTemplate } from './org-chart-templates.directive';
import { TxOrgChartToolbar } from './org-chart-toolbar.component';
import { TX_ORG_CHART_CONNECTOR_GAP, orgChartExpandState, orgChartPathLine } from './org-chart-tree';
import { TX_ORG_CHART_FOCUS_ZOOM, TX_ORG_CHART_PADDING, TX_ORG_CHART_ZOOM, boundView, centerOn, clampZoom, fitView, wheelIsMouse, wheelZoom, zoomAt } from './org-chart-view';
import {
  TxOrgChartLabels,
  TxOrgChartMinimapItem,
  TxOrgChartMinimapLayout,
  TxOrgChartMinimapTone,
  TxOrgChartNode,
  TxOrgChartPart,
  TxOrgChartPoint,
  TxOrgChartSize,
  TxOrgChartToolbarState,
  TxOrgChartTreeState,
  TxOrgChartView,
} from './org-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { ORG_CHART_ICON_DEFAULTS } from './org-chart.icons';

type TxFullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type TxFullscreenDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void };

const TYPING = ['INPUT', 'TEXTAREA', 'SELECT'];
const DRAG_IGNORE = '[data-drag-ignore], button, a, input, textarea, select, [contenteditable="true"]';
const DRAG_THRESHOLD = 4;
const KEY_PAN = 48;
const DEFAULT_HEIGHT = 'calc(100vh - 15rem)';

@Component({
  selector: 'tx-org-chart',
  imports: [TxOrgChartNodeView, TxOrgChartToolbar, TxOrgChartMinimap],
  templateUrl: './org-chart.component.html',
  styleUrl: './org-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '(document:fullscreenchange)': 'onFullscreenChange()',
    '(document:webkitfullscreenchange)': 'onFullscreenChange()',
    '(document:keydown.escape)': 'exitOverlayFullscreen()',
  },
  viewProviders: [provideTxIconDefaults(ORG_CHART_ICON_DEFAULTS)],
})
export class TxOrgChart implements OnDestroy {
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private locale = inject(TxLocaleService);
  private readonly translations = injectTranslations();
  private readonly canvas = viewChild<ElementRef<HTMLElement>>('canvas');
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');

  readonly nodes = input<readonly TxOrgChartNode[] | null | undefined>([]);
  readonly highlightIds = input<Iterable<string> | null | undefined>([]);
  readonly focusId = input<string | null | undefined>(null);
  readonly labels = input<Partial<TxOrgChartLabels>>({});
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly minimap = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly height = input<string>(DEFAULT_HEIGHT);
  readonly busy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly pathKinds = input<readonly string[] | null>(null);
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxOrgChartPart, TxOrgChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly nodeToggle = output<string>();
  readonly nodeClick = output<TxOrgChartNode>();
  readonly searchChange = output<string>();
  readonly expandAll = output<void>();
  readonly collapseAll = output<void>();

  readonly nodeTemplate = contentChild(TxOrgChartNodeTemplate);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('orgChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));

  readonly view = signal<TxOrgChartView>({ x: 0, y: 0, zoom: TX_ORG_CHART_ZOOM.initial });
  readonly viewport = signal<TxOrgChartSize>({ width: 0, height: 0 });
  readonly fullscreen = signal(false);
  readonly native = signal(false);
  readonly topLayer = signal(false);
  readonly dragging = signal(false);
  readonly settled = signal(false);
  readonly query = signal('');
  readonly pathIds = signal<ReadonlySet<string>>(new Set());
  private readonly pathOrder = signal<readonly string[]>([]);
  readonly pathLine = signal('');
  readonly minimapLayout = signal<TxOrgChartMinimapLayout>({ width: 0, height: 0, items: [] });

  readonly intl = computed(() => this.locale.locale().intl);
  readonly text = computed<TxOrgChartLabels>(() => {
    const t = this.translations();
    return {
      title: t.orgChartTitle,
      hint: t.orgChartHint,
      search: t.orgChartSearch,
      matches: t.orgChartMatches,
      noMatches: t.orgChartNoMatches,
      zoomIn: t.orgChartZoomIn,
      zoomOut: t.orgChartZoomOut,
      resetZoom: t.orgChartResetZoom,
      fit: t.orgChartFit,
      expandAll: t.orgChartExpandAll,
      collapseAll: t.orgChartCollapseAll,
      fullscreen: t.orgChartFullscreen,
      exitFullscreen: t.orgChartExitFullscreen,
      expand: t.orgChartExpand,
      collapse: t.orgChartCollapse,
      more: t.orgChartMore,
      ...this.labels(),
    };
  });
  readonly list = computed(() => this.nodes() ?? []);
  private readonly highlightSet = computed<ReadonlySet<string>>(() => new Set(this.highlightIds() ?? []));
  readonly hasContent = computed(() => this.list().length > 0);
  readonly stageTransform = computed(() => {
    const { x, y, zoom } = this.view();
    return `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  });

  readonly treeState = computed<TxOrgChartTreeState>(() => ({
    highlightIds: this.highlightSet(),
    pathIds: this.pathIds(),
    pathKinds: this.pathKinds(),
    labels: this.text(),
    unstyled: this.isUnstyled(),
  }));

  readonly toolbarState = computed<TxOrgChartToolbarState>(() => {
    const expand = orgChartExpandState(this.list());
    const zoom = this.view().zoom;
    return {
      zoomPercent: Math.round(zoom * 100),
      canZoomIn: zoom < TX_ORG_CHART_ZOOM.max,
      canZoomOut: zoom > TX_ORG_CHART_ZOOM.min,
      hasQuery: !!this.query().trim(),
      matchCount: this.highlightSet().size,
      isFullscreen: this.fullscreen(),
      hasContent: this.hasContent(),
      allExpanded: !expand.hasCollapsible || expand.allExpanded,
      noneExpanded: expand.noneExpanded,
    };
  });

  private observer: ResizeObserver | null = null;
  private pointers = new Map<number, TxOrgChartPoint>();
  private pinchDistance = 0;
  private moved = 0;
  private suppressClick = false;
  private lastFocusKey = '';
  private pageOverflow = '';
  private pageLocked = false;
  private pageGutter = '';

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;
      this.observeViewport(canvas);
      this.measureMinimap();
      this.fitToScreen();
      setTimeout(() => this.settled.set(true));
    });

    effect(() => {
      this.list();
      afterNextRender(() => this.measureMinimap(), { injector: this.injector });
    });

    effect(() => {
      const ids = this.pathOrder();
      if (!ids.length) return;
      afterNextRender(() => this.drawPath(ids), { injector: this.injector });
    });

    effect(() => {
      const target = this.focusId();
      const query = this.query();
      this.list();
      if (!target) return;
      const key = `${query}|${target}`;
      if (key === this.lastFocusKey) return;
      afterNextRender(() => this.focusOn(key, target), { injector: this.injector });
    });
  }

  fitToScreen(): void {
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    const next = fitView(this.viewport(), { width: stage.offsetWidth, height: stage.offsetHeight }, this.fullscreen() ? TX_ORG_CHART_PADDING * 2 : 0);
    if (next) this.view.set(next);
  }

  zoomIn(): void {
    this.zoomAtCenter(this.view().zoom * TX_ORG_CHART_ZOOM.step);
  }

  zoomOut(): void {
    this.zoomAtCenter(this.view().zoom / TX_ORG_CHART_ZOOM.step);
  }

  resetZoom(): void {
    this.zoomAtCenter(TX_ORG_CHART_ZOOM.initial);
  }

  centerOn(point: TxOrgChartPoint): void {
    this.view.update((view) => centerOn(view, this.viewport(), point));
  }

  onSearch(query: string): void {
    this.query.set(query);
    this.searchChange.emit(query);
  }

  onNodeClick(node: TxOrgChartNode): void {
    if (!this.suppressClick) this.nodeClick.emit(node);
  }

  highlightPath(ids: string[] | null): void {
    this.pathIds.set(new Set(ids ?? []));
    this.pathOrder.set(ids ?? []);
    if (!ids) this.pathLine.set('');
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey || wheelIsMouse(event)) {
      const rect = this.canvasRect();
      this.view.update((view) => zoomAt(view, wheelZoom(view.zoom, event.deltaY, event.ctrlKey), { x: event.clientX - rect.left, y: event.clientY - rect.top }));
      return;
    }
    this.panBy(-event.deltaX, -event.deltaY);
  }

  onPointerDown(event: PointerEvent): void {
    if ((event.button !== 0 && event.pointerType === 'mouse') || (event.target as Element | null)?.closest(DRAG_IGNORE)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.moved = 0;
    this.suppressClick = false;
    this.pinchDistance = this.pointers.size === 2 ? this.distance() : 0;
  }

  onPointerMove(event: PointerEvent): void {
    const last = this.pointers.get(event.pointerId);
    if (!last) return;
    const point = { x: event.clientX, y: event.clientY };
    if (this.pointers.size >= 2) {
      this.pointers.set(event.pointerId, point);
      const distance = this.distance();
      const [a, b] = [...this.pointers.values()];
      const rect = this.canvasRect();
      if (this.pinchDistance > 0) {
        const ratio = distance / this.pinchDistance;
        this.view.update((view) => zoomAt(view, view.zoom * ratio, { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top }));
      }
      this.pinchDistance = distance;
      this.suppressClick = true;
      return;
    }
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    this.pointers.set(event.pointerId, point);
    this.moved += Math.abs(dx) + Math.abs(dy);
    if (this.moved > DRAG_THRESHOLD) {
      this.dragging.set(true);
      this.suppressClick = true;
    }
    if (this.dragging()) this.panBy(dx, dy);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.pointers.delete(event.pointerId)) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.pinchDistance = 0;
    if (!this.pointers.size) {
      this.dragging.set(false);
      setTimeout(() => (this.suppressClick = false));
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.isContentEditable || TYPING.includes(target.tagName) || event.ctrlKey || event.metaKey || event.altKey || !this.hasContent()) return;
    const onCanvas = target === this.canvas()?.nativeElement;
    switch (event.key) {
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
      case '_':
        this.zoomOut();
        break;
      case '0':
        this.resetZoom();
        break;
      case 'f':
      case 'F':
      case 'а':
      case 'А':
        this.fitToScreen();
        break;
      case '/':
        this.focusSearch();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        if (!onCanvas) return;
        this.panBy(event.key === 'ArrowLeft' ? KEY_PAN : event.key === 'ArrowRight' ? -KEY_PAN : 0, event.key === 'ArrowUp' ? KEY_PAN : event.key === 'ArrowDown' ? -KEY_PAN : 0);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  toggleFullscreen(): void {
    const element = this.canvas()?.nativeElement;
    if (!element) return;
    if (this.nativeElement()) {
      this.exitNative();
      return;
    }
    if (this.fullscreen()) {
      this.leaveOverlay();
      return;
    }
    const request = (element as TxFullscreenElement).requestFullscreen?.bind(element) ?? (element as TxFullscreenElement).webkitRequestFullscreen?.bind(element);
    if (!request) {
      this.enterOverlay();
      return;
    }
    try {
      const result = request();
      if (result && typeof result.catch === 'function') {
        result.catch(() => this.enterOverlay());
      }
    } catch {
      this.enterOverlay();
    }
  }

  onFullscreenChange(): void {
    const native = this.nativeElement() === this.canvas()?.nativeElement;
    if (native) {
      this.lockPage(true);
    } else if (this.native()) {
      this.unlockPage();
    }
    this.native.set(native);
    if (native === this.fullscreen()) return;
    this.fullscreen.set(native);
    afterNextRender(() => this.fitToScreen(), { injector: this.injector });
  }

  exitOverlayFullscreen(): void {
    if (this.nativeElement() === this.canvas()?.nativeElement) {
      this.exitNative();
      return;
    }
    if (this.fullscreen() && !this.native()) {
      this.leaveOverlay();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.nativeElement() === this.canvas()?.nativeElement) {
      this.exitNative();
    }
    this.unlockPage();
  }

  private nativeElement(): Element | null {
    const document = this.document as TxFullscreenDocument;
    return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
  }

  private exitNative(): void {
    const document = this.document as TxFullscreenDocument;
    const exit = document.exitFullscreen?.bind(document) ?? document.webkitExitFullscreen?.bind(document);
    const result = exit?.();
    if (result && typeof result.catch === 'function') {
      result.catch(() => undefined);
    }
  }

  private enterOverlay(): void {
    this.native.set(false);
    this.fullscreen.set(true);
    this.lockPage();
    afterNextRender(
      () => {
        const element = this.canvas()?.nativeElement as (HTMLElement & { showPopover?: () => void }) | undefined;
        if (element?.showPopover && this.fullscreen()) {
          element.setAttribute('popover', 'manual');
          try {
            element.showPopover();
            this.topLayer.set(true);
          } catch {
            element.removeAttribute('popover');
          }
        }
        this.fitToScreen();
      },
      { injector: this.injector },
    );
  }

  private leaveOverlay(): void {
    const element = this.canvas()?.nativeElement as (HTMLElement & { hidePopover?: () => void }) | undefined;
    if (this.topLayer() && element) {
      try {
        element.hidePopover?.();
      } catch {
        this.topLayer.set(false);
      }
      element.removeAttribute('popover');
    }
    this.topLayer.set(false);
    this.fullscreen.set(false);
    this.unlockPage();
    afterNextRender(() => this.fitToScreen(), { injector: this.injector });
  }

  private lockPage(gutter = false): void {
    if (this.pageLocked) return;
    const root = this.document.documentElement;
    this.pageOverflow = root.style.overflow;
    this.pageGutter = root.style.getPropertyValue('scrollbar-gutter');
    root.style.overflow = 'hidden';
    if (gutter) {
      root.style.setProperty('scrollbar-gutter', 'auto');
    }
    this.pageLocked = true;
  }

  private unlockPage(): void {
    if (!this.pageLocked) return;
    const root = this.document.documentElement;
    root.style.overflow = this.pageOverflow;
    if (this.pageGutter) {
      root.style.setProperty('scrollbar-gutter', this.pageGutter);
    } else {
      root.style.removeProperty('scrollbar-gutter');
    }
    this.pageLocked = false;
  }

  private panBy(dx: number, dy: number): void {
    const { width, height } = this.minimapLayout();
    this.view.update((view) => boundView({ ...view, x: view.x + dx, y: view.y + dy }, this.viewport(), { width, height }));
  }

  private zoomAtCenter(zoom: number): void {
    const viewport = this.viewport();
    this.view.update((view) => zoomAt(view, clampZoom(zoom), { x: viewport.width / 2, y: viewport.height / 2 }));
  }

  private distance(): number {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private canvasRect(): DOMRect {
    return this.canvas()?.nativeElement.getBoundingClientRect() ?? new DOMRect();
  }

  private focusSearch(): void {
    this.canvas()?.nativeElement.closest('.tx-org-chart')?.querySelector<HTMLInputElement>(this.fullscreen() ? '.tx-org-chart__floating input' : '.tx-org-chart__bar input')?.focus();
  }

  private focusOn(key: string, id: string): void {
    const stage = this.stage()?.nativeElement;
    const target = stage?.querySelector<HTMLElement>(`[data-org-id="${CSS.escape(id)}"]`);
    if (!stage || !target || !this.viewport().width) return;
    this.lastFocusKey = key;
    const rect = this.stageRect(target);
    this.view.update((view) => centerOn(view, this.viewport(), { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, Math.max(view.zoom, TX_ORG_CHART_FOCUS_ZOOM)));
  }

  private drawPath(ids: readonly string[]): void {
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    const rects = ids
      .map((id) => stage.querySelector<HTMLElement>(`.tx-org-chart-node__card[data-org-id="${CSS.escape(id)}"]`))
      .filter((element): element is HTMLElement => !!element)
      .map((element) => this.stageRect(element));
    const style = this.document.defaultView?.getComputedStyle(stage);
    const gap = parseFloat(style?.getPropertyValue('--tx-chart-org-chart-connector-height') ?? '') || TX_ORG_CHART_CONNECTOR_GAP;
    const radius = parseFloat(style?.getPropertyValue('--tx-chart-org-chart-connector-radius') ?? '') || 0;
    this.pathLine.set(orgChartPathLine(rects, gap, this.isUnstyled() ? 0 : radius, 0.5));
  }

  private stageRect(element: HTMLElement): TxOrgChartMinimapItem {
    const stage = this.stage()?.nativeElement;
    let x = 0;
    let y = 0;
    let current: HTMLElement | null = element;
    while (current && current !== stage) {
      x += current.offsetLeft;
      y += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return {
      id: element.dataset['orgId'] ?? '',
      tone: (element.dataset['orgTone'] ?? 'default') as TxOrgChartMinimapTone,
      x,
      y,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  private measureMinimap(): void {
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    const items = [...stage.querySelectorAll<HTMLElement>('.tx-org-chart-node__card[data-org-id]')].map((element) => this.stageRect(element));
    this.minimapLayout.set({ width: stage.offsetWidth, height: stage.offsetHeight, items });
  }

  private observeViewport(canvas: HTMLElement): void {
    const update = () => this.viewport.set({ width: canvas.clientWidth, height: canvas.clientHeight });
    update();
    const view = this.document.defaultView;
    if (view && 'ResizeObserver' in view) {
      this.observer = new view.ResizeObserver(update);
      this.observer.observe(canvas);
    }
  }
}
