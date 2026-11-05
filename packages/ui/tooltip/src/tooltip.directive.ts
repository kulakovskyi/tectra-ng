import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { linkAriaReference, uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxOverlay, TxOverlayRef, TxPlacement } from '@tectra/core/overlay';
import { optionalBoolean, optionalNumber } from '@tectra/core/utils';
import { TectraDeepPartial, TectraTooltipTokens, toStyleObject } from '@tectra/themes';
import { TX_TOOLTIP_DEFAULTS, TX_TOOLTIP_OPTIONS } from './tooltip.options';
import { TX_TOOLTIP_PANEL, TxTooltipPanel, TxTooltipPanelState } from './tooltip-panel.component';
import { TxTooltipHandle, TxTooltipRegistry } from './tooltip-registry.service';
import { TxTooltipContent, TxTooltipContext, TxTooltipEvent, TxTooltipPart } from './tooltip.types';

const FORM_CONTROL = 'input, select, textarea';
const NAMED_CHILD = 'img[alt]:not([alt=""]), [aria-label]:not([aria-hidden="true"])';
const INTERACTIVE_HIDE_DELAY = 100;

function isFocusVisible(element: Element): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

@Directive({
  selector: '[txTooltip]',
  exportAs: 'txTooltip',
  host: {
    '(mouseenter)': 'onPointerEnter()',
    '(mouseleave)': 'onPointerLeave()',
    '(pointerdown)': 'onPointerDown($event)',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TxTooltip implements TxTooltipHandle {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private overlay = inject(TxOverlay);
  private injector = inject(Injector);
  private viewContainerRef = inject(ViewContainerRef);
  private registry = inject(TxTooltipRegistry);
  private options = { ...TX_TOOLTIP_DEFAULTS, ...inject(TX_TOOLTIP_OPTIONS, { optional: true }) };

  readonly txTooltip = input<TxTooltipContent>(undefined);
  readonly tooltipPlacement = input<TxPlacement | undefined>(undefined);
  readonly tooltipEvent = input<TxTooltipEvent | undefined>(undefined);
  readonly tooltipShowDelay = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly tooltipHideDelay = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly tooltipLife = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly tooltipOffset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly tooltipArrow = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly tooltipInteractive = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly tooltipDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltipOverflowOnly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltipMultiline = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltipContext = input<unknown>(undefined);
  readonly tooltipClass = input<string | undefined>(undefined);
  readonly tooltipDt = input<TectraDeepPartial<TectraTooltipTokens> | undefined>(undefined);
  readonly tooltipPt = input<TxPassThrough<TxTooltipPart, TxTooltip> | undefined>(undefined);
  readonly tooltipPtOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly tooltipUnstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly tooltipShown = output<void>();
  readonly tooltipHidden = output<void>();

  private readonly ref = signal<TxOverlayRef<TxTooltipPanel> | null>(null);
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private lifeTimer: ReturnType<typeof setTimeout> | undefined;
  private hovered = false;
  private focused = false;
  private suppressed = false;
  private touched = false;
  private destroyed = false;

  readonly id = uniqueId('tx-tooltip');
  readonly isOpen = computed(() => this.ref() !== null);
  readonly placement = computed(() => this.tooltipPlacement() ?? this.options.placement);
  readonly event = computed(() => this.tooltipEvent() ?? this.options.event);
  readonly showDelay = computed(() => this.tooltipShowDelay() ?? this.options.showDelay);
  readonly hideDelay = computed(() => this.tooltipHideDelay() ?? this.options.hideDelay);
  readonly life = computed(() => this.tooltipLife() ?? this.options.life);
  readonly offset = computed(() => this.tooltipOffset() ?? this.options.offset);
  readonly arrow = computed(() => this.tooltipArrow() ?? this.options.arrow);
  readonly interactive = computed(() => this.tooltipInteractive() ?? this.options.interactive);
  readonly isUnstyled = injectUnstyled(this.tooltipUnstyled);
  readonly passThrough = injectPassThrough('tooltip', this, this.tooltipPt, this.tooltipPtOptions);
  readonly panelStyle = computed(() => toStyleObject(this.tooltipDt(), '--tx-tooltip'));
  readonly text = computed(() => {
    const content = this.txTooltip();
    return typeof content === 'string' || typeof content === 'number' ? String(content).trim() : '';
  });
  readonly template = computed(() => {
    const content = this.txTooltip();
    return content instanceof TemplateRef ? content : null;
  });
  readonly hasContent = computed(() => !this.tooltipDisabled() && (this.template() !== null || this.text() !== ''));
  readonly describesAhead = computed(() => this.text() !== '' && this.event() !== 'manual' && !this.tooltipOverflowOnly());
  readonly context = computed<TxTooltipContext>(() => ({ $implicit: this.tooltipContext(), close: () => this.hideNow() }));

  private readonly listensToHover = computed(() => this.event() === 'hover' || this.event() === 'both');
  private readonly listensToFocus = computed(() => this.event() === 'focus' || this.event() === 'both');

  constructor() {
    afterRenderEffect((onCleanup) => {
      const text = this.tooltipDisabled() || !this.describesAhead() ? '' : this.text();
      if (!text) {
        return;
      }
      const node = this.registry.describe(`${this.id}-text`);
      node.textContent = text;
      const unlink = linkAriaReference(this.host, this.needsName() ? 'aria-labelledby' : 'aria-describedby', node.id);
      onCleanup(() => {
        unlink();
        this.registry.forget(node);
      });
    });

    afterRenderEffect((onCleanup) => {
      if (this.ref() && !this.describesAhead()) {
        onCleanup(linkAriaReference(this.host, 'aria-describedby', this.id));
      }
    });

    afterRenderEffect(() => {
      this.txTooltip();
      this.tooltipContext();
      untracked(this.ref)?.updatePosition();
    });

    effect(() => {
      if (!this.hasContent()) {
        untracked(() => this.hideNow());
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.hideNow();
    });
  }

  show(delay = this.showDelay()): void {
    this.clearHide();
    if (!this.hasContent() || this.ref() || this.showTimer !== undefined) {
      return;
    }
    if (this.tooltipOverflowOnly() && !this.overflows()) {
      return;
    }
    const wait = this.registry.isWarm() ? 0 : delay;
    if (wait > 0) {
      this.showTimer = setTimeout(() => this.open(), wait);
    } else {
      this.open();
    }
  }

  hide(delay = this.hideDelay()): void {
    this.clearShow();
    if (!this.ref() || this.hideTimer !== undefined) {
      return;
    }
    const wait = this.interactive() ? Math.max(delay, INTERACTIVE_HIDE_DELAY) : delay;
    if (wait > 0) {
      this.hideTimer = setTimeout(() => this.hideNow(), wait);
    } else {
      this.hideNow();
    }
  }

  hideNow(): void {
    this.clearShow();
    this.clearHide();
    this.ref()?.close('api');
  }

  toggle(): void {
    if (this.ref()) {
      this.hideNow();
    } else {
      this.show(0);
    }
  }

  onPointerEnter(): void {
    if (this.touched) {
      this.touched = false;
      return;
    }
    this.hovered = true;
    if (this.listensToHover() && !this.suppressed) {
      this.show();
    }
  }

  onPointerLeave(): void {
    this.hovered = false;
    this.suppressed = false;
    if (this.listensToHover() && !(this.focused && this.listensToFocus())) {
      this.hide();
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.touched = event.pointerType === 'touch';
    if (this.listensToHover()) {
      this.suppressed = true;
      this.hideNow();
    }
  }

  onFocusIn(): void {
    this.focused = true;
    if (!this.listensToFocus() || this.suppressed) {
      return;
    }
    if (this.event() === 'focus' || isFocusVisible(this.host)) {
      this.show();
    }
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (this.host.contains(next) || this.ref()?.element.contains(next))) {
      return;
    }
    this.focused = false;
    if (this.event() === 'focus') {
      this.suppressed = false;
    }
    if (this.listensToFocus() && !(this.hovered && this.listensToHover())) {
      this.hide();
    }
  }

  private open(): void {
    this.showTimer = undefined;
    const state: TxTooltipPanelState = {
      id: this.id,
      origin: this.host,
      content: this.txTooltip,
      context: this.context,
      placement: computed(() => this.ref()?.placement() ?? this.placement()),
      arrow: this.arrow,
      interactive: this.interactive,
      hiddenFromReaders: this.describesAhead,
      multiline: this.tooltipMultiline,
      unstyled: this.isUnstyled,
      passThrough: this.passThrough,
      style: this.panelStyle,
      panelClass: this.tooltipClass,
      pointerEnter: () => this.onPanelEnter(),
      pointerLeave: () => this.onPanelLeave(),
    };
    this.registry.activate(this);
    const ref = this.overlay.open(TxTooltipPanel, {
      origin: this.host,
      viewContainerRef: this.viewContainerRef,
      injector: Injector.create({ providers: [{ provide: TX_TOOLTIP_PANEL, useValue: state }], parent: this.injector }),
      placement: this.placement(),
      offset: this.offset(),
      layer: 'tooltip',
      closeOnOutsideClick: false,
      restoreFocus: false,
      panelClass: 'tx-tooltip-pane',
    });
    ref.closed.subscribe((reason) => {
      this.ref.set(null);
      this.clearHide();
      this.clearLife();
      this.registry.release(this);
      if (reason === 'escape') {
        this.suppressed = true;
      }
      if (!this.destroyed) {
        this.tooltipHidden.emit();
      }
    });
    this.ref.set(ref);
    this.tooltipShown.emit();
    const life = this.life();
    if (life !== undefined && life > 0) {
      this.lifeTimer = setTimeout(() => this.hideNow(), life);
    }
  }

  private onPanelEnter(): void {
    if (this.interactive()) {
      this.clearHide();
    }
  }

  private onPanelLeave(): void {
    if (!this.hovered && !this.focused) {
      this.hide();
    }
  }

  private overflows(): boolean {
    return this.host.scrollWidth > this.host.clientWidth || this.host.scrollHeight > this.host.clientHeight;
  }

  private needsName(): boolean {
    const host = this.host;
    if (host.matches(FORM_CONTROL) || host.hasAttribute('aria-label') || host.hasAttribute('aria-labelledby')) {
      return false;
    }
    return !host.textContent?.trim() && !host.querySelector(NAMED_CHILD);
  }

  private clearShow(): void {
    clearTimeout(this.showTimer);
    this.showTimer = undefined;
  }

  private clearHide(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = undefined;
  }

  private clearLife(): void {
    clearTimeout(this.lifeTimer);
    this.lifeTimer = undefined;
  }
}
