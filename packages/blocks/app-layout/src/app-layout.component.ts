import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraAppLayoutTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { filter } from 'rxjs';
import { TxAppLayoutBackdrop, TxAppLayoutPart, TxAppLayoutResponsive } from './app-layout.types';
import { APP_LAYOUT_ICON_DEFAULTS } from './app-layout.icons';

const MOBILE_WIDTH = 1024;
const PICKED = 'a[href], [role="treeitem"]:not([aria-expanded])';

@Component({
  selector: 'tx-app-layout',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxPanelMenu, TxTooltip],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-app-layout',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-responsive]': 'responsive()',
    '[class.tx-app-layout--plain]': '!sidebar()',
    '[class.tx-app-layout--anchored]': 'sidebar() && anchored()',
    '[class.tx-app-layout--wide]': 'sidebar() && wide()',
    '[class.tx-app-layout--open]': 'sidebar() && mobileOpen()',
    '(keydown.escape)': 'closeFromKeyboard()',
  },
  viewProviders: [provideTxIconDefaults(APP_LAYOUT_ICON_DEFAULTS)],
})
export class TxAppLayout implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  readonly model = input<TxPanelMenuItem[]>([]);
  readonly logo = input<string | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);
  readonly homeLink = input<string | readonly unknown[] | undefined>('/');
  readonly sidebar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly anchored = model(true);
  readonly stateKey = input<string | undefined>(undefined);
  readonly backdrop = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly backdropVariant = input<TxAppLayoutBackdrop>('spectrum');
  readonly responsive = input<TxAppLayoutResponsive>('viewport');
  readonly menuLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAppLayoutTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAppLayoutPart, TxAppLayout> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('appLayout', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly id = uniqueId('tx-app-layout');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-app-layout'), ...this.passThrough().root?.style }));

  readonly mobile = signal(false);
  readonly mobileOpen = signal(false);
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  readonly expanded = computed(() => this.anchored() || this.hovered() || this.focused());
  readonly wide = computed(() => this.mobile() || this.expanded());
  protected readonly menuName = computed(() => this.menuLabel() ?? this.translations().menu);

  constructor() {
    const destroyRef = inject(DestroyRef);
    inject(Router, { optional: true })
      ?.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.mobileOpen.set(false));
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) {
        return;
      }
      const update = (mobile: boolean) => {
        this.mobile.set(mobile);
        if (!mobile) {
          this.mobileOpen.set(false);
        }
      };
      if (this.responsive() === 'container' && 'ResizeObserver' in view) {
        const observer = new view.ResizeObserver(([entry]) => update(entry.contentRect.width < MOBILE_WIDTH));
        observer.observe(this.host.nativeElement);
        destroyRef.onDestroy(() => observer.disconnect());
        return;
      }
      const media = view.matchMedia?.(`(width < ${MOBILE_WIDTH}px)`);
      if (media) {
        const change = () => update(media.matches);
        change();
        media.addEventListener?.('change', change);
        destroyRef.onDestroy(() => media.removeEventListener?.('change', change));
      }
    });
  }

  ngOnInit(): void {
    const stored = this.readAnchored();
    if (stored !== null) {
      this.anchored.set(stored);
    }
  }

  toggleAnchored(): void {
    const next = !this.anchored();
    this.anchored.set(next);
    this.hovered.set(true);
    this.writeAnchored(next);
  }

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected setHovered(hovered: boolean): void {
    this.hovered.set(hovered);
  }

  protected onFocusIn(event: FocusEvent): void {
    this.focused.set((event.target as HTMLElement | null)?.matches(':focus-visible') ?? false);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.focused.set(false);
    }
  }

  protected onSidebarClick(event: Event): void {
    if (this.mobile() && (event.target as HTMLElement | null)?.closest(PICKED)) {
      this.mobileOpen.set(false);
    }
  }

  protected closeFromKeyboard(): void {
    if (this.mobileOpen()) {
      this.mobileOpen.set(false);
      this.menuButton()?.nativeElement.focus();
    }
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private readAnchored(): boolean | null {
    const key = this.stateKey();
    if (!key) {
      return null;
    }
    try {
      const value = this.storage()?.getItem(key);
      return value === null || value === undefined ? null : value === 'true';
    } catch {
      return null;
    }
  }

  private writeAnchored(value: boolean): void {
    const key = this.stateKey();
    if (!key) {
      return;
    }
    try {
      this.storage()?.setItem(key, String(value));
    } catch {
      return;
    }
  }
}
