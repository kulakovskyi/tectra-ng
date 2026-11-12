import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, InjectionToken, Signal, TemplateRef, afterRenderEffect, computed, inject, signal } from '@angular/core';
import { injectTokens, TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxPlacement, parsePlacement, txArrowOffset } from '@tectra-ng/core/overlay';
import { TxTooltipContent, TxTooltipContext, TxTooltipPart } from './tooltip.types';
import { TOOLTIP_THEME } from './tooltip.theme';

export interface TxTooltipPanelState {
  id: string;
  origin: HTMLElement;
  content: Signal<TxTooltipContent>;
  context: Signal<TxTooltipContext>;
  placement: Signal<TxPlacement>;
  arrow: Signal<boolean>;
  interactive: Signal<boolean>;
  hiddenFromReaders: Signal<boolean>;
  multiline: Signal<boolean>;
  unstyled: Signal<boolean>;
  passThrough: Signal<TxResolvedPassThrough<TxTooltipPart>>;
  style: Signal<Record<string, string>>;
  panelClass: Signal<string | undefined>;
  pointerEnter(): void;
  pointerLeave(): void;
}

export const TX_TOOLTIP_PANEL = new InjectionToken<TxTooltipPanelState>('TX_TOOLTIP_PANEL');

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
