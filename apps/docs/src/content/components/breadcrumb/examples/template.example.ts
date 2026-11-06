import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import {
  TxBreadcrumb,
  TxBreadcrumbItem,
  TxBreadcrumbItemTemplate,
  TxBreadcrumbSeparatorTemplate,
} from '@tectra-ng/ui/breadcrumb';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'breadcrumb-template-example',
  imports: [TxBreadcrumb, TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate, TxIcon, TxPill],
  template: `
    <tx-breadcrumb [model]="items">
      <ng-template txBreadcrumbItem let-item let-current="current">
        <span>{{ item.label }}</span>
        @if (current) {
          <tx-pill size="small" tone="info" value="New" />
        }
      </ng-template>
      <ng-template txBreadcrumbSeparator><tx-icon name="angle-double-right" /></ng-template>
    </tx-breadcrumb>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbTemplateExample {
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Docs', routerLink: '/' },
    { label: 'Theming', routerLink: '/theming' },
    { label: 'Presets' },
  ];
}
