import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraScrollPanelTokens, toStyleObject } from '@tectra-ng/themes';
import { TxScrollPanelAxis, TxScrollPanelBar, TxScrollPanelPart } from './scroll-panel.types';
import { SCROLL_PANEL_THEME } from './scroll-panel.theme';

const MIN_BAR_RATIO = 0.1;
const HIDDEN_BAR: TxScrollPanelBar = { visible: false, length: 0, offset: 0, value: 0 };

interface TxScrollPanelGrab {
  axis: TxScrollPanelAxis;
  start: number;
  scroll: number;
  ratio: number;
}

@Component({
  selector: 'tx-scroll-panel',
  templateUrl: './scroll-panel.component.html',
  styleUrl: './scroll-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-scroll-panel',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-grabbed]': 'grabbed() ?? null',
  },
})
export class TxScrollPanel {
  private readonly scrollPanelTheme = injectTokens(SCROLL_PANEL_THEME);

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  readonly step = input(5, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraScrollPanelTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxScrollPanelPart, TxScrollPanel> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('scrollPanel', this, this.pt, this.ptOptions);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly inner = viewChild.required<ElementRef<HTMLElement>>('inner');

  protected readonly contentId = uniqueId('tx-scroll-panel');
  protected readonly barX = signal<TxScrollPanelBar>(HIDDEN_BAR);
  protected readonly barY = signal<TxScrollPanelBar>(HIDDEN_BAR);
  protected readonly grabbed = signal<TxScrollPanelAxis | null>(null);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-scroll-panel'), ...this.passThrough().root?.style }));

  private grab: TxScrollPanelGrab | null = null;

  constructor() {
    afterNextRender(() => {
      this.refresh();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver(() => this.refresh());
      observer.observe(this.content().nativeElement);
      observer.observe(this.inner().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  refresh(): void {
    const content = this.content().nativeElement;
    const overflowX = content.scrollWidth - content.clientWidth > 0.5;
    const overflowY = content.scrollHeight - content.clientHeight > 0.5;
    const thickness = this.barThickness();
    this.barX.set(
      overflowX
        ? this.measure(Math.abs(content.scrollLeft), content.scrollWidth, content.clientWidth, content.clientWidth - (overflowY ? thickness : 0))
        : HIDDEN_BAR,
    );
    this.barY.set(
      overflowY
        ? this.measure(content.scrollTop, content.scrollHeight, content.clientHeight, content.clientHeight - (overflowX ? thickness : 0))
        : HIDDEN_BAR,
    );
  }

  scrollTop(value: number): void {
    const content = this.content().nativeElement;
    content.scrollTop = Math.min(Math.max(value, 0), content.scrollHeight - content.clientHeight);
    this.refresh();
  }

  scrollLeft(value: number): void {
    const content = this.content().nativeElement;
    const max = content.scrollWidth - content.clientWidth;
    const clamped = Math.min(Math.max(value, 0), max);
    content.scrollLeft = this.isRtl() ? -clamped : clamped;
    this.refresh();
  }

  protected onGrab(event: PointerEvent, axis: TxScrollPanelAxis): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    target.focus({ preventScroll: true });
    const content = this.content().nativeElement;
    const bar = axis === 'x' ? this.barX() : this.barY();
    const scrollable = axis === 'x' ? content.scrollWidth - content.clientWidth : content.scrollHeight - content.clientHeight;
    const track = this.trackLength(axis) - bar.length;
    this.grab = {
      axis,
      start: axis === 'x' ? event.clientX : event.clientY,
      scroll: axis === 'x' ? Math.abs(content.scrollLeft) : content.scrollTop,
      ratio: track > 0 ? scrollable / track : 0,
    };
    this.grabbed.set(axis);
  }

  protected onDrag(event: PointerEvent): void {
    const grab = this.grab;
    if (!grab) {
      return;
    }
    if (grab.axis === 'x') {
      const direction = this.isRtl() ? -1 : 1;
      this.scrollLeft(grab.scroll + (event.clientX - grab.start) * direction * grab.ratio);
    } else {
      this.scrollTop(grab.scroll + (event.clientY - grab.start) * grab.ratio);
    }
  }

  protected onRelease(event: PointerEvent): void {
    if (!this.grab) {
      return;
    }
    this.grab = null;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.grabbed.set(null);
  }

  protected onBarKeyDown(event: KeyboardEvent, axis: TxScrollPanelAxis): void {
    const content = this.content().nativeElement;
    const vertical = axis === 'y';
    const current = vertical ? content.scrollTop : Math.abs(content.scrollLeft);
    const page = vertical ? content.clientHeight : content.clientWidth;
    const end = vertical ? content.scrollHeight : content.scrollWidth;
    const forward = vertical ? 'ArrowDown' : this.isRtl() ? 'ArrowLeft' : 'ArrowRight';
    const backward = vertical ? 'ArrowUp' : this.isRtl() ? 'ArrowRight' : 'ArrowLeft';
    const targets: Record<string, number> = {
      [forward]: current + this.step(),
      [backward]: current - this.step(),
      PageDown: current + page,
      PageUp: current - page,
      Home: 0,
      End: end,
    };
    const next = targets[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    if (vertical) {
      this.scrollTop(next);
    } else {
      this.scrollLeft(next);
    }
  }

  private measure(position: number, total: number, visible: number, track: number): TxScrollPanelBar {
    const length = Math.max(track * (visible / total), track * MIN_BAR_RATIO);
    const scrollable = total - visible;
    const progress = scrollable > 0 ? Math.min(Math.max(position / scrollable, 0), 1) : 0;
    return { visible: true, length, offset: progress * (track - length), value: Math.round(progress * 100) };
  }

  private trackLength(axis: TxScrollPanelAxis): number {
    const content = this.content().nativeElement;
    const other = axis === 'x' ? this.barY() : this.barX();
    const base = axis === 'x' ? content.clientWidth : content.clientHeight;
    return base - (other.visible ? this.barThickness() : 0);
  }

  private barThickness(): number {
    const view = this.document.defaultView;
    const size = view ? parseFloat(view.getComputedStyle(this.content().nativeElement).getPropertyValue('--tx-scroll-panel-bar-size')) : 0;
    return Number.isFinite(size) ? size : 0;
  }

  private isRtl(): boolean {
    return this.document.defaultView?.getComputedStyle(this.content().nativeElement).direction === 'rtl';
  }
}
