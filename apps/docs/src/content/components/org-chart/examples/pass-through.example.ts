import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxOrgChart, TxOrgChartNode } from '@tectra-ng/charts/org-chart';

@Component({
  selector: 'org-chart-pass-through-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart
      [nodes]="nodes"
      [toolbar]="false"
      height="300px"
      [pt]="{
        canvas: { style: { backgroundImage: 'none' } },
        hint: { style: { fontStyle: 'italic' } },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartPassThroughExample {
  readonly nodes: TxOrgChartNode[] = [
    {
      id: 'owner',
      title: 'Vera Young',
      subtitle: 'Owner',
      icon: 'star',
      children: [{ id: 'manager', title: 'Will Zane', subtitle: 'Manager', icon: 'user' }],
    },
  ];
}
