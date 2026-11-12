import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TxChartFrame,
  TxChartHeight,
  TxChartPointerEvent,
  TxChartTooltipData,
  TxChartTooltipFormatter,
  TxChartTooltipTemplate,
  TxChartValueFormat,
  chartNumberFormatter,
  chartSummary,
  initialChartSize,
  injectChartEntrance,
  seriesColor,
} from '@tectra-ng/charts/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { insetRect, squarify, treemapValue } from './treemap-layout';
import { TxTreemapTileTemplate } from './treemap-tile.directive';
import { TxTreemapGroup, TxTreemapItem, TxTreemapPart, TxTreemapTile, TxTreemapTileContext, TxTreemapTileEvent } from './treemap.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TREEMAP_ICON_DEFAULTS } from './treemap.icons';
import { TREEMAP_THEME } from './treemap.theme';

const LABEL_SIZE = 13;
const VALUE_SIZE = 12;
const LABEL_PADDING = 8;
const MIN_LABEL_WIDTH = 36;
const GROUP_HEADER = 22;
const GROUP_PADDING = 3;

@Component({
  selector: 'tx-treemap',
  imports: [TxChartFrame, NgTemplateOutlet],
  templateUrl: './treemap.component.html',
  styleUrl: './treemap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-treemap',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-treemap--entering]': 'entrance.active()',
    '[class.tx-treemap--hovering]': 'hovered() !== null',
  },
  viewProviders: [provideTxIconDefaults(TREEMAP_ICON_DEFAULTS)],
})
export class TxTreemap {
  private readonly treemapTheme = injectTokens(TREEMAP_THEME);

  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxTreemapItem[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(350);
  readonly showDataLabels = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showValues = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly tooltipFormatter = input<TxChartTooltipFormatter | null>(null);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTreemapPart, TxTreemap> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly tileClick = output<TxTreemapTileEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  readonly tileTemplate = contentChild(TxTreemapTileTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('treemap', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();

  readonly size = linkedSignal(() => initialChartSize(this.height(), null));
  readonly hovered = signal<number | null>(null);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => chartNumberFormatter(this.intl(), 'percent'));

  readonly roots = computed(() => (this.items() ?? []).filter((item) => treemapValue(item) > 0));
  readonly total = computed(() => this.roots().reduce((sum, item) => sum + treemapValue(item), 0));
  readonly isEmpty = computed(() => this.total() <= 0);

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const total = this.total();
    const tiles: TxTreemapTile[] = [];
    const groups: TxTreemapGroup[] = [];
    const roots = this.roots();
    const nodes = squarify(
      roots.map((item) => ({ value: treemapValue(item), item })),
      { x: 0, y: 0, width, height },
    );
    for (const node of nodes) {
      const color = seriesColor(node.item.color, node.index);
      const children = (node.item.children ?? []).filter((child) => treemapValue(child) > 0);
      if (!children.length) {
        tiles.push(this.tile(node, [node.index], node.item.label, null, color, total));
        continue;
      }
      groups.push({ key: `g${node.index}`, label: node.item.label, value: node.value, color, x: node.x, y: node.y, width: node.width, height: node.height });
      const inner = insetRect({ x: node.x, y: node.y + GROUP_HEADER, width: node.width, height: Math.max(0, node.height - GROUP_HEADER) }, GROUP_PADDING * 2);
      for (const child of squarify(children.map((item) => ({ value: treemapValue(item), item })), inner)) {
        tiles.push(this.tile(child, [node.index, child.index], child.item.label, node.item.label, child.item.color ?? color, total));
      }
    }
    return { tiles: tiles.map((tile, index) => ({ ...tile, index })), groups };
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const index = this.hovered();
    if (index === null || !this.showTooltip()) return null;
    const tile = this.layout().tiles[index];
    if (!tile) return null;
    const custom = this.tooltipFormatter();
    const value = custom ? custom(tile.value, { seriesIndex: tile.path[0], dataPointIndex: index }) : this.valueFormatter()(tile.value);
    return {
      title: tile.group ?? '',
      rows: [{ label: tile.label, value, share: this.percentFormatter()(Number(tile.share.toFixed(1))), color: tile.color, raw: tile.value, seriesIndex: tile.path[0], active: true }],
      index,
      x: tile.x + tile.width / 2,
      y: tile.y,
      placement: 'top',
    };
  });

  readonly summary = computed(() => {
    const t = this.translations();
    const text = `${chartSummary(t, this.intl(), t.chartTreemap, 1, this.layout().tiles.length, null)}, ${t.chartTotal.toLocaleLowerCase(this.intl())} ${this.valueFormatter()(this.total())}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    const format = this.valueFormatter();
    const percent = this.percentFormatter();
    return {
      columns: [
        { key: 'value', label: t.chartValue },
        { key: 'share', label: t.chartShare },
      ],
      rows: this.layout().tiles.map((tile) => ({
        label: tile.group ? `${tile.group} / ${tile.label}` : tile.label,
        cells: [format(tile.value), percent(Number(tile.share.toFixed(1)))],
      })),
    };
  });

  tileContext(tile: TxTreemapTile): TxTreemapTileContext {
    return {
      $implicit: tile,
      tile,
      label: tile.label,
      value: tile.valueText,
      share: this.percentFormatter()(Number(tile.share.toFixed(1))),
      color: tile.color,
      width: tile.width,
      height: tile.height,
    };
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.hovered.set(null);
      return;
    }
    const index = this.layout().tiles.findIndex((tile) => event.x >= tile.x && event.x <= tile.x + tile.width && event.y >= tile.y && event.y <= tile.y + tile.height);
    this.hovered.set(index >= 0 ? index : null);
    if (event.type === 'click' && index >= 0) {
      const tile = this.layout().tiles[index];
      this.tileClick.emit({ index, path: tile.path, label: tile.label, group: tile.group, value: tile.value, share: tile.share });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hovered.set(null);
      return;
    }
    const count = this.layout().tiles.length;
    if (!count) return;
    const current = this.hovered();
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : current === null ? (forward ? 0 : count - 1) : (current + (forward ? 1 : -1) + count) % count;
    this.hovered.set(next);
    const tile = this.layout().tiles[next];
    this.frame()?.announce(`${tile.group ? `${tile.group}, ` : ''}${tile.label}: ${this.valueFormatter()(tile.value)}, ${this.percentFormatter()(Number(tile.share.toFixed(1)))}`);
  }

  private tile(node: { x: number; y: number; width: number; height: number; value: number }, path: number[], label: string, group: string | null, color: string, total: number): TxTreemapTile {
    const nameFits = this.showDataLabels() && node.width >= MIN_LABEL_WIDTH && node.height >= LABEL_SIZE + LABEL_PADDING * 2;
    const value = this.valueFormatter()(node.value);
    const valueFits = nameFits && this.showValues() && node.height >= LABEL_SIZE + VALUE_SIZE + LABEL_PADDING * 2 + 4;
    return {
      key: path.join('.'),
      index: 0,
      path,
      label,
      group,
      value: node.value,
      share: (node.value / total) * 100,
      color,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      nameFits,
      valueFits,
      valueText: value,
    };
  }
}
