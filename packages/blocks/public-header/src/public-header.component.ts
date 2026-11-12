import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPublicHeaderTokens, toStyleObject } from '@tectra-ng/themes';
import { TxTopbarPreferences } from '@tectra-ng/blocks/topbar-preferences';
import { TxPublicHeaderBrand } from './public-header-brand.directive';
import { TxPublicHeaderPart, TxPublicHeaderResponsive } from './public-header.types';
import { PUBLIC_HEADER_ICON_DEFAULTS } from './public-header.icons';
import { PUBLIC_HEADER_THEME } from './public-header.theme';

const COMPACT_WIDTH = 768;
const CLOSE_FALLBACK_MS = 600;

@Component({
  selector: 'tx-public-header',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxTopbarPreferences],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-public-header',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-responsive]': 'responsive()',
    '[class.tx-public-header--open]': 'open()',
    '[class.tx-public-header--closing]': 'closing()',
    '(document:keydown.escape)': 'onEscape()',
  },
  viewProviders: [provideTxIconDefaults(PUBLIC_HEADER_ICON_DEFAULTS)],
})
export class TxPublicHeader {
  private readonly publicHeaderTheme = injectTokens(PUBLIC_HEADER_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  protected readonly router = inject(ActivatedRoute, { optional: true }) ? inject(Router) : null;
  protected readonly brandSlot = contentChild(TxPublicHeaderBrand);

  readonly brand = input.required<string>();
  readonly logo = input<string | undefined>(undefined);
  readonly homeLink = input<string | readonly unknown[]>('/');
  readonly preferences = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly responsive = input<TxPublicHeaderResponsive>('viewport');
  readonly dt = input<TectraDeepPartial<TectraPublicHeaderTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPublicHeaderPart, TxPublicHeader> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('publicHeader', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly panelId = uniqueId('tx-public-header-panel');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-public-header'), ...this.passThrough().root?.style }));
  protected readonly homeHref = computed(() => {
    const link = this.homeLink();
    return typeof link === 'string' ? link : '/' + link.join('/');
  });

  readonly open = signal(false);
  readonly compact = signal(false);
  protected readonly closing = signal(false);
  private closingTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => clearTimeout(this.closingTimer));
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) {
        return;
      }
      const update = (compact: boolean) => {
        this.compact.set(compact);
        if (!compact) {
          this.open.set(false);
          this.finishClosing();
        }
      };
      if (this.responsive() === 'container' && 'ResizeObserver' in view) {
        const observer = new view.ResizeObserver(([entry]) => update(entry.contentRect.width < COMPACT_WIDTH));
        observer.observe(this.host.nativeElement);
        destroyRef.onDestroy(() => observer.disconnect());
        return;
      }
      const media = view.matchMedia?.(`(width < ${COMPACT_WIDTH}px)`);
      if (media) {
        const change = () => update(media.matches);
        change();
        media.addEventListener?.('change', change);
        destroyRef.onDestroy(() => media.removeEventListener?.('change', change));
      }
    });
  }

  toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.finishClosing();
    this.open.set(true);
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (this.compact() && !this.isUnstyled() && !this.reducedMotion()) {
      this.closing.set(true);
      clearTimeout(this.closingTimer);
      this.closingTimer = setTimeout(() => this.finishClosing(), CLOSE_FALLBACK_MS);
    }
  }

  protected onPanelAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget && this.closing()) {
      this.finishClosing();
    }
  }

  private finishClosing(): void {
    clearTimeout(this.closingTimer);
    this.closing.set(false);
  }

  private reducedMotion(): boolean {
    return !!this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  protected onEscape(): void {
    if (this.open()) {
      this.close();
      this.toggleButton()?.nativeElement.focus();
    }
  }

  protected onPanelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a, button') && !target.closest('.tx-public-header__preferences')) {
      this.close();
    }
  }
}
