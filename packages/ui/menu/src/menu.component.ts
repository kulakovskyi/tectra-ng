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
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxOverlay, TxOverlayRef, TxPlacement } from '@tectra/core/overlay';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraMenuTokens, toStyleObject } from '@tectra/themes';
import { TxMenuFocus, TxMenuList } from './menu-list.component';
import { TxMenuItem, TxMenuItemContext, TxMenuItemEvent, TxMenuPart } from './menu.types';

@Directive({ selector: 'ng-template[txMenuItem]' })
export class TxMenuItemTemplate {
  readonly template = inject<TemplateRef<TxMenuItemContext>>(TemplateRef);
}

@Component({
  selector: 'tx-menu, tx-tiered-menu',
  imports: [TxMenuList],
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
      <tx-menu-list
        panel="popup"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-menu-host',
    '[style]': 'tokens()',
    '[style.display]': 'popup() ? "contents" : null',
  },
})
export class TxMenu {
  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private tagName = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase();
  private triggers: Element[] = [];

  readonly model = input<TxMenuItem[]>([]);
  readonly popup = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tiered = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly placement = input<TxPlacement>('bottom-start');
  readonly offset = input<number, unknown>(4, { transform: numberAttribute });
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
  private readonly anchor = signal<Element | null>(null);
  private destroyed = false;
  readonly isOpen = computed(() => this.ref() !== null);

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
    const ref = this.overlay.open(this.panel(), {
      origin: anchor,
      viewContainerRef: this.viewContainerRef,
      context: { focus },
      placement: this.placement(),
      offset: this.offset(),
      layer: 'dropdown',
      closeOnOutsideClick: !closeOnPointerDown,
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
})
export class TxMenuTrigger {
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
