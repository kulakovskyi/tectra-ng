import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injector,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxSwapEffect, optionalBoolean, txCanAnimate, txCssTime, txSwapMotion } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIconName } from '@tectra-ng/icons';
import { TectraCarouselTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCarouselFooter, TxCarouselHeader, TxCarouselIndicatorTemplate, TxCarouselItemTemplate } from './carousel.templates';
import { TxCarouselOrientation, TxCarouselPart, TxCarouselResponsiveOption } from './carousel.types';
import { CAROUSEL_ICON_DEFAULTS } from './carousel.icons';
import { CAROUSEL_THEME } from './carousel.theme';

const DRAG_START = 6;
const SWIPE_RATIO = 0.2;
const SWIPE_MIN = 40;
const EDGE_RESISTANCE = 0.3;
const SWAP_DURATION = 500;
const SWAP_STAGGER = 40;

function percent(value: number): string {
  return `${Math.round(value * 10000) / 10000}%`;
}

interface TxCarouselDrag {
  pointerId: number;
  start: number;
  cross: number;
  size: number;
  active: boolean;
}

/**
 * Shows a list of items a few at a time and pages through them with buttons, indicators, swipes or autoplay.
 */
@Component({
  selector: 'tx-carousel',
  imports: [NgTemplateOutlet, TxButton],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-carousel',
    role: 'region',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-roledescription]': 'translations().carousel',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[class.tx-carousel--vertical]': 'vertical()',
    '[class.tx-carousel--dragging]': 'dragging()',
    '[class.tx-carousel--instant]': "effect() !== 'slide'",
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'onFocusOut($event)',
  },
  viewProviders: [provideTxIconDefaults(CAROUSEL_ICON_DEFAULTS)],
})
export class TxCarousel {
  private readonly carouselTheme = injectTokens(CAROUSEL_THEME);

  private document = inject(DOCUMENT);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  private drag: TxCarouselDrag | null = null;
  private injector = inject(Injector);
  private swapToken = 0;
  private swapStarted = false;
  private suppressClick = false;

