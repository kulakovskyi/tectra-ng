import { ChangeDetectionStrategy, Component, DestroyRef, booleanAttribute, computed, forwardRef, inject, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraStatTilesTokens, toStyleObject } from '@tectra-ng/themes';
import { TX_STAT_TILES, TxStatTilesContext, TxStatTilesRelay } from './stat-tiles.context';
import { TxStatTilesPart } from './stat-tiles.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STAT_TILES_ICON_DEFAULTS } from './stat-tiles.icons';
import { STAT_TILES_THEME } from './stat-tiles.theme';

/** A responsive grid of key numbers made of `tx-stat-tile` elements. */
@Component({
  selector: 'tx-stat-tiles',
  template: '<ng-content />',
  styleUrl: './stat-tiles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_STAT_TILES, useExisting: forwardRef(() => TxStatTiles) }],
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
export class TxStatTiles implements TxStatTilesContext {
  private readonly statTilesTheme = injectTokens(STAT_TILES_THEME);

  readonly minWidth = input<string | undefined>(undefined);
  readonly floorWidth = input<string | null | undefined>(undefined);
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
    const floorWidth = this.floorWidth();
    return {
      ...(minWidth ? { '--tx-stat-tiles-floor-width': '0px' } : {}),
      ...toStyleObject(this.dt(), '--tx-stat-tiles'),
      ...(minWidth ? { '--tx-stat-tiles-min-width': minWidth } : {}),
      ...(floorWidth ? { '--tx-stat-tiles-floor-width': floorWidth } : {}),
      ...this.passThrough().root?.style,
    };
  });

  constructor() {
    const disconnect = inject(TxStatTilesRelay, { optional: true })?.connect(this);
    if (disconnect) {
      inject(DestroyRef).onDestroy(disconnect);
    }
  }
}
