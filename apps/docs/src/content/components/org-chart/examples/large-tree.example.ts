import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxOrgChart, TxOrgChartNode } from '@tectra-ng/charts/org-chart';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

const TEAMS = ['Design', 'Web', 'Mobile', 'Platform', 'Data', 'Support', 'Sales'];
const NAMES = ['Ada', 'Ben', 'Cleo', 'Dan', 'Eva', 'Finn', 'Gus', 'Hana', 'Ivan'];

const TREE: TxOrgChartNode[] = [
  {
    id: 'ceo',
    title: 'Ada Brooks',
    subtitle: 'Chief Executive Officer',
    avatar: { name: 'Ada Brooks' },
    children: TEAMS.map((team) => ({
      id: team,
      title: `${team} lead`,
      subtitle: `${NAMES.length} people`,
      icon: 'users',
      collapsible: true,
      expanded: true,
      children: NAMES.map((name) => ({
        id: `${team}-${name}`,
        title: `${name} ${team[0]}.`,
        subtitle: team,
        avatar: { name: `${name} ${team}` },
      })),
    })),
  },
];

@Component({
  selector: 'org-chart-large-tree-example',
  imports: [FormsModule, TxOrgChart, TxToggleSwitch],
  template: `
    <div class="wrap">
      <tx-toggle-switch label="Hotkeys on the whole page" [(ngModel)]="pageHotkeys" />
      <tx-org-chart
        [nodes]="nodes()"
        [minFitZoom]="0"
        [pageHotkeys]="pageHotkeys"
        height="460px"
        (nodeToggle)="toggle($event)"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartLargeTreeExample {
  readonly nodes = signal<TxOrgChartNode[]>(TREE);
  pageHotkeys = false;

  toggle(id: string): void {
    this.nodes.update((nodes) =>
      nodes.map((root) => ({
        ...root,
        children: root.children?.map((team) =>
          team.id === id ? { ...team, expanded: !team.expanded } : team,
        ),
      })),
    );
  }
}