  readonly value = input<readonly unknown[] | null | undefined>([]);
  readonly page = model(0);
  readonly numVisible = input(1, { transform: numberAttribute });
  readonly numScroll = input(1, { transform: numberAttribute });
  readonly responsiveOptions = input<TxCarouselResponsiveOption[] | undefined>(undefined);
  readonly orientation = input<TxCarouselOrientation>('horizontal');
  readonly verticalViewPortHeight = input('300px');
  readonly circular = input(false, { transform: booleanAttribute });
  readonly autoplayInterval = input(0, { transform: numberAttribute });
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly showNavigators = input(true, { transform: booleanAttribute });
  readonly swipe = input(true, { transform: booleanAttribute });
  readonly effect = input<TxSwapEffect>('slide');
  readonly prevIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly nextIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraCarouselTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCarouselPart, TxCarousel> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('carousel', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-carousel'), ...this.passThrough().root?.style }));

  protected readonly itemTemplate = contentChild(TxCarouselItemTemplate);
  protected readonly indicatorTemplate = contentChild(TxCarouselIndicatorTemplate);
  protected readonly header = contentChild(TxCarouselHeader);
  protected readonly footer = contentChild(TxCarouselFooter);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly indicatorList = viewChild<ElementRef<HTMLElement>>('indicators');

  readonly hovered = signal(false);
  readonly focused = signal(false);
  readonly autoplayStopped = signal(false);
  readonly dragging = signal(false);
  readonly shownFirst = signal(0);
  readonly dragOffset = signal(0);
  private readonly responsive = signal<TxCarouselResponsiveOption | null>(null);

  readonly items = computed(() => this.value() ?? []);
  readonly vertical = computed(() => this.orientation() === 'vertical');
  readonly visibleCount = computed(() => Math.max(1, Math.floor(this.responsive()?.numVisible ?? this.numVisible())));
  readonly scrollCount = computed(() => Math.max(1, Math.floor(this.responsive()?.numScroll ?? this.responsive()?.numVisible ?? this.numScroll())));
  readonly totalPages = computed(() => {
    const count = this.items().length;
    const visible = this.visibleCount();
    return count <= visible ? 1 : Math.ceil((count - visible) / this.scrollCount()) + 1;
  });
  readonly currentPage = computed(() => Math.min(Math.max(Math.floor(this.page()), 0), this.totalPages() - 1));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index));
  readonly firstIndex = computed(() => Math.min(this.currentPage() * this.scrollCount(), Math.max(this.items().length - this.visibleCount(), 0)));
  readonly autoplaying = computed(() => this.autoplayInterval() > 0 && !this.autoplayStopped() && this.totalPages() > 1);
  readonly isCircular = computed(() => this.circular() || this.autoplayInterval() > 0);
  readonly canPrev = computed(() => this.totalPages() > 1 && (this.isCircular() || this.currentPage() > 0));
  readonly canNext = computed(() => this.totalPages() > 1 && (this.isCircular() || this.currentPage() < this.totalPages() - 1));
  readonly prevIconName = computed(() => this.prevIcon() ?? (this.vertical() ? 'chevron-up' : 'chevron-left'));
  readonly nextIconName = computed(() => this.nextIcon() ?? (this.vertical() ? 'chevron-down' : 'chevron-right'));
  readonly itemBasis = computed(() => percent(100 / this.visibleCount()));
  readonly trackTransform = computed(() => {
    const shift = percent((-this.shownFirst() * 100) / this.visibleCount());
    const offset = `${this.dragOffset()}px`;
    return this.vertical() ? `translate3d(0, calc(${shift} + ${offset}), 0)` : `translate3d(calc(${shift} + ${offset}), 0, 0)`;
  });

  constructor() {
    effect((onCleanup) => {
      const options = this.responsiveOptions();
      const view = this.document.defaultView;
      if (!options?.length || !view?.matchMedia) {
        this.responsive.set(null);
        return;
      }
      const entries = [...options]
        .sort((a, b) => parseFloat(a.breakpoint) - parseFloat(b.breakpoint))
        .map((option) => ({ option, query: view.matchMedia(`(max-width: ${option.breakpoint})`) }));
      const pick = () => this.responsive.set(entries.find((entry) => entry.query.matches)?.option ?? null);
      pick();
      entries.forEach((entry) => entry.query.addEventListener('change', pick));
      onCleanup(() => entries.forEach((entry) => entry.query.removeEventListener('change', pick)));
    });

    effect((onCleanup) => {
      const interval = this.autoplayInterval();
      if (!this.autoplaying() || this.hovered() || this.focused() || this.dragging()) {
        return;
      }
      const timer = setInterval(() => this.step(1), interval);
      onCleanup(() => clearInterval(timer));
    });

    effect(() => {
      const first = this.firstIndex();
      untracked(() => this.swapTo(first));
    });

    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      const swallow = (event: MouseEvent) => {
        if (this.suppressClick) {
          event.preventDefault();
          event.stopPropagation();
          this.suppressClick = false;
        }
      };
      viewport.addEventListener('click', swallow, true);
      this.destroyRef.onDestroy(() => viewport.removeEventListener('click', swallow, true));
    });

    this.destroyRef.onDestroy(() => this.releaseDrag());
  }

  next(): void {
    this.step(1);
  }

  prev(): void {
    this.step(-1);
  }

  goTo(page: number): void {
    this.page.set(Math.min(Math.max(page, 0), this.totalPages() - 1));
  }

  startAutoplay(): void {
    this.autoplayStopped.set(false);
  }

  stopAutoplay(): void {
    this.autoplayStopped.set(true);
  }

  isShown(index: number): boolean {
    const first = this.shownFirst();
    return index >= first && index < first + this.visibleCount();
  }

  slideLabel(index: number): string {
    return this.translations()
      .slideOf.replace('{index}', String(index + 1))
      .replace('{total}', String(this.items().length));
  }

  pageLabel(page: number): string {
    return this.translations().pageNumber.replace('{page}', String(page + 1));
  }

  protected onNavigate(direction: 1 | -1): void {
    this.step(direction);
    this.stopAutoplay();
  }

  protected onIndicatorClick(page: number): void {
    this.goTo(page);
    this.stopAutoplay();
  }

  protected onIndicatorKeydown(event: KeyboardEvent): void {
    const last = this.totalPages() - 1;
    const keys: Record<string, number> = {
      ArrowRight: this.currentPage() + 1,
      ArrowDown: this.currentPage() + 1,
      ArrowLeft: this.currentPage() - 1,
      ArrowUp: this.currentPage() - 1,
      Home: 0,
      End: last,
    };
    const target = keys[event.key];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    const page = target > last ? 0 : target < 0 ? last : target;
    this.onIndicatorClick(page);
    queueMicrotask(() => this.indicatorList()?.nativeElement.querySelectorAll<HTMLElement>('.tx-carousel__indicator-button')[page]?.focus());
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.swipe() || this.totalPages() < 2 || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    const vertical = this.vertical();
    this.drag = {
      pointerId: event.pointerId,
      start: vertical ? event.clientY : event.clientX,
      cross: vertical ? event.clientX : event.clientY,
      size: (vertical ? rect.height : rect.width) / this.visibleCount(),
      active: false,
    };
    this.document.addEventListener('pointermove', this.onPointerMove);
    this.document.addEventListener('pointerup', this.onPointerUp);
    this.document.addEventListener('pointercancel', this.onPointerCancel);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const vertical = this.vertical();
    const delta = (vertical ? event.clientY : event.clientX) - drag.start;
    const cross = (vertical ? event.clientX : event.clientY) - drag.cross;
    if (!drag.active) {
      if (Math.abs(delta) < DRAG_START) {
        return;
      }
      if (Math.abs(cross) > Math.abs(delta)) {
        this.releaseDrag();
        return;
      }
      drag.active = true;
      this.dragging.set(true);
    }
    event.preventDefault();
    const blocked = (delta > 0 && !this.canPrev()) || (delta < 0 && !this.canNext());
    this.dragOffset.set(blocked ? delta * EDGE_RESISTANCE : delta);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const offset = this.dragOffset();
    if (drag.active) {
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false));
      if (Math.abs(offset) >= Math.min(SWIPE_MIN, drag.size * SWIPE_RATIO) + 0.5) {
        const direction = offset < 0 ? 1 : -1;
        if (direction === 1 ? this.canNext() : this.canPrev()) {
          this.onNavigate(direction);
        }
      }
    }
    this.releaseDrag();
  };

  private readonly onPointerCancel = (): void => {
    this.releaseDrag();
  };

  private releaseDrag(): void {
    this.drag = null;
    this.dragging.set(false);
    this.dragOffset.set(0);
    this.document.removeEventListener('pointermove', this.onPointerMove);
    this.document.removeEventListener('pointerup', this.onPointerUp);
    this.document.removeEventListener('pointercancel', this.onPointerCancel);
  }

  private swapTo(first: number): void {
    const previous = this.shownFirst();
    const token = ++this.swapToken;
    if (!this.swapStarted) {
      this.swapStarted = true;
      this.shownFirst.set(first);
      return;
    }
    const viewport = this.viewport().nativeElement;
    const motion = txSwapMotion(this.effect(), first > previous ? 1 : -1, this.vertical() ? 'y' : 'x');
    const outgoing = Array.from(viewport.querySelectorAll<HTMLElement>('.tx-carousel__item--active'));
    if (first === previous || this.effect() === 'slide' || !motion || !outgoing.length || !txCanAnimate(outgoing[0])) {
      this.shownFirst.set(first);
      return;
    }
    viewport.querySelectorAll<HTMLElement>('.tx-carousel__item').forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
    const part = txCssTime(viewport, '--tx-carousel-slide-duration', SWAP_DURATION) / 2;
    const easing = (viewport.ownerDocument.defaultView?.getComputedStyle(viewport).getPropertyValue('--tx-carousel-slide-easing') ?? '').trim() || 'ease';
    const leaves = outgoing.map((item) => item.animate(motion.leave, { duration: part, easing, fill: 'forwards' }));
    void Promise.all(leaves.map((animation) => animation.finished.catch(() => undefined))).then(() => {
      if (token !== this.swapToken) {
        return;
      }
      this.shownFirst.set(first);
      afterNextRender(
        () => {
          leaves.forEach((animation) => animation.cancel());
          if (token !== this.swapToken) {
            return;
          }
          Array.from(viewport.querySelectorAll<HTMLElement>('.tx-carousel__item--active')).forEach((item, order) =>
            item.animate(motion.enter, { duration: part, easing, delay: order * SWAP_STAGGER, fill: 'backwards' }),
          );
        },
        { injector: this.injector },
      );
    });
  }

  private step(direction: 1 | -1): void {
    const total = this.totalPages();
    if (total < 2) {
      return;
    }
    const next = this.currentPage() + direction;
    if (next >= 0 && next < total) {
      this.page.set(next);
    } else if (this.isCircular()) {
      this.page.set(next < 0 ? total - 1 : 0);
    }
  }
}
