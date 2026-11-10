import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxOrgChart, TxOrgChartNode, orgChartToggle } from '@tectra-ng/charts/org-chart';

const TEAMS: Record<string, TxOrgChartNode[]> = {
  design: [
    {
      id: 'design-1',
      title: 'Lia Novak',
      subtitle: 'Product designer',
      avatar: { name: 'Lia Novak' },
    },
    {
      id: 'design-2',
      title: 'Max Ortiz',
      subtitle: 'Brand designer',
      avatar: { name: 'Max Ortiz' },
    },
  ],
  research: [],
};

@Component({
  selector: 'org-chart-lazy-children-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart
      [nodes]="nodes()"
      [minimap]="false"
      height="420px"
      (nodeToggle)="toggle($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartLazyChildrenExample {
  readonly nodes = signal<TxOrgChartNode[]>([
    {
      id: 'lead',
      title: 'Nora Price',
      subtitle: 'Head of design',
      avatar: { name: 'Nora Price' },
      children: [
        {
          id: 'design',
          title: 'Design',
          subtitle: 'Two people',
          icon: 'palette',
          collapsible: true,
        },
        {
          id: 'research',
          title: 'Research',
          subtitle: 'Hiring',
          icon: 'search',
          collapsible: true,
          childrenEmptyText: 'No one yet',
        },
      ],
    },
  ]);

  toggle(id: string): void {
    const loaded = this.find(this.nodes(), id)?.children !== undefined;
    this.nodes.set(orgChartToggle(this.nodes(), id));
    if (loaded || !(id in TEAMS)) return;
    this.patch(id, { loading: true });
    setTimeout(() => this.patch(id, { loading: false, children: TEAMS[id] }), 900);
  }

  private patch(id: string, change: Partial<TxOrgChartNode>): void {
    const walk = (list: TxOrgChartNode[]): TxOrgChartNode[] =>
      list.map((node) =>
        node.id === id
          ? { ...node, ...change }
          : node.children
            ? { ...node, children: walk(node.children) }
            : node,
      );
    this.nodes.set(walk(this.nodes()));
  }

  private find(list: TxOrgChartNode[], id: string): TxOrgChartNode | undefined {
    for (const node of list) {
      if (node.id === id) return node;
      const inner = this.find(node.children ?? [], id);
      if (inner) return inner;
    }
    return undefined;
  }
}
