import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
  ViewContainerRef,
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
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraGalleriaTokens, toStyleObject } from '@tectra-ng/themes';
import { TxImageLayer, openImageLayer } from '@tectra-ng/ui/image';
import { TxGalleriaCaptionTemplate, TxGalleriaFooter, TxGalleriaHeader, TxGalleriaIndicatorTemplate, TxGalleriaItemTemplate, TxGalleriaThumbnailTemplate } from './galleria.templates';
import { TxGalleriaImage, TxGalleriaPart, TxGalleriaPosition, TxGalleriaResponsiveOption } from './galleria.types';
import { GALLERIA_ICON_DEFAULTS } from './galleria.icons';
import { GALLERIA_THEME } from './galleria.theme';

const SWIPE_MIN = 40;
const SWAP_DURATION = 450;

function percent(value: number): string {
  return `${Math.round(value * 10000) / 10000}%`;
}

export function galleriaImage(item: unknown): TxGalleriaImage | null {
  return typeof item === 'object' && item !== null && typeof (item as TxGalleriaImage).src === 'string' ? (item as TxGalleriaImage) : null;
}

@Component({
  selector: 'tx-galleria',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './galleria.component.html',
  styleUrl: './galleria.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-galleria',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-galleria--fullscreen]': 'fullScreen()',
  },
  viewProviders: [provideTxIconDefaults(GALLERIA_ICON_DEFAULTS)],
})
export class TxGalleria {
  private readonly galleriaTheme = injectTokens(GALLERIA_THEME);

  private injector = inject(Injector);
  private viewContainerRef = inject(ViewContainerRef);
  private document = inject(DOCUMENT);
  private layer: TxImageLayer | null = null;
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private swipeStart: { pointerId: number; x: number; y: number } | null = null;

