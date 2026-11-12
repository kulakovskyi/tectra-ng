import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { injectTokens, TxPassThroughPart } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxChartLegendAlign, TxChartLegendContext, TxChartLegendItem, TxChartLegendPosition, TxChartLegendVariant } from './chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CORE_ICON_DEFAULTS } from './core.icons';
import { CORE_THEME } from './core.theme';

@Component({
  selector: 'tx-chart-legend',
  imports: [NgTemplateOutlet],
  template: `
    @for (item of items(); track item.key; let index = $index) {
      @if (toggle()) {
        <button
          type="button"
          class="tx-chart-legend__item"
          [class.tx-chart-legend__item--hidden]="item.hidden"
          [class]="itemPart()?.class"
          [style]="itemPart()?.style"
          [style.--tx-chart-legend-item-color]="item.color"
          [attr.aria-pressed]="!item.hidden"
          [attr.data-key]="item.key"
          [attr.data-marker]="item.marker"
          [tabindex]="index === 0 ? 0 : -1"
          (click)="toggled.emit(item.key)"
          (pointerenter)="hovered.emit(item.key)"
          (pointerleave)="hovered.emit(null)"
          (focus)="hovered.emit(item.key)"
          (blur)="hovered.emit(null)"
          (keydown)="onKeydown($event, index)"
        >
          <ng-container [ngTemplateOutlet]="template() ?? plain" [ngTemplateOutletContext]="{ $implicit: item, index }" />
        </button>
      } @else {
        <span
          class="tx-chart-legend__item"
          role="listitem"
          [class.tx-chart-legend__item--hidden]="item.hidden"
          [class]="itemPart()?.class"
          [style]="itemPart()?.style"
          [style.--tx-chart-legend-item-color]="item.color"
          [attr.data-key]="item.key"
          [attr.data-marker]="item.marker"
          (pointerenter)="hovered.emit(item.key)"
          (pointerleave)="hovered.emit(null)"
        >
          <ng-container [ngTemplateOutlet]="template() ?? plain" [ngTemplateOutletContext]="{ $implicit: item, index }" />
        </span>
      }
    }
    <ng-template #plain let-item>
      @if (variant() === 'stat') {
        <span class="tx-chart-legend__head">
          <span class="tx-chart-legend__marker" aria-hidden="true"></span>
          <span class="tx-chart-legend__label">{{ item.label }}</span>
        </span>
        <span class="tx-chart-legend__stat">{{ item.value ?? '—' }}</span>
        @if (item.caption) {
          <span class="tx-chart-legend__caption">{{ item.caption }}</span>
        }
      } @else {
        <span class="tx-chart-legend__marker" aria-hidden="true"></span>
        <span class="tx-chart-legend__label">{{ item.label }}</span>
        @if (item.value !== undefined) {
          <span class="tx-chart-legend__value">{{ item.value }}</span>
        }
        @if (item.percent !== undefined) {
          <span class="tx-chart-legend__percent">{{ item.percent }}</span>
        }
      }
    </ng-template>
  `,
  styleUrl: './chart-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-chart-legend',
    '[attr.role]': 'toggle() ? "group" : "list"',
    '[attr.aria-label]': 'translations().chartLegend',
    '[attr.data-position]': 'position()',
    '[attr.data-align]': 'align()',
    '[attr.data-variant]': 'variant()',
    '[class.tx-chart-legend--values]': 'hasValues()',
  },
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartLegend {
  private readonly coreTheme = injectTokens(CORE_THEME);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxChartLegendItem[]>([]);
  readonly position = input<TxChartLegendPosition>('top');
  readonly align = input<TxChartLegendAlign>('start');
  readonly variant = input<TxChartLegendVariant>('dot');
  readonly toggle = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly template = input<TemplateRef<TxChartLegendContext> | null | undefined>(null);
  readonly itemPart = input<TxPassThroughPart | undefined>(undefined);

  readonly toggled = output<string>();
  readonly hovered = output<string | null>();

  readonly hasValues = computed(() => this.variant() !== 'stat' && this.items().some((item) => item.value !== undefined || item.percent !== undefined));

  onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.items().length;
    const vertical = this.position() === 'left' || this.position() === 'right' || this.hasValues();
    const forward = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
    const back = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
    const next = forward.includes(event.key)
      ? (index + 1) % count
      : back.includes(event.key)
        ? (index - 1 + count) % count
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? count - 1
            : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    const buttons = this.host.nativeElement.querySelectorAll<HTMLElement>('.tx-chart-legend__item');
    buttons.forEach((button, position) => (button.tabIndex = position === next ? 0 : -1));
    buttons[next]?.focus();
  }
}
