import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
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
  TxChartTooltipTemplate,
  TxChartValueFormat,
  chartNumberFormatter,
  initialChartSize,
  injectChartEntrance,
  readTokenNumber,
  textWidth,
} from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, formatMessage, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { sankeyLayout, sankeyLinkY } from './sankey-layout';
import { TxSankeyAlign, TxSankeyChartPart, TxSankeyLayoutLink, TxSankeyLayoutNode, TxSankeyLink, TxSankeyLinkEvent, TxSankeyNode, TxSankeyNodeEvent } from './sankey-chart.types';

const DEFAULTS = { nodeWidth: 12, nodePadding: 14, labelGap: 8, fontSize: 12 };
const PADDING = 4;
const HIT_SLACK = 3;

type TxSankeyActive = { kind: 'node'; index: number } | { kind: 'link'; index: number };

@Component({
  selector: 'tx-sankey-chart',
  imports: [TxChartFrame],
  templateUrl: './sankey-chart.component.html',
  styleUrl: './sankey-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-sankey-chart',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-sankey-chart--fill]': 'typeof height() === "string"',
    '[class.tx-sankey-chart--entering]': 'entrance.active()',
    '[class.tx-sankey-chart--morph]': 'morph()',
    '[class.tx-sankey-chart--active]': 'active() !== null',
  },
})
export class TxSankeyChart {
  private locale = inject(TxLocaleService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly translations = injectTranslations();

  readonly nodes = input<readonly TxSankeyNode[] | null | undefined>([]);
  readonly links = input<readonly TxSankeyLink[] | null | undefined>([]);
  readonly height = input<TxChartHeight>(360);
  readonly align = input<TxSankeyAlign>('justify');
  readonly showValues = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showTooltip = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSankeyChartPart, TxSankeyChart> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly nodeClick = output<TxSankeyNodeEvent>();
  readonly linkClick = output<TxSankeyLinkEvent>();

  readonly tooltipTemplate = contentChild(TxChartTooltipTemplate);
  private readonly frame = viewChild(TxChartFrame);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('sankeyChart', this, this.pt, this.ptOptions);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-chart'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  readonly entrance = injectChartEntrance();
  readonly morph = signal(false);
  readonly active = signal<TxSankeyActive | null>(null);
  readonly geometry = signal(DEFAULTS);

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly size = linkedSignal(() => initialChartSize(this.height(), null, undefined, this.toolbar()));
  readonly valueFormatter = computed(() => chartNumberFormatter(this.intl(), this.valueFormat()));
  readonly percentFormatter = computed(() => chartNumberFormatter(this.intl(), 'percent'));

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const { nodeWidth, nodePadding } = this.geometry();
    return sankeyLayout(this.nodes() ?? [], this.links() ?? [], { width: Math.max(1, width), height: Math.max(1, height - PADDING * 2), nodeWidth, nodePadding, align: this.align(), top: PADDING });
  });

  readonly isEmpty = computed(() => !this.layout().links.length);
  readonly drawnLinks = computed(() => [...this.layout().links].sort((a, b) => b.width - a.width));

  readonly labels = computed(() => {
    const { labelGap, fontSize } = this.geometry();
    const last = this.layout().columns - 1;
    const width = this.size().width;
    return this.layout().nodes.map((node) => {
      const before = node.depth === last && last > 0;
      const value = this.showValues() ? this.valueFormatter()(node.value) : '';
      const room = before ? node.x - labelGap : width - node.x - node.width - labelGap;
      const fits = textWidth(`${node.label} ${value}`, fontSize) <= room;
      return { key: node.id, x: before ? node.x - labelGap : node.x + node.width + labelGap, y: node.y + node.height / 2, anchor: before ? 'end' : 'start', label: node.label, value: fits ? value : '' };
    });
  });

  readonly related = computed(() => {
    const active = this.active();
    const layout = this.layout();
    if (!active) return null;
    if (active.kind === 'link') {
      const link = layout.links[active.index];
      return { links: new Set([link.index]), nodes: new Set([link.source.index, link.target.index]) };
    }
    const links = layout.links.filter((link) => link.source.index === active.index || link.target.index === active.index);
    return { links: new Set(links.map((link) => link.index)), nodes: new Set([active.index, ...links.flatMap((link) => [link.source.index, link.target.index])]) };
  });

  readonly tooltip = computed<TxChartTooltipData | null>(() => {
    const active = this.active();
    if (!active || !this.showTooltip()) return null;
    const t = this.translations();
    const format = this.valueFormatter();
    if (active.kind === 'node') {
      const node = this.layout().nodes[active.index];
      if (!node) return null;
      const rows = [
        ...(node.incoming ? [{ label: t.chartIncoming, value: format(node.incoming), color: node.color, raw: node.incoming, seriesIndex: 0 }] : []),
        ...(node.outgoing ? [{ label: t.chartOutgoing, value: format(node.outgoing), color: node.incoming ? 'transparent' : node.color, raw: node.outgoing, seriesIndex: 1 }] : []),
      ];
      return { title: node.label, rows, index: active.index, x: node.x + node.width / 2, y: node.y, placement: 'top' };
    }
    const link = this.layout().links[active.index];
    if (!link) return null;
    const share = link.source.outgoing ? (link.value / link.source.outgoing) * 100 : 0;
    const x = (link.source.x + link.source.width + link.target.x) / 2;
    return {
      title: formatMessage(t.chartFlow, { source: link.source.label, target: link.target.label }),
      rows: [{ label: t.chartValue, value: format(link.value), share: this.percentFormatter()(Number(share.toFixed(1))), color: link.color, raw: link.value, seriesIndex: 0 }],
      index: active.index,
      x,
      y: sankeyLinkY(link.source.x + link.source.width, link.y0, link.target.x, link.y1, x) - link.width / 2,
      placement: 'top',
    };
  });

  readonly order = computed(() => [...this.layout().nodes].sort((a, b) => a.depth - b.depth || a.y - b.y).map((node) => node.index));

  readonly summary = computed(() => {
    const t = this.translations();
    const text = `${t.chartSankey}, ${formatMessage(t.chartFlows, { count: this.layout().links.length }, this.intl())}`;
    return this.ariaLabel() ? `${this.ariaLabel()}. ${text}` : text;
  });

  readonly dataTable = computed(() => {
    const t = this.translations();
    return {
      columns: [{ key: 'value', label: t.chartValue }],
      rows: this.layout().links.map((link) => ({ label: formatMessage(t.chartFlow, { source: link.source.label, target: link.target.label }), cells: [this.valueFormatter()(link.value)] })),
    };
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.morph.set(true), 120));
    afterRenderEffect(() => {
      this.dt();
      this.readGeometry();
    });
  }

  isNodeDimmed(node: TxSankeyLayoutNode): boolean {
    const related = this.related();
    return !!related && !related.nodes.has(node.index);
  }

  isLinkLit(link: TxSankeyLayoutLink): boolean {
    return !!this.related()?.links.has(link.index);
  }

  onPointer(event: TxChartPointerEvent): void {
    if (event.type === 'leave') {
      this.active.set(null);
      return;
    }
    const hit = this.hitTest(event.x, event.y);
    this.active.set(hit);
    if (event.type !== 'click' || !hit) return;
    if (hit.kind === 'node') {
      const node = this.layout().nodes[hit.index];
      this.nodeClick.emit({ id: node.id, label: node.label, incoming: node.incoming, outgoing: node.outgoing });
    } else {
      const link = this.layout().links[hit.index];
      this.linkClick.emit({ source: link.source.id, target: link.target.id, value: link.value });
    }
  }

  onNavigate(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    const order = this.order();
    if (!order.length) return;
    const current = this.active();
    const at = current?.kind === 'node' ? order.indexOf(current.index) : -1;
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? order.length - 1 : at < 0 ? (forward ? 0 : order.length - 1) : Math.max(0, Math.min(order.length - 1, at + (forward ? 1 : -1)));
    const node = this.layout().nodes[order[next]];
    this.active.set({ kind: 'node', index: node.index });
    const t = this.translations();
    const format = this.valueFormatter();
    const parts = [node.incoming ? `${t.chartIncoming} ${format(node.incoming)}` : '', node.outgoing ? `${t.chartOutgoing} ${format(node.outgoing)}` : ''].filter(Boolean);
    this.frame()?.announce(`${node.label}: ${parts.join(', ')}`);
  }

  private hitTest(x: number, y: number): TxSankeyActive | null {
    const layout = this.layout();
    const node = layout.nodes.find((item) => x >= item.x - HIT_SLACK && x <= item.x + item.width + HIT_SLACK && y >= item.y - HIT_SLACK && y <= item.y + item.height + HIT_SLACK);
    if (node) return { kind: 'node', index: node.index };
    let best: TxSankeyLayoutLink | null = null;
    for (const link of layout.links) {
      const x0 = link.source.x + link.source.width;
      const x1 = link.target.x;
      if (x < x0 || x > x1) continue;
      const centre = sankeyLinkY(x0, link.y0, x1, link.y1, x);
      if (Math.abs(y - centre) <= link.width / 2 + 1 && (!best || link.width < best.width)) best = link;
    }
    return best ? { kind: 'link', index: best.index } : null;
  }

  private readGeometry(): void {
    const element = this.host.nativeElement;
    const next = {
      nodeWidth: readTokenNumber(element, '--tx-chart-sankey-node-width', DEFAULTS.nodeWidth),
      nodePadding: readTokenNumber(element, '--tx-chart-sankey-node-padding', DEFAULTS.nodePadding),
      labelGap: readTokenNumber(element, '--tx-chart-sankey-label-gap', DEFAULTS.labelGap),
      fontSize: readTokenNumber(element, '--tx-chart-sankey-label-font-size', DEFAULTS.fontSize),
    };
    const current = this.geometry();
    if ((Object.keys(next) as (keyof typeof next)[]).some((key) => next[key] !== current[key])) this.geometry.set(next);
  }
}
