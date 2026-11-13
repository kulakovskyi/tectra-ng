import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSplitterTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSplitterPanel } from './splitter-panel.component';
import { moveGutter } from './splitter.resize';
import {
  TxSplitterCollapseEvent,
  TxSplitterLayout,
  TxSplitterLayoutState,
  TxSplitterPanelLimits,
  TxSplitterPart,
  TxSplitterResizeEvent,
  TxSplitterStateStorage,
} from './splitter.types';
import { SPLITTER_THEME } from './splitter.theme';

interface TxSplitterDrag {
  gutter: number;
  start: number;
  pixels: number;
  initial: TxSplitterLayoutState;
}

/**
 * Two or more panels with draggable gutters between them; sizes are percentages and can be kept in the
 * browser storage.
 */
@Component({
  selector: 'tx-splitter',
  imports: [NgTemplateOutlet],
  templateUrl: './splitter.component.html',
  styleUrl: './splitter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-splitter',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
    '[attr.data-resizing]': 'resizingGutter() !== null || null',
    '[class.tx-splitter--nested]': 'nested',
    '[class.tx-splitter--disabled]': 'disabled()',
  },
})
export class TxSplitter {
  private readonly splitterTheme = injectTokens(SPLITTER_THEME);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  protected readonly nested = inject(TxSplitter, { optional: true, skipSelf: true }) !== null;

