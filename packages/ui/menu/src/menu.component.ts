import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
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
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxOverlay, TxOverlayRef, TxPlacement, parsePlacement, txArrowInset, txArrowOffset } from '@tectra-ng/core/overlay';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraMenuTokens, toStyleObject } from '@tectra-ng/themes';
import { TxMenuFocus, TxMenuList, TxMenuVariant } from './menu-list.component';
import { TxMenuItem, TxMenuItemContext, TxMenuItemEvent, TxMenuPart } from './menu.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { MENU_ICON_DEFAULTS } from './menu.icons';
import { MENU_THEME } from './menu.theme';

@Directive({ selector: 'ng-template[txMenuItem]' })
export class TxMenuItemTemplate<T> {
  readonly template = inject<TemplateRef<TxMenuItemContext<T>>>(TemplateRef);
  readonly txMenuItemOf = input<readonly TxMenuItem<T>[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxMenuItemTemplate<T>, context: unknown): context is TxMenuItemContext<T> {
    return !!context;
  }
}

@Component({
  selector: 'tx-menu, tx-tiered-menu',
  imports: [NgTemplateOutlet, TxMenuList],
  template: `
    @if (!popup()) {
      <tx-menu-list
        panel="inline"
        [id]="id"
        [items]="model()"
        [tiered]="isTiered()"
        [itemTemplate]="itemTemplate()?.template ?? null"
        [unstyled]="isUnstyled()"
        [pt]="passThrough()"
        [ariaLabel]="ariaLabel()"
        [ariaLabelledBy]="ariaLabelledBy()"
        (selected)="onSelected($event)"
      />
    }
    <ng-template #panel let-focus="focus">
      @if (arrow()) {
        <div
          class="tx-menu-popup"
          [style]="arrowStyle()"
          [attr.data-styled]="!isUnstyled() || null"
          [attr.data-side]="side()"
          [attr.data-placement]="currentPlacement()"
        >
          <span class="tx-menu-popup__arrow" aria-hidden="true" [class]="passThrough().arrow?.class" [style]="passThrough().arrow?.style"></span>
          <ng-container [ngTemplateOutlet]="menuList" [ngTemplateOutletContext]="{ focus }" />
        </div>
      } @else {
        <ng-container [ngTemplateOutlet]="menuList" [ngTemplateOutletContext]="{ focus }" />
      }
    </ng-template>
    <ng-template #menuList let-focus="focus">
      <tx-menu-list
        panel="popup"
        [variant]="variant()"
        [id]="id"
        [style]="tokens()"
        [items]="model()"
        [tiered]="isTiered()"
        [focusOnInit]="focus"
        [itemTemplate]="itemTemplate()?.template ?? null"
        [unstyled]="isUnstyled()"
        [pt]="passThrough()"
        [ariaLabel]="ariaLabel()"
        [ariaLabelledBy]="ariaLabelledBy()"
        (selected)="onSelected($event)"
        (tabbed)="hide()"
      />
    </ng-template>
  `,
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-menu-host',
    '[style]': 'tokens()',
    '[style.display]': 'popup() ? "contents" : null',
  },
  viewProviders: [provideTxIconDefaults(MENU_ICON_DEFAULTS)],
})
export class TxMenu {
  private readonly menuTheme = injectTokens(MENU_THEME);

  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private tagName = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase();
  private triggers: Element[] = [];

  readonly model = input<TxMenuItem[]>([]);
  readonly popup = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tiered = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly placement = input<TxPlacement>('bottom-start');
  readonly offset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly arrow = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<TxMenuVariant>('default');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraMenuTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMenuPart, TxMenu> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemSelected = output<TxMenuItemEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly itemTemplate = contentChild(TxMenuItemTemplate);
  private readonly panel = viewChild.required<TemplateRef<{ focus: TxMenuFocus }>>('panel');

  readonly id = uniqueId('tx-menu');
  readonly isTiered = computed(() => this.tiered() ?? this.tagName === 'tx-tiered-menu');
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('menu', this, this.pt, this.ptOptions);
  readonly tokens = computed(() => toStyleObject(this.dt(), '--tx-menu'));

