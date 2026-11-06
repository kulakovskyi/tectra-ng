import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBreadcrumb, TxBreadcrumbItem } from '@tectra-ng/ui/breadcrumb';

@Component({
  selector: 'breadcrumb-disabled-example',
  imports: [TxBreadcrumb],
  template: `<tx-breadcrumb [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbDisabledExample {
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Docs', routerLink: '/' },
    { label: 'Icons', routerLink: '/icons', disabled: true, title: 'Not available offline' },
    { label: 'Brand logos' },
  ];
}
