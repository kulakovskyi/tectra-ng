import { InteractivityChecker } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { nextTabbable, tabbableElements, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlay, TxOverlayRef, TxOverlayScroll, TxPlacement, parsePlacement, txArrowOffset } from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPopoverTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPopoverContent, TxPopoverFooter, TxPopoverHeader } from './popover-slots.directive';
import { TxPopoverAutoFocus, TxPopoverCloseReason, TxPopoverContentContext, TxPopoverPart, TxPopoverTarget } from './popover.types';

@Component({
  selector: 'tx-popover',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-popover-host',
  },
})
export class TxPopover {
  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private checker = inject(InteractivityChecker);
  private document = inject(DOCUMENT);

  readonly placement = input<TxPlacement>('bottom-start');
  readonly offset = input<number, unknown>(10, { transform: numberAttribute });
  readonly arrow = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly header = input<string | undefined>(undefined);
  readonly closeButton = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dismissable = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly closeOnEscape = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly autoFocus = input<TxPopoverAutoFocus>('first');
  readonly restoreFocus = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly scroll = input<TxOverlayScroll>('reposition');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly panelClass = input<string | undefined>(undefined);
  readonly open = model(false);
  readonly dt = input<TectraDeepPartial<TectraPopoverTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPopoverPart, TxPopover> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<void>();
  readonly closed = output<TxPopoverCloseReason>();

  readonly headerSlot = contentChild(TxPopoverHeader);
  readonly footerSlot = contentChild(TxPopoverFooter);
  readonly lazyContent = contentChild(TxPopoverContent);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('popover', this, this.pt, this.ptOptions);
  readonly id = uniqueId('tx-popover');
  readonly titleId = `${this.id}-title`;

  private readonly ref = signal<TxOverlayRef | null>(null);
  private readonly anchor = signal<Element | null>(null);
  private readonly anchorSize = signal({ width: 0, height: 0 });
  private readonly shown = signal<TxOverlayRef | null>(null);
  private readonly triggers: Element[] = [];
  private closeReason: TxPopoverCloseReason | null = null;
  private destroyed = false;

  readonly isOpen = computed(() => this.ref() !== null);
  readonly currentPlacement = computed(() => this.shown()?.placement() ?? this.placement());
  readonly side = computed(() => parsePlacement(this.currentPlacement()).side);
  readonly hasTitle = computed(() => Boolean(this.header()) || Boolean(this.headerSlot()));
  readonly labelledBy = computed(() => this.ariaLabelledBy() ?? (this.hasTitle() && !this.ariaLabel() ? this.titleId : null));
  readonly panelStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-popover'),
    '--tx-popover-arrow-offset': this.arrowOffset(),
    ...this.passThrough().root?.style,
  }));
  readonly arrowOffset = computed(() => txArrowOffset(this.currentPlacement(), this.anchorSize(), 'var(--tx-popover-arrow-inset)'));
  readonly contentContext: TxPopoverContentContext = { $implicit: () => this.hide(), close: () => this.hide() };

  constructor() {
    effect(() => {
      const wanted = this.open();
      untracked(() => {
        if (wanted && !this.ref()) {
          this.show();
        } else if (!wanted && this.ref()) {
          this.hide();
        }
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.ref()?.close('api');
    });
  }

  show(target?: TxPopoverTarget): void {
    const anchor = this.resolve(target) ?? this.anchor() ?? this.triggers[0] ?? null;
    if (!anchor) {
      return;
    }
    const current = this.ref();
    if (current) {
      if (anchor === this.anchor()) {
        return;
      }
      this.closeReason = 'api';
      current.close('api');
    }
    this.anchor.set(anchor);
    const { width, height } = anchor.getBoundingClientRect();
    this.anchorSize.set({ width, height });
    const ref = this.overlay.open(this.panelTemplate(), {
      origin: anchor,
      viewContainerRef: this.viewContainerRef,
      placement: this.placement(),
      offset: this.offset(),
      layer: 'popover',
      scroll: this.scroll(),
      closeOnEscape: this.closeOnEscape(),
      closeOnOutsideClick: this.dismissable(),
      restoreFocus: this.restoreFocus(),
      panelClass: ['tx-popover-pane', ...(this.panelClass() ? [this.panelClass() as string] : [])],
    });
    ref.closed.subscribe((reason) => {
      if (this.ref() === ref) {
        this.ref.set(null);
        this.open.set(false);
      }
      const emitted = this.closeReason ?? reason;
      this.closeReason = null;
      if (!this.destroyed) {
        this.closed.emit(emitted);
      }
    });
    this.shown.set(ref);
    this.ref.set(ref);
    this.open.set(true);
    this.opened.emit();
    this.focusInitial(ref.element);
  }

  hide(): void {
    this.ref()?.close('api');
  }

  toggle(target?: TxPopoverTarget): void {
    const anchor = this.resolve(target);
    if (this.ref() && (!anchor || anchor === this.anchor())) {
      this.hide();
    } else {
      this.show(anchor);
    }
  }

  updatePosition(): void {
    this.ref()?.updatePosition();
  }

  isOpenFor(element: Element): boolean {
    return this.ref() !== null && this.anchor() === element;
  }

  registerTrigger(element: Element): () => void {
    this.triggers.push(element);
    return () => this.triggers.splice(this.triggers.indexOf(element), 1);
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const panel = event.currentTarget as HTMLElement;
    const items = tabbableElements(panel, this.checker);
    const active = this.document.activeElement;
    const atStart = !items.length || active === panel || active === items[0];
    const atEnd = !items.length || active === items[items.length - 1];
    if (event.shiftKey && atStart) {
      event.preventDefault();
      this.closeWith('tab');
    } else if (!event.shiftKey && atEnd) {
      event.preventDefault();
      const anchor = this.anchor();
      this.closeWith('tab');
      if (anchor) {
        nextTabbable(anchor, this.checker, panel)?.focus();
      }
    }
  }

  private closeWith(reason: TxPopoverCloseReason): void {
    this.closeReason = reason;
    this.ref()?.close('api');
  }

  private focusInitial(pane: HTMLElement): void {
    const panel = pane.querySelector<HTMLElement>('.tx-popover');
    if (!panel || this.autoFocus() === 'none') {
      return;
    }
    const first =
      this.autoFocus() === 'first'
        ? ['.tx-popover__content', '.tx-popover__footer', '.tx-popover']
            .map((selector) => panel.matches(selector) ? panel : panel.querySelector(selector))
            .map((part) => (part ? tabbableElements(part, this.checker)[0] : undefined))
            .find(Boolean)
        : undefined;
    (first ?? panel).focus({ preventScroll: true });
  }

  private resolve(target: TxPopoverTarget): Element | null {
    if (!target) {
      return null;
    }
    if (target instanceof Event) {
      return (target.currentTarget as Element | null) ?? (target.target as Element | null);
    }
    return target;
  }
}
