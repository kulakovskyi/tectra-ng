import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraStatTilesTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStatTilesPart } from './stat-tiles.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STAT_TILES_ICON_DEFAULTS } from './stat-tiles.icons';
import { STAT_TILES_THEME } from './stat-tiles.theme';

@Component({
  selector: 'tx-stat-tiles',
  template: '<ng-content />',
  styleUrl: './stat-tiles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-stat-tiles',
    role: 'list',
    '[class]': 'passThrough().root?.class',
    '[class.tx-stat-tiles--compact]': 'compact()',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
  },
  viewProviders: [provideTxIconDefaults(STAT_TILES_ICON_DEFAULTS)],
})
export class TxStatTiles {
  private readonly statTilesTheme = injectTokens(STAT_TILES_THEME);

  readonly minWidth = input<string | undefined>(undefined);
  readonly compact = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraStatTilesTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxStatTilesPart, TxStatTiles> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('statTiles', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => {
    const minWidth = this.minWidth();
    return {
      ...toStyleObject(this.dt(), '--tx-stat-tiles'),
      ...(minWidth ? { '--tx-stat-tiles-min-width': minWidth } : {}),
      ...this.passThrough().root?.style,
    };
  });
}