  private readonly ref = signal<TxOverlayRef | null>(null);
  private readonly shown = signal<TxOverlayRef | null>(null);
  private readonly anchor = signal<Element | null>(null);
  private readonly anchorSize = signal({ width: 0, height: 0 });
  private destroyed = false;
  readonly isOpen = computed(() => this.ref() !== null);
  readonly currentPlacement = computed(() => this.shown()?.placement() ?? this.placement());
  readonly side = computed(() => parsePlacement(this.currentPlacement()).side);
  readonly arrowStyle = computed(() => ({
    ...this.tokens(),
    '--tx-menu-arrow-offset': txArrowOffset(this.currentPlacement(), this.anchorSize(), 'var(--tx-menu-arrow-inset)'),
  }));

  constructor() {
    effect(() => {
      if (!this.popup()) {
        this.ref()?.close('api');
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.ref()?.close('api');
    });
  }

  show(target?: Element | Event | null, focus: TxMenuFocus = 'first', closeOnPointerDown = false): void {
    const anchor = this.resolve(target) ?? this.anchor() ?? this.triggers[0] ?? null;
    if (!anchor || !this.popup()) {
      return;
    }
    if (this.ref()) {
      if (anchor === this.anchor()) {
        return;
      }
      this.ref()?.close('api');
    }
    this.anchor.set(anchor);
    const { width, height } = anchor.getBoundingClientRect();
    this.anchorSize.set({ width, height });
    const ref = this.overlay.open(this.panel(), {
      origin: anchor,
      viewContainerRef: this.viewContainerRef,
      context: { focus },
      placement: this.placement(),
      offset: this.offset() ?? (this.arrow() ? 10 : 4),
      layer: 'dropdown',
      closeOnOutsideClick: !closeOnPointerDown,
      arrowInset: (pane) => txArrowInset(pane.querySelector('.tx-menu'), pane.querySelector('.tx-menu-popup__arrow')),
    });
    const stopWatching = closeOnPointerDown ? this.closeOnPointerDownOutside(ref) : () => undefined;
    ref.closed.subscribe(() => {
      stopWatching();
      if (this.ref() === ref) {
        this.ref.set(null);
      }
      if (!this.destroyed) {
        this.closed.emit();
      }
    });
    this.shown.set(ref);
    this.ref.set(ref);
    this.opened.emit();
  }

  hide(): void {
    this.ref()?.close('api');
  }

  toggle(target?: Element | Event | null, focus: TxMenuFocus = 'first'): void {
    const anchor = this.resolve(target);
    if (this.ref() && (!anchor || anchor === this.anchor())) {
      this.hide();
    } else {
      this.show(anchor, focus);
    }
  }

  isOpenFor(element: Element): boolean {
    return this.ref() !== null && this.anchor() === element;
  }

  registerTrigger(element: Element): () => void {
    this.triggers.push(element);
    return () => this.triggers.splice(this.triggers.indexOf(element), 1);
  }

  onSelected(event: TxMenuItemEvent): void {
    this.itemSelected.emit(event);
    this.hide();
  }

  private closeOnPointerDownOutside(ref: TxOverlayRef): () => void {
    const document = ref.element.ownerDocument;
    const listener = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest('tx-menu-list')) {
        ref.close('outside');
      }
    };
    document.addEventListener('pointerdown', listener, true);
    return () => document.removeEventListener('pointerdown', listener, true);
  }

  private resolve(target: Element | Event | null | undefined): Element | null {
    if (!target) {
      return null;
    }
    if (target instanceof Event) {
      return (target.currentTarget as Element | null) ?? (target.target as Element | null);
    }
    return target;
  }
}

@Directive({
  selector: '[txMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'txMenuTrigger().isOpenFor(host)',
    '[attr.aria-controls]': 'txMenuTrigger().isOpenFor(host) ? txMenuTrigger().id : null',
    '(click)': 'txMenuTrigger().toggle(host)',
    '(keydown.arrowdown)': 'open($event, "first")',
    '(keydown.arrowup)': 'open($event, "last")',
  },
  providers: [provideTxIconDefaults(MENU_ICON_DEFAULTS)],
})
export class TxMenuTrigger {
  private readonly menuTheme = injectTokens(MENU_THEME);

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly txMenuTrigger = input.required<TxMenu>();

  constructor() {
    effect((onCleanup) => onCleanup(this.txMenuTrigger().registerTrigger(this.host)));
  }

  open(event: Event, focus: TxMenuFocus): void {
    event.preventDefault();
    this.txMenuTrigger().show(this.host, focus);
  }
}
