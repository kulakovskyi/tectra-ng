import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxOrgChart, TxOrgChartNode } from '@tectra-ng/charts/org-chart';

@Component({
  selector: 'org-chart-header-and-labels-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart
      [nodes]="nodes"
      [labels]="{
        title: 'Support rota',
        hint: 'Drag the board, scroll to zoom',
        search: 'Find an agent',
        expandAll: 'Open all',
        collapseAll: 'Close all',
      }"
      [minimap]="false"
      height="360px"
    >
      <div txOrgChartHeader class="heading">
        <strong>Support rota</strong>
        <span>Week 46</span>
      </div>
    </tx-org-chart>
  `,
  styles: `
    .heading {
      display: grid;
      gap: 2px;
    }
    .heading span {
      font-size: 13px;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartHeaderAndLabelsExample {
  readonly nodes: TxOrgChartNode[] = [
    {
      id: 'duty',
      title: 'Paula Reed',
      subtitle: 'Duty manager',
      avatar: { name: 'Paula Reed' },
      children: [
        {
          id: 'early',
          title: 'Quinn Shaw',
          subtitle: 'Early shift',
          avatar: { name: 'Quinn Shaw' },
        },
        { id: 'late', title: 'Rosa Tate', subtitle: 'Late shift', avatar: { name: 'Rosa Tate' } },
      ],
    },
  ];
}
