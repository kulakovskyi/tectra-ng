import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxConsoleRailItem } from './console-layout.types';
import { TX_CONSOLE_RAIL_EXACT_MATCH } from './console-rail-match';
import { CONSOLE_LAYOUT_ICON_DEFAULTS } from './console-layout.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { CONSOLE_LAYOUT_THEME } from './console-layout.theme';

@Component({
  selector: 'tx-console-rail',
  imports: [RouterLink, RouterLinkActive, TxIcon],
  template: `
    <nav class="tx-console-rail__nav" [attr.aria-label]="label() ?? null">
      @for (item of items(); track item.label) {
        @if (item.routerLink !== undefined) {
          <a
            class="tx-console-rail__item"
            routerLinkActive="tx-console-rail__item--active"
            ariaCurrentWhenActive="page"
            [class.tx-console-rail__item--active]="item.active"
            [routerLink]="item.routerLink"
            [queryParams]="item.queryParams"
            [routerLinkActiveOptions]="item.activeOptions ?? exactMatch"
            [attr.target]="item.target ?? null"
          >
            <tx-icon class="tx-console-rail__icon" aria-hidden="true" [name]="item.icon" />
            <span class="tx-console-rail__label">{{ item.label }}</span>
          </a>
        } @else if (item.url) {
          <a
            class="tx-console-rail__item"
            [class.tx-console-rail__item--active]="item.active"
            [attr.aria-current]="item.active ? 'page' : null"
            [attr.href]="item.url"
            [attr.target]="item.target ?? null"
          >
            <tx-icon class="tx-console-rail__icon" aria-hidden="true" [name]="item.icon" />
            <span class="tx-console-rail__label">{{ item.label }}</span>
          </a>
        } @else {
          <button
            type="button"
            class="tx-console-rail__item"
            [class.tx-console-rail__item--active]="item.active"
            [attr.aria-current]="item.active ? 'page' : null"
            (click)="item.command?.()"
          >
            <tx-icon class="tx-console-rail__icon" aria-hidden="true" [name]="item.icon" />
            <span class="tx-console-rail__label">{{ item.label }}</span>
          </button>
        }
      }
    </nav>
  `,
  styleUrl: './console-rail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-console-rail', '[attr.data-styled]': '!unstyled() || null' },
  viewProviders: [provideTxIconDefaults(CONSOLE_LAYOUT_ICON_DEFAULTS)],
})
export class TxConsoleRail {
  private readonly consoleLayoutTheme = injectTokens(CONSOLE_LAYOUT_THEME);

  readonly items = input.required<readonly TxConsoleRailItem[]>();
  readonly label = input<string | undefined>(undefined);
  readonly unstyled = input<boolean, unknown>(false, { transform: booleanAttribute });
  protected readonly exactMatch = TX_CONSOLE_RAIL_EXACT_MATCH;
}
