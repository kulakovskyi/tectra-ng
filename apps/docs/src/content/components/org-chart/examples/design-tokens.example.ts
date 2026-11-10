import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxOrgChart, TxOrgChartNode } from '@tectra-ng/charts/org-chart';

@Component({
  selector: 'org-chart-design-tokens-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart
      [nodes]="nodes"
      [toolbar]="false"
      [minimap]="false"
      height="320px"
      [dt]="{
        orgChart: {
          cardWidth: '220px',
          cardRadius: '16px',
          connectorColor: 'var(--tx-primary-300)',
          connectorRadius: '12px',
          canvasDotGap: '24px',
          pathColor: 'var(--tx-green-500)',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartDesignTokensExample {
  readonly nodes: TxOrgChartNode[] = [
    {
      id: 'chair',
      title: 'Sara Underwood',
      subtitle: 'Chair',
      avatar: { name: 'Sara Underwood' },
      children: [
        {
          id: 'board-1',
          title: 'Tom Vance',
          subtitle: 'Board member',
          avatar: { name: 'Tom Vance' },
        },
        {
          id: 'board-2',
          title: 'Uma Wells',
          subtitle: 'Board member',
          avatar: { name: 'Uma Wells' },
        },
      ],
    },
  ];
}