  readonly layout = input<TxSplitterLayout>('horizontal');
  readonly panelSizes = input<readonly number[]>([]);
  readonly minSizes = input<readonly number[]>([]);
  readonly gutterSize = input(1, { transform: numberAttribute });
  readonly step = input(5, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly stateKey = input<string | undefined>(undefined);
  readonly stateStorage = input<TxSplitterStateStorage>('session');
  readonly gutterAriaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSplitterTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSplitterPart, TxSplitter> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly resizeStart = output<TxSplitterResizeEvent>();
  readonly resizing = output<TxSplitterResizeEvent>();
  readonly resizeEnd = output<TxSplitterResizeEvent>();
  readonly collapsedChange = output<TxSplitterCollapseEvent>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('splitter', this, this.pt, this.ptOptions);
  protected readonly panels = contentChildren(TxSplitterPanel);
  private readonly panelElements = viewChildren<ElementRef<HTMLElement>>('panelElement');

  private readonly state = signal<TxSplitterLayoutState>({ sizes: [], collapsed: [] });
  readonly sizes = computed(() => this.state().sizes);
  readonly collapsed = computed(() => this.state().collapsed);
  readonly resizingGutter = signal<number | null>(null);

  protected readonly id = uniqueId('tx-splitter');
  protected readonly limits = computed<TxSplitterPanelLimits[]>(() => {
    const minSizes = this.minSizes();
    return this.panels().map((panel, index) => ({
      minSize: panel.minSize() ?? minSizes[index] ?? 0,
      maxSize: panel.maxSize(),
      collapsible: panel.collapsible(),
      collapsedSize: panel.collapsedSize(),
    }));
  });
  private readonly initialSizes = computed(() => {
    const panels = this.panels();
    const panelSizes = this.panelSizes();
    return panels.map((panel, index) => panelSizes[index] ?? panel.size() ?? 100 / panels.length);
  });
  private readonly signature = computed(
    () =>
      `${this.initialSizes().join(',')}|${this.limits()
        .map((limit) => `${limit.minSize}:${limit.maxSize}:${limit.collapsible}:${limit.collapsedSize}`)
        .join(',')}|${this.stateKey() ?? ''}`,
  );
  protected readonly flex = computed(() => this.sizes().map((size) => `${size} 1 0px`));
  protected readonly gutterLabel = computed(() => this.gutterAriaLabel() ?? this.translations().resizePanels);
  protected readonly gutterRanges = computed(() => {
    const { sizes } = this.state();
    const limits = this.limits();
    return sizes.slice(0, -1).map((size, index) => {
      const spare = sizes.slice(index + 1).reduce((sum, next, offset) => sum + Math.max(0, next - this.floorOf(limits[index + 1 + offset])), 0);
      return {
        now: Math.round(size),
        min: Math.round(this.floorOf(limits[index])),
        max: Math.round(Math.min(limits[index].maxSize, size + spare)),
      };
    });
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-splitter'), ...this.passThrough().root?.style }));

  private drag: TxSplitterDrag | null = null;
  private keyboardGutter: number | null = null;
  private reportedCollapsed: boolean[] = [];
  private readonly openSizes = new Map<number, number>();

  constructor() {
    effect(() => {
      this.signature();
      if (untracked(() => this.resizingGutter()) === null) {
        untracked(() => this.resetState());
      }
    });
  }

  resetState(): void {
    const limits = this.limits();
    const sizes = this.restoreState(limits.length) ?? this.initialSizes();
    const collapsed = sizes.map((size, index) => limits[index].collapsible && size <= limits[index].collapsedSize);
    this.reportedCollapsed = collapsed;
    this.state.set({ sizes: [...sizes], collapsed });
  }

  protected panelId(index: number): string {
    return `${this.id}-panel-${index}`;
  }

  protected onPointerDown(event: PointerEvent, gutter: number): void {
    if (this.disabled() || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    target.focus({ preventScroll: true });
    this.drag = { gutter, start: this.pointerPosition(event), pixels: this.panelPixels(), initial: this.state() };
    this.resizingGutter.set(gutter);
    this.resizeStart.emit({ originalEvent: event, sizes: [...this.sizes()] });
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pixels === 0) {
      return;
    }
    const offset = this.pointerPosition(event) - drag.start;
    const direction = this.layout() === 'horizontal' && this.isRtl() ? -1 : 1;
    this.apply(event, drag.initial, drag.gutter, (offset * direction * this.total(drag.initial)) / drag.pixels);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.drag) {
      return;
    }
    this.drag = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.finish(event);
  }

  protected onKeyDown(event: KeyboardEvent, gutter: number): void {
    if (this.disabled()) {
      return;
    }
    const delta = this.keyDelta(event, gutter);
    if (delta === null) {
      return;
    }
    event.preventDefault();
    if (this.keyboardGutter === null) {
      this.keyboardGutter = gutter;
      this.resizeStart.emit({ originalEvent: event, sizes: [...this.sizes()] });
    }
    this.apply(event, this.state(), gutter, delta);
  }

  protected onKeyUp(event: Event): void {
    if (this.keyboardGutter !== null) {
      this.keyboardGutter = null;
      this.finish(event);
    }
  }

  private keyDelta(event: KeyboardEvent, gutter: number): number | null {
    const horizontal = this.layout() === 'horizontal';
    const stepPercent = (this.step() * this.total(this.state())) / (this.panelPixels() || 1);
    const forward = horizontal && this.isRtl() ? -stepPercent : stepPercent;
    switch (event.key) {
      case 'ArrowRight':
        return horizontal ? forward : null;
      case 'ArrowLeft':
        return horizontal ? -forward : null;
      case 'ArrowDown':
        return horizontal ? null : stepPercent;
      case 'ArrowUp':
        return horizontal ? null : -stepPercent;
      case 'Home':
        return -this.sizes()[gutter];
      case 'End':
        return this.total(this.state());
      case 'Enter':
        return this.collapseDelta(gutter);
      default:
        return null;
    }
  }

  private collapseDelta(gutter: number): number | null {
    const limits = this.limits();
    const { sizes, collapsed } = this.state();
    const index = limits[gutter].collapsible ? gutter : limits[gutter + 1].collapsible ? gutter + 1 : null;
    if (index === null) {
      return null;
    }
    const sign = index === gutter ? 1 : -1;
    if (collapsed[index]) {
      const open = Math.max(this.openSizes.get(index) ?? limits[index].minSize, limits[index].minSize);
      return sign * (open - sizes[index]);
    }
    this.openSizes.set(index, sizes[index]);
    return sign * (limits[index].collapsedSize - sizes[index]);
  }

  private apply(event: Event, from: TxSplitterLayoutState, gutter: number, delta: number): void {
    const next = moveGutter(from, this.limits(), gutter, delta);
    this.state.set(next);
    next.collapsed.forEach((collapsed, index) => {
      if (collapsed !== this.reportedCollapsed[index]) {
        this.collapsedChange.emit({ index, collapsed, sizes: [...next.sizes] });
      }
    });
    this.reportedCollapsed = [...next.collapsed];
    this.resizing.emit({ originalEvent: event, sizes: [...next.sizes] });
  }

  private finish(event: Event): void {
    this.saveState();
    this.resizingGutter.set(null);
    this.resizeEnd.emit({ originalEvent: event, sizes: [...this.sizes()] });
  }

  private floorOf(limit: TxSplitterPanelLimits | undefined): number {
    if (!limit) {
      return 0;
    }
    return limit.collapsible ? limit.collapsedSize : limit.minSize;
  }

  private total(state: TxSplitterLayoutState): number {
    return state.sizes.reduce((sum, size) => sum + size, 0) || 100;
  }

  private pointerPosition(event: PointerEvent): number {
    return this.layout() === 'horizontal' ? event.clientX : event.clientY;
  }

  private panelPixels(): number {
    const horizontal = this.layout() === 'horizontal';
    return this.panelElements().reduce((sum, panel) => {
      const rect = panel.nativeElement.getBoundingClientRect();
      return sum + (horizontal ? rect.width : rect.height);
    }, 0);
  }

  private isRtl(): boolean {
    return this.document.defaultView?.getComputedStyle(this.host.nativeElement).direction === 'rtl';
  }

  private storage(): Storage | null {
    try {
      const view = this.document.defaultView;
      return (this.stateStorage() === 'local' ? view?.localStorage : view?.sessionStorage) ?? null;
    } catch {
      return null;
    }
  }

  private saveState(): void {
    const key = this.stateKey();
    if (!key) {
      return;
    }
    try {
      this.storage()?.setItem(key, JSON.stringify(this.sizes()));
    } catch {
      return;
    }
  }

  private restoreState(count: number): number[] | null {
    const key = this.stateKey();
    if (!key || count === 0) {
      return null;
    }
    try {
      const stored: unknown = JSON.parse(this.storage()?.getItem(key) ?? 'null');
      const valid = Array.isArray(stored) && stored.length === count && stored.every((size) => typeof size === 'number' && Number.isFinite(size));
      return valid ? (stored as number[]) : null;
    } catch {
      return null;
    }
  }
}
