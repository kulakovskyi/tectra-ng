import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraStatTileTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStatTiles } from './stat-tiles.component';
import { TxStatTileCommands, TxStatTilePart, TxStatTileTone } from './stat-tiles.types';
import { STAT_TILES_ICON_DEFAULTS } from './stat-tiles.icons';
import { STAT_TILES_THEME } from './stat-tiles.theme';

@Component({
  selector: 'tx-stat-tile',
  imports: [NgTemplateOutlet, RouterLink, TxIcon],
  templateUrl: './stat-tile.component.html',
  styleUrl: './stat-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-stat-tile',
    role: 'listitem',
    '[class]': 'passThrough().root?.class',
    '[class.tx-stat-tile--highlighted]': 'highlighted()',
    '[class.tx-stat-tile--link]': 'isLink()',
    '[class.tx-stat-tile--fit]': 'fitValue()',
    '[class.tx-stat-tile--compact]': 'isCompact()',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-tone]': 'tone()',
  },
  viewProviders: [provideTxIconDefaults(STAT_TILES_ICON_DEFAULTS)],
})
export class TxStatTile {
  private readonly statTilesTheme = injectTokens(STAT_TILES_THEME);

  private tiles = inject(TxStatTiles, { optional: true });

  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>(null);
  readonly unit = input<string | null | undefined>('');
  readonly icon = input<TxIconName | (string & {}) | null | undefined>(undefined);
  readonly meta = input<string | null | undefined>('');
  readonly tone = input<TxStatTileTone>('primary');
  readonly share = input<number | null | undefined>(null);
  readonly textValue = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly fitValue = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly accentValue = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly highlighted = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly link = input<TxStatTileCommands>(undefined);
  readonly queryParams = input<Params | null | undefined>(undefined);
  readonly href = input<string | null | undefined>(undefined);
  readonly target = input<string | null | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraStatTileTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxStatTilePart, TxStatTile> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('statTile', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-stat-tile'), ...this.passThrough().root?.style }));
  readonly isCompact = computed(() => this.tiles?.compact() ?? false);
  readonly isLink = computed(() => !!this.link() || !!this.href());
  readonly displayValue = computed(() => this.value() ?? '-');
  readonly valueTitle = computed(() => (this.textValue() ? String(this.displayValue()) : null));
  readonly sharePercent = computed(() => {
    const share = this.share();
    return share === null || share === undefined || Number.isNaN(share) ? null : Math.min(100, Math.max(0, share));
  });
  readonly rel = computed(() => (this.target() === '_blank' ? 'noopener noreferrer' : null));
}
