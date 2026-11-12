import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, computed, input, output } from '@angular/core';
import { TxOrgChartCard } from './org-chart-card.component';
import { TxOrgChartNodeSkeleton } from './org-chart-node-skeleton.component';
import { orgChartChildren } from './org-chart-tree';
import { TxOrgChartNode, TxOrgChartNodeContext, TxOrgChartTreeState } from './org-chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { ORG_CHART_ICON_DEFAULTS } from './org-chart.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { ORG_CHART_THEME } from './org-chart.theme';

@Component({
  selector: 'tx-org-chart-node',
  imports: [NgTemplateOutlet, TxOrgChartCard, TxOrgChartNodeSkeleton],
  templateUrl: './org-chart-node.component.html',
  styleUrl: './org-chart-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart-node',
    '[attr.data-styled]': '!state().unstyled || null',
    '[class.tx-org-chart-node--root]': 'root()',
    role: 'listitem',
  },
  viewProviders: [provideTxIconDefaults(ORG_CHART_ICON_DEFAULTS)],
})
export class TxOrgChartNodeView {
  private readonly orgChartTheme = injectTokens(ORG_CHART_THEME);

  readonly node = input.required<TxOrgChartNode>();
  readonly state = input.required<TxOrgChartTreeState>();
  readonly template = input<TemplateRef<TxOrgChartNodeContext> | null>(null);
  readonly root = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly path = input<readonly string[]>([]);

  readonly toggleNode = output<string>();
  readonly hoverPath = output<string[] | null>();
  readonly nodeClick = output<TxOrgChartNode>();

  readonly childPath = computed(() => [...this.path(), this.node().id]);
  readonly children = computed(() => orgChartChildren(this.node()));
  private readonly hasHoverPath = computed(() => {
    const kinds = this.state().pathKinds;
    return !kinds || kinds.includes(this.node().kind ?? '');
  });
  readonly context = computed<TxOrgChartNodeContext>(() => {
    const node = this.node();
    const state = this.state();
    return {
      $implicit: node,
      node,
      highlighted: state.highlightIds.has(node.id),
      inPath: state.pathIds.has(node.id),
      toggle: () => this.toggleNode.emit(node.id),
    };
  });

  onKey(event: Event): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.nodeClick.emit(this.node());
  }

  onHover(entering: boolean): void {
    if (this.hasHoverPath()) {
      this.hoverPath.emit(entering ? this.childPath() : null);
    }
  }
}
