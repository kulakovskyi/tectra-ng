import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
  signal,
} from '@angular/core';
import { TxOrgChart, TxOrgChartNode, TxOrgChartNodeContext } from '@tectra-ng/charts/org-chart';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'team-chart',
  imports: [TxCard, TxOrgChart],
  template: `
    <tx-card [title]="title()">
      <tx-org-chart
        [nodes]="nodes()"
        [toolbar]="false"
        [minimap]="false"
        [nodeTemplate]="card()"
        height="300px"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamChart {
  readonly title = input('');
  readonly nodes = input<TxOrgChartNode[]>([]);
  readonly card = contentChild('card', { read: TemplateRef<TxOrgChartNodeContext> });
}

@Component({
  selector: 'org-chart-template-input-example',
  imports: [TeamChart],
  template: `
    <team-chart title="Product team" [nodes]="nodes()">
      <ng-template #card let-node>
        <div class="person">
          <strong>{{ node.title }}</strong>
          <span>{{ node.subtitle }}</span>
        </div>
      </ng-template>
    </team-chart>
  `,
  styles: `
    .person {
      display: grid;
      justify-items: center;
      gap: 2px;
      width: 140px;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      background: var(--tx-surface-card);
      box-shadow: inset 0 0 0 1px var(--tx-surface-border);
    }
    .person span {
      font-size: 12px;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartTemplateInputExample {
  readonly nodes = signal<TxOrgChartNode[]>([
    {
      id: 'lead',
      title: 'Maya Lopez',
      subtitle: 'Product lead',
      children: [
        { id: 'design', title: 'Owen Clarke', subtitle: 'Design' },
        { id: 'web', title: 'Priya Natarajan', subtitle: 'Web' },
        { id: 'data', title: 'Leo Hoffmann', subtitle: 'Data' },
      ],
    },
  ]);
}
