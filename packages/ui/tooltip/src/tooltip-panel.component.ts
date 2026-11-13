import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, InjectionToken, Signal, TemplateRef, afterRenderEffect, computed, inject, signal } from '@angular/core';
import { injectTokens, TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxPlacement, parsePlacement, txArrowOffset } from '@tectra-ng/core/overlay';
import { TxTooltipContent, TxTooltipContext, TxTooltipPart } from './tooltip.types';
import { TOOLTIP_THEME } from './tooltip.theme';

/** What `txTooltip` gives its panel to render: content, placement, look and pointer hooks. */
export interface TxTooltipPanelState {
  /** Id of the panel element. */
  id: string;
  /** Element the tooltip belongs to. */
  origin: HTMLElement;
  /** Text, number or template shown in the panel. */
  content: Signal<TxTooltipContent>;
  /** Context passed to a template content. */
  context: Signal<TxTooltipContext>;
  /** Side of the element where the panel opens. */
  placement: Signal<TxPlacement>;
  /** Whether the arrow is shown. */
  arrow: Signal<boolean>;
  /** Whether the pointer can move onto the panel. */
  interactive: Signal<boolean>;
  /** Hides the panel from screen readers because the text is already read through `aria-describedby`. */
  hiddenFromReaders: Signal<boolean>;
  /** Whether long text wraps onto several lines. */
  multiline: Signal<boolean>;
  /** Whether the tectra styles are removed. */
  unstyled: Signal<boolean>;
  /** Resolved `pt` classes and styles of the parts. */
  passThrough: Signal<TxResolvedPassThrough<TxTooltipPart>>;
  /** Inline CSS variables from the `tooltipDt` input. */
  style: Signal<Record<string, string>>;
  /** Extra class of the panel (the `tooltipClass` input). */
  panelClass: Signal<string | undefined>;
  /** Called when the pointer enters the panel. */
  pointerEnter(): void;
  /** Called when the pointer leaves the panel. */
  pointerLeave(): void;
}

/** Gives `tx-tooltip` its `TxTooltipPanelState`. */
export const TX_TOOLTIP_PANEL = new InjectionToken<TxTooltipPanelState>('TX_TOOLTIP_PANEL');

/** The tooltip bubble that `txTooltip` opens in an overlay; not used directly. */
@Component({
  selector: 'tx-tooltip',
  imports: [NgTemplateOutlet],
  template: `
    @if (state.arrow()) {
      <span class="tx-tooltip__arrow" [class]="state.passThrough().arrow?.class" [style]="state.passThrough().arrow?.style" aria-hidden="true"></span>
    }
    <div class="tx-tooltip__content" [class]="state.passThrough().content?.class" [style]="state.passThrough().content?.style">
      @if (template(); as template) {
        <ng-container *ngTemplateOutlet="template; context: state.context()" />
      } @else {
        {{ state.content() }}
      }
    </div>
  `,
  styleUrl: './tooltip-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tooltip',
    role: 'tooltip',
    '[id]': 'state.id',
    '[class]': 'rootClass()',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!state.unstyled() || null',
    '[attr.data-side]': 'side()',
    '[attr.data-placement]': 'state.placement()',
    '[attr.aria-hidden]': 'state.hiddenFromReaders() || null',
    '[class.tx-tooltip--interactive]': 'state.interactive()',
    '[class.tx-tooltip--multiline]': 'state.multiline()',
    '(mouseenter)': 'state.pointerEnter()',
    '(mouseleave)': 'state.pointerLeave()',
  },
})
export class TxTooltipPanel {
  private readonly tooltipTheme = injectTokens(TOOLTIP_THEME);

  readonly state = inject(TX_TOOLTIP_PANEL);

  private readonly originSize = signal({ width: 0, height: 0 });

  readonly template = computed(() => {
    const content = this.state.content();
    return content instanceof TemplateRef ? content : null;
  });
  readonly side = computed(() => parsePlacement(this.state.placement()).side);
  readonly rootClass = computed(() => [this.state.passThrough().root?.class, this.state.panelClass()].filter(Boolean).join(' '));
  readonly arrowOffset = computed(() => txArrowOffset(this.state.placement(), this.originSize()));
  readonly hostStyle = computed(() => ({
    ...this.state.style(),
    '--tx-tooltip-arrow-offset': this.arrowOffset(),
    ...this.state.passThrough().root?.style,
  }));

  constructor() {
    afterRenderEffect(() => {
      this.state.placement();
      const { width, height } = this.state.origin.getBoundingClientRect();
      const current = this.originSize();
      if (current.width !== width || current.height !== height) {
        this.originSize.set({ width, height });
      }
    });
  }
}
