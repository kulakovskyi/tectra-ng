import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  TxOrgChart,
  TxOrgChartNode,
  orgChartExpandAll,
  orgChartReveal,
  orgChartSearch,
  orgChartToggle,
} from '@tectra-ng/charts/org-chart';

const TEAM: TxOrgChartNode[] = [
  {
    id: 'ceo',
    title: 'Ada Brooks',
    subtitle: 'Chief Executive Officer',
    avatar: { name: 'Ada Brooks' },
    pills: [{ label: '42 people', tone: 'primary', icon: 'users' }],
    minimapTone: 'primary',
    children: [
      {
        id: 'cto',
        title: 'Ben Cole',
        subtitle: 'Chief Technology Officer',
        avatar: { name: 'Ben Cole' },
        collapsible: true,
        expanded: true,
        children: [
          { id: 'web', title: 'Dana Fox', subtitle: 'Web lead', avatar: { name: 'Dana Fox' } },
          {
            id: 'mobile',
            title: 'Eli Grant',
            subtitle: 'Mobile lead',
            avatar: { name: 'Eli Grant' },
          },
          {
            id: 'infra',
            title: 'Fay Hill',
            subtitle: 'Platform lead',
            avatar: { name: 'Fay Hill' },
            pills: [{ label: 'On leave', tone: 'warn' }],
          },
        ],
      },
      {
        id: 'cfo',
        title: 'Carl Diaz',
        subtitle: 'Chief Financial Officer',
        avatar: { name: 'Carl Diaz' },
        collapsible: true,
        children: [
          { id: 'acc', title: 'Gina Ives', subtitle: 'Accounting', avatar: { name: 'Gina Ives' } },
          { id: 'pay', title: 'Hugo Jay', subtitle: 'Payroll', avatar: { name: 'Hugo Jay' } },
        ],
      },
      {
        id: 'coo',
        title: 'Iris Kent',
        subtitle: 'Chief Operating Officer',
        avatar: { name: 'Iris Kent' },
        collapsible: true,
        children: [
          { id: 'support', title: 'Jon Lake', subtitle: 'Support', avatar: { name: 'Jon Lake' } },
          {
            id: 'office',
            title: 'Kim Moss',
            subtitle: 'Office',
            avatar: { name: 'Kim Moss' },
            pills: [{ label: 'New', tone: 'success' }],
          },
        ],
      },
    ],
  },
];

@Component({
  selector: 'org-chart-basic-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart
      [nodes]="nodes()"
      [highlightIds]="matches()"
      [focusId]="matches()[0] ?? null"
      height="520px"
      (nodeToggle)="nodes.set(toggle(nodes(), $event))"
      (expandAll)="nodes.set(expandAll(nodes(), true))"
      (collapseAll)="nodes.set(expandAll(nodes(), false))"
      (searchChange)="search($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartBasicExample {
  readonly toggle = orgChartToggle;
  readonly expandAll = orgChartExpandAll;
  readonly nodes = signal<TxOrgChartNode[]>(TEAM);
  readonly query = signal('');
  readonly matches = computed(() => orgChartSearch(this.nodes(), this.query()));

  search(query: string): void {
    this.query.set(query);
    this.nodes.set(orgChartReveal(this.nodes(), orgChartSearch(this.nodes(), query)));
  }
}
