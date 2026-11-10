import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxOrgChart, TxOrgChartNode, TxOrgChartNodeTemplate } from '@tectra-ng/charts/org-chart';
import { TxIcon } from '@tectra-ng/icons';
import { TxMessage } from '@tectra-ng/ui/message';

interface Unit {
  people: number;
  budget: string;
}

@Component({
  selector: 'org-chart-node-template-example',
  imports: [TxOrgChart, TxOrgChartNodeTemplate, TxIcon, TxMessage],
  template: `
    <div class="wrap">
      <tx-org-chart
        [nodes]="units"
        [toolbar]="false"
        height="380px"
        (nodeClick)="picked.set($event.title)"
      >
        <ng-template txOrgChartNode let-node let-inPath="inPath">
          <div class="unit" [class.unit--path]="inPath">
            <tx-icon [name]="node.icon ?? 'sitemap'" class="unit-icon" />
            <strong>{{ node.title }}</strong>
            <span>{{ unit(node).people }} people · {{ unit(node).budget }}</span>
          </div>
        </ng-template>
      </tx-org-chart>
      <tx-message severity="secondary" size="small">
        {{ picked() ? picked() + ' selected' : 'Click a unit.' }}
      </tx-message>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
    .unit {
      display: grid;
      justify-items: center;
      gap: 2px;
      width: 150px;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      background: var(--tx-surface-card);
      box-shadow: inset 0 0 0 1px var(--tx-surface-border);
      transition: box-shadow 0.15s ease;
    }
    .unit--path {
      box-shadow: inset 0 0 0 2px var(--tx-primary-base);
    }
    .unit span {
      font-size: 12px;
      color: var(--tx-text-muted);
    }
    .unit-icon {
      color: var(--tx-primary-base);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrgChartNodeTemplateExample {
  readonly picked = signal('');
  readonly units: TxOrgChartNode[] = [
    {
      id: 'company',
      title: 'Company',
      icon: 'building',
      data: { people: 120, budget: '$4.2M' },
      children: [
        { id: 'product', title: 'Product', icon: 'box', data: { people: 48, budget: '$1.9M' } },
        { id: 'sales', title: 'Sales', icon: 'chart-line', data: { people: 36, budget: '$1.2M' } },
        { id: 'people', title: 'People', icon: 'users', data: { people: 12, budget: '$0.4M' } },
      ],
    },
  ];

  unit(node: TxOrgChartNode): Unit {
    return node.data as Unit;
  }
}
