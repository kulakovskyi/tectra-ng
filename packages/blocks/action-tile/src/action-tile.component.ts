import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraActionTileTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxActionTilePart } from './action-tile.types';
import { ACTION_TILE_ICON_DEFAULTS } from './action-tile.icons';
import { ACTION_TILE_THEME } from './action-tile.theme';

@Component({
  selector: 'tx-action-tile',
  imports: [TxIcon],
  template: `
    <button
      type="button"
      class="tx-action-tile__button"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [class]="passThrough().button?.class"
      [style]="passThrough().button?.style"
      (click)="onClick()"
    >
      @if (icon(); as icon) {
        <span class="tx-action-tile__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
          <tx-icon [name]="icon" />
        </span>
      }
      <span class="tx-action-tile__body" [class]="passThrough().body?.class" [style]="passThrough().body?.style">
        <span class="tx-action-tile__title" [class]="passThrough().title?.class" [style]="passThrough().title?.style">{{ title() }}</span>
        @if (text()) {
          <span class="tx-action-tile__text" [class]="passThrough().text?.class" [style]="passThrough().text?.style">{{ text() }}</span>
        }
      </span>
      <span class="tx-action-tile__end" aria-hidden="true" [class]="passThrough().end?.class" [style]="passThrough().end?.style">
        <tx-icon [class.tx-action-tile__spinner]="loading()" [name]="loading() ? 'spinner' : 'angle-right'" />
      </span>
    </button>
  `,
  styleUrl: './action-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-action-tile',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.title]': 'null',
    '[class.tx-action-tile--loading]': 'loading()',
    '[class.tx-action-tile--disabled]': 'disabled()',
  },
  viewProviders: [provideTxIconDefaults(ACTION_TILE_ICON_DEFAULTS)],
})
export class TxActionTile {
  private readonly actionTileTheme = injectTokens(ACTION_TILE_THEME);

  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly title = input.required<string>();
  readonly text = input<string | undefined>(undefined);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraActionTileTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxActionTilePart, TxActionTile> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly tileClick = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('actionTile', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-action-tile'), ...this.passThrough().root?.style }));

  protected onClick(): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.tileClick.emit();
  }
}
