import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraEmptyStateTokens, toStyleObject } from '@tectra-ng/themes';
import { TxEmptyStatePart, TxEmptyStateSize, TxEmptyStateTone, TxEmptyStateVariant } from './empty-state.types';
import { EMPTY_STATE_ICON_DEFAULTS } from './empty-state.icons';

@Component({
  selector: 'tx-empty-state',
  imports: [TxIcon],
  template: `
    <span class="tx-empty-state__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
      <tx-icon [name]="icon()" />
    </span>
    @if (title() || text()) {
      <span class="tx-empty-state__body" [class]="passThrough().body?.class" [style]="passThrough().body?.style">
        @if (title()) {
          <span class="tx-empty-state__title" [class]="passThrough().title?.class" [style]="passThrough().title?.style">{{ title() }}</span>
        }
        @if (text()) {
          <span class="tx-empty-state__text" [class]="passThrough().text?.class" [style]="passThrough().text?.style">{{ text() }}</span>
        }
      </span>
    }
    <ng-content />
  `,
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-empty-state',
    role: 'status',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
  viewProviders: [provideTxIconDefaults(EMPTY_STATE_ICON_DEFAULTS)],
})
export class TxEmptyState {
  readonly icon = input<TxIconName | (string & {})>('inbox');
  readonly title = input<string | undefined>(undefined);
  readonly text = input<string | undefined>(undefined);
  readonly variant = input<TxEmptyStateVariant>('plain');
  readonly size = input<TxEmptyStateSize>('normal');
  readonly tone = input<TxEmptyStateTone>('primary');
  readonly dt = input<TectraDeepPartial<TectraEmptyStateTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxEmptyStatePart, TxEmptyState> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('emptyState', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-empty-state'), ...this.passThrough().root?.style }));
}
