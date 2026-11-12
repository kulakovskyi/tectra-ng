import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { nextListIndex } from '@tectra-ng/core/a11y';
import { injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { CORE_ICON_DEFAULTS } from './core.icons';

export interface TxChartMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const MENU_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

@Component({
  selector: 'tx-chart-menu',
  imports: [TxIcon],
  template: `
    <div #list class="tx-chart-menu__list" role="menu" tabindex="-1" [attr.aria-label]="ariaLabel() || null" [attr.data-styled]="!isUnstyled() || null" (keydown)="onKeydown($event)">
      @for (item of items(); track item.id) {
        <button type="button" role="menuitem" class="tx-chart-menu__item" [disabled]="item.disabled" (click)="selected.emit(item.id)">
          @if (item.icon) {
            <tx-icon class="tx-chart-menu__icon" aria-hidden="true" [name]="item.icon" />
          }
          <span class="tx-chart-menu__label">{{ item.label }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './chart-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-chart-menu' },
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartMenu {
  readonly items = input<readonly TxChartMenuItem[]>([]);
  readonly ariaLabel = input('');
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly selected = output<string>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  onKeydown(event: KeyboardEvent): void {
    if (!MENU_KEYS.has(event.key)) return;
    const items = Array.from(this.list()?.nativeElement.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const next = nextListIndex(event.key, { count: items.length, current: items.indexOf(event.target as HTMLButtonElement) });
    if (next === null) return;
    event.preventDefault();
    items[next]?.focus();
  }
}
