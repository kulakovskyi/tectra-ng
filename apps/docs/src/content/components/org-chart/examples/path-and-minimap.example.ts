import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxOrgChart, TxOrgChartNode } from '@tectra-ng/charts/org-chart';

function person(id: string, title: string, subtitle: string): TxOrgChartNode {
  return { id, kind: 'person', title, subtitle, avatar: { name: title } };
}

@Component({
  selector: 'org-chart-path-and-minimap-example',
  imports: [TxOrgChart],
  template: `
    <tx-org-chart [nodes]="nodes" [pathKinds]="['person']" [toolbar]="false" height="440px" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartPathAndMinimapExample {
  readonly nodes: TxOrgChartNode[] = [
    {
      ...person('head', 'Olga Quinn', 'Head of engineering'),
      minimapTone: 'primary',
      children: ['Frontend', 'Backend', 'Data', 'QA'].map((team, index) => ({
        id: `team-${index}`,
        kind: 'team',
        title: team,
        icon: 'users',
        minimapTone: 'accent',
        children: [1, 2, 3].map((n) => ({
          ...person(`p-${index}-${n}`, `${team} engineer ${n}`, n === 1 ? 'Lead' : 'Engineer'),
          minimapTone: n === 1 ? 'default' : 'muted',
        })),
      })),
    },
  ];
}