  readonly value = input<readonly unknown[] | null | undefined>([]);
  readonly activeIndex = model(0);
  readonly visible = model(false);
  readonly fullScreen = input(false, { transform: booleanAttribute });
  readonly numVisible = input(3, { transform: numberAttribute });
  readonly responsiveOptions = input<TxGalleriaResponsiveOption[] | undefined>(undefined);
  readonly showItemNavigators = input(false, { transform: booleanAttribute });
  readonly showItemNavigatorsOnHover = input(false, { transform: booleanAttribute });
  readonly showThumbnailNavigators = input(true, { transform: booleanAttribute });
  readonly showThumbnails = input(true, { transform: booleanAttribute });
  readonly thumbnailsPosition = input<TxGalleriaPosition>('bottom');
  readonly verticalThumbnailViewPortHeight = input('300px');
  readonly showIndicators = input(false, { transform: booleanAttribute });
  readonly showIndicatorsOnItem = input(false, { transform: booleanAttribute });
  readonly indicatorsPosition = input<TxGalleriaPosition>('bottom');
  readonly changeItemOnIndicatorHover = input(false, { transform: booleanAttribute });
  readonly circular = input(false, { transform: booleanAttribute });
  readonly autoPlay = input(false, { transform: booleanAttribute });
  readonly transitionInterval = input(4000, { transform: numberAttribute });
  readonly shouldStopAutoplayByClick = input(true, { transform: booleanAttribute });
  readonly swipe = input(true, { transform: booleanAttribute });
  readonly effect = input<TxSwapEffect>('slide');
  readonly prevIcon = input<TxIconName | (string & {})>('chevron-left');
  readonly nextIcon = input<TxIconName | (string & {})>('chevron-right');
  readonly closeIcon = input<TxIconName | (string & {})>('times');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraGalleriaTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxGalleriaPart, TxGalleria> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('galleria', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-galleria'));
  readonly frameStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly maskStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().mask?.style }));

  protected readonly itemTemplate = contentChild(TxGalleriaItemTemplate);
  protected readonly thumbnailTemplate = contentChild(TxGalleriaThumbnailTemplate);
  protected readonly captionTemplate = contentChild(TxGalleriaCaptionTemplate);
  protected readonly indicatorTemplate = contentChild(TxGalleriaIndicatorTemplate);
  protected readonly header = contentChild(TxGalleriaHeader);
  protected readonly footer = contentChild(TxGalleriaFooter);
  private readonly layerTemplate = viewChild.required<TemplateRef<unknown>>('layer');

  readonly playing = signal(false);
  readonly leaving = signal<number | null>(null);
  private shownIndex: number | null = null;
  private lastDirection: 1 | -1 | null = null;
  private swapToken = 0;
  readonly hovered = signal(false);
  readonly focused = signal(false);
  private readonly responsive = signal<TxGalleriaResponsiveOption | null>(null);

  readonly items = computed(() => this.value() ?? []);
  readonly count = computed(() => this.items().length);
  readonly current = computed(() => Math.min(Math.max(Math.floor(this.activeIndex()), 0), Math.max(this.count() - 1, 0)));
  readonly activeItem = computed(() => this.items()[this.current()]);
  readonly activeImage = computed(() => galleriaImage(this.activeItem()));
  readonly thumbnailsVertical = computed(() => this.thumbnailsPosition() === 'left' || this.thumbnailsPosition() === 'right');
  readonly visibleThumbnails = computed(() => Math.max(1, Math.min(Math.floor(this.responsive()?.numVisible ?? this.numVisible()), Math.max(this.count(), 1))));
  readonly thumbnailStart = computed(() => {
    const visible = this.visibleThumbnails();
    const start = this.current() - Math.floor(visible / 2);
    return Math.min(Math.max(start, 0), Math.max(this.count() - visible, 0));
  });
  readonly thumbnailBasis = computed(() => percent(100 / this.visibleThumbnails()));
  readonly thumbnailTransform = computed(() => {
    const shift = percent((-this.thumbnailStart() * 100) / this.visibleThumbnails());
    return this.thumbnailsVertical() ? `translate3d(0, ${shift}, 0)` : `translate3d(${shift}, 0, 0)`;
  });
  readonly canPrev = computed(() => this.count() > 1 && (this.circular() || this.current() > 0));
  readonly canNext = computed(() => this.count() > 1 && (this.circular() || this.current() < this.count() - 1));
  readonly indexes = computed(() => Array.from({ length: this.count() }, (_, index) => index));
  readonly hasCaption = computed(() => !!this.captionTemplate() || !!this.activeImage()?.title || !!this.activeImage()?.description);
  readonly label = computed(() => this.ariaLabel() ?? this.translations().gallery);

  constructor() {
    effect(() => {
      const auto = this.autoPlay();
      untracked(() => this.playing.set(auto));
    });

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
      const interval = this.transitionInterval();
      const shown = !this.fullScreen() || this.visible();
      if (!this.playing() || !shown || this.count() < 2 || this.hovered() || this.focused()) {
        return;
      }
      const timer = setInterval(() => this.move(1, true), interval);
      onCleanup(() => clearInterval(timer));
    });

    effect(() => {
      const index = this.current();
      untracked(() => this.swapTo(index));
    });

    effect(() => {
      const wanted = this.fullScreen() && this.visible();
      untracked(() => (wanted ? this.openLayer() : this.closeLayer()));
    });

    inject(DestroyRef).onDestroy(() => {
      const layer = this.layer;
      this.layer = null;
      void layer?.close();
      this.releaseSwipe();
    });
  }

  next(): void {
    this.move(1, false);
  }

  prev(): void {
    this.move(-1, false);
  }

  show(index: number): void {
    this.lastDirection = index < this.current() ? -1 : 1;
    this.activeIndex.set(Math.min(Math.max(index, 0), Math.max(this.count() - 1, 0)));
  }

  startAutoplay(): void {
    this.playing.set(true);
  }

  stopAutoplay(): void {
    this.playing.set(false);
  }

  isAutoPlayActive(): boolean {
    return this.playing();
  }

  close(): void {
    this.visible.set(false);
  }

  imageLabel(index: number): string {
    return this.translations().galleryImage.replace('{index}', String(index + 1));
  }

  slideLabel(index: number): string {
    return this.translations()
      .slideOf.replace('{index}', String(index + 1))
      .replace('{total}', String(this.count()));
  }

  imageOf(item: unknown): TxGalleriaImage | null {
    return galleriaImage(item);
  }

  protected onUserMove(direction: 1 | -1): void {
    this.move(direction, false);
    this.stopByClick();
  }

  protected onSelect(index: number): void {
    this.show(index);
    this.stopByClick();
  }

  protected onIndicatorHover(index: number): void {
    if (this.changeItemOnIndicatorHover()) {
      this.onSelect(index);
    }
  }

  protected onListKeydown(event: KeyboardEvent, selector: string): void {
    const last = this.count() - 1;
    const forward = ['ArrowRight', 'ArrowDown'];
    const backward = ['ArrowLeft', 'ArrowUp'];
    const target = forward.includes(event.key)
      ? this.current() + 1
      : backward.includes(event.key)
        ? this.current() - 1
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : null;
    if (target === null || last < 0) {
      return;
    }
    event.preventDefault();
    const index = target > last ? (this.circular() ? 0 : last) : target < 0 ? (this.circular() ? last : 0) : target;
    this.onSelect(index);
    const list = (event.currentTarget as HTMLElement).closest('ul');
    queueMicrotask(() => list?.querySelectorAll<HTMLElement>(selector)[index]?.focus());
  }

  protected onItemsKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.onUserMove(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (!container.contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
    }
  }

  protected onSwipeStart(event: PointerEvent): void {
    if (!this.swipe() || this.count() < 2 || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    if ((event.target as Element).closest('button, a, input, select, textarea')) {
      return;
    }
    this.swipeStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    this.document.addEventListener('pointerup', this.onSwipeEnd);
    this.document.addEventListener('pointercancel', this.onSwipeCancel);
  }

  private readonly onSwipeEnd = (event: PointerEvent): void => {
    const start = this.swipeStart;
    this.releaseSwipe();
    if (!start || event.pointerId !== start.pointerId) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
      this.onUserMove(dx < 0 ? 1 : -1);
    }
  };

  private readonly onSwipeCancel = (): void => {
    this.releaseSwipe();
  };

  private releaseSwipe(): void {
    this.swipeStart = null;
    this.document.removeEventListener('pointerup', this.onSwipeEnd);
    this.document.removeEventListener('pointercancel', this.onSwipeCancel);
  }

  private stopByClick(): void {
    if (this.shouldStopAutoplayByClick()) {
      this.stopAutoplay();
    }
  }

  private move(direction: 1 | -1, wrap: boolean): void {
    const count = this.count();
    if (count < 2) {
      return;
    }
    const next = this.current() + direction;
    this.lastDirection = direction;
    if (next >= 0 && next < count) {
      this.activeIndex.set(next);
    } else if (this.circular() || wrap) {
      this.activeIndex.set(next < 0 ? count - 1 : 0);
    } else if (this.playing()) {
      this.stopAutoplay();
    }
  }

  private swapTo(index: number): void {
    const previous = this.shownIndex;
    this.shownIndex = index;
    const token = ++this.swapToken;
    const direction = this.lastDirection ?? (previous !== null && index < previous ? -1 : 1);
    this.lastDirection = null;
    if (previous === null || previous === index || previous >= this.count()) {
      this.leaving.set(null);
      return;
    }
    const motion = txSwapMotion(this.effect(), direction, 'x');
    if (!motion) {
      this.leaving.set(null);
      return;
    }
    this.leaving.set(previous);
    afterNextRender(
      () => {
        if (token !== this.swapToken) {
          return;
        }
        const root = this.fullScreen() ? (this.layer?.element ?? null) : this.host.nativeElement;
        const stage = root?.querySelector('.tx-galleria__stage') ?? null;
        const incoming = stage?.querySelector<HTMLElement>(`.tx-galleria__item[data-index="${index}"]`) ?? null;
        const outgoing = stage?.querySelector<HTMLElement>(`.tx-galleria__item[data-index="${previous}"]`) ?? null;
        if (!stage || !txCanAnimate(incoming) || !outgoing) {
          this.leaving.set(null);
          return;
        }
        stage.querySelectorAll<HTMLElement>('.tx-galleria__item').forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
        const duration = txCssTime(stage, '--tx-galleria-slide-duration', SWAP_DURATION);
        const easing = (stage.ownerDocument.defaultView?.getComputedStyle(stage).getPropertyValue('--tx-galleria-slide-easing') ?? '').trim() || 'ease';
        const part = motion.sequential ? duration / 2 : duration;
        const leave = outgoing.animate(motion.leave, { duration: part, easing, fill: 'forwards' });
        incoming.animate(motion.enter, { duration: part, easing, delay: motion.sequential ? part : 0, fill: 'backwards' });
        void leave.finished
          .catch(() => undefined)
          .then(() => {
            if (token === this.swapToken) {
              this.leaving.set(null);
              leave.cancel();
            }
          });
      },
      { injector: this.injector },
    );
  }

  private openLayer(): void {
    if (this.layer) {
      return;
    }
    this.layer = openImageLayer(this.layerTemplate(), {
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      focus: '.tx-galleria__close',
      onEscape: () => this.close(),
      onDetach: () => this.close(),
    });
  }

  private closeLayer(): void {
    const layer = this.layer;
    this.layer = null;
    void layer?.close();
  }
}
